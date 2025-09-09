from marshmallow import Schema, fields

class CourseRequestSchema(Schema):
    course_name = fields.Str(required=True)
    description = fields.Str(required=False, allow_none=True)
    status = fields.Str(required=True)
    start_date = fields.Raw(required=True)
    end_date = fields.Raw(required=True)

class CourseResponseSchema(CourseRequestSchema):
    id = fields.Int(required=True)
    created_at = fields.Raw(required=False)
    updated_at = fields.Raw(required=False)
