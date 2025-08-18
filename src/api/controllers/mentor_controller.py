from flask import Blueprint, request, jsonify
from flasgger import swag_from
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
@swag_from({
    'tags': ['Mentors'],
    'summary': 'Get all mentors',
    'parameters': [
        {
            'name': 'expertise',
            'in': 'query',
            'type': 'string',
            'required': False,
            'description': 'Filter by expertise area'
        },
        {
            'name': 'available_only',
            'in': 'query',
            'type': 'boolean',
            'required': False,
            'description': 'Get only available mentors'
        }
    ],
    'responses': {
        200: {
            'description': 'List of mentors',
            'schema': {
                'type': 'array',
                'items': {
                    'type': 'object',
                    'properties': {
                        'id': {'type': 'integer'},
                        'user_id': {'type': 'integer'},
                        'bio': {'type': 'string'},
                        'expertise_areas': {'type': 'array', 'items': {'type': 'string'}},
                        'hourly_rate': {'type': 'integer'},
                        'rating': {'type': 'number'},
                        'status': {'type': 'string'}
                    }
                }
            }
        }
    }
})
def get_mentors():
    """Get all mentors with optional filtering"""
    expertise = request.args.get('expertise')
    available_only = request.args.get('available_only', 'false').lower() == 'true'
    
    try:
        if expertise:
            mentors = mentor_service.get_mentors_by_expertise(expertise)
        elif available_only:
            mentors = mentor_service.get_available_mentors()
        else:
            mentors = mentor_service.get_all_mentors()
        
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
        
        return jsonify({
            'success': True,
            'data': mentor_list,
            'message': f'Found {len(mentor_list)} mentors'
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': str(e)
        }), 500

@bp.route('/<int:mentor_id>', methods=['GET'])
@swag_from({
    'tags': ['Mentors'],
    'summary': 'Get mentor by ID',
    'parameters': [
        {
            'name': 'mentor_id',
            'in': 'path',
            'type': 'integer',
            'required': True,
            'description': 'Mentor ID'
        }
    ],
    'responses': {
        200: {
            'description': 'Mentor details',
            'schema': {
                'type': 'object',
                'properties': {
                    'id': {'type': 'integer'},
                    'user_id': {'type': 'integer'},
                    'bio': {'type': 'string'},
                    'expertise_areas': {'type': 'array', 'items': {'type': 'string'}},
                    'hourly_rate': {'type': 'integer'},
                    'rating': {'type': 'number'},
                    'status': {'type': 'string'}
                }
            }
        },
        404: {
            'description': 'Mentor not found'
        }
    }
})
def get_mentor(mentor_id):
    """Get mentor by ID"""
    try:
        mentor = mentor_service.get_mentor_by_id(mentor_id)
        if not mentor:
            return jsonify({
                'success': False,
                'message': 'Mentor not found'
            }), 404
        
        return jsonify({
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
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': str(e)
        }), 500

@bp.route('/', methods=['POST'])
@swag_from({
    'tags': ['Mentors'],
    'summary': 'Create new mentor profile',
    'parameters': [
        {
            'name': 'body',
            'in': 'body',
            'required': True,
            'schema': {
                'type': 'object',
                'properties': {
                    'user_id': {'type': 'integer'},
                    'bio': {'type': 'string'},
                    'expertise_areas': {'type': 'array', 'items': {'type': 'string'}},
                    'hourly_rate': {'type': 'integer'},
                    'max_sessions_per_day': {'type': 'integer'}
                },
                'required': ['user_id', 'bio', 'expertise_areas', 'hourly_rate']
            }
        }
    ],
    'responses': {
        201: {
            'description': 'Mentor created successfully'
        },
        400: {
            'description': 'Invalid input data'
        }
    }
})
def create_mentor():
    """Create a new mentor profile"""
    try:
        data = request.get_json()
        
        # Validate required fields
        required_fields = ['user_id', 'bio', 'expertise_areas', 'hourly_rate']
        for field in required_fields:
            if field not in data:
                return jsonify({
                    'success': False,
                    'message': f'Missing required field: {field}'
                }), 400
        
        mentor = mentor_service.create_mentor(
            user_id=data['user_id'],
            bio=data['bio'],
            expertise_areas=data['expertise_areas'],
            hourly_rate=data['hourly_rate'],
            max_sessions_per_day=data.get('max_sessions_per_day', 5)
        )
        
        return jsonify({
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
        }), 201
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': str(e)
        }), 500

@bp.route('/<int:mentor_id>', methods=['PUT'])
@swag_from({
    'tags': ['Mentors'],
    'summary': 'Update mentor profile',
    'parameters': [
        {
            'name': 'mentor_id',
            'in': 'path',
            'type': 'integer',
            'required': True,
            'description': 'Mentor ID'
        },
        {
            'name': 'body',
            'in': 'body',
            'required': True,
            'schema': {
                'type': 'object',
                'properties': {
                    'bio': {'type': 'string'},
                    'expertise_areas': {'type': 'array', 'items': {'type': 'string'}},
                    'hourly_rate': {'type': 'integer'},
                    'max_sessions_per_day': {'type': 'integer'}
                }
            }
        }
    ],
    'responses': {
        200: {
            'description': 'Mentor updated successfully'
        },
        404: {
            'description': 'Mentor not found'
        }
    }
})
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
            return jsonify({
                'success': False,
                'message': 'Mentor not found'
            }), 404
        
        return jsonify({
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
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': str(e)
        }), 500

@bp.route('/<int:mentor_id>/schedule', methods=['GET'])
@swag_from({
    'tags': ['Mentors'],
    'summary': 'Get mentor schedule for a specific date',
    'parameters': [
        {
            'name': 'mentor_id',
            'in': 'path',
            'type': 'integer',
            'required': True,
            'description': 'Mentor ID'
        },
        {
            'name': 'date',
            'in': 'query',
            'type': 'string',
            'required': True,
            'description': 'Date in YYYY-MM-DD format'
        }
    ],
    'responses': {
        200: {
            'description': 'Mentor schedule',
            'schema': {
                'type': 'array',
                'items': {
                    'type': 'object',
                    'properties': {
                        'id': {'type': 'integer'},
                        'start_time': {'type': 'string'},
                        'end_time': {'type': 'string'},
                        'status': {'type': 'string'},
                        'title': {'type': 'string'}
                    }
                }
            }
        }
    }
})
def get_mentor_schedule(mentor_id):
    """Get mentor schedule for a specific date"""
    try:
        date_str = request.args.get('date')
        if not date_str:
            return jsonify({
                'success': False,
                'message': 'Date parameter is required'
            }), 400
        
        date = datetime.strptime(date_str, '%Y-%m-%d')
        schedule = mentor_service.get_mentor_schedule(mentor_id, date)
        
        return jsonify({
            'success': True,
            'data': schedule,
            'message': f'Schedule for {date_str}'
        }), 200
        
    except ValueError:
        return jsonify({
            'success': False,
            'message': 'Invalid date format. Use YYYY-MM-DD'
        }), 400
    except Exception as e:
        return jsonify({
            'success': False,
            'message': str(e)
        }), 500

@bp.route('/<int:mentor_id>/status', methods=['PUT'])
@swag_from({
    'tags': ['Mentors'],
    'summary': 'Update mentor status',
    'parameters': [
        {
            'name': 'mentor_id',
            'in': 'path',
            'type': 'integer',
            'required': True,
            'description': 'Mentor ID'
        },
        {
            'name': 'body',
            'in': 'body',
            'required': True,
            'schema': {
                'type': 'object',
                'properties': {
                    'status': {'type': 'string', 'enum': ['active', 'inactive', 'busy']}
                },
                'required': ['status']
            }
        }
    ],
    'responses': {
        200: {
            'description': 'Status updated successfully'
        },
        400: {
            'description': 'Invalid status'
        }
    }
})
def update_mentor_status(mentor_id):
    """Update mentor status"""
    try:
        data = request.get_json()
        status_str = data.get('status')
        
        if not status_str:
            return jsonify({
                'success': False,
                'message': 'Status is required'
            }), 400
        
        try:
            status = MentorStatus(status_str)
        except ValueError:
            return jsonify({
                'success': False,
                'message': 'Invalid status. Use: active, inactive, busy'
            }), 400
        
        success = mentor_service.update_mentor_status(mentor_id, status)
        
        if not success:
            return jsonify({
                'success': False,
                'message': 'Mentor not found'
            }), 404
        
        return jsonify({
            'success': True,
            'message': f'Mentor status updated to {status.value}'
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': str(e)
        }), 500
