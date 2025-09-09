import jwt
import bcrypt
from flask import Blueprint, request, jsonify, current_app
from datetime import datetime, timedelta, timezone
from infrastructure.models.user_model import UserModel
from infrastructure.databases.mssql import session

auth_bp = Blueprint('auth', __name__, url_prefix='/api/auth')

@auth_bp.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    username = data.get('username')
    email = data.get('email')
    password = data.get('password')
    role = data.get('role', 'student')
    
    if not username or not email or not password:
        return jsonify({'error': 'Username, email and password are required'}), 400
    
    # Check if user already exists
    existing_user = session.query(UserModel).filter_by(username=username).first()
    if existing_user:
        return jsonify({'error': 'Username already exists'}), 400
    
    # Hash password
    hashed_password = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
    
    # Create new user
    from datetime import datetime
    from domain.models.user import UserRole
    new_user = UserModel(
        username=username,
        email=email,
        password=hashed_password,
        full_name=username,  # Use username as full_name for now
        role=UserRole(role),
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow()
    )
    
    try:
        session.add(new_user)
        session.commit()
        
        return jsonify({
            'message': 'User registered successfully',
            'user': {
                'id': new_user.id,
                'username': new_user.username,
                'email': new_user.email
            }
        }), 201
    except Exception as e:
        session.rollback()
        return jsonify({'error': 'Registration failed'}), 500

@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    user = session.query(UserModel).filter_by(username=data.get('username', data.get('user_name'))).first()
    if not user:
        return jsonify({'error': 'Invalid credentials'}), 401

    # Backward-compatible: accept either hashed or plaintext stored passwords
    provided = data['password'].encode('utf-8')
    stored = (user.password or '').encode('utf-8')
    is_valid = False
    try:
        if stored.startswith(b'$2b$') or stored.startswith(b'$2a$'):
            is_valid = bcrypt.checkpw(provided, stored)
        else:
            is_valid = provided.decode('utf-8') == user.password
    except Exception:
        is_valid = False

    if not is_valid:
        return jsonify({'error': 'Invalid credentials'}), 401

    secret = current_app.config.get('SECRET_KEY')
    if not secret:
        return jsonify({'error': 'Server misconfigured: SECRET_KEY not set'}), 500
    payload = {
        'user_id': user.id,
        'exp': datetime.now(timezone.utc) + timedelta(hours=2)
    }
    token = jwt.encode(payload, secret, algorithm='HS256')
    return jsonify({
        'token': token,
        'user': {
            'id': user.id,
            'username': user.username,
            'email': user.email,
            'role': user.role.value if user.role else 'student'
        }
    }), 200