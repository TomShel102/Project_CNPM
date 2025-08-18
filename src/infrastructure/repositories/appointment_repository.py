from typing import List, Optional
from sqlalchemy.orm import Session
from datetime import datetime
from domain.models.appointment import Appointment, AppointmentStatus
from domain.models.iappointment_repository import IAppointmentRepository
from infrastructure.models.appointment_model import AppointmentModel
from infrastructure.databases.mssql import session

class AppointmentRepository(IAppointmentRepository):
    def __init__(self):
        self.db: Session = session
    
    def create(self, appointment: Appointment) -> Appointment:
        appointment_model = AppointmentModel(
            mentor_id=appointment.mentor_id,
            student_id=appointment.student_id,
            project_group_id=appointment.project_group_id,
            title=appointment.title,
            description=appointment.description,
            start_time=appointment.start_time,
            end_time=appointment.end_time,
            status=appointment.status,
            points_required=appointment.points_required,
            points_used=appointment.points_used,
            meeting_url=appointment.meeting_url,
            notes=appointment.notes,
            created_at=appointment.created_at,
            updated_at=appointment.updated_at
        )
        self.db.add(appointment_model)
        self.db.commit()
        self.db.refresh(appointment_model)
        
        return Appointment(
            id=appointment_model.id,
            mentor_id=appointment_model.mentor_id,
            student_id=appointment_model.student_id,
            project_group_id=appointment_model.project_group_id,
            title=appointment_model.title,
            description=appointment_model.description,
            start_time=appointment_model.start_time,
            end_time=appointment_model.end_time,
            status=appointment_model.status,
            points_required=appointment_model.points_required,
            points_used=appointment_model.points_used,
            meeting_url=appointment_model.meeting_url,
            notes=appointment_model.notes,
            created_at=appointment_model.created_at,
            updated_at=appointment_model.updated_at
        )
    
    def get_by_id(self, appointment_id: int) -> Optional[Appointment]:
        appointment_model = self.db.query(AppointmentModel).filter(AppointmentModel.id == appointment_id).first()
        if not appointment_model:
            return None
        
        return Appointment(
            id=appointment_model.id,
            mentor_id=appointment_model.mentor_id,
            student_id=appointment_model.student_id,
            project_group_id=appointment_model.project_group_id,
            title=appointment_model.title,
            description=appointment_model.description,
            start_time=appointment_model.start_time,
            end_time=appointment_model.end_time,
            status=appointment_model.status,
            points_required=appointment_model.points_required,
            points_used=appointment_model.points_used,
            meeting_url=appointment_model.meeting_url,
            notes=appointment_model.notes,
            created_at=appointment_model.created_at,
            updated_at=appointment_model.updated_at
        )
    
    def get_by_mentor_id(self, mentor_id: int) -> List[Appointment]:
        appointment_models = self.db.query(AppointmentModel).filter(AppointmentModel.mentor_id == mentor_id).all()
        return [
            Appointment(
                id=model.id,
                mentor_id=model.mentor_id,
                student_id=model.student_id,
                project_group_id=model.project_group_id,
                title=model.title,
                description=model.description,
                start_time=model.start_time,
                end_time=model.end_time,
                status=model.status,
                points_required=model.points_required,
                points_used=model.points_used,
                meeting_url=model.meeting_url,
                notes=model.notes,
                created_at=model.created_at,
                updated_at=model.updated_at
            ) for model in appointment_models
        ]
    
    def get_by_student_id(self, student_id: int) -> List[Appointment]:
        appointment_models = self.db.query(AppointmentModel).filter(AppointmentModel.student_id == student_id).all()
        return [
            Appointment(
                id=model.id,
                mentor_id=model.mentor_id,
                student_id=model.student_id,
                project_group_id=model.project_group_id,
                title=model.title,
                description=model.description,
                start_time=model.start_time,
                end_time=model.end_time,
                status=model.status,
                points_required=model.points_required,
                points_used=model.points_used,
                meeting_url=model.meeting_url,
                notes=model.notes,
                created_at=model.created_at,
                updated_at=model.updated_at
            ) for model in appointment_models
        ]
    
    def get_by_project_group_id(self, group_id: int) -> List[Appointment]:
        appointment_models = self.db.query(AppointmentModel).filter(AppointmentModel.project_group_id == group_id).all()
        return [
            Appointment(
                id=model.id,
                mentor_id=model.mentor_id,
                student_id=model.student_id,
                project_group_id=model.project_group_id,
                title=model.title,
                description=model.description,
                start_time=model.start_time,
                end_time=model.end_time,
                status=model.status,
                points_required=model.points_required,
                points_used=model.points_used,
                meeting_url=model.meeting_url,
                notes=model.notes,
                created_at=model.created_at,
                updated_at=model.updated_at
            ) for model in appointment_models
        ]
    
    def get_by_status(self, status: AppointmentStatus) -> List[Appointment]:
        appointment_models = self.db.query(AppointmentModel).filter(AppointmentModel.status == status).all()
        return [
            Appointment(
                id=model.id,
                mentor_id=model.mentor_id,
                student_id=model.student_id,
                project_group_id=model.project_group_id,
                title=model.title,
                description=model.description,
                start_time=model.start_time,
                end_time=model.end_time,
                status=model.status,
                points_required=model.points_required,
                points_used=model.points_used,
                meeting_url=model.meeting_url,
                notes=model.notes,
                created_at=model.created_at,
                updated_at=model.updated_at
            ) for model in appointment_models
        ]
    
    def get_by_date_range(self, start_date: datetime, end_date: datetime) -> List[Appointment]:
        appointment_models = self.db.query(AppointmentModel).filter(
            AppointmentModel.start_time >= start_date,
            AppointmentModel.end_time <= end_date
        ).all()
        return [
            Appointment(
                id=model.id,
                mentor_id=model.mentor_id,
                student_id=model.student_id,
                project_group_id=model.project_group_id,
                title=model.title,
                description=model.description,
                start_time=model.start_time,
                end_time=model.end_time,
                status=model.status,
                points_required=model.points_required,
                points_used=model.points_used,
                meeting_url=model.meeting_url,
                notes=model.notes,
                created_at=model.created_at,
                updated_at=model.updated_at
            ) for model in appointment_models
        ]
    
    def get_conflicting_appointments(self, mentor_id: int, start_time: datetime, end_time: datetime) -> List[Appointment]:
        appointment_models = self.db.query(AppointmentModel).filter(
            AppointmentModel.mentor_id == mentor_id,
            AppointmentModel.start_time < end_time,
            AppointmentModel.end_time > start_time
        ).all()
        return [
            Appointment(
                id=model.id,
                mentor_id=model.mentor_id,
                student_id=model.student_id,
                project_group_id=model.project_group_id,
                title=model.title,
                description=model.description,
                start_time=model.start_time,
                end_time=model.end_time,
                status=model.status,
                points_required=model.points_required,
                points_used=model.points_used,
                meeting_url=model.meeting_url,
                notes=model.notes,
                created_at=model.created_at,
                updated_at=model.updated_at
            ) for model in appointment_models
        ]
    
    def update(self, appointment: Appointment) -> Appointment:
        appointment_model = self.db.query(AppointmentModel).filter(AppointmentModel.id == appointment.id).first()
        if not appointment_model:
            raise ValueError("Appointment not found")
        
        appointment_model.mentor_id = appointment.mentor_id
        appointment_model.student_id = appointment.student_id
        appointment_model.project_group_id = appointment.project_group_id
        appointment_model.title = appointment.title
        appointment_model.description = appointment.description
        appointment_model.start_time = appointment.start_time
        appointment_model.end_time = appointment.end_time
        appointment_model.status = appointment.status
        appointment_model.points_required = appointment.points_required
        appointment_model.points_used = appointment.points_used
        appointment_model.meeting_url = appointment.meeting_url
        appointment_model.notes = appointment.notes
        appointment_model.updated_at = appointment.updated_at
        
        self.db.commit()
        self.db.refresh(appointment_model)
        
        return Appointment(
            id=appointment_model.id,
            mentor_id=appointment_model.mentor_id,
            student_id=appointment_model.student_id,
            project_group_id=appointment_model.project_group_id,
            title=appointment_model.title,
            description=appointment_model.description,
            start_time=appointment_model.start_time,
            end_time=appointment_model.end_time,
            status=appointment_model.status,
            points_required=appointment_model.points_required,
            points_used=appointment_model.points_used,
            meeting_url=appointment_model.meeting_url,
            notes=appointment_model.notes,
            created_at=appointment_model.created_at,
            updated_at=appointment_model.updated_at
        )
    
    def delete(self, appointment_id: int) -> bool:
        appointment_model = self.db.query(AppointmentModel).filter(AppointmentModel.id == appointment_id).first()
        if not appointment_model:
            return False
        
        self.db.delete(appointment_model)
        self.db.commit()
        return True
    
    def update_status(self, appointment_id: int, status: AppointmentStatus) -> bool:
        appointment_model = self.db.query(AppointmentModel).filter(AppointmentModel.id == appointment_id).first()
        if not appointment_model:
            return False
        
        appointment_model.status = status
        self.db.commit()
        return True
