from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.models.user import User
from app.core.dependencies import get_current_instructor
from app.schemas.ai_generator import (
    AICourseGenerateRequest,
    AICourseLessonDraft,
    AICourseDraftResponse,
    AICourseRegenerateLessonRequest,
    AIQuizGenerateRequest,
    AIQuizQuestionDraft,
    AIQuizDraftResponse,
    AIQuizRegenerateQuestionRequest,
)
from app.services.ai.content_generator import get_content_generator

router = APIRouter()


@router.post("/course-generation", response_model=AICourseDraftResponse)
def generate_course_draft(
    payload: AICourseGenerateRequest,
    current_instructor: User = Depends(get_current_instructor),
):
    """
    Generates a structured, pedagogical quantum course draft grounded in verified RAG knowledge.
    Draft-only: does not publish without instructor review.
    """
    generator = get_content_generator()
    return generator.generate_course_draft(payload)


@router.post("/course-generation/regenerate-lesson", response_model=AICourseLessonDraft)
def regenerate_course_lesson_draft(
    payload: AICourseRegenerateLessonRequest,
    current_instructor: User = Depends(get_current_instructor),
):
    """
    Regenerates a single lesson draft with specific instructor pedagogical adjustments.
    """
    generator = get_content_generator()
    return generator.regenerate_lesson_draft(payload)


@router.post("/quiz-generation", response_model=AIQuizDraftResponse)
def generate_quiz_draft(
    payload: AIQuizGenerateRequest,
    db: Session = Depends(get_db),
    current_instructor: User = Depends(get_current_instructor),
):
    """
    Generates a structured quiz draft with authoritative answers, points, and explanations.
    Draft-only: authoritative answers are accessible only on instructor review endpoints.
    """
    generator = get_content_generator()
    return generator.generate_quiz_draft(payload, db)


@router.post("/quiz-generation/regenerate-question", response_model=AIQuizQuestionDraft)
def regenerate_quiz_question_draft(
    payload: AIQuizRegenerateQuestionRequest,
    current_instructor: User = Depends(get_current_instructor),
):
    """
    Regenerates a single question draft incorporating instructor feedback.
    """
    generator = get_content_generator()
    return generator.regenerate_question_draft(payload)
