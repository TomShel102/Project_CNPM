from flask import Blueprint, request
from services.appointment_service import AppointmentService
from infrastructure.repositories.appointment_repository import AppointmentRepository
from infrastructure.repositories.mentor_repository import MentorRepository
from infrastructure.repositories.wallet_repository import WalletRepository
from domain.models.appointment import AppointmentStatus
from datetime import datetime
import json

bp = Blueprint('appointment', __name__, url_prefix='/api/appointments')

# Initialize services
appointment_repository = AppointmentRepository()
mentor_repository = MentorRepository()
wallet_repository = WalletRepository()
appointment_service = AppointmentService(appointment_repository, mentor_repository, wallet_repository)

@bp.route('/', methods=['POST'])
def create_appointment():
    """Create a new appointment booking"""
    try:
        data = request.get_json()
        
        # Validate required fields
        required_fields = ['mentor_id', 'student_id', 'title', 'start_time', 'end_time']
        for field in required_fields:
            if field not in data:
                return {
                    'success': False,
                    'message': f'Missing required field: {field}'
                }, 400
        
        # Parse datetime strings
        try:
            start_time = datetime.fromisoformat(data['start_time'].replace('Z', '+00:00'))
            end_time = datetime.fromisoformat(data['end_time'].replace('Z', '+00:00'))
        except ValueError:
            return {
                'success': False,
                'message': 'Invalid datetime format. Use ISO format (YYYY-MM-DDTHH:MM:SS)'
            }, 400
        
        appointment = appointment_service.create_appointment(
            mentor_id=data['mentor_id'],
            student_id=data['student_id'],
            title=data['title'],
            description=data.get('description', ''),
            start_time=start_time,
            end_time=end_time,
            project_group_id=data.get('project_group_id')
        )
        
        return {
            'success': True,
            'data': {
                'id': appointment.id,
                'mentor_id': appointment.mentor_id,
                'student_id': appointment.student_id,
                'project_group_id': appointment.project_group_id,
                'title': appointment.title,
                'description': appointment.description,
                'start_time': appointment.start_time.isoformat(),
                'end_time': appointment.end_time.isoformat(),
                'status': appointment.status.value,
                'points_required': appointment.points_required,
                'points_used': appointment.points_used,
                'meeting_url': appointment.meeting_url,
                'notes': appointment.notes
            },
            'message': 'Appointment booked successfully'
        }, 201
        
    except ValueError as e:
        return {
            'success': False,
            'message': str(e)
        }, 400
    except Exception as e:
        return {
            'success': False,
            'message': str(e)
        }, 500

@bp.route('/<int:appointment_id>', methods=['GET'])
def get_appointment(appointment_id):
    """Get appointment by ID"""
    try:
        appointment = appointment_service.get_appointment_by_id(appointment_id)
        if not appointment:
            return {
                'success': False,
                'message': 'Appointment not found'
            }, 404
        
        return {
            'success': True,
            'data': {
                'id': appointment.id,
                'mentor_id': appointment.mentor_id,
                'student_id': appointment.student_id,
                'project_group_id': appointment.project_group_id,
                'title': appointment.title,
                'description': appointment.description,
                'start_time': appointment.start_time.isoformat(),
                'end_time': appointment.end_time.isoformat(),
                'status': appointment.status.value,
                'points_required': appointment.points_required,
                'points_used': appointment.points_used,
                'meeting_url': appointment.meeting_url,
                'notes': appointment.notes,
                'created_at': appointment.created_at.isoformat(),
                'updated_at': appointment.updated_at.isoformat()
            },
            'message': 'Appointment found successfully'
        }, 200
        
    except Exception as e:
        return {
            'success': False,
            'message': str(e)
        }, 500

@bp.route('/student/<int:student_id>', methods=['GET'])
def get_student_appointments(student_id):
    """Get all appointments for a student"""
    try:
        # pagination
        try:
            page = max(1, int(request.args.get('page', 1)))
            size = max(1, min(100, int(request.args.get('size', 20))))
        except ValueError:
            page, size = 1, 20

        appointments = appointment_service.get_appointments_by_student(student_id)
        
        total = len(appointments)
        start = (page - 1) * size
        end = start + size
        appointments = appointments[start:end]

        appointment_list = []
        for appointment in appointments:
            appointment_list.append({
                'id': appointment.id,
                'mentor_id': appointment.mentor_id,
                'student_id': appointment.student_id,
                'project_group_id': appointment.project_group_id,
                'title': appointment.title,
                'description': appointment.description,
                'start_time': appointment.start_time.isoformat(),
                'end_time': appointment.end_time.isoformat(),
                'status': appointment.status.value,
                'points_required': appointment.points_required,
                'points_used': appointment.points_used,
                'meeting_url': appointment.meeting_url,
                'notes': appointment.notes,
                'created_at': appointment.created_at.isoformat(),
                'updated_at': appointment.updated_at.isoformat()
            })
        
        return {
            'success': True,
            'data': appointment_list,
            'meta': {'page': page, 'size': size, 'total': total},
            'message': f'Found {len(appointment_list)} appointments'
        }, 200
        
    except Exception as e:
        return {
            'success': False,
            'message': str(e)
        }, 500

@bp.route('/mentor/<int:mentor_id>', methods=['GET'])
def get_mentor_appointments(mentor_id):
    """Get all appointments for a mentor"""
    try:
        # pagination
        try:
            page = max(1, int(request.args.get('page', 1)))
            size = max(1, min(100, int(request.args.get('size', 20))))
        except ValueError:
            page, size = 1, 20

        appointments = appointment_service.get_appointments_by_mentor(mentor_id)
        
        total = len(appointments)
        start = (page - 1) * size
        end = start + size
        appointments = appointments[start:end]

        appointment_list = []
        for appointment in appointments:
            appointment_list.append({
                'id': appointment.id,
                'mentor_id': appointment.mentor_id,
                'student_id': appointment.student_id,
                'project_group_id': appointment.project_group_id,
                'title': appointment.title,
                'description': appointment.description,
                'start_time': appointment.start_time.isoformat(),
                'end_time': appointment.end_time.isoformat(),
                'status': appointment.status.value,
                'points_required': appointment.points_required,
                'points_used': appointment.points_used,
                'meeting_url': appointment.meeting_url,
                'notes': appointment.notes,
                'created_at': appointment.created_at.isoformat(),
                'updated_at': appointment.updated_at.isoformat()
            })
        
        return {
            'success': True,
            'data': appointment_list,
            'meta': {'page': page, 'size': size, 'total': total},
            'message': f'Found {len(appointment_list)} appointments'
        }, 200
        
    except Exception as e:
        return {
            'success': False,
            'message': str(e)
        }, 500

@bp.route('/<int:appointment_id>/confirm', methods=['PUT'])
def confirm_appointment(appointment_id):
    """Confirm an appointment"""
    try:
        success = appointment_service.confirm_appointment(appointment_id)
        
        if not success:
            return {
                'success': False,
                'message': 'Appointment not found'
            }, 404
        
        return {
            'success': True,
            'message': 'Appointment confirmed successfully'
        }, 200
        
    except Exception as e:
        return {
            'success': False,
            'message': str(e)
        }, 500

@bp.route('/<int:appointment_id>/cancel', methods=['PUT'])
def cancel_appointment(appointment_id):
    """Cancel an appointment"""
    try:
        data = request.get_json()
        cancelled_by_user_id = data.get('cancelled_by_user_id')
        
        if not cancelled_by_user_id:
            return {
                'success': False,
                'message': 'cancelled_by_user_id is required'
            }, 400
        
        success = appointment_service.cancel_appointment(appointment_id, cancelled_by_user_id)
        
        if not success:
            return {
                'success': False,
                'message': 'Appointment not found or unauthorized to cancel'
            }, 404
        
        return {
            'success': True,
            'message': 'Appointment cancelled successfully. Points have been refunded.'
        }, 200
        
    except Exception as e:
        return {
            'success': False,
            'message': str(e)
        }, 500

@bp.route('/<int:appointment_id>/complete', methods=['PUT'])
def complete_appointment(appointment_id):
    """Mark appointment as completed"""
    try:
        success = appointment_service.complete_appointment(appointment_id)
        
        if not success:
            return {
                'success': False,
                'message': 'Appointment not found'
            }, 404
        
        return {
            'success': True,
            'message': 'Appointment marked as completed'
        }, 200
        
    except Exception as e:
        return {
            'success': False,
            'message': str(e)
        }, 500

@bp.route('/mentor/<int:mentor_id>/available-slots', methods=['GET'])
def get_available_slots(mentor_id):
    """Get available time slots for a mentor on a specific date"""
    try:
        date_str = request.args.get('date')
        duration_hours = float(request.args.get('duration_hours', 1.0))
        
        if not date_str:
            return {
                'success': False,
                'message': 'Date parameter is required'
            }, 400
        
        try:
            date = datetime.strptime(date_str, '%Y-%m-%d')
        except ValueError:
            return {
                'success': False,
                'message': 'Invalid date format. Use YYYY-MM-DD'
            }, 400
        
        slots = appointment_service.get_available_slots(mentor_id, date, duration_hours)
        
        # Format slots for response
        formatted_slots = []
        for slot in slots:
            formatted_slots.append({
                'start_time': slot['start_time'].isoformat(),
                'end_time': slot['end_time'].isoformat(),
                'points_required': slot['points_required']
            })
        
        return {
            'success': True,
            'data': formatted_slots,
            'message': f'Available slots for {date_str}'
        }, 200
        
    except Exception as e:
        return {
            'success': False,
            'message': str(e)
        }, 500
