from typing import List, Dict, Optional, Any
from datetime import datetime
from pydantic import BaseModel, Field


# ==========================================
# COURSE SCHEMAS (INSTRUCTOR)
# ==========================================

class InstructorCourseCreate(BaseModel):
    title: str = Field(..., min_length=3, max_length=255)
    description: str = Field(..., min_length=10)
    short_description: Optional[str] = Field(None, max_length=500)
    level: str = Field("Beginner", description="Beginner, Intermediate, Advanced")
    estimated_hours: float = Field(10.0, ge=0.5, le=200.0)
    thumbnail_url: Optional[str] = None
    is_published: bool = False


class InstructorCourseUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=3, max_length=255)
    description: Optional[str] = None
    short_description: Optional[str] = None
    level: Optional[str] = None
    estimated_hours: Optional[float] = None
    thumbnail_url: Optional[str] = None
    is_published: Optional[bool] = None


class InstructorCourseListItem(BaseModel):
    id: int
    title: str
    slug: str
    description: str
    short_description: Optional[str] = None
    level: str
    estimated_hours: float
    is_published: bool
    modules_count: int
    lessons_count: int
    students_count: int = 0
    avg_completion_percentage: float = 0.0
    created_at: datetime
    updated_at: datetime


class InstructorModuleCreate(BaseModel):
    course_id: int
    title: str = Field(..., min_length=3, max_length=255)
    description: Optional[str] = None
    order: int = 1


class InstructorModuleUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    order: Optional[int] = None


class InstructorModuleResponse(BaseModel):
    id: int
    course_id: int
    title: str
    description: Optional[str] = None
    order: int
    lessons_count: int = 0


# ==========================================
# LESSON SCHEMAS (INSTRUCTOR)
# ==========================================

class InstructorLessonCreate(BaseModel):
    module_id: int
    title: str = Field(..., min_length=3, max_length=255)
    content: str = Field(..., min_length=10)
    lesson_type: str = Field("interactive", description="theory, interactive, circuit_lab, qiskit_code")
    order: int = 1
    duration_minutes: int = 15
    is_published: bool = True
    initial_circuit_json: Optional[str] = None
    initial_qiskit_code: Optional[str] = None


class InstructorLessonUpdate(BaseModel):
    module_id: Optional[int] = None
    title: Optional[str] = None
    content: Optional[str] = None
    lesson_type: Optional[str] = None
    order: Optional[int] = None
    duration_minutes: Optional[int] = None
    is_published: Optional[bool] = None
    initial_circuit_json: Optional[str] = None
    initial_qiskit_code: Optional[str] = None


class InstructorLessonListItem(BaseModel):
    id: int
    module_id: int
    course_id: int
    course_title: str
    module_title: str
    title: str
    slug: str
    lesson_type: str
    order: int
    duration_minutes: int
    is_published: bool
    created_at: datetime
    updated_at: datetime


class InstructorLessonDetail(BaseModel):
    id: int
    module_id: int
    course_id: int
    course_title: str
    module_title: str
    title: str
    slug: str
    content: str
    lesson_type: str
    order: int
    duration_minutes: int
    is_published: bool
    initial_circuit_json: Optional[str] = None
    initial_qiskit_code: Optional[str] = None
    created_at: datetime
    updated_at: datetime


# ==========================================
# QUIZ SCHEMAS (INSTRUCTOR)
# ==========================================

class InstructorQuestionItem(BaseModel):
    id: Optional[int] = None
    prompt: str = Field(..., min_length=3)
    question_type: str = "multiple_choice"
    options_json: str = "[]"  # or JSON string representing options
    correct_answer: str
    explanation: Optional[str] = None
    points: int = 10
    order: int = 1


class InstructorQuizCreate(BaseModel):
    title: str = Field(..., min_length=3, max_length=255)
    description: Optional[str] = None
    course_id: Optional[int] = None
    lesson_id: Optional[int] = None
    passing_score_percentage: float = 70.0
    time_limit_minutes: int = 15
    is_published: bool = True
    questions: List[InstructorQuestionItem] = []


class InstructorQuizUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    course_id: Optional[int] = None
    lesson_id: Optional[int] = None
    passing_score_percentage: Optional[float] = None
    time_limit_minutes: Optional[int] = None
    is_published: Optional[bool] = None
    questions: Optional[List[InstructorQuestionItem]] = None


class InstructorQuizListItem(BaseModel):
    id: int
    title: str
    description: Optional[str] = None
    course_id: Optional[int] = None
    course_title: Optional[str] = None
    lesson_id: Optional[int] = None
    lesson_title: Optional[str] = None
    passing_score_percentage: float
    time_limit_minutes: int
    question_count: int
    attempts_count: int = 0
    is_published: bool
    created_at: datetime


class InstructorQuizDetail(BaseModel):
    id: int
    title: str
    description: Optional[str] = None
    course_id: Optional[int] = None
    course_title: Optional[str] = None
    lesson_id: Optional[int] = None
    lesson_title: Optional[str] = None
    passing_score_percentage: float
    time_limit_minutes: int
    is_published: bool
    questions: List[InstructorQuestionItem] = []
    created_at: datetime


# ==========================================
# CHALLENGE SCHEMAS (INSTRUCTOR)
# ==========================================

class InstructorChallengeCreate(BaseModel):
    title: str = Field(..., min_length=3, max_length=255)
    slug: Optional[str] = None
    difficulty: str = "Beginner"
    category: str = "Quantum Gates"
    description: str = Field(..., min_length=10)
    target_state_vector: Optional[str] = None
    starter_qiskit_code: Optional[str] = None
    starter_circuit_json: Optional[str] = None
    test_cases_json: Optional[str] = None
    points_reward: int = 50
    is_published: bool = True


class InstructorChallengeUpdate(BaseModel):
    title: Optional[str] = None
    slug: Optional[str] = None
    difficulty: Optional[str] = None
    category: Optional[str] = None
    description: Optional[str] = None
    target_state_vector: Optional[str] = None
    starter_qiskit_code: Optional[str] = None
    starter_circuit_json: Optional[str] = None
    test_cases_json: Optional[str] = None
    points_reward: Optional[int] = None
    is_published: Optional[bool] = None


class InstructorChallengeListItem(BaseModel):
    id: int
    title: str
    slug: str
    difficulty: str
    category: str
    description: str
    points_reward: int
    is_published: bool
    attempts_count: int = 0
    solved_count: int = 0
    created_at: datetime


class InstructorChallengeDetail(BaseModel):
    id: int
    title: str
    slug: str
    difficulty: str
    category: str
    description: str
    target_state_vector: Optional[str] = None
    starter_qiskit_code: Optional[str] = None
    starter_circuit_json: Optional[str] = None
    test_cases_json: Optional[str] = None
    points_reward: int
    is_published: bool
    attempts_count: int = 0
    solved_count: int = 0
    created_at: datetime


# ==========================================
# STUDENT MANAGEMENT & ANALYTICS SCHEMAS
# ==========================================

class InstructorStudentListItem(BaseModel):
    id: int
    full_name: str
    email: str
    education_level: Optional[str] = None
    quantum_experience: Optional[str] = None
    enrolled_courses_count: int = 0
    overall_progress: float = 0.0
    avg_quiz_score: float = 0.0
    challenges_completed: int = 0
    last_activity: Optional[datetime] = None
    status: str = "Active"  # Active, Needs Attention


class InstructorStudentDetail(BaseModel):
    id: int
    full_name: str
    email: str
    education_level: Optional[str] = None
    quantum_experience: Optional[str] = None
    bio: Optional[str] = None
    created_at: datetime
    enrolled_courses: List[Dict[str, Any]] = []
    completed_lessons: List[Dict[str, Any]] = []
    quiz_attempts: List[Dict[str, Any]] = []
    challenge_attempts: List[Dict[str, Any]] = []


class InstructorDashboardMetrics(BaseModel):
    total_students: int
    active_students: int
    published_courses: int
    avg_quiz_score: float
    course_completion_rate: float
    challenges_completed: int


class InstructorCoursePerformanceItem(BaseModel):
    course_id: int
    title: str
    students_count: int
    completion_rate: float
    avg_score: float
    status: str


class InstructorStudentPerformanceItem(BaseModel):
    student_id: int
    name: str
    course_title: str
    progress: float
    avg_score: float
    last_activity: Optional[datetime] = None


class InstructorDashboardResponse(BaseModel):
    metrics: InstructorDashboardMetrics
    course_performance: List[InstructorCoursePerformanceItem] = []
    top_students: List[InstructorStudentPerformanceItem] = []
    students_needing_attention: List[InstructorStudentPerformanceItem] = []


class InstructorAnalyticsResponse(BaseModel):
    metrics: InstructorDashboardMetrics
    course_completion_trends: List[Dict[str, Any]] = []
    quiz_score_distribution: List[Dict[str, Any]] = []
    challenge_completion_stats: List[Dict[str, Any]] = []
    student_engagement_activity: List[Dict[str, Any]] = []
