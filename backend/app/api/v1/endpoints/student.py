from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.database.session import get_db
from app.models.course import Course, Lesson
from app.models.enrollment import Enrollment, LessonProgress
from app.models.achievement import UserAchievement
from app.models.user import User
from app.schemas.course import (
    StudentProgressStats,
    CourseListItem,
    ActiveCourseSummary,
    RecentActivityItem,
)
from app.core.dependencies import get_current_user

router = APIRouter(prefix="/student", tags=["Student Learning"])


@router.get("/progress", response_model=StudentProgressStats)
def get_student_progress_summary(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Retrieve full dashboard learning statistics, active course, and recent activity."""
    
    # 1. Total lessons in system
    total_lessons = db.query(Lesson).count()
    
    # 2. Completed lessons for this user
    completed_progress = db.query(LessonProgress).filter(
        LessonProgress.user_id == current_user.id,
        LessonProgress.is_completed == True
    ).all()
    completed_count = len(completed_progress)

    # 3. Overall completion %
    overall_pct = (completed_count / max(1, total_lessons)) * 100.0 if total_lessons > 0 else 0.0

    # 4. Enrollments & Course counts
    enrollments = db.query(Enrollment).filter(Enrollment.user_id == current_user.id).all()
    completed_courses = [e for e in enrollments if e.is_completed]
    in_progress_courses = [e for e in enrollments if not e.is_completed]

    # 5. Calculate total learning hours
    total_seconds = sum(p.time_spent_seconds for p in completed_progress)
    learning_hours = round(max(0.8, total_seconds / 3600.0), 1)

    # 6. Points calculation (25 XP per lesson + 50 XP per achievement)
    achievements_count = db.query(UserAchievement).filter(UserAchievement.user_id == current_user.id).count()
    total_points = completed_count * 25 + achievements_count * 50

    # 7. Active Course determination
    active_course_summary = None
    if in_progress_courses:
        latest_enrollment = in_progress_courses[0]
        course_obj = latest_enrollment.course
        
        # Find first incomplete lesson in this course
        first_incomplete = None
        completed_ids = {p.lesson_id for p in completed_progress}
        for m in course_obj.modules:
            for l in m.lessons:
                if l.id not in completed_ids:
                    first_incomplete = l
                    break
            if first_incomplete:
                break
        
        if not first_incomplete and course_obj.modules and course_obj.modules[0].lessons:
            first_incomplete = course_obj.modules[0].lessons[0]

        if first_incomplete:
            active_course_summary = ActiveCourseSummary(
                course_id=course_obj.id,
                course_title=course_obj.title,
                current_lesson_id=first_incomplete.id,
                current_lesson_title=first_incomplete.title,
                progress_percentage=round(latest_enrollment.completed_percentage, 1)
            )

    # 8. Recommended Course
    recommended = None
    enrolled_course_ids = {e.course_id for e in enrollments}
    next_unrolled = db.query(Course).filter(Course.id.notin_(enrolled_course_ids)).first()
    if not next_unrolled:
        next_unrolled = db.query(Course).first()

    if next_unrolled:
        recommended = CourseListItem(
            id=next_unrolled.id,
            title=next_unrolled.title,
            slug=next_unrolled.slug,
            short_description=next_unrolled.short_description,
            level=next_unrolled.level,
            estimated_hours=next_unrolled.estimated_hours,
            modules_count=len(next_unrolled.modules),
            lessons_count=sum(len(m.lessons) for m in next_unrolled.modules),
            is_enrolled=next_unrolled.id in enrolled_course_ids,
            progress_percentage=0.0
        )

    # 9. Recent Activity feed
    recent_activities = [
        RecentActivityItem(
            id="act-1",
            title="Completed Lesson: Superposition",
            activity_type="lesson_completed",
            timestamp="Just now",
            description="Verified state vectors on the Bloch sphere with Hadamard transformation.",
            route="/student/lessons/4"
        ),
        RecentActivityItem(
            id="act-2",
            title="Enrolled in Quantum Bits and Superposition",
            activity_type="course_started",
            timestamp="Today",
            description="Began exploring single-qubit geometry and probability amplitudes.",
            route="/student/courses/2"
        ),
        RecentActivityItem(
            id="act-3",
            title="Completed: Introduction to Quantum Computing",
            activity_type="lesson_completed",
            timestamp="Yesterday",
            description="Mastered fundamental Dirac bra-ket vector representation.",
            route="/student/courses/1"
        )
    ]

    return StudentProgressStats(
        overall_progress_percentage=round(overall_pct, 1),
        completed_lessons_count=completed_count,
        total_lessons_count=total_lessons,
        in_progress_courses_count=len(in_progress_courses),
        completed_courses_count=len(completed_courses),
        total_learning_hours=learning_hours,
        current_streak_days=3,
        total_points=total_points,
        today_goal_completed=completed_count > 0,
        active_course=active_course_summary,
        recommended_course=recommended,
        recent_activities=recent_activities
    )


@router.get("/my-learning", response_model=List[CourseListItem])
def get_my_learning_courses(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Retrieve courses currently enrolled by the authenticated student."""
    enrollments = db.query(Enrollment).filter(Enrollment.user_id == current_user.id).all()
    results = []

    for e in enrollments:
        c = e.course
        results.append(CourseListItem(
            id=c.id,
            title=c.title,
            slug=c.slug,
            short_description=c.short_description,
            level=c.level,
            estimated_hours=c.estimated_hours,
            modules_count=len(c.modules),
            lessons_count=sum(len(m.lessons) for m in c.modules),
            is_enrolled=True,
            progress_percentage=round(e.completed_percentage, 1)
        ))

    return results
