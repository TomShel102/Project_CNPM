from datetime import datetime, timezone
from typing import Optional, List
from enum import Enum

class ProjectStatus(Enum):
    PLANNING = "planning"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    ON_HOLD = "on_hold"

class ProjectGroup:
    def __init__(self,
                 id: Optional[int] = None,
                 name: str = "",
                 description: str = "",
                 topic: str = "",
                 status: ProjectStatus = ProjectStatus.PLANNING,
                 leader_id: int = 0,
                 member_ids: List[int] = None,
                 max_members: int = 5,
                 created_at: Optional[datetime] = None,
                 updated_at: Optional[datetime] = None):
        self.id = id
        self.name = name
        self.description = description
        self.topic = topic
        self.status = status
        self.leader_id = leader_id
        self.member_ids = member_ids or []
        self.max_members = max_members
        self.created_at = created_at or datetime.now(timezone.utc)
        self.updated_at = updated_at or datetime.now(timezone.utc)
