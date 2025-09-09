from typing import List, Optional
from datetime import datetime, timedelta, timezone
from domain.models.appointment import Appointment, AppointmentStatus
from domain.models.iappointment_repository import IAppointmentRepository
from domain.models.imentor_repository import IMentorRepository
from domain.models.iwallet_repository import IWalletRepository
from domain.models.wallet import TransactionType
from domain.models.mentor import MentorStatus

class AppointmentService:
    def __init__(self, appointment_repository: IAppointmentRepository, 
                 mentor_repository: IMentorRepository,
                 wallet_repository: IWalletRepository):
        self.appointment_repository = appointment_repository
        self.mentor_repository = mentor_repository
        self.wallet_repository = wallet_repository
    
    def create_appointment(self, mentor_id: int, student_id: int, 
                          title: str, description: str, start_time: datetime,
                          end_time: datetime, project_group_id: Optional[int] = None) -> Optional[Appointment]:
        """Create a new appointment booking"""
        # Check if mentor is available
        if not self._is_mentor_available(mentor_id, start_time, end_time):
            raise ValueError("Mentor is not available for this time slot")
        
        # Get mentor to calculate points required
        mentor = self.mentor_repository.get_by_id(mentor_id)
        if not mentor:
            raise ValueError("Mentor not found")
        
        # Calculate duration in hours and points required
        duration_hours = (end_time - start_time).total_seconds() / 3600
        points_required = int(duration_hours * mentor.hourly_rate)
        
        # Check if student has enough points
        wallet = self.wallet_repository.get_wallet_by_user_id(student_id)
        if not wallet or wallet.balance < points_required:
            raise ValueError("Insufficient points in wallet")
        
        # Create appointment
        appointment = Appointment(
            mentor_id=mentor_id,
            student_id=student_id,
            project_group_id=project_group_id,
            title=title,
            description=description,
            start_time=start_time,
            end_time=end_time,
            status=AppointmentStatus.PENDING,
            points_required=points_required,
            points_used=0,
            created_at=datetime.now(timezone.utc),
            updated_at=datetime.now(timezone.utc)
        )
        
        created_appointment = self.appointment_repository.create(appointment)
        
        # Deduct points from wallet
        if created_appointment:
            # Deduct points from the student's wallet (by user_id)
            self._deduct_points_from_wallet(student_id, points_required, created_appointment.id)
            created_appointment.points_used = points_required
            self.appointment_repository.update(created_appointment)
        
        return created_appointment
    
    def get_appointment_by_id(self, appointment_id: int) -> Optional[Appointment]:
        """Get appointment by ID"""
        return self.appointment_repository.get_by_id(appointment_id)
    
    def get_appointments_by_student(self, student_id: int) -> List[Appointment]:
        """Get all appointments for a student"""
        return self.appointment_repository.get_by_student_id(student_id)
    
    def get_appointments_by_mentor(self, mentor_id: int) -> List[Appointment]:
        """Get all appointments for a mentor"""
        return self.appointment_repository.get_by_mentor_id(mentor_id)
    
    def get_appointments_by_project_group(self, group_id: int) -> List[Appointment]:
        """Get all appointments for a project group"""
        return self.appointment_repository.get_by_project_group_id(group_id)
    
    def confirm_appointment(self, appointment_id: int) -> bool:
        """Confirm an appointment"""
        appointment = self.appointment_repository.get_by_id(appointment_id)
        if not appointment:
            return False
        
        appointment.status = AppointmentStatus.CONFIRMED
        appointment.updated_at = datetime.now(timezone.utc)
        self.appointment_repository.update(appointment)
        return True
    
    def cancel_appointment(self, appointment_id: int, cancelled_by_user_id: int) -> bool:
        """Cancel an appointment and refund points"""
        appointment = self.appointment_repository.get_by_id(appointment_id)
        if not appointment:
            return False
        
        # Only student or mentor can cancel
        if cancelled_by_user_id not in [appointment.student_id, appointment.mentor_id]:
            return False
        
        appointment.status = AppointmentStatus.CANCELLED
        appointment.updated_at = datetime.now(timezone.utc)
        self.appointment_repository.update(appointment)
        
        # Refund points to student
        if appointment.points_used > 0:
            wallet = self.wallet_repository.get_wallet_by_user_id(appointment.student_id)
            if wallet:
                # Refund points to the student's wallet (by user_id)
                self._refund_points_to_wallet(appointment.student_id, appointment.points_used, appointment_id)
        
        return True
    
    def complete_appointment(self, appointment_id: int) -> bool:
        """Mark appointment as completed"""
        appointment = self.appointment_repository.get_by_id(appointment_id)
        if not appointment:
            return False
        
        appointment.status = AppointmentStatus.COMPLETED
        appointment.updated_at = datetime.now(timezone.utc)
        self.appointment_repository.update(appointment)
        return True
    
    def get_available_slots(self, mentor_id: int, date: datetime, duration_hours: float = 1.0) -> List[dict]:
        """Get available time slots for a mentor on a specific date"""
        mentor = self.mentor_repository.get_by_id(mentor_id)
        if not mentor or mentor.status != MentorStatus.ACTIVE:
            return []
        
        # Get mentor's existing appointments for the date
        existing_appointments = self.appointment_repository.get_by_mentor_id(mentor_id)
        day_appointments = [
            apt for apt in existing_appointments 
            if apt.start_time.date() == date.date() and apt.status not in [AppointmentStatus.CANCELLED, AppointmentStatus.NO_SHOW]
        ]
        
        # Define working hours (9 AM to 6 PM)
        start_hour = 9
        end_hour = 18
        
        # Generate time slots
        slots = []
        current_time = datetime.combine(date.date(), datetime.min.time().replace(hour=start_hour)).replace(tzinfo=timezone.utc)
        end_time = datetime.combine(date.date(), datetime.min.time().replace(hour=end_hour)).replace(tzinfo=timezone.utc)
        
        while current_time + timedelta(hours=duration_hours) <= end_time:
            slot_end = current_time + timedelta(hours=duration_hours)
            
            # Check if slot conflicts with existing appointments
            is_available = True
            for apt in day_appointments:
                if (current_time < apt.end_time and slot_end > apt.start_time):
                    is_available = False
                    break
            
            if is_available:
                slots.append({
                    'start_time': current_time,
                    'end_time': slot_end,
                    'points_required': int(duration_hours * mentor.hourly_rate)
                })
            
            current_time += timedelta(hours=1)  # 1-hour intervals
        
        return slots
    
    def _is_mentor_available(self, mentor_id: int, start_time: datetime, end_time: datetime) -> bool:
        """Check if mentor is available for a specific time slot"""
        mentor = self.mentor_repository.get_by_id(mentor_id)
        if not mentor or mentor.status != MentorStatus.ACTIVE:
            return False
        
        conflicting_appointments = self.appointment_repository.get_conflicting_appointments(
            mentor_id, start_time, end_time
        )
        
        active_conflicts = [
            apt for apt in conflicting_appointments 
            if apt.status not in [AppointmentStatus.CANCELLED, AppointmentStatus.NO_SHOW]
        ]
        
        return len(active_conflicts) == 0
    
    def _deduct_points_from_wallet(self, user_id: int, points: int, appointment_id: int):
        """Deduct points from wallet by user_id"""
        wallet = self.wallet_repository.get_wallet_by_user_id(user_id)
        if wallet:
            new_balance = wallet.balance - points
            self.wallet_repository.update_wallet_balance(wallet.id, new_balance)

            # Create transaction record
            from domain.models.wallet import WalletTransaction
            transaction = WalletTransaction(
                wallet_id=wallet.id,
                amount=-points,
                transaction_type=TransactionType.SPENT,
                description=f"Appointment booking #{appointment_id}",
                appointment_id=appointment_id
            )
            self.wallet_repository.create_transaction(transaction)
    
    def _refund_points_to_wallet(self, user_id: int, points: int, appointment_id: int):
        """Refund points to wallet by user_id"""
        wallet = self.wallet_repository.get_wallet_by_user_id(user_id)
        if wallet:
            new_balance = wallet.balance + points
            self.wallet_repository.update_wallet_balance(wallet.id, new_balance)

            # Create transaction record
            from domain.models.wallet import WalletTransaction
            transaction = WalletTransaction(
                wallet_id=wallet.id,
                amount=points,
                transaction_type=TransactionType.REFUNDED,
                description=f"Appointment cancellation refund #{appointment_id}",
                appointment_id=appointment_id
            )
            self.wallet_repository.create_transaction(transaction)
