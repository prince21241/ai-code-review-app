from pydantic import BaseModel
from datetime import datetime

class SubmissionCreate(BaseModel):
    code: str
    language: str | None = None
    review: str | None = None
    status: str | None = None

class SubmissionOut(BaseModel):
    id: int
    code: str
    language: str | None
    review: str | None
    status: str
    created_at: datetime
    class Config:
        from_attributes = True
