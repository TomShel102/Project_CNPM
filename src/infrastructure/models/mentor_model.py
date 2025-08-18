from sqlalchemy import Column, Integer, String, DateTime, Float, Enum as SQLEnum, JSON
from infrastructure.databases.base import Base
from domain.models.mentor import MentorStatus

class MentorModel(Base):
    __tablename__ = 'mentors'
    __table_args__ = {'extend_existing': True}

    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, nullable=False)
    bio = Column(String(500), nullable=True)
    expertise_areas = Column(JSON, nullable=True)  # Store as JSON array
    hourly_rate = Column(Integer, nullable=False, default=0)
    max_sessions_per_day = Column(Integer, nullable=False, default=5)
    status = Column(SQLEnum(MentorStatus), nullable=False, default=MentorStatus.ACTIVE)
    rating = Column(Float, nullable=False, default=0.0)
    total_sessions = Column(Integer, nullable=False, default=0)
    created_at = Column(DateTime, nullable=False)
    updated_at = Column(DateTime, nullable=False)
