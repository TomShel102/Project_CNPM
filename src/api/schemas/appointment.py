from marshmallow import Schema, fields

class AppointmentRequestSchema(Schema):
    student_id = fields.Int(required=True)
    mentor_id = fields.Int(required=True)
    scheduled_time = fields.Raw(required=True)
    notes = fields.Str(required=False, allow_none=True)

class AppointmentResponseSchema(AppointmentRequestSchema):
    id = fields.Int(required=True)
    status = fields.Str(required=True)
    created_at = fields.Raw(required=False)
    updated_at = fields.Raw(required=False)
