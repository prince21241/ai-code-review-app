import logging
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import Base, engine, get_db
from app.models.submission import Submission
from app.schemas.submission import SubmissionCreate, SubmissionOut
from app.analyzers.basic import generate_basic_review
from app.jobs.review_job import get_queue, run_review

# Create tables on first run (simple for MVP)
Base.metadata.create_all(bind=engine)

router = APIRouter(prefix="/submissions", tags=["submissions"])

logger = logging.getLogger(__name__)


@router.post("", response_model=SubmissionOut)
def create_submission(payload: SubmissionCreate, db: Session = Depends(get_db)):
    # Create as pending first to prepare for async workers
    s = Submission(code=payload.code, language=payload.language, status="pending")
    db.add(s)
    db.commit()
    db.refresh(s)

    # Enqueue async review job
    try:
        q = get_queue()
        q.enqueue(run_review, s.id)
        logger.info("Enqueued review job for submission id=%s", s.id)
    except Exception:
        logger.exception("Failed to enqueue review for submission id=%s", s.id)
    return s


@router.get("/{submission_id}", response_model=SubmissionOut)
def get_submission(submission_id: int, db: Session = Depends(get_db)):
    s = db.get(Submission, submission_id)
    if not s:
        raise HTTPException(status_code=404, detail="Submission not found")
    return s

@router.get("", response_model=list[SubmissionOut])
def list_submissions(db: Session = Depends(get_db)):
    return db.query(Submission).order_by(Submission.id.desc()).limit(50).all()
