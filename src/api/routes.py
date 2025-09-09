from src.api.controllers.todo_controller import bp as todo_bp
from src.api.controllers.auth_controller import auth_bp
from src.api.controllers.course_controller import bp as course_bp
from src.api.controllers.mentor_controller import bp as mentor_bp
from src.api.controllers.appointment_controller import bp as appointment_bp
from src.api.controllers.wallet_controller import bp as wallet_bp

def register_routes(app):
    app.register_blueprint(todo_bp)
    app.register_blueprint(auth_bp)
    app.register_blueprint(course_bp)
    app.register_blueprint(mentor_bp)
    app.register_blueprint(appointment_bp)
    app.register_blueprint(wallet_bp) 