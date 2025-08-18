from typing import List, Optional
from datetime import datetime
from domain.models.mentor import Mentor, MentorStatus
from domain.models.imentor_repository import IMentorRepository
from domain.models.iappointment_repository import IAppointmentRepository
from domain.models.appointment import AppointmentStatus

class MentorService:
    def __init__(self, mentor_repository: IMentorRepository, appointment_repository: IAppointmentRepository):
        self.mentor_repository = mentor_repository
        self.appointment_repository = appointment_repository
    
    def create_mentor(self, user_id: int, bio: str, expertise_areas: List[str], 
                     hourly_rate: int, max_sessions_per_day: int = 5) -> Mentor:
        """Create a new mentor profile"""
        mentor = Mentor(
            user_id=user_id,
            bio=bio,
            expertise_areas=expertise_areas,
            hourly_rate=hourly_rate,
            max_sessions_per_day=max_sessions_per_day,
            status=MentorStatus.ACTIVE,
            created_at=datetime.now(),
            updated_at=datetime.now()
        )
        return self.mentor_repository.create(mentor)
    
    def get_mentor_by_id(self, mentor_id: int) -> Optional[Mentor]:
        """Get mentor by ID"""
        return self.mentor_repository.get_by_id(mentor_id)
    
    def get_mentor_by_user_id(self, user_id: int) -> Optional[Mentor]:
        """Get mentor by user ID"""
        return self.mentor_repository.get_by_user_id(user_id)
    
    def get_all_mentors(self) -> List[Mentor]:
        """Get all mentors"""
        return self.mentor_repository.get_all()
    
    def get_mentors_by_expertise(self, expertise: str) -> List[Mentor]:
        """Get mentors by expertise area"""
        return self.mentor_repository.get_by_expertise(expertise)
    
    def get_available_mentors(self) -> List[Mentor]:
        """Get all available mentors"""
        return self.mentor_repository.get_available_mentors()
    
    def update_mentor_profile(self, mentor_id: int, bio: str = None, 
                            expertise_areas: List[str] = None, hourly_rate: int = None,
                            max_sessions_per_day: int = None) -> Optional[Mentor]:
        """Update mentor profile"""
        mentor = self.mentor_repository.get_by_id(mentor_id)
        if not mentor:
            return None
        
        if bio is not None:
            mentor.bio = bio
        if expertise_areas is not None:
            mentor.expertise_areas = expertise_areas
        if hourly_rate is not None:
            mentor.hourly_rate = hourly_rate
        if max_sessions_per_day is not None:
            mentor.max_sessions_per_day = max_sessions_per_day
        
        mentor.updated_at = datetime.now()
        return self.mentor_repository.update(mentor)
    
    def update_mentor_status(self, mentor_id: int, status: MentorStatus) -> bool:
        """Update mentor status"""
        return self.mentor_repository.update_status(mentor_id, status)
    
    def calculate_mentor_rating(self, mentor_id: int) -> float:
        """Calculate mentor rating based on feedback"""
        # This would typically involve getting feedback and calculating average
        # For now, return the current rating
        mentor = self.mentor_repository.get_by_id(mentor_id)
        return mentor.rating if mentor else 0.0
    
    def get_mentor_schedule(self, mentor_id: int, date: datetime) -> List[dict]:
        """Get mentor's schedule for a specific date"""
        appointments = self.appointment_repository.get_by_mentor_id(mentor_id)
        
        # Filter appointments for the specific date
        day_appointments = [
            apt for apt in appointments 
            if apt.start_time.date() == date.date() and apt.status != AppointmentStatus.CANCELLED
        ]
        
        return [
            {
                'id': apt.id,
                'start_time': apt.start_time,
                'end_time': apt.end_time,
                'status': apt.status.value,
                'title': apt.title
            } for apt in day_appointments
        ]
    
    def is_mentor_available(self, mentor_id: int, start_time: datetime, end_time: datetime) -> bool:
        """Check if mentor is available for a specific time slot"""
        # Check if mentor is active
        mentor = self.mentor_repository.get_by_id(mentor_id)
        if not mentor or mentor.status != MentorStatus.ACTIVE:
            return False
        
        # Check for conflicting appointments
        conflicting_appointments = self.appointment_repository.get_conflicting_appointments(
            mentor_id, start_time, end_time
        )
        
        # Filter out cancelled appointments
        active_conflicts = [
            apt for apt in conflicting_appointments 
            if apt.status not in [AppointmentStatus.CANCELLED, AppointmentStatus.NO_SHOW]
        ]
        
        return len(active_conflicts) == 0
    
    def delete_mentor(self, mentor_id: int) -> bool:
        """Delete mentor profile"""
        return self.mentor_repository.delete(mentor_id)
