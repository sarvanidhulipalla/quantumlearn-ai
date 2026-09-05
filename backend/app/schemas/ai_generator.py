from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field


# ==========================================
# COURSE GENERATOR SCHEMAS
# ==========================================

class AICourseGenerateRequest(BaseModel):
    topic: str = Field(..., min_length=3, max_length=200, description="Quantum topic e.g. Quantum Error Correction")
    target_audience: Optional[str] = Field("Undergraduate Students", description="Target learner background")
    difficulty: str = Field("Intermediate", description="Beginner, Intermediate, or Advanced")
    num_modules: int = Field(3, ge=1, le=10, description="Number of modules to generate")
    estimated_hours: float = Field(8.0, ge=1.0, le=100.0, description="Approximate course duration")
    learning_objectives: Optional[str] = Field(None, description="Instructor specified target outcomes")
    prerequisites: Optional[str] = Field(None, description="Prior knowledge required")
    teaching_style: Optional[str] = Field("Hands-on interactive lab with code examples", description="Pedagogical style")


class AICourseLessonDraft(BaseModel):
    title: str
    slug: str
    lesson_type: str = "interactive"  # theory, interactive, qiskit_code
    order: int
    duration_minutes: int = 15
    objectives: List[str] = []
    content: str
    suggested_circuit_gates: Optional[List[str]] = None
    suggested_qiskit_code: Optional[str] = None
    key_takeaways: List[str] = []


class AICourseModuleDraft(BaseModel):
    title: str
    description: str
    order: int
    lessons: List[AICourseLessonDraft] = []


class AICourseDraftResponse(BaseModel):
    title: str
    slug: str
    short_description: str
    description: str
    level: str
    estimated_hours: float
    learning_objectives: List[str] = []
    prerequisites: List[str] = []
    modules: List[AICourseModuleDraft] = []
    model_used: str = "QuantumLearn-Grounded-RAG"
    is_draft: bool = True
    notice: str = "AI Generated Draft — Instructor review required before publishing."


class AICourseRegenerateLessonRequest(BaseModel):
    course_title: str
    module_title: str
    lesson_title: str
    lesson_order: int = 1
    difficulty: str = "Intermediate"
    guidance: Optional[str] = Field(None, description="Specific instructor adjustment guidance")


# ==========================================
# QUIZ GENERATOR SCHEMAS
# ==========================================

class AIQuizGenerateRequest(BaseModel):
    course_id: Optional[int] = None
    module_id: Optional[int] = None
    lesson_id: Optional[int] = None
    topic: Optional[str] = None
    difficulty: str = Field("Intermediate", description="Beginner, Intermediate, or Advanced")
    num_questions: int = Field(4, ge=1, le=10, description="Number of questions to generate")
    question_types: Optional[List[str]] = Field(
        ["multiple_choice", "true_false", "conceptual", "circuit_prediction"],
        description="Types of questions to include"
    )
    passing_score: int = Field(70, ge=10, le=100)
    time_limit_minutes: int = Field(15, ge=5, le=120)


class AIQuizQuestionOption(BaseModel):
    id: str  # A, B, C, D or True/False
    text: str


class AIQuizQuestionDraft(BaseModel):
    prompt: str
    question_type: str = "multiple_choice"
    options: List[AIQuizQuestionOption] = []
    correct_answer: str
    explanation: str
    topic: str = "Quantum Computing"
    difficulty: str = "Intermediate"
    points: int = 10
    order: int = 1


class AIQuizDraftResponse(BaseModel):
    title: str
    description: str
    course_id: Optional[int] = None
    lesson_id: Optional[int] = None
    passing_score_percentage: int = 70
    time_limit_minutes: int = 15
    questions: List[AIQuizQuestionDraft] = []
    model_used: str = "QuantumLearn-Grounded-RAG"
    is_draft: bool = True
    notice: str = "AI Generated Draft — Verify correct answers and explanations before publishing."


class AIQuizRegenerateQuestionRequest(BaseModel):
    topic: str
    difficulty: str = "Intermediate"
    question_type: str = "multiple_choice"
    guidance: Optional[str] = None
    question_order: int = 1
