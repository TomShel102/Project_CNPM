from abc import ABC, abstractmethod
from typing import List, Optional
from datetime import datetime
from domain.models.appointment import Appointment, AppointmentStatus

class IAppointmentRepository(ABC):
    @abstractmethod
    def create(self, appointment: Appointment) -> Appointment:
        pass
    
    @abstractmethod
    def get_by_id(self, appointment_id: int) -> Optional[Appointment]:
        pass
    
    @abstractmethod
    def get_by_mentor_id(self, mentor_id: int) -> List[Appointment]:
        pass
    
    @abstractmethod
    def get_by_student_id(self, student_id: int) -> List[Appointment]:
        pass
    
    @abstractmethod
    def get_by_project_group_id(self, group_id: int) -> List[Appointment]:
        pass
    
    @abstractmethod
    def get_by_status(self, status: AppointmentStatus) -> List[Appointment]:
        pass
    
    @abstractmethod
    def get_by_date_range(self, start_date: datetime, end_date: datetime) -> List[Appointment]:
        pass
    
    @abstractmethod
    def get_conflicting_appointments(self, mentor_id: int, start_time: datetime, end_time: datetime) -> List[Appointment]:
        pass
    
    @abstractmethod
    def update(self, appointment: Appointment) -> Appointment:
        pass
    
    @abstractmethod
    def delete(self, appointment_id: int) -> bool:
        pass
    
    @abstractmethod
    def update_status(self, appointment_id: int, status: AppointmentStatus) -> bool:
        pass
