from flask import Blueprint, jsonify, request
from infrastructure.repositories.user_repository import UserRepository
from infrastructure.models.user_model import UserModel
from infrastructure.databases.mssql import session
import jwt
from datetime import datetime

user_bp = Blueprint('user', __name__, url_prefix='/api/users')

def get_current_user():
    """Helper function to get current user from JWT token"""
    token = request.headers.get('Authorization')
    if not token:
        return None
    
    try:
        if token.startswith('Bearer '):
            token = token[7:]
        
        from flask import current_app
        payload = jwt.decode(token, current_app.config['SECRET_KEY'], algorithms=['HS256'])
        user_id = payload.get('user_id')
        
        user = session.query(UserModel).filter_by(id=user_id).first()
        return user
    except Exception as e:
        return None

@user_bp.route('/mentors', methods=['GET'])
def get_mentors():
    mentors = UserRepository().get_users_by_role('MENTOR')
    return jsonify({'data': mentors})

@user_bp.route('/profile', methods=['GET'])
def get_profile():
    """Get current user profile"""
    user = get_current_user()
    if not user:
        return jsonify({'error': 'Unauthorized'}), 401
    
    profile_data = {
        'id': user.id,
        'username': user.username,
        'email': user.email,
        'full_name': user.full_name,
        'role': user.role.value if user.role else 'student',
        'phone': user.phone,
        'avatar_url': user.avatar_url,
        'is_active': user.is_active,
        'created_at': user.created_at.isoformat() if user.created_at else None,
        'updated_at': user.updated_at.isoformat() if user.updated_at else None
    }
    
    return jsonify({'data': profile_data}), 200

@user_bp.route('/profile', methods=['PUT'])
def update_profile():
    """Update current user profile"""
    user = get_current_user()
    if not user:
        return jsonify({'error': 'Unauthorized'}), 401
    
    data = request.get_json()
    
    # Update allowed fields
    if 'full_name' in data:
        user.full_name = data['full_name']
    if 'email' in data:
        user.email = data['email']
    if 'phone' in data:
        user.phone = data['phone']
    if 'avatar_url' in data:
        user.avatar_url = data['avatar_url']
    
    user.updated_at = datetime.utcnow()
    
    try:
        session.commit()
        
        profile_data = {
            'id': user.id,
            'username': user.username,
            'email': user.email,
            'full_name': user.full_name,
            'role': user.role.value if user.role else 'student',
            'phone': user.phone,
            'avatar_url': user.avatar_url,
            'is_active': user.is_active,
            'created_at': user.created_at.isoformat() if user.created_at else None,
            'updated_at': user.updated_at.isoformat() if user.updated_at else None
        }
        
        return jsonify({
            'message': 'Profile updated successfully',
            'data': profile_data
        }), 200
    except Exception as e:
        session.rollback()
        return jsonify({'error': 'Failed to update profile'}), 500

@user_bp.route('/<int:user_id>', methods=['GET'])
def get_user_by_id(user_id):
    """Get user profile by ID (public info only)"""
    user = session.query(UserModel).filter_by(id=user_id).first()
    if not user:
        return jsonify({'error': 'User not found'}), 404
    
    # Return only public information
    public_data = {
        'id': user.id,
        'username': user.username,
        'full_name': user.full_name,
        'role': user.role.value if user.role else 'student',
        'avatar_url': user.avatar_url,
        'created_at': user.created_at.isoformat() if user.created_at else None
    }
    
    return jsonify({'data': public_data}), 200