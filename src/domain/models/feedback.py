from datetime import datetime, timezone
from typing import Optional
from enum import Enum

class FeedbackType(Enum):
    STUDENT_TO_MENTOR = "student_to_mentor"
    MENTOR_TO_STUDENT = "mentor_to_student"

class Feedback:
    def __init__(self,
                 id: Optional[int] = None,
                 appointment_id: int = 0,
                 reviewer_id: int = 0,
                 reviewed_id: int = 0,
                 rating: int = 0,
                 comment: str = "",
                 feedback_type: FeedbackType = FeedbackType.STUDENT_TO_MENTOR,
                 created_at: Optional[datetime] = None):
        self.id = id
        self.appointment_id = appointment_id
        self.reviewer_id = reviewer_id
        self.reviewed_id = reviewed_id
        self.rating = rating
        self.comment = comment
        self.feedback_type = feedback_type
        self.created_at = created_at or datetime.now(timezone.utc)
