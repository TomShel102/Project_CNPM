import jwt
import sqlite3
from flask import Blueprint, request, jsonify, current_app
from datetime import datetime, timedelta, timezone
import os

auth_sqlite_bp = Blueprint('auth_sqlite', __name__, url_prefix='/api/auth')

def get_db_connection():
    """Get SQLite database connection"""
    db_path = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), 'default.db')
    conn = sqlite3.connect(db_path)
    conn.row_factory = sqlite3.Row  # This allows column access by name
    return conn

@auth_sqlite_bp.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    username = data.get('username')
    email = data.get('email')
    password = data.get('password')
    role = data.get('role', 'STUDENT')
    
    if not username or not email or not password:
        return jsonify({'error': 'Username, email and password are required'}), 400
    
    conn = get_db_connection()
    cursor = conn.cursor()
    
    try:
        # Check if user already exists
        cursor.execute('SELECT username FROM users WHERE username = ?', (username,))
        existing_user = cursor.fetchone()
        if existing_user:
            return jsonify({'error': 'Username already exists'}), 400
        
        # Create new user
        cursor.execute('''
            INSERT INTO users (username, email, password, full_name, role, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        ''', (username, email, password, username, role, 
              datetime.utcnow().isoformat(), datetime.utcnow().isoformat()))
        
        user_id = cursor.lastrowid
        conn.commit()
        
        return jsonify({
            'message': 'User registered successfully',
            'user': {
                'id': user_id,
                'username': username,
                'email': email
            }
        }), 201
        
    except Exception as e:
        conn.rollback()
        return jsonify({'error': f'Registration failed: {str(e)}'}), 500
    finally:
        conn.close()

@auth_sqlite_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    username = data.get('username', data.get('user_name'))
    password = data.get('password')
    
    if not username or not password:
        return jsonify({'error': 'Username and password are required'}), 400
    
    conn = get_db_connection()
    cursor = conn.cursor()
    
    try:
        # Get user from database
        cursor.execute('SELECT * FROM users WHERE username = ?', (username,))
        user = cursor.fetchone()
        
        if not user:
            return jsonify({'error': 'Invalid credentials'}), 401
        
        # Check password (simple comparison for testing)
        if user['password'] != password:
            return jsonify({'error': 'Invalid credentials'}), 401
        
        # Generate JWT token
        secret = current_app.config.get('SECRET_KEY', 'your-secret-key')
        payload = {
            'user_id': user['id'],
            'username': user['username'],
            'exp': datetime.now(timezone.utc) + timedelta(hours=2)
        }
        token = jwt.encode(payload, secret, algorithm='HS256')
        
        return jsonify({
            'token': token,
            'user': {
                'id': user['id'],
                'username': user['username'],
                'email': user['email'],
                'role': user['role'].lower() if user['role'] else 'student'
            }
        }), 200
        
    except Exception as e:
        return jsonify({'error': f'Login failed: {str(e)}'}), 500
    finally:
        conn.close()
