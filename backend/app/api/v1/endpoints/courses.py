from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime, timezone

from app.database.session import get_db
from app.models.course import Course, Module, Lesson
from app.models.enrollment import Enrollment, LessonProgress
from app.models.user import User
from app.schemas.course import (
    CourseListItem,
    CourseDetailResponse,
    ModuleWithLessons,
    LessonSummary,
    LessonDetailResponse,
    LessonCompleteResponse,
    InstructorSummary,
)
from app.core.dependencies import get_current_user, security_scheme
from app.core.security import decode_access_token

router = APIRouter(prefix="", tags=["Courses & Lessons"])


def get_optional_user(
    auth = Depends(security_scheme),
    db: Session = Depends(get_db)
) -> Optional[User]:
    """Extracts user if valid token is present, otherwise returns None without error."""
    if not auth:
        return None
    try:
        payload = decode_access_token(auth.credentials)
        if not payload or "sub" not in payload:
            return None
        user_id = int(payload.get("sub"))
        return db.query(User).filter(User.id == user_id).first()
    except Exception:
        return None


@router.get("/courses", response_model=List[CourseListItem])
def list_courses(
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_optional_user)
):
    """Retrieve all published courses with learner's enrollment status and progress."""
    courses = db.query(Course).filter(Course.is_published == True).all()
    results = []

    for c in courses:
        modules_count = len(c.modules)
        total_lessons = sum(len(m.lessons) for m in c.modules)
        
        is_enrolled = False
        progress_pct = 0.0

        if current_user:
            enrollment = db.query(Enrollment).filter(
                Enrollment.user_id == current_user.id,
                Enrollment.course_id == c.id
            ).first()
            if enrollment:
                is_enrolled = True
                progress_pct = enrollment.completed_percentage

        results.append(CourseListItem(
            id=c.id,
            title=c.title,
            slug=c.slug,
            short_description=c.short_description,
            level=c.level,
            estimated_hours=c.estimated_hours,
            modules_count=modules_count,
            lessons_count=total_lessons,
            is_enrolled=is_enrolled,
            progress_percentage=round(progress_pct, 1)
        ))

    return results


@router.get("/courses/{course_id}", response_model=CourseDetailResponse)
def get_course_detail(
    course_id: int,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_optional_user)
):
    """Retrieve full course details including syllabus, instructor, and completion status."""
    course = db.query(Course).filter(Course.id == course_id, Course.is_published == True).first()
    if not course:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Course not found"
        )

    # Get user completed lesson IDs
    completed_lesson_ids = set()
    is_enrolled = False
    progress_percentage = 0.0
    first_incomplete_lesson_id = None

    if current_user:
        enrollment = db.query(Enrollment).filter(
            Enrollment.user_id == current_user.id,
            Enrollment.course_id == course.id
        ).first()
        if enrollment:
            is_enrolled = True
            progress_percentage = enrollment.completed_percentage

        progress_records = db.query(LessonProgress).filter(
            LessonProgress.user_id == current_user.id,
            LessonProgress.is_completed == True
        ).all()
        completed_lesson_ids = {p.lesson_id for p in progress_records}

    modules_output = []
    all_lesson_ids = []

    for m in course.modules:
        lessons_output = []
        for l in m.lessons:
            if not l.is_published:
                continue
            all_lesson_ids.append(l.id)
            is_comp = l.id in completed_lesson_ids
            if not is_comp and first_incomplete_lesson_id is None:
                first_incomplete_lesson_id = l.id
            lessons_output.append(LessonSummary(
                id=l.id,
                title=l.title,
                slug=l.slug,
                lesson_type=l.lesson_type,
                order=l.order,
                duration_minutes=l.duration_minutes,
                is_completed=is_comp
            ))
        modules_output.append(ModuleWithLessons(
            id=m.id,
            title=m.title,
            description=m.description,
            order=m.order,
            lessons=lessons_output
        ))

    # Determine recommended current lesson ID
    current_lesson_id = first_incomplete_lesson_id if first_incomplete_lesson_id else (all_lesson_ids[0] if all_lesson_ids else None)

    return CourseDetailResponse(
        id=course.id,
        title=course.title,
        slug=course.slug,
        description=course.description,
        short_description=course.short_description,
        level=course.level,
        estimated_hours=course.estimated_hours,
        instructor=InstructorSummary(
            id=course.instructor.id,
            full_name=course.instructor.full_name,
            role=course.instructor.role,
            bio=course.instructor.bio,
            avatar_url=None
        ),
        modules=modules_output,
        is_enrolled=is_enrolled,
        progress_percentage=round(progress_percentage, 1),
        current_lesson_id=current_lesson_id
    )


@router.get("/courses/{course_id}/modules", response_model=List[ModuleWithLessons])
def get_course_modules(
    course_id: int,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_optional_user)
):
    """Retrieve all modules and lessons with completion markers for a course."""
    course = db.query(Course).filter(Course.id == course_id, Course.is_published == True).first()
    if not course:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Course not found"
        )

    completed_lesson_ids = set()
    if current_user:
        progress_records = db.query(LessonProgress).filter(
            LessonProgress.user_id == current_user.id,
            LessonProgress.is_completed == True
        ).all()
        completed_lesson_ids = {p.lesson_id for p in progress_records}

    modules_output = []
    for m in course.modules:
        lessons_output = []
        for l in m.lessons:
            if not l.is_published:
                continue
            lessons_output.append(LessonSummary(
                id=l.id,
                title=l.title,
                slug=l.slug,
                lesson_type=l.lesson_type,
                order=l.order,
                duration_minutes=l.duration_minutes,
                is_completed=l.id in completed_lesson_ids
            ))
        modules_output.append(ModuleWithLessons(
            id=m.id,
            title=m.title,
            description=m.description,
            order=m.order,
            lessons=lessons_output
        ))

    return modules_output


@router.get("/lessons/{lesson_id}", response_model=LessonDetailResponse)
def get_lesson_detail(
    lesson_id: int,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_optional_user)
):
    """Retrieve full lesson content, module info, and navigation links."""
    lesson = db.query(Lesson).filter(Lesson.id == lesson_id, Lesson.is_published == True).first()
    if not lesson:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Lesson not found"
        )

    module = lesson.module
    course = module.course

    # Flatten all lessons in course to find prev and next lesson
    all_course_lessons = []
    for m in course.modules:
        for l in m.lessons:
            all_course_lessons.append(l.id)

    current_idx = all_course_lessons.index(lesson.id) if lesson.id in all_course_lessons else -1
    prev_lesson_id = all_course_lessons[current_idx - 1] if current_idx > 0 else None
    next_lesson_id = all_course_lessons[current_idx + 1] if current_idx >= 0 and current_idx < len(all_course_lessons) - 1 else None

    is_completed = False
    if current_user:
        prog = db.query(LessonProgress).filter(
            LessonProgress.user_id == current_user.id,
            LessonProgress.lesson_id == lesson.id
        ).first()
        if prog and prog.is_completed:
            is_completed = True

    return LessonDetailResponse(
        id=lesson.id,
        title=lesson.title,
        slug=lesson.slug,
        content=lesson.content,
        lesson_type=lesson.lesson_type,
        order=lesson.order,
        duration_minutes=lesson.duration_minutes,
        is_completed=is_completed,
        module_id=module.id,
        module_title=module.title,
        course_id=course.id,
        course_title=course.title,
        prev_lesson_id=prev_lesson_id,
        next_lesson_id=next_lesson_id
    )


@router.post("/lessons/{lesson_id}/complete", response_model=LessonCompleteResponse)
def complete_lesson(
    lesson_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Mark a lesson as completed and recalculate course progress percentage."""
    lesson = db.query(Lesson).filter(Lesson.id == lesson_id).first()
    if not lesson:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Lesson not found"
        )

    course = lesson.module.course

    # 1. Update or create lesson progress record
    prog = db.query(LessonProgress).filter(
        LessonProgress.user_id == current_user.id,
        LessonProgress.lesson_id == lesson.id
    ).first()

    points_awarded = 0
    if not prog:
        prog = LessonProgress(
            user_id=current_user.id,
            lesson_id=lesson.id,
            is_completed=True,
            time_spent_seconds=lesson.duration_minutes * 60,
            completed_at=datetime.now(timezone.utc)
        )
        db.add(prog)
        points_awarded = 25
    else:
        if not prog.is_completed:
            prog.is_completed = True
            prog.completed_at = datetime.now(timezone.utc)
            points_awarded = 25

    # 2. Find all lesson IDs in course and calculate completion percentage
    all_course_lesson_ids = []
    for m in course.modules:
        for l in m.lessons:
            all_course_lesson_ids.append(l.id)

    total_lessons = len(all_course_lesson_ids)
    completed_in_course = db.query(LessonProgress).filter(
        LessonProgress.user_id == current_user.id,
        LessonProgress.lesson_id.in_(all_course_lesson_ids),
        LessonProgress.is_completed == True
    ).count()

    # ensure this lesson is counted
    if lesson.id not in [p.lesson_id for p in current_user.lesson_progress if p.is_completed]:
        completed_in_course = max(completed_in_course, 1)

    pct = min(100.0, (completed_in_course / max(1, total_lessons)) * 100.0)
    is_course_completed = pct >= 99.9

    # 3. Update or create Enrollment record
    enrollment = db.query(Enrollment).filter(
        Enrollment.user_id == current_user.id,
        Enrollment.course_id == course.id
    ).first()

    if not enrollment:
        enrollment = Enrollment(
            user_id=current_user.id,
            course_id=course.id,
            completed_percentage=pct,
            is_completed=is_course_completed,
            last_accessed_at=datetime.now(timezone.utc)
        )
        db.add(enrollment)
    else:
        enrollment.completed_percentage = pct
        enrollment.is_completed = is_course_completed
        enrollment.last_accessed_at = datetime.now(timezone.utc)

    db.commit()

    # Trigger Gamification & Streak updates
    from app.services.gamification.streak import StreakService
    from app.services.gamification.evaluator import AchievementEvaluator
    StreakService.record_daily_activity(db, current_user.id)
    AchievementEvaluator.evaluate_and_award(db, current_user.id)

    # Find next lesson
    current_idx = all_course_lesson_ids.index(lesson.id) if lesson.id in all_course_lesson_ids else -1
    next_lesson_id = all_course_lesson_ids[current_idx + 1] if current_idx >= 0 and current_idx < len(all_course_lesson_ids) - 1 else None

    return LessonCompleteResponse(
        lesson_id=lesson.id,
        is_completed=True,
        course_id=course.id,
        course_progress_percentage=round(pct, 1),
        is_course_completed=is_course_completed,
        points_awarded=points_awarded,
        next_lesson_id=next_lesson_id
    )
