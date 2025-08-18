from abc import ABC, abstractmethod
from typing import List, Optional
from domain.models.mentor import Mentor, MentorStatus

class IMentorRepository(ABC):
    @abstractmethod
    def create(self, mentor: Mentor) -> Mentor:
        pass
    
    @abstractmethod
    def get_by_id(self, mentor_id: int) -> Optional[Mentor]:
        pass
    
    @abstractmethod
    def get_by_user_id(self, user_id: int) -> Optional[Mentor]:
        pass
    
    @abstractmethod
    def get_all(self) -> List[Mentor]:
        pass
    
    @abstractmethod
    def get_by_expertise(self, expertise: str) -> List[Mentor]:
        pass
    
    @abstractmethod
    def get_available_mentors(self) -> List[Mentor]:
        pass
    
    @abstractmethod
    def update(self, mentor: Mentor) -> Mentor:
        pass
    
    @abstractmethod
    def delete(self, mentor_id: int) -> bool:
        pass
    
    @abstractmethod
    def update_status(self, mentor_id: int, status: MentorStatus) -> bool:
        pass
