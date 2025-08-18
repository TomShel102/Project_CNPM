from abc import ABC, abstractmethod
from typing import List, Optional
from domain.models.feedback import Feedback, FeedbackType

class IFeedbackRepository(ABC):
    @abstractmethod
    def create(self, feedback: Feedback) -> Feedback:
        pass
    
    @abstractmethod
    def get_by_id(self, feedback_id: int) -> Optional[Feedback]:
        pass
    
    @abstractmethod
    def get_by_appointment_id(self, appointment_id: int) -> List[Feedback]:
        pass
    
    @abstractmethod
    def get_by_reviewer_id(self, reviewer_id: int) -> List[Feedback]:
        pass
    
    @abstractmethod
    def get_by_reviewed_id(self, reviewed_id: int) -> List[Feedback]:
        pass
    
    @abstractmethod
    def get_by_type(self, feedback_type: FeedbackType) -> List[Feedback]:
        pass
    
    @abstractmethod
    def get_average_rating_by_user(self, user_id: int) -> float:
        pass
    
    @abstractmethod
    def update(self, feedback: Feedback) -> Feedback:
        pass
    
    @abstractmethod
    def delete(self, feedback_id: int) -> bool:
        pass
