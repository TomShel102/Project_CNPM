from marshmallow import Schema, fields

class MentorResponseSchema(Schema):
    id = fields.Int(required=True)
    user_id = fields.Int(required=True)
    bio = fields.Str(required=False, allow_none=True)
    expertise_areas = fields.List(fields.Str(), required=False)
    hourly_rate = fields.Float(required=False)
    max_sessions_per_day = fields.Int(required=False)
    rating = fields.Float(required=False)
    total_sessions = fields.Int(required=False)
    status = fields.Str(required=True)
    created_at = fields.Raw(required=False)
    updated_at = fields.Raw(required=False)
