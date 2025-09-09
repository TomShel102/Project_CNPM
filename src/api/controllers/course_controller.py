from flask import Blueprint, request, jsonify
from services.course_service import CourseService
from infrastructure.repositories.course_repository import CourseRepository
from datetime import datetime

bp = Blueprint('course', __name__, url_prefix='/api/courses')

course_service = CourseService(CourseRepository())

@bp.route('/', methods=['GET'])
def list_courses():
    courses = course_service.list_courses()
    return jsonify([
        {
            'id': c.id,
            'course_name': c.course_name,
            'description': c.description,
            'status': c.status,
            'start_date': c.start_date.isoformat() if hasattr(c.start_date, 'isoformat') else c.start_date,
            'end_date': c.end_date.isoformat() if hasattr(c.end_date, 'isoformat') else c.end_date,
            'created_at': c.created_at.isoformat() if hasattr(c.created_at, 'isoformat') else c.created_at,
            'updated_at': c.updated_at.isoformat() if hasattr(c.updated_at, 'isoformat') else c.updated_at,
        }
        for c in courses
    ]), 200

@bp.route('/<int:course_id>', methods=['GET'])
def get_course(course_id):
    c = course_service.get_course(course_id)
    if not c:
        return {'message': 'Course not found'}, 404
    return {
        'id': c.id,
        'course_name': c.course_name,
        'description': c.description,
        'status': c.status,
        'start_date': c.start_date.isoformat() if hasattr(c.start_date, 'isoformat') else c.start_date,
        'end_date': c.end_date.isoformat() if hasattr(c.end_date, 'isoformat') else c.end_date,
        'created_at': c.created_at.isoformat() if hasattr(c.created_at, 'isoformat') else c.created_at,
        'updated_at': c.updated_at.isoformat() if hasattr(c.updated_at, 'isoformat') else c.updated_at,
    }, 200

@bp.route('/', methods=['POST'])
def create_course():
    data = request.get_json()
    now = datetime.utcnow()
    c = course_service.create_course(
        course_name=data['course_name'],
        description=data.get('description'),
        status=data['status'],
        start_date=data['start_date'],
        end_date=data['end_date'],
        created_at=now,
        updated_at=now
    )
    return {
        'id': c.id,
        'course_name': c.course_name,
        'description': c.description,
        'status': c.status,
        'start_date': c.start_date,
        'end_date': c.end_date,
        'created_at': c.created_at,
        'updated_at': c.updated_at,
    }, 201

@bp.route('/<int:course_id>', methods=['PUT'])
def update_course(course_id):
    data = request.get_json()
    now = datetime.utcnow()
    c = course_service.update_course(
        course_id=course_id,
        course_name=data['course_name'],
        description=data.get('description'),
        status=data['status'],
        start_date=data['start_date'],
        end_date=data['end_date'],
        created_at=now,
        updated_at=now
    )
    return {
        'id': c.id,
        'course_name': c.course_name,
        'description': c.description,
        'status': c.status,
        'start_date': c.start_date,
        'end_date': c.end_date,
        'created_at': c.created_at,
        'updated_at': c.updated_at,
    }, 200

@bp.route('/<int:course_id>', methods=['DELETE'])
def delete_course(course_id):
    course_service.delete_course(course_id)
    return '', 204