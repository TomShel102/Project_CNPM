from infrastructure.models.user_model import UserModel

class UserRepository:
    def get_users_by_role(self, role):
        return [user.to_dict() for user in UserModel.query.filter_by(role=role).all()]