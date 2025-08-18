from sqlalchemy import Column, ForeignKey, Integer, String, DateTime, Enum as SQLEnum, Text
from infrastructure.databases.base import Base
from domain.models.appointment import AppointmentStatus

class AppointmentModel(Base):
    __tablename__ = 'appointments'
    __table_args__ = {'extend_existing': True}

    id = Column(Integer, primary_key=True)
    mentor_id = Column(Integer, ForeignKey('mentors.id'), nullable=False)
    student_id = Column(Integer, ForeignKey('users.id'), nullable=False)
    project_group_id = Column(Integer, ForeignKey('project_groups.id'), nullable=True)
    title = Column(String(200), nullable=False)
    description = Column(Text, nullable=True)
    start_time = Column(DateTime, nullable=False)
    end_time = Column(DateTime, nullable=False)
    status = Column(SQLEnum(AppointmentStatus), nullable=False, default=AppointmentStatus.PENDING)
    points_required = Column(Integer, nullable=False, default=0)
    points_used = Column(Integer, nullable=False, default=0)
    meeting_url = Column(String(255), nullable=True)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, nullable=False)
    updated_at = Column(DateTime, nullable=False) 