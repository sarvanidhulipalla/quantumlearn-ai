from typing import List, Dict, Optional, Any
from pydantic import BaseModel, Field


# ==========================================
# QUIZ SCHEMAS
# ==========================================

class QuestionOption(BaseModel):
    id: str
    text: str


class QuestionPublicResponse(BaseModel):
    id: int
    prompt: str
    question_type: str
    options: List[Dict[str, Any]] = []
    points: int
    order: int


class QuizSummaryResponse(BaseModel):
    id: int
    title: str
    description: Optional[str] = None
    course_id: Optional[int] = None
    lesson_id: Optional[int] = None
    passing_score_percentage: float
    time_limit_minutes: int
    question_count: int
    attempt_count: int = 0
    best_score: float = 0.0
    is_passed: bool = False


class QuizDetailResponse(BaseModel):
    id: int
    title: str
    description: Optional[str] = None
    course_id: Optional[int] = None
    lesson_id: Optional[int] = None
    passing_score_percentage: float
    time_limit_minutes: int
    questions: List[QuestionPublicResponse] = []


class QuizSubmitRequest(BaseModel):
    answers: Dict[str, str] = Field(..., description="Mapping of question_id to selected answer")


class QuestionGradedItem(BaseModel):
    question_id: int
    prompt: str
    question_type: str
    options: List[Dict[str, Any]] = []
    student_answer: str
    correct_answer: str
    is_correct: bool
    points_earned: int
    points_possible: int
    explanation: str


class QuizSubmitResponse(BaseModel):
    attempt_id: int
    quiz_id: int
    quiz_title: str
    score_percentage: float
    earned_points: int
    total_possible_points: int
    correct_count: int
    total_questions: int
    passed: bool
    passing_score_percentage: float
    xp_earned: int
    breakdown: List[QuestionGradedItem] = []
    completed_at: str


class QuizAttemptSummary(BaseModel):
    id: int
    quiz_id: int
    score_percentage: float
    passed: bool
    completed_at: str


# ==========================================
# CHALLENGE SCHEMAS
# ==========================================

class ChallengeSummaryResponse(BaseModel):
    id: int
    title: str
    slug: str
    difficulty: str
    category: str
    description: str
    points_reward: int
    is_solved: bool = False
    best_fidelity: float = 0.0
    attempt_count: int = 0


class ChallengeDetailResponse(BaseModel):
    id: int
    title: str
    slug: str
    difficulty: str
    category: str
    description: str
    points_reward: int
    starter_circuit: Dict[str, Any] = {}
    starter_qiskit_code: Optional[str] = None
    target_state_vector: Optional[str] = None
    is_solved: bool = False
    best_fidelity: float = 0.0


class ChallengeSubmitRequest(BaseModel):
    circuit: Dict[str, Any] = Field(..., description="Interactive circuit grid data to evaluate")


class ChallengeSubmitResponse(BaseModel):
    attempt_id: int
    challenge_id: int
    challenge_title: str
    solved: bool
    fidelity_score: float
    message: str
    detailed_checks: List[str] = []
    simulation_results: Optional[Dict[str, Any]] = None
    awarded_xp: int = 0
    attempted_at: str


class ChallengeAttemptSummary(BaseModel):
    id: int
    challenge_id: int
    solved: bool
    fidelity_score: float
    attempted_at: str


class ChallengeHintResponse(BaseModel):
    challenge_id: int
    hint_level: int
    total_hints: int
    hint: str
