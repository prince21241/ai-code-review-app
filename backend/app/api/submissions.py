import logging
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.submission import Submission
from app.schemas.submission import SubmissionCreate, SubmissionOut
from app.jobs.review_job import get_queue, run_review
from app.middleware.clerk_auth import get_current_user_optional

router = APIRouter(prefix="/submissions", tags=["submissions"])

logger = logging.getLogger(__name__)


@router.post("", response_model=SubmissionOut)
def create_submission(
    payload: SubmissionCreate, 
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user_optional)
):
    # Create as pending first
    s = Submission(code=payload.code, language=payload.language, status="pending")
    db.add(s)
    db.commit()
    db.refresh(s)

    # Try to enqueue async review job
    try:
        q = get_queue()
        q.enqueue(run_review, s.id)
        logger.info("Enqueued review job for submission id=%s", s.id)
    except Exception as e:
        # If queue fails (Redis not running), process synchronously as fallback
        logger.warning("Failed to enqueue review for submission id=%s, processing synchronously: %s", s.id, e)
        try:
            run_review(s.id)
            db.refresh(s)
            logger.info("Review processed synchronously for submission id=%s", s.id)
        except Exception as sync_error:
            logger.error("Failed to process review synchronously for submission id=%s: %s", s.id, sync_error)
            # Keep as pending if both async and sync fail
    return s


@router.get("/{submission_id}", response_model=SubmissionOut)
def get_submission(submission_id: int, db: Session = Depends(get_db)):
    s = db.get(Submission, submission_id)
    if not s:
        raise HTTPException(status_code=404, detail="Submission not found")
    return s

@router.get("", response_model=list[SubmissionOut])
def list_submissions(
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user_optional)
):
    return db.query(Submission).order_by(Submission.id.desc()).limit(50).all()


@router.post("/process-pending")
def process_pending_reviews(db: Session = Depends(get_db)):
    """Process all pending reviews. Useful for catching up on missed jobs."""
    pending = db.query(Submission).filter(Submission.status == "pending").all()
    processed = 0
    errors = 0
    
    for submission in pending:
        try:
            run_review(submission.id)
            processed += 1
            logger.info(f"Processed pending submission {submission.id}")
        except Exception as e:
            errors += 1
            logger.error(f"Failed to process submission {submission.id}: {e}")
    
    return {
        "message": f"Processed {processed} submissions, {errors} errors",
        "processed": processed,
        "errors": errors,
        "total_pending": len(pending)
    }
