from typing import List, Optional
from sqlalchemy.orm import Session
from domain.models.mentor import Mentor, MentorStatus
from domain.models.imentor_repository import IMentorRepository
from infrastructure.models.mentor_model import MentorModel
from infrastructure.databases.mssql import session

class MentorRepository(IMentorRepository):
    def __init__(self):
        self.db: Session = session
    
    def create(self, mentor: Mentor) -> Mentor:
        mentor_model = MentorModel(
            user_id=mentor.user_id,
            bio=mentor.bio,
            expertise_areas=mentor.expertise_areas,
            hourly_rate=mentor.hourly_rate,
            max_sessions_per_day=mentor.max_sessions_per_day,
            status=mentor.status,
            rating=mentor.rating,
            total_sessions=mentor.total_sessions,
            created_at=mentor.created_at,
            updated_at=mentor.updated_at
        )
        self.db.add(mentor_model)
        self.db.commit()
        self.db.refresh(mentor_model)
        
        return Mentor(
            id=mentor_model.id,
            user_id=mentor_model.user_id,
            bio=mentor_model.bio,
            expertise_areas=mentor_model.expertise_areas,
            hourly_rate=mentor_model.hourly_rate,
            max_sessions_per_day=mentor_model.max_sessions_per_day,
            status=mentor_model.status,
            rating=mentor_model.rating,
            total_sessions=mentor_model.total_sessions,
            created_at=mentor_model.created_at,
            updated_at=mentor_model.updated_at
        )
    
    def get_by_id(self, mentor_id: int) -> Optional[Mentor]:
        mentor_model = self.db.query(MentorModel).filter(MentorModel.id == mentor_id).first()
        if not mentor_model:
            return None
        
        return Mentor(
            id=mentor_model.id,
            user_id=mentor_model.user_id,
            bio=mentor_model.bio,
            expertise_areas=mentor_model.expertise_areas,
            hourly_rate=mentor_model.hourly_rate,
            max_sessions_per_day=mentor_model.max_sessions_per_day,
            status=mentor_model.status,
            rating=mentor_model.rating,
            total_sessions=mentor_model.total_sessions,
            created_at=mentor_model.created_at,
            updated_at=mentor_model.updated_at
        )
    
    def get_by_user_id(self, user_id: int) -> Optional[Mentor]:
        mentor_model = self.db.query(MentorModel).filter(MentorModel.user_id == user_id).first()
        if not mentor_model:
            return None
        
        return Mentor(
            id=mentor_model.id,
            user_id=mentor_model.user_id,
            bio=mentor_model.bio,
            expertise_areas=mentor_model.expertise_areas,
            hourly_rate=mentor_model.hourly_rate,
            max_sessions_per_day=mentor_model.max_sessions_per_day,
            status=mentor_model.status,
            rating=mentor_model.rating,
            total_sessions=mentor_model.total_sessions,
            created_at=mentor_model.created_at,
            updated_at=mentor_model.updated_at
        )
    
    def get_all(self) -> List[Mentor]:
        mentor_models = self.db.query(MentorModel).all()
        return [
            Mentor(
                id=model.id,
                user_id=model.user_id,
                bio=model.bio,
                expertise_areas=model.expertise_areas,
                hourly_rate=model.hourly_rate,
                max_sessions_per_day=model.max_sessions_per_day,
                status=model.status,
                rating=model.rating,
                total_sessions=model.total_sessions,
                created_at=model.created_at,
                updated_at=model.updated_at
            ) for model in mentor_models
        ]
    
    def get_by_expertise(self, expertise: str) -> List[Mentor]:
        mentor_models = self.db.query(MentorModel).filter(
            MentorModel.expertise_areas.contains([expertise])
        ).all()
        
        return [
            Mentor(
                id=model.id,
                user_id=model.user_id,
                bio=model.bio,
                expertise_areas=model.expertise_areas,
                hourly_rate=model.hourly_rate,
                max_sessions_per_day=model.max_sessions_per_day,
                status=model.status,
                rating=model.rating,
                total_sessions=model.total_sessions,
                created_at=model.created_at,
                updated_at=model.updated_at
            ) for model in mentor_models
        ]
    
    def get_available_mentors(self) -> List[Mentor]:
        mentor_models = self.db.query(MentorModel).filter(
            MentorModel.status == MentorStatus.ACTIVE
        ).all()
        
        return [
            Mentor(
                id=model.id,
                user_id=model.user_id,
                bio=model.bio,
                expertise_areas=model.expertise_areas,
                hourly_rate=model.hourly_rate,
                max_sessions_per_day=model.max_sessions_per_day,
                status=model.status,
                rating=model.rating,
                total_sessions=model.total_sessions,
                created_at=model.created_at,
                updated_at=model.updated_at
            ) for model in mentor_models
        ]
    
    def update(self, mentor: Mentor) -> Mentor:
        mentor_model = self.db.query(MentorModel).filter(MentorModel.id == mentor.id).first()
        if not mentor_model:
            raise ValueError("Mentor not found")
        
        mentor_model.bio = mentor.bio
        mentor_model.expertise_areas = mentor.expertise_areas
        mentor_model.hourly_rate = mentor.hourly_rate
        mentor_model.max_sessions_per_day = mentor.max_sessions_per_day
        mentor_model.status = mentor.status
        mentor_model.rating = mentor.rating
        mentor_model.total_sessions = mentor.total_sessions
        mentor_model.updated_at = mentor.updated_at
        
        self.db.commit()
        self.db.refresh(mentor_model)
        
        return Mentor(
            id=mentor_model.id,
            user_id=mentor_model.user_id,
            bio=mentor_model.bio,
            expertise_areas=mentor_model.expertise_areas,
            hourly_rate=mentor_model.hourly_rate,
            max_sessions_per_day=mentor_model.max_sessions_per_day,
            status=mentor_model.status,
            rating=mentor_model.rating,
            total_sessions=mentor_model.total_sessions,
            created_at=mentor_model.created_at,
            updated_at=mentor_model.updated_at
        )
    
    def delete(self, mentor_id: int) -> bool:
        mentor_model = self.db.query(MentorModel).filter(MentorModel.id == mentor_id).first()
        if not mentor_model:
            return False
        
        self.db.delete(mentor_model)
        self.db.commit()
        return True
    
    def update_status(self, mentor_id: int, status: MentorStatus) -> bool:
        mentor_model = self.db.query(MentorModel).filter(MentorModel.id == mentor_id).first()
        if not mentor_model:
            return False
        
        mentor_model.status = status
        self.db.commit()
        return True
