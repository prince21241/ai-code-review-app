import os
from rq import Queue
from redis import Redis
from sqlalchemy.orm import Session

from app.database import SessionLocal
from app.models.submission import Submission
from app.analyzers.ai import generate_ai_review


def get_queue() -> Queue:
    redis_url = os.getenv("REDIS_URL", "redis://localhost:6379/0")
    conn = Redis.from_url(redis_url)
    return Queue("reviews", connection=conn)


def run_review(submission_id: int) -> None:
    """Process a code review for a submission."""
    import logging
    logger = logging.getLogger(__name__)
    
    db: Session = SessionLocal()
    try:
        s = db.get(Submission, submission_id)
        if not s:
            logger.warning(f"Submission {submission_id} not found")
            return
        
        logger.info(f"Processing review for submission {submission_id}")
        s.status = "processing"
        db.add(s)
        db.commit()
        db.refresh(s)

        # Generate AI review
        review_text = generate_ai_review(s.code, s.language)
        
        # Update submission with review
        s.review = review_text
        s.status = "reviewed"
        db.add(s)
        db.commit()
        
        logger.info(f"Review completed for submission {submission_id}")
    except Exception as e:
        logger.error(f"Error processing review for submission {submission_id}: {e}", exc_info=True)
        # Update status to indicate failure
        try:
            s = db.get(Submission, submission_id)
            if s:
                s.status = "error"
                db.add(s)
                db.commit()
        except:
            pass
        raise
    finally:
        db.close()


