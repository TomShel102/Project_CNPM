from enum import Enum
from datetime import datetime
from typing import Optional

class UserRole(Enum):
    ADMIN = "admin"
    STUDENT = "student"
    MENTOR = "mentor"

class User:
    def __init__(self, 
                 id: Optional[int] = None,
                 username: str = "",
                 email: str = "",
                 password: str = "",
                 full_name: str = "",
                 role: UserRole = UserRole.STUDENT,
                 phone: Optional[str] = None,
                 avatar_url: Optional[str] = None,
                 is_active: bool = True,
                 created_at: Optional[datetime] = None,
                 updated_at: Optional[datetime] = None):
        self.id = id
        self.username = username
        self.email = email
        self.password = password
        self.full_name = full_name
        self.role = role
        self.phone = phone
        self.avatar_url = avatar_url
        self.is_active = is_active
        self.created_at = created_at or datetime.now()
        self.updated_at = updated_at or datetime.now()