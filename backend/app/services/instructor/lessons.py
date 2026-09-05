import re
from datetime import datetime, timezone
from typing import List, Dict, Any, Optional
from sqlalchemy.orm import Session
from fastapi import HTTPException, status

from app.models.course import Course, Module, Lesson
from app.schemas.instructor import (
    InstructorLessonCreate,
    InstructorLessonUpdate,
    InstructorLessonListItem,
    InstructorLessonDetail,
)
from app.services.instructor.courses import check_course_ownership


def _generate_lesson_slug(title: str, module_id: int, db: Session, lesson_id: Optional[int] = None) -> str:
    base_slug = re.sub(r'[^a-zA-Z0-9]+', '-', title.lower()).strip('-')
    if not base_slug:
        base_slug = "quantum-lesson"
    
    slug = base_slug
    counter = 1
    while True:
        query = db.query(Lesson).filter(Lesson.module_id == module_id, Lesson.slug == slug)
        if lesson_id:
            query = query.filter(Lesson.id != lesson_id)
        if not query.first():
            break
        slug = f"{base_slug}-{counter}"
        counter += 1
    return slug


def check_lesson_ownership(lesson_id: int, instructor_id: int, db: Session) -> Lesson:
    lesson = db.query(Lesson).filter(Lesson.id == lesson_id).first()
    if not lesson:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Lesson with ID {lesson_id} not found."
        )
    course = lesson.module.course
    if course.instructor_id != instructor_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have permission to modify this lesson."
        )
    return lesson


def list_instructor_lessons(instructor_id: int, db: Session) -> List[InstructorLessonListItem]:
    # Query all lessons whose course belongs to instructor
    lessons = (
        db.query(Lesson)
        .join(Module, Lesson.module_id == Module.id)
        .join(Course, Module.course_id == Course.id)
        .filter(Course.instructor_id == instructor_id)
        .order_by(Course.id, Module.order, Lesson.order)
        .all()
    )

    results: List[InstructorLessonListItem] = []
    for l in lessons:
        results.append(InstructorLessonListItem(
            id=l.id,
            module_id=l.module_id,
            course_id=l.module.course_id,
            course_title=l.module.course.title,
            module_title=l.module.title,
            title=l.title,
            slug=l.slug,
            lesson_type=l.lesson_type,
            order=l.order,
            duration_minutes=l.duration_minutes,
            is_published=l.is_published,
            created_at=l.created_at,
            updated_at=l.updated_at,
        ))
    return results


def create_instructor_lesson(instructor_id: int, data: InstructorLessonCreate, db: Session) -> Dict[str, Any]:
    module = db.query(Module).filter(Module.id == data.module_id).first()
    if not module:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Module not found.")
    
    check_course_ownership(module.course_id, instructor_id, db)
    slug = _generate_lesson_slug(data.title, module.id, db)

    existing_count = db.query(Lesson).filter(Lesson.module_id == module.id).count()
    new_order = data.order if data.order > 0 else existing_count + 1

    lesson = Lesson(
        module_id=data.module_id,
        title=data.title,
        slug=slug,
        content=data.content,
        lesson_type=data.lesson_type,
        order=new_order,
        duration_minutes=data.duration_minutes,
        is_published=data.is_published,
        initial_circuit_json=data.initial_circuit_json,
        initial_qiskit_code=data.initial_qiskit_code,
        created_at=datetime.now(timezone.utc),
        updated_at=datetime.now(timezone.utc),
    )
    db.add(lesson)
    db.commit()
    db.refresh(lesson)

    return {
        "id": lesson.id,
        "title": lesson.title,
        "slug": lesson.slug,
        "is_published": lesson.is_published,
        "message": "Lesson created successfully."
    }


def get_instructor_lesson(lesson_id: int, instructor_id: int, db: Session) -> InstructorLessonDetail:
    lesson = check_lesson_ownership(lesson_id, instructor_id, db)
    return InstructorLessonDetail(
        id=lesson.id,
        module_id=lesson.module_id,
        course_id=lesson.module.course_id,
        course_title=lesson.module.course.title,
        module_title=lesson.module.title,
        title=lesson.title,
        slug=lesson.slug,
        content=lesson.content,
        lesson_type=lesson.lesson_type,
        order=lesson.order,
        duration_minutes=lesson.duration_minutes,
        is_published=lesson.is_published,
        initial_circuit_json=lesson.initial_circuit_json,
        initial_qiskit_code=lesson.initial_qiskit_code,
        created_at=lesson.created_at,
        updated_at=lesson.updated_at,
    )


def update_instructor_lesson(lesson_id: int, instructor_id: int, data: InstructorLessonUpdate, db: Session) -> Dict[str, Any]:
    lesson = check_lesson_ownership(lesson_id, instructor_id, db)

    if data.module_id is not None and data.module_id != lesson.module_id:
        target_module = db.query(Module).filter(Module.id == data.module_id).first()
        if not target_module:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Target module not found.")
        check_course_ownership(target_module.course_id, instructor_id, db)
        lesson.module_id = data.module_id

    if data.title is not None and data.title != lesson.title:
        lesson.title = data.title
        lesson.slug = _generate_lesson_slug(data.title, lesson.module_id, db, lesson_id=lesson.id)

    if data.content is not None:
        lesson.content = data.content
    if data.lesson_type is not None:
        lesson.lesson_type = data.lesson_type
    if data.order is not None:
        lesson.order = data.order
    if data.duration_minutes is not None:
        lesson.duration_minutes = data.duration_minutes
    if data.is_published is not None:
        lesson.is_published = data.is_published
    if data.initial_circuit_json is not None:
        lesson.initial_circuit_json = data.initial_circuit_json
    if data.initial_qiskit_code is not None:
        lesson.initial_qiskit_code = data.initial_qiskit_code

    lesson.updated_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(lesson)

    return {
        "id": lesson.id,
        "title": lesson.title,
        "is_published": lesson.is_published,
        "message": "Lesson updated successfully."
    }


def delete_instructor_lesson(lesson_id: int, instructor_id: int, db: Session) -> Dict[str, str]:
    lesson = check_lesson_ownership(lesson_id, instructor_id, db)
    db.delete(lesson)
    db.commit()
    return {"message": f"Lesson '{lesson.title}' deleted successfully."}


def set_lesson_published(lesson_id: int, instructor_id: int, is_published: bool, db: Session) -> Dict[str, Any]:
    lesson = check_lesson_ownership(lesson_id, instructor_id, db)
    lesson.is_published = is_published
    lesson.updated_at = datetime.now(timezone.utc)
    db.commit()
    return {
        "id": lesson.id,
        "is_published": lesson.is_published,
        "message": f"Lesson {'published' if is_published else 'unpublished'} successfully."
    }
