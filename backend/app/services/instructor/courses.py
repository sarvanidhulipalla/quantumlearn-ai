import re
from datetime import datetime, timezone
from typing import List, Dict, Any, Optional
from sqlalchemy.orm import Session
from fastapi import HTTPException, status

from app.models.course import Course, Module, Lesson
from app.models.enrollment import Enrollment, LessonProgress
from app.schemas.instructor import (
    InstructorCourseCreate,
    InstructorCourseUpdate,
    InstructorCourseListItem,
    InstructorModuleCreate,
    InstructorModuleUpdate,
)


def _generate_slug(title: str, db: Session, course_id: Optional[int] = None) -> str:
    base_slug = re.sub(r'[^a-zA-Z0-9]+', '-', title.lower()).strip('-')
    if not base_slug:
        base_slug = "quantum-course"
    
    slug = base_slug
    counter = 1
    while True:
        query = db.query(Course).filter(Course.slug == slug)
        if course_id:
            query = query.filter(Course.id != course_id)
        if not query.first():
            break
        slug = f"{base_slug}-{counter}"
        counter += 1
    return slug


def check_course_ownership(course_id: int, instructor_id: int, db: Session) -> Course:
    course = db.query(Course).filter(Course.id == course_id).first()
    if not course:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Course with ID {course_id} not found."
        )
    if course.instructor_id != instructor_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have permission to modify this course."
        )
    return course


def list_instructor_courses(instructor_id: int, db: Session) -> List[InstructorCourseListItem]:
    courses = db.query(Course).filter(Course.instructor_id == instructor_id).order_by(Course.created_at.desc()).all()
    results: List[InstructorCourseListItem] = []

    for c in courses:
        modules_count = len(c.modules)
        total_lessons = sum(len(m.lessons) for m in c.modules)
        enrollments = db.query(Enrollment).filter(Enrollment.course_id == c.id).all()
        students_count = len(enrollments)
        avg_comp = sum(e.completed_percentage for e in enrollments) / students_count if students_count > 0 else 0.0

        results.append(InstructorCourseListItem(
            id=c.id,
            title=c.title,
            slug=c.slug,
            description=c.description,
            short_description=c.short_description,
            level=c.level,
            estimated_hours=c.estimated_hours,
            is_published=c.is_published,
            modules_count=modules_count,
            lessons_count=total_lessons,
            students_count=students_count,
            avg_completion_percentage=round(avg_comp, 1),
            created_at=c.created_at,
            updated_at=c.updated_at,
        ))

    return results


def create_instructor_course(instructor_id: int, data: InstructorCourseCreate, db: Session) -> Dict[str, Any]:
    slug = _generate_slug(data.title, db)
    
    course = Course(
        title=data.title,
        slug=slug,
        description=data.description,
        short_description=data.short_description or data.description[:180],
        level=data.level,
        estimated_hours=data.estimated_hours,
        thumbnail_url=data.thumbnail_url,
        is_published=data.is_published,
        instructor_id=instructor_id,
        created_at=datetime.now(timezone.utc),
        updated_at=datetime.now(timezone.utc),
    )
    db.add(course)
    db.commit()
    db.refresh(course)

    # Automatically create a starter Module 1 if no modules exist
    default_module = Module(
        course_id=course.id,
        title="Module 1: Foundations",
        description="Introduction and foundational concepts",
        order=1,
        created_at=datetime.now(timezone.utc),
    )
    db.add(default_module)
    db.commit()

    return {
        "id": course.id,
        "title": course.title,
        "slug": course.slug,
        "message": "Course created successfully."
    }


def get_instructor_course(course_id: int, instructor_id: int, db: Session) -> Dict[str, Any]:
    course = check_course_ownership(course_id, instructor_id, db)
    
    enrollments = db.query(Enrollment).filter(Enrollment.course_id == course.id).all()
    students_count = len(enrollments)
    avg_comp = sum(e.completed_percentage for e in enrollments) / students_count if students_count > 0 else 0.0

    modules_data = []
    for m in course.modules:
        lessons_data = []
        for l in m.lessons:
            lessons_data.append({
                "id": l.id,
                "title": l.title,
                "slug": l.slug,
                "lesson_type": l.lesson_type,
                "order": l.order,
                "duration_minutes": l.duration_minutes,
                "is_published": l.is_published,
                "created_at": l.created_at,
            })
        modules_data.append({
            "id": m.id,
            "title": m.title,
            "description": m.description,
            "order": m.order,
            "lessons": lessons_data,
        })

    return {
        "id": course.id,
        "title": course.title,
        "slug": course.slug,
        "description": course.description,
        "short_description": course.short_description,
        "level": course.level,
        "estimated_hours": course.estimated_hours,
        "thumbnail_url": course.thumbnail_url,
        "is_published": course.is_published,
        "instructor_id": course.instructor_id,
        "modules": modules_data,
        "students_count": students_count,
        "avg_completion_percentage": round(avg_comp, 1),
        "created_at": course.created_at,
        "updated_at": course.updated_at,
    }


def update_instructor_course(course_id: int, instructor_id: int, data: InstructorCourseUpdate, db: Session) -> Dict[str, Any]:
    course = check_course_ownership(course_id, instructor_id, db)

    if data.title is not None and data.title != course.title:
        course.title = data.title
        course.slug = _generate_slug(data.title, db, course_id=course.id)
    
    if data.description is not None:
        course.description = data.description
    if data.short_description is not None:
        course.short_description = data.short_description
    if data.level is not None:
        course.level = data.level
    if data.estimated_hours is not None:
        course.estimated_hours = data.estimated_hours
    if data.thumbnail_url is not None:
        course.thumbnail_url = data.thumbnail_url
    if data.is_published is not None:
        course.is_published = data.is_published
    
    course.updated_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(course)

    return {
        "id": course.id,
        "title": course.title,
        "slug": course.slug,
        "is_published": course.is_published,
        "message": "Course updated successfully."
    }


def delete_instructor_course(course_id: int, instructor_id: int, db: Session) -> Dict[str, str]:
    course = check_course_ownership(course_id, instructor_id, db)
    db.delete(course)
    db.commit()
    return {"message": f"Course '{course.title}' deleted successfully."}


def set_course_published(course_id: int, instructor_id: int, is_published: bool, db: Session) -> Dict[str, Any]:
    course = check_course_ownership(course_id, instructor_id, db)
    course.is_published = is_published
    course.updated_at = datetime.now(timezone.utc)
    db.commit()
    return {
        "id": course.id,
        "is_published": course.is_published,
        "message": f"Course {'published' if is_published else 'unpublished'} successfully."
    }


def create_module(course_id: int, instructor_id: int, data: InstructorModuleCreate, db: Session) -> Dict[str, Any]:
    course = check_course_ownership(course_id, instructor_id, db)
    
    existing_count = db.query(Module).filter(Module.course_id == course.id).count()
    new_order = data.order if data.order > 0 else existing_count + 1

    module = Module(
        course_id=course.id,
        title=data.title,
        description=data.description,
        order=new_order,
        created_at=datetime.now(timezone.utc),
    )
    db.add(module)
    db.commit()
    db.refresh(module)

    return {
        "id": module.id,
        "course_id": module.course_id,
        "title": module.title,
        "order": module.order,
        "message": "Module created successfully."
    }


def update_module(module_id: int, instructor_id: int, data: InstructorModuleUpdate, db: Session) -> Dict[str, Any]:
    module = db.query(Module).filter(Module.id == module_id).first()
    if not module:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Module not found.")
    
    check_course_ownership(module.course_id, instructor_id, db)

    if data.title is not None:
        module.title = data.title
    if data.description is not None:
        module.description = data.description
    if data.order is not None:
        module.order = data.order
    
    db.commit()
    db.refresh(module)
    return {"id": module.id, "title": module.title, "order": module.order, "message": "Module updated successfully."}


def delete_module(module_id: int, instructor_id: int, db: Session) -> Dict[str, str]:
    module = db.query(Module).filter(Module.id == module_id).first()
    if not module:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Module not found.")
    
    check_course_ownership(module.course_id, instructor_id, db)
    
    # Check if this is the only module in the course
    total_modules = db.query(Module).filter(Module.course_id == module.course_id).count()
    if total_modules <= 1:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Course must contain at least one module.")
    
    db.delete(module)
    db.commit()
    return {"message": "Module deleted successfully."}
