from infrastructure.databases.mssql import init_mssql
from infrastructure.models import (
    course_register_model, todo_model, user_model, course_model, 
    consultant_model, appointment_model, program_model, feedback_model,
    mentor_model, project_group_model, wallet_model, rating_model
)

def init_db(app):
    init_mssql(app)
    
from infrastructure.databases.mssql import Base