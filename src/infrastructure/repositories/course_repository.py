from domain.models.icourse_repository import ICourseRepository
from domain.models.course import Course
from typing import List, Optional
from infrastructure.models.course_model import CourseModel
from infrastructure.databases.mssql import session

class CourseRepository(ICourseRepository):
    def __init__(self):
        pass

    def add(self, course: Course) -> Course:
        model = CourseModel(
            course_name=course.course_name,
            description=course.description,
            status=course.status,
            start_date=course.start_date,
            end_date=course.end_date,
            created_at=course.created_at,
            updated_at=course.updated_at,
        )
        session.add(model)
        session.commit()
        course.id = model.id
        return course

    def get_by_id(self, course_id: int) -> Optional[Course]:
        model = session.query(CourseModel).get(course_id)
        if not model:
            return None
        return Course(
            id=model.id,
            course_name=model.course_name,
            description=model.description,
            status=model.status,
            start_date=model.start_date,
            end_date=model.end_date,
            created_at=model.created_at,
            updated_at=model.updated_at,
        )

    def list(self) -> List[Course]:
        models = session.query(CourseModel).all()
        return [
            Course(
                id=m.id,
                course_name=m.course_name,
                description=m.description,
                status=m.status,
                start_date=m.start_date,
                end_date=m.end_date,
                created_at=m.created_at,
                updated_at=m.updated_at,
            ) for m in models
        ]

    def update(self, course: Course) -> Course:
        model = session.query(CourseModel).get(course.id)
        if not model:
            raise ValueError('course not found')
        model.course_name = course.course_name
        model.description = course.description
        model.status = course.status
        model.start_date = course.start_date
        model.end_date = course.end_date
        model.created_at = course.created_at
        model.updated_at = course.updated_at
        session.commit()
        return course

    def delete(self, course_id: int) -> None:
        model = session.query(CourseModel).get(course_id)
        if model:
            session.delete(model)
            session.commit()

