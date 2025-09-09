from sqlalchemy import Column, Integer, String, ForeignKey, UniqueConstraint
from infrastructure.databases.base import Base


class MentorExpertiseModel(Base):
    __tablename__ = 'mentor_expertise'
    __table_args__ = (
        UniqueConstraint('mentor_id', 'expertise', name='uq_mentor_expertise'),
        {'extend_existing': True}
    )

    id = Column(Integer, primary_key=True)
    mentor_id = Column(Integer, ForeignKey('mentors.id'), nullable=False)
    expertise = Column(String(100), nullable=False)


