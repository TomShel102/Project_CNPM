from apispec import APISpec
from apispec.ext.marshmallow import MarshmallowPlugin
from apispec_webframeworks.flask import FlaskPlugin
from api.schemas.todo import TodoRequestSchema, TodoResponseSchema
from api.schemas.course import CourseRequestSchema, CourseResponseSchema
from api.schemas.mentor import MentorResponseSchema
from api.schemas.appointment import AppointmentRequestSchema, AppointmentResponseSchema

spec = APISpec(
    title="Todo API",
    version="1.0.0",
    openapi_version="3.0.2",
    plugins=[FlaskPlugin(), MarshmallowPlugin()],
)

# Đăng ký schema để tự động sinh model
spec.components.schema("TodoRequest", schema=TodoRequestSchema)
spec.components.schema("TodoResponse", schema=TodoResponseSchema)
spec.components.schema("CourseRequest", schema=CourseRequestSchema)
spec.components.schema("CourseResponse", schema=CourseResponseSchema)
spec.components.schema("MentorResponse", schema=MentorResponseSchema)
spec.components.schema("AppointmentRequest", schema=AppointmentRequestSchema)
spec.components.schema("AppointmentResponse", schema=AppointmentResponseSchema)