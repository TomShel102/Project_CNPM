# Middleware functions for processing requests and responses

from flask import  request, jsonify, current_app
from infrastructure.databases.mssql import remove_session
import jwt

def log_request_info(app):
    app.logger.debug('Headers: %s', request.headers)
    app.logger.debug('Body: %s', request.get_data())

def handle_options_request():
    return {'message': 'CORS preflight response'}, 200

def error_handling_middleware(error):
    return {'error': str(error)}, 500

def add_custom_headers(response):
    response.headers['X-Custom-Header'] = 'Value'
    return response

def middleware(app):
    @app.before_request
    def before_request():
        log_request_info(app)

    @app.after_request
    def after_request(response):
        response = add_custom_headers(response)
        # Ensure SQLAlchemy session is removed after each request
        remove_session()
        return response

    @app.errorhandler(Exception)
    def handle_exception(error):
        try:
            return error_handling_middleware(error)
        finally:
            # Remove session on error paths as well
            remove_session()

    @app.route('/options', methods=['OPTIONS'])
    def options_route():
        return handle_options_request()

    def require_auth(f):
        def wrapper(*args, **kwargs):
            auth_header = request.headers.get('Authorization', '')
            if not auth_header.startswith('Bearer '):
                return jsonify({'error': 'Unauthorized'}), 401
            token = auth_header.split(' ', 1)[1]
            try:
                jwt.decode(token, current_app.config['SECRET_KEY'], algorithms=['HS256'])
            except Exception:
                return jsonify({'error': 'Invalid token'}), 401
            return f(*args, **kwargs)
        wrapper.__name__ = f.__name__
        return wrapper
    app.require_auth = require_auth