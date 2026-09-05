from typing import List, Optional, Dict, Any
from fastapi import APIRouter, Depends, Query, Path, status
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.models.user import User
from app.core.dependencies import get_current_instructor
from app.schemas.instructor import (
    InstructorCourseCreate,
    InstructorCourseUpdate,
    InstructorCourseListItem,
    InstructorModuleCreate,
    InstructorModuleUpdate,
    InstructorLessonCreate,
    InstructorLessonUpdate,
    InstructorLessonListItem,
    InstructorLessonDetail,
    InstructorQuizCreate,
    InstructorQuizUpdate,
    InstructorQuizListItem,
    InstructorQuizDetail,
    InstructorChallengeCreate,
    InstructorChallengeUpdate,
    InstructorChallengeListItem,
    InstructorChallengeDetail,
    InstructorStudentListItem,
    InstructorStudentDetail,
    InstructorDashboardResponse,
    InstructorAnalyticsResponse,
)
from app.services.instructor import (
    list_instructor_courses,
    create_instructor_course,
    get_instructor_course,
    update_instructor_course,
    delete_instructor_course,
    set_course_published,
    create_module,
    update_module,
    delete_module,
    list_instructor_lessons,
    create_instructor_lesson,
    get_instructor_lesson,
    update_instructor_lesson,
    delete_instructor_lesson,
    set_lesson_published,
    list_instructor_quizzes,
    create_instructor_quiz,
    get_instructor_quiz,
    update_instructor_quiz,
    delete_instructor_quiz,
    set_quiz_published,
    list_instructor_challenges,
    create_instructor_challenge,
    get_instructor_challenge,
    update_instructor_challenge,
    delete_instructor_challenge,
    set_challenge_published,
    get_instructor_dashboard_data,
    list_instructor_students,
    get_student_detail,
    get_instructor_analytics,
    get_course_analytics,
)

router = APIRouter(prefix="/instructor", tags=["Instructor Management"])


# ==========================================
# 1. DASHBOARD & ANALYTICS
# ==========================================

@router.get("/dashboard", response_model=InstructorDashboardResponse)
def get_dashboard(
    current_user: User = Depends(get_current_instructor),
    db: Session = Depends(get_db),
):
    """Retrieve high-level metrics, course performance, and student status for the instructor."""
    return get_instructor_dashboard_data(current_user.id, db)


@router.get("/analytics", response_model=InstructorAnalyticsResponse)
def get_analytics(
    current_user: User = Depends(get_current_instructor),
    db: Session = Depends(get_db),
):
    """Retrieve full platform analytics for the instructor."""
    return get_instructor_analytics(current_user.id, db)


@router.get("/analytics/advanced", response_model=Any)
def get_advanced_analytics_data(
    current_user: User = Depends(get_current_instructor),
    db: Session = Depends(get_db),
):
    """Retrieve cohort topic mastery distributions, completion funnel, and drop-off signals."""
    from app.services.instructor.advanced_analytics import AdvancedAnalyticsService
    return AdvancedAnalyticsService.get_advanced_analytics(db)


@router.get("/courses/{course_id}/insights", response_model=Any)
def get_course_ai_insights(
    course_id: int = Path(..., description="ID of the course"),
    current_user: User = Depends(get_current_instructor),
    db: Session = Depends(get_db),
):
    """Retrieve deep telemetry and AI pedagogical insights for a specific course."""
    from app.services.instructor.course_insights import CourseInsightsService
    return CourseInsightsService.get_course_insights(db, course_id)


@router.get("/courses/{course_id}/analytics")
def get_single_course_analytics(
    course_id: int = Path(..., description="ID of the course"),
    current_user: User = Depends(get_current_instructor),
    db: Session = Depends(get_db),
):
    """Retrieve detailed analytics for a single course."""
    return get_course_analytics(course_id, current_user.id, db)


# ==========================================
# 2. COURSE MANAGEMENT
# ==========================================

@router.get("/courses", response_model=List[InstructorCourseListItem])
def list_courses(
    current_user: User = Depends(get_current_instructor),
    db: Session = Depends(get_db),
):
    """List all courses created/managed by the authenticated instructor."""
    return list_instructor_courses(current_user.id, db)


@router.post("/courses", status_code=status.HTTP_201_CREATED)
def create_course(
    payload: InstructorCourseCreate,
    current_user: User = Depends(get_current_instructor),
    db: Session = Depends(get_db),
):
    """Create a new quantum course."""
    return create_instructor_course(current_user.id, payload, db)


@router.get("/courses/{course_id}")
def get_course(
    course_id: int = Path(..., description="ID of the course"),
    current_user: User = Depends(get_current_instructor),
    db: Session = Depends(get_db),
):
    """Get full course detail for editing."""
    return get_instructor_course(course_id, current_user.id, db)


@router.put("/courses/{course_id}")
def update_course(
    payload: InstructorCourseUpdate,
    course_id: int = Path(..., description="ID of the course"),
    current_user: User = Depends(get_current_instructor),
    db: Session = Depends(get_db),
):
    """Update an existing course."""
    return update_instructor_course(course_id, current_user.id, payload, db)


@router.delete("/courses/{course_id}")
def delete_course(
    course_id: int = Path(..., description="ID of the course"),
    current_user: User = Depends(get_current_instructor),
    db: Session = Depends(get_db),
):
    """Delete a course."""
    return delete_instructor_course(course_id, current_user.id, db)


@router.post("/courses/{course_id}/publish")
def publish_course(
    course_id: int = Path(..., description="ID of the course"),
    current_user: User = Depends(get_current_instructor),
    db: Session = Depends(get_db),
):
    """Publish a course making it visible to students."""
    return set_course_published(course_id, current_user.id, True, db)


@router.post("/courses/{course_id}/unpublish")
def unpublish_course(
    course_id: int = Path(..., description="ID of the course"),
    current_user: User = Depends(get_current_instructor),
    db: Session = Depends(get_db),
):
    """Unpublish a course to hide it from students."""
    return set_course_published(course_id, current_user.id, False, db)


# ==========================================
# 3. MODULE MANAGEMENT
# ==========================================

@router.post("/modules", status_code=status.HTTP_201_CREATED)
def create_course_module(
    payload: InstructorModuleCreate,
    current_user: User = Depends(get_current_instructor),
    db: Session = Depends(get_db),
):
    """Create a new module inside an authorized course."""
    return create_module(payload.course_id, current_user.id, payload, db)


@router.put("/modules/{module_id}")
def update_course_module(
    payload: InstructorModuleUpdate,
    module_id: int = Path(..., description="ID of the module"),
    current_user: User = Depends(get_current_instructor),
    db: Session = Depends(get_db),
):
    """Update module metadata or sequence ordering."""
    return update_module(module_id, current_user.id, payload, db)


@router.delete("/modules/{module_id}")
def delete_course_module(
    module_id: int = Path(..., description="ID of the module"),
    current_user: User = Depends(get_current_instructor),
    db: Session = Depends(get_db),
):
    """Delete a module from a course."""
    return delete_module(module_id, current_user.id, db)


# ==========================================
# 4. LESSON MANAGEMENT
# ==========================================

@router.get("/lessons", response_model=List[InstructorLessonListItem])
def list_lessons(
    current_user: User = Depends(get_current_instructor),
    db: Session = Depends(get_db),
):
    """List all lessons in courses managed by the instructor."""
    return list_instructor_lessons(current_user.id, db)


@router.post("/lessons", status_code=status.HTTP_201_CREATED)
def create_lesson(
    payload: InstructorLessonCreate,
    current_user: User = Depends(get_current_instructor),
    db: Session = Depends(get_db),
):
    """Create a new lesson inside an authorized module."""
    return create_instructor_lesson(current_user.id, payload, db)


@router.get("/lessons/{lesson_id}", response_model=InstructorLessonDetail)
def get_lesson(
    lesson_id: int = Path(..., description="ID of the lesson"),
    current_user: User = Depends(get_current_instructor),
    db: Session = Depends(get_db),
):
    """Get full lesson details for instructor preview and editing."""
    return get_instructor_lesson(lesson_id, current_user.id, db)


@router.put("/lessons/{lesson_id}")
def update_lesson(
    payload: InstructorLessonUpdate,
    lesson_id: int = Path(..., description="ID of the lesson"),
    current_user: User = Depends(get_current_instructor),
    db: Session = Depends(get_db),
):
    """Update lesson content, circuit settings, and ordering."""
    return update_instructor_lesson(lesson_id, current_user.id, payload, db)


@router.delete("/lessons/{lesson_id}")
def delete_lesson(
    lesson_id: int = Path(..., description="ID of the lesson"),
    current_user: User = Depends(get_current_instructor),
    db: Session = Depends(get_db),
):
    """Delete a lesson."""
    return delete_instructor_lesson(lesson_id, current_user.id, db)


@router.post("/lessons/{lesson_id}/publish")
def publish_lesson(
    lesson_id: int = Path(..., description="ID of the lesson"),
    current_user: User = Depends(get_current_instructor),
    db: Session = Depends(get_db),
):
    """Publish a lesson."""
    return set_lesson_published(lesson_id, current_user.id, True, db)


@router.post("/lessons/{lesson_id}/unpublish")
def unpublish_lesson(
    lesson_id: int = Path(..., description="ID of the lesson"),
    current_user: User = Depends(get_current_instructor),
    db: Session = Depends(get_db),
):
    """Unpublish a lesson."""
    return set_lesson_published(lesson_id, current_user.id, False, db)


# ==========================================
# 5. QUIZ MANAGEMENT
# ==========================================

@router.get("/quizzes", response_model=List[InstructorQuizListItem])
def list_quizzes(
    current_user: User = Depends(get_current_instructor),
    db: Session = Depends(get_db),
):
    """List all quizzes managed by the instructor."""
    return list_instructor_quizzes(current_user.id, db)


@router.post("/quizzes", status_code=status.HTTP_201_CREATED)
def create_quiz(
    payload: InstructorQuizCreate,
    current_user: User = Depends(get_current_instructor),
    db: Session = Depends(get_db),
):
    """Create a new quiz with custom questions and answers."""
    return create_instructor_quiz(current_user.id, payload, db)


@router.get("/quizzes/{quiz_id}", response_model=InstructorQuizDetail)
def get_quiz(
    quiz_id: int = Path(..., description="ID of the quiz"),
    current_user: User = Depends(get_current_instructor),
    db: Session = Depends(get_db),
):
    """Get full quiz details including questions and authoritative correct answers."""
    return get_instructor_quiz(quiz_id, current_user.id, db)


@router.put("/quizzes/{quiz_id}")
def update_quiz(
    payload: InstructorQuizUpdate,
    quiz_id: int = Path(..., description="ID of the quiz"),
    current_user: User = Depends(get_current_instructor),
    db: Session = Depends(get_db),
):
    """Update quiz metadata and question roster."""
    return update_instructor_quiz(quiz_id, current_user.id, payload, db)


@router.delete("/quizzes/{quiz_id}")
def delete_quiz(
    quiz_id: int = Path(..., description="ID of the quiz"),
    current_user: User = Depends(get_current_instructor),
    db: Session = Depends(get_db),
):
    """Delete a quiz."""
    return delete_instructor_quiz(quiz_id, current_user.id, db)


@router.post("/quizzes/{quiz_id}/publish")
def publish_quiz(
    quiz_id: int = Path(..., description="ID of the quiz"),
    current_user: User = Depends(get_current_instructor),
    db: Session = Depends(get_db),
):
    """Publish a quiz."""
    return set_quiz_published(quiz_id, current_user.id, True, db)


@router.post("/quizzes/{quiz_id}/unpublish")
def unpublish_quiz(
    quiz_id: int = Path(..., description="ID of the quiz"),
    current_user: User = Depends(get_current_instructor),
    db: Session = Depends(get_db),
):
    """Unpublish a quiz."""
    return set_quiz_published(quiz_id, current_user.id, False, db)


# ==========================================
# 6. CHALLENGE MANAGEMENT
# ==========================================

@router.get("/challenges", response_model=List[InstructorChallengeListItem])
def list_challenges(
    current_user: User = Depends(get_current_instructor),
    db: Session = Depends(get_db),
):
    """List all challenges managed by the instructor."""
    return list_instructor_challenges(current_user.id, db)


@router.post("/challenges", status_code=status.HTTP_201_CREATED)
def create_challenge(
    payload: InstructorChallengeCreate,
    current_user: User = Depends(get_current_instructor),
    db: Session = Depends(get_db),
):
    """Create a new quantum circuit challenge."""
    return create_instructor_challenge(current_user.id, payload, db)


@router.get("/challenges/{challenge_id}", response_model=InstructorChallengeDetail)
def get_challenge(
    challenge_id: int = Path(..., description="ID of the challenge"),
    current_user: User = Depends(get_current_instructor),
    db: Session = Depends(get_db),
):
    """Get full challenge specifications for instructor preview and editing."""
    return get_instructor_challenge(challenge_id, current_user.id, db)


@router.put("/challenges/{challenge_id}")
def update_challenge(
    payload: InstructorChallengeUpdate,
    challenge_id: int = Path(..., description="ID of the challenge"),
    current_user: User = Depends(get_current_instructor),
    db: Session = Depends(get_db),
):
    """Update challenge criteria, target state, and reward points."""
    return update_instructor_challenge(challenge_id, current_user.id, payload, db)


@router.delete("/challenges/{challenge_id}")
def delete_challenge(
    challenge_id: int = Path(..., description="ID of the challenge"),
    current_user: User = Depends(get_current_instructor),
    db: Session = Depends(get_db),
):
    """Delete a challenge."""
    return delete_instructor_challenge(challenge_id, current_user.id, db)


@router.post("/challenges/{challenge_id}/publish")
def publish_challenge(
    challenge_id: int = Path(..., description="ID of the challenge"),
    current_user: User = Depends(get_current_instructor),
    db: Session = Depends(get_db),
):
    """Publish a challenge."""
    return set_challenge_published(challenge_id, current_user.id, True, db)


@router.post("/challenges/{challenge_id}/unpublish")
def unpublish_challenge(
    challenge_id: int = Path(..., description="ID of the challenge"),
    current_user: User = Depends(get_current_instructor),
    db: Session = Depends(get_db),
):
    """Unpublish a challenge."""
    return set_challenge_published(challenge_id, current_user.id, False, db)


# ==========================================
# 7. STUDENT MANAGEMENT
# ==========================================

@router.get("/students", response_model=List[InstructorStudentListItem])
def list_students(
    filter: str = Query("all", description="all, active, needs_attention"),
    search: Optional[str] = Query(None, description="Search by name or email"),
    current_user: User = Depends(get_current_instructor),
    db: Session = Depends(get_db),
):
    """List students enrolled in the instructor's courses with performance metrics."""
    return list_instructor_students(current_user.id, filter, search, db)


@router.get("/students/{student_id}", response_model=InstructorStudentDetail)
def get_single_student(
    student_id: int = Path(..., description="ID of the student"),
    current_user: User = Depends(get_current_instructor),
    db: Session = Depends(get_db),
):
    """Get detailed learning history for an enrolled student."""
    return get_student_detail(student_id, current_user.id, db)
