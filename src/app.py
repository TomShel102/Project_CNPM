from flask import Flask
import os
from api.swagger import spec
from api.controllers.todo_controller import bp as todo_bp
from api.controllers.mentor_controller import bp as mentor_bp
from api.controllers.appointment_controller import bp as appointment_bp
from api.controllers.course_controller import bp as course_bp
from api.controllers.auth_controller import auth_bp
from api.controllers.user_controller import user_bp
from api.middleware import middleware
from api.responses import success_response
from infrastructure.databases import init_db
from config import Config
from config import Config
from cors import init_cors
from flask_swagger_ui import get_swaggerui_blueprint


def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)
    
    # Register blueprints
    app.register_blueprint(todo_bp)
    app.register_blueprint(mentor_bp)
    app.register_blueprint(appointment_bp)
    app.register_blueprint(course_bp)
    app.register_blueprint(auth_bp)
    app.register_blueprint(user_bp)

    # flasgger already serves Swagger UI at /docs via Swagger(app)

    try:
        init_db(app)
    except Exception as e:
        print(f"Error initializing database: {e}")

    # Register middleware
    middleware(app)
    init_cors(app)

    # Register routes
    with app.test_request_context():
        for rule in app.url_map.iter_rules():
            # Add endpoints for swagger documentation
            if rule.endpoint.startswith(('todo.', 'mentor.', 'appointment.', 'course.', 'user.', 'auth.')):
                view_func = app.view_functions[rule.endpoint]
                print(f"Adding path: {rule.rule} -> {view_func}")
                spec.path(view=view_func)

    @app.route("/swagger.json")
    def swagger_json():
        return spec.to_dict(), 200

    # Swagger UI at /docs
    swaggerui_blueprint = get_swaggerui_blueprint(
        "/docs",
        "/swagger.json",
        config={
            'app_name': "Mentor Booking System API"
        }
    )
    app.register_blueprint(swaggerui_blueprint, url_prefix='/docs')

    @app.route("/")
    def index():
        return {
            "message": "Welcome to Mentor Booking System API",
            "version": "1.0.0",
            "docs": "/docs"
        }, 200

    return app

if __name__ == '__main__':
    app = create_app()
    port = int(os.environ.get('PORT', '6868'))
    app.run(host='0.0.0.0', port=port, debug=True)