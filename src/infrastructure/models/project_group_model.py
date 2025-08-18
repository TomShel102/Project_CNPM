from sqlalchemy import Column, Integer, String, DateTime, Enum as SQLEnum, JSON
from infrastructure.databases.base import Base
from domain.models.project_group import ProjectStatus

class ProjectGroupModel(Base):
    __tablename__ = 'project_groups'
    __table_args__ = {'extend_existing': True}

    id = Column(Integer, primary_key=True)
    name = Column(String(100), nullable=False)
    description = Column(String(500), nullable=True)
    topic = Column(String(200), nullable=False)
    status = Column(SQLEnum(ProjectStatus), nullable=False, default=ProjectStatus.PLANNING)
    leader_id = Column(Integer, nullable=False)
    member_ids = Column(JSON, nullable=True)  # Store as JSON array
    max_members = Column(Integer, nullable=False, default=5)
    created_at = Column(DateTime, nullable=False)
    updated_at = Column(DateTime, nullable=False)
