from datetime import datetime
from typing import Optional
from enum import Enum

class AppointmentStatus(Enum):
    PENDING = "pending"
    CONFIRMED = "confirmed"
    CANCELLED = "cancelled"
    COMPLETED = "completed"
    NO_SHOW = "no_show"

class Appointment:
    def __init__(self,
                 id: Optional[int] = None,
                 mentor_id: int = 0,
                 student_id: int = 0,
                 project_group_id: Optional[int] = None,
                 title: str = "",
                 description: str = "",
                 start_time: datetime = None,
                 end_time: datetime = None,
                 status: AppointmentStatus = AppointmentStatus.PENDING,
                 points_required: int = 0,
                 points_used: int = 0,
                 meeting_url: Optional[str] = None,
                 notes: Optional[str] = None,
                 created_at: Optional[datetime] = None,
                 updated_at: Optional[datetime] = None):
        self.id = id
        self.mentor_id = mentor_id
        self.student_id = student_id
        self.project_group_id = project_group_id
        self.title = title
        self.description = description
        self.start_time = start_time
        self.end_time = end_time
        self.status = status
        self.points_required = points_required
        self.points_used = points_used
        self.meeting_url = meeting_url
        self.notes = notes
        self.created_at = created_at or datetime.now()
        self.updated_at = updated_at or datetime.now()
