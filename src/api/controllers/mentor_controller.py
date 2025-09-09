from flask import Blueprint, request
from services.mentor_service import MentorService
from infrastructure.repositories.mentor_repository import MentorRepository
from infrastructure.repositories.appointment_repository import AppointmentRepository
from domain.models.mentor import MentorStatus
from datetime import datetime
import json

bp = Blueprint('mentor', __name__, url_prefix='/api/mentors')

# Initialize services
mentor_repository = MentorRepository()
appointment_repository = AppointmentRepository()
mentor_service = MentorService(mentor_repository, appointment_repository)

@bp.route('/', methods=['GET'])
def get_mentors():
    """Get all mentors with optional filtering"""
    expertise = request.args.get('expertise')
    available_only = request.args.get('available_only', 'false').lower() == 'true'
    # pagination
    try:
        page = max(1, int(request.args.get('page', 1)))
        size = max(1, min(100, int(request.args.get('size', 20))))
    except ValueError:
        page, size = 1, 20
    
    try:
        if expertise:
            mentors = mentor_service.get_mentors_by_expertise(expertise)
        elif available_only:
            mentors = mentor_service.get_available_mentors()
        else:
            mentors = mentor_service.get_all_mentors()

        # apply pagination on result list
        start = (page - 1) * size
        end = start + size
        total = len(mentors)
        mentors = mentors[start:end]
        
        mentor_list = []
        for mentor in mentors:
            mentor_list.append({
                'id': mentor.id,
                'user_id': mentor.user_id,
                'bio': mentor.bio,
                'expertise_areas': mentor.expertise_areas,
                'hourly_rate': mentor.hourly_rate,
                'max_sessions_per_day': mentor.max_sessions_per_day,
                'rating': mentor.rating,
                'total_sessions': mentor.total_sessions,
                'status': mentor.status.value,
                'created_at': mentor.created_at.isoformat() if mentor.created_at else None,
                'updated_at': mentor.updated_at.isoformat() if mentor.updated_at else None
            })
        
        return {
            'success': True,
            'data': mentor_list,
            'meta': {'page': page, 'size': size, 'total': total},
            'message': f'Found {len(mentor_list)} mentors'
        }, 200
        
    except Exception as e:
        return {
            'success': False,
            'message': str(e)
        }, 500

@bp.route('/<int:mentor_id>', methods=['GET'])
def get_mentor(mentor_id):
    """Get mentor by ID"""
    try:
        mentor = mentor_service.get_mentor_by_id(mentor_id)
        if not mentor:
            return {
                'success': False,
                'message': 'Mentor not found'
            }, 404
        
        return {
            'success': True,
            'data': {
                'id': mentor.id,
                'user_id': mentor.user_id,
                'bio': mentor.bio,
                'expertise_areas': mentor.expertise_areas,
                'hourly_rate': mentor.hourly_rate,
                'max_sessions_per_day': mentor.max_sessions_per_day,
                'rating': mentor.rating,
                'total_sessions': mentor.total_sessions,
                'status': mentor.status.value,
                'created_at': mentor.created_at.isoformat() if mentor.created_at else None,
                'updated_at': mentor.updated_at.isoformat() if mentor.updated_at else None
            },
            'message': 'Mentor found successfully'
        }, 200
        
    except Exception as e:
        return {
            'success': False,
            'message': str(e)
        }, 500

@bp.route('/', methods=['POST'])
def create_mentor():
    """Create a new mentor profile"""
    try:
        data = request.get_json()
        
        # Validate required fields
        required_fields = ['user_id', 'bio', 'expertise_areas', 'hourly_rate']
        for field in required_fields:
            if field not in data:
                return {
                    'success': False,
                    'message': f'Missing required field: {field}'
                }, 400
        
        mentor = mentor_service.create_mentor(
            user_id=data['user_id'],
            bio=data['bio'],
            expertise_areas=data['expertise_areas'],
            hourly_rate=data['hourly_rate'],
            max_sessions_per_day=data.get('max_sessions_per_day', 5)
        )
        
        return {
            'success': True,
            'data': {
                'id': mentor.id,
                'user_id': mentor.user_id,
                'bio': mentor.bio,
                'expertise_areas': mentor.expertise_areas,
                'hourly_rate': mentor.hourly_rate,
                'max_sessions_per_day': mentor.max_sessions_per_day,
                'status': mentor.status.value
            },
            'message': 'Mentor profile created successfully'
        }, 201
        
    except Exception as e:
        return {
            'success': False,
            'message': str(e)
        }, 500

@bp.route('/<int:mentor_id>', methods=['PUT'])
def update_mentor(mentor_id):
    """Update mentor profile"""
    try:
        data = request.get_json()
        
        mentor = mentor_service.update_mentor_profile(
            mentor_id=mentor_id,
            bio=data.get('bio'),
            expertise_areas=data.get('expertise_areas'),
            hourly_rate=data.get('hourly_rate'),
            max_sessions_per_day=data.get('max_sessions_per_day')
        )
        
        if not mentor:
            return {
                'success': False,
                'message': 'Mentor not found'
            }, 404
        
        return {
            'success': True,
            'data': {
                'id': mentor.id,
                'user_id': mentor.user_id,
                'bio': mentor.bio,
                'expertise_areas': mentor.expertise_areas,
                'hourly_rate': mentor.hourly_rate,
                'max_sessions_per_day': mentor.max_sessions_per_day,
                'status': mentor.status.value
            },
            'message': 'Mentor profile updated successfully'
        }, 200
        
    except Exception as e:
        return {
            'success': False,
            'message': str(e)
        }, 500

@bp.route('/<int:mentor_id>/schedule', methods=['GET'])
def get_mentor_schedule(mentor_id):
    """Get mentor schedule for a specific date"""
    try:
        date_str = request.args.get('date')
        if not date_str:
            return {
                'success': False,
                'message': 'Date parameter is required'
            }, 400
        
        date = datetime.strptime(date_str, '%Y-%m-%d')
        schedule = mentor_service.get_mentor_schedule(mentor_id, date)
        
        return {
            'success': True,
            'data': schedule,
            'message': f'Schedule for {date_str}'
        }, 200
        
    except ValueError:
        return {
            'success': False,
            'message': 'Invalid date format. Use YYYY-MM-DD'
        }, 400
    except Exception as e:
        return {
            'success': False,
            'message': str(e)
        }, 500

@bp.route('/<int:mentor_id>/status', methods=['PUT'])
def update_mentor_status(mentor_id):
    """Update mentor status"""
    try:
        data = request.get_json()
        status_str = data.get('status')
        
        if not status_str:
            return {
                'success': False,
                'message': 'Status is required'
            }, 400
        
        try:
            status = MentorStatus(status_str)
        except ValueError:
            return {
                'success': False,
                'message': 'Invalid status. Use: active, inactive, busy'
            }, 400
        
        success = mentor_service.update_mentor_status(mentor_id, status)
        
        if not success:
            return {
                'success': False,
                'message': 'Mentor not found'
            }, 404
        
        return {
            'success': True,
            'message': f'Mentor status updated to {status.value}'
        }, 200
        
    except Exception as e:
        return {
            'success': False,
            'message': str(e)
        }, 500
