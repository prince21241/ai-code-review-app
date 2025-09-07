from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import Base, engine, get_db
from app.models.submission import Submission
from app.schemas.submission import SubmissionCreate, SubmissionOut

# Create tables on first run (simple for MVP)
Base.metadata.create_all(bind=engine)

router = APIRouter(prefix="/submissions", tags=["submissions"])

@router.post("", response_model=SubmissionOut)
def create_submission(payload: SubmissionCreate, db: Session = Depends(get_db)):
    s = Submission(code=payload.code, language=payload.language)
    db.add(s)
    db.commit()
    db.refresh(s)
    return s

@router.get("", response_model=list[SubmissionOut])
def list_submissions(db: Session = Depends(get_db)):
    return db.query(Submission).order_by(Submission.id.desc()).limit(50).all()
