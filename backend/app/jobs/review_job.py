import os
from rq import Queue
from redis import Redis
from sqlalchemy.orm import Session

from app.database import SessionLocal
from app.models.submission import Submission
from app.analyzers.basic import generate_basic_review


def get_queue() -> Queue:
    redis_url = os.getenv("REDIS_URL", "redis://localhost:6379/0")
    conn = Redis.from_url(redis_url)
    return Queue("reviews", connection=conn)


def run_review(submission_id: int) -> None:
    db: Session = SessionLocal()
    try:
        s = db.get(Submission, submission_id)
        if not s:
            return
        s.status = "processing"
        db.add(s)
        db.commit()
        db.refresh(s)

        review_text = generate_basic_review(s.code, s.language)
        s.review = review_text
        s.status = "reviewed"
        db.add(s)
        db.commit()
    finally:
        db.close()


