from typing import List, Dict, Any, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.core.dependencies import get_current_user
from app.models.user import User
from app.schemas.assessment import (
    QuizSummaryResponse,
    QuizDetailResponse,
    QuizSubmitRequest,
    QuizSubmitResponse,
    QuizAttemptSummary,
)
from app.services.assessment.quiz import (
    list_quizzes,
    get_quiz_detail,
    submit_quiz_answers,
    get_quiz_attempts,
)

router = APIRouter(prefix="/quizzes", tags=["Quizzes & Assessments"])


@router.get("", response_model=List[QuizSummaryResponse])
def get_all_quizzes(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Retrieves all quantum quizzes with student attempt progress.
    """
    return list_quizzes(db, user_id=current_user.id)


@router.get("/{quiz_id}", response_model=QuizDetailResponse)
def get_quiz_by_id(
    quiz_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Retrieves quiz questions for taking a quiz.
    Correct answers are hidden to ensure academic integrity.
    """
    return get_quiz_detail(quiz_id=quiz_id, db=db)


@router.post("/{quiz_id}/submit", response_model=QuizSubmitResponse)
def submit_quiz(
    quiz_id: int,
    payload: QuizSubmitRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Submits student answers for authoritative backend grading and explanation feedback.
    """
    return submit_quiz_answers(
        quiz_id=quiz_id,
        user_id=current_user.id,
        answers=payload.answers,
        db=db,
    )


@router.get("/{quiz_id}/attempts", response_model=List[QuizAttemptSummary])
def get_attempts(
    quiz_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Retrieves previous attempts and scores for the current student.
    """
    return get_quiz_attempts(
        quiz_id=quiz_id,
        user_id=current_user.id,
        db=db,
    )
