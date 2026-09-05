from datetime import datetime
from pydantic import BaseModel
from typing import List, Optional


class LessonSummary(BaseModel):
    id: int
    title: str
    slug: str
    lesson_type: str
    order: int
    duration_minutes: int
    is_completed: bool = False

    class Config:
        from_attributes = True


class ModuleWithLessons(BaseModel):
    id: int
    title: str
    description: Optional[str] = None
    order: int
    lessons: List[LessonSummary] = []

    class Config:
        from_attributes = True


class InstructorSummary(BaseModel):
    id: int
    full_name: str
    role: str
    bio: Optional[str] = None
    avatar_url: Optional[str] = None

    class Config:
        from_attributes = True


class CourseListItem(BaseModel):
    id: int
    title: str
    slug: str
    short_description: Optional[str] = None
    level: str
    estimated_hours: float
    modules_count: int
    lessons_count: int
    is_enrolled: bool = False
    progress_percentage: float = 0.0

    class Config:
        from_attributes = True


class CourseDetailResponse(BaseModel):
    id: int
    title: str
    slug: str
    description: str
    short_description: Optional[str] = None
    level: str
    estimated_hours: float
    instructor: InstructorSummary
    modules: List[ModuleWithLessons] = []
    is_enrolled: bool = False
    progress_percentage: float = 0.0
    current_lesson_id: Optional[int] = None

    class Config:
        from_attributes = True


class LessonDetailResponse(BaseModel):
    id: int
    title: str
    slug: str
    content: str
    lesson_type: str
    order: int
    duration_minutes: int
    is_completed: bool = False
    module_id: int
    module_title: str
    course_id: int
    course_title: str
    prev_lesson_id: Optional[int] = None
    next_lesson_id: Optional[int] = None

    class Config:
        from_attributes = True


class LessonCompleteResponse(BaseModel):
    lesson_id: int
    is_completed: bool
    course_id: int
    course_progress_percentage: float
    is_course_completed: bool
    points_awarded: int
    next_lesson_id: Optional[int] = None


class RecentActivityItem(BaseModel):
    id: str
    title: str
    activity_type: str  # lesson_completed, course_started, badge_unlocked
    timestamp: str
    description: str
    route: str


class ActiveCourseSummary(BaseModel):
    course_id: int
    course_title: str
    current_lesson_id: int
    current_lesson_title: str
    progress_percentage: float


class StudentProgressStats(BaseModel):
    overall_progress_percentage: float
    completed_lessons_count: int
    total_lessons_count: int
    in_progress_courses_count: int
    completed_courses_count: int
    total_learning_hours: float
    current_streak_days: int
    total_points: int
    today_goal_completed: bool
    active_course: Optional[ActiveCourseSummary] = None
    recommended_course: Optional[CourseListItem] = None
    recent_activities: List[RecentActivityItem] = []
