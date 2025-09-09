from datetime import datetime, timezone
from typing import Optional, List
from enum import Enum

class MentorStatus(Enum):
    ACTIVE = "active"
    INACTIVE = "inactive"
    BUSY = "busy"

class Mentor:
    def __init__(self,
                 id: Optional[int] = None,
                 user_id: int = 0,
                 bio: str = "",
                 expertise_areas: List[str] = None,
                 hourly_rate: int = 0,
                 max_sessions_per_day: int = 5,
                 status: MentorStatus = MentorStatus.ACTIVE,
                 rating: float = 0.0,
                 total_sessions: int = 0,
                 created_at: Optional[datetime] = None,
                 updated_at: Optional[datetime] = None):
        self.id = id
        self.user_id = user_id
        self.bio = bio
        self.expertise_areas = expertise_areas or []
        self.hourly_rate = hourly_rate
        self.max_sessions_per_day = max_sessions_per_day
        self.status = status
        self.rating = rating
        self.total_sessions = total_sessions
        self.created_at = created_at or datetime.now(timezone.utc)
        self.updated_at = updated_at or datetime.now(timezone.utc)
