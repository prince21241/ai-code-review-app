from sqlalchemy import Column, Integer, Text, String, DateTime, func
from app.database import Base

class Submission(Base):
    __tablename__ = "submissions"
    id = Column(Integer, primary_key=True, index=True)
    code = Column(Text, nullable=False)
    language = Column(String(50), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
