from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.models.user import User
from app.core.dependencies import get_current_user
from app.schemas.achievement import AchievementProgressResponse
from app.services.gamification.evaluator import AchievementEvaluator

router = APIRouter()


@router.get("", response_model=AchievementProgressResponse)
@router.get("/progress", response_model=AchievementProgressResponse)
def get_user_achievements_progress(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Evaluates pending achievements and returns complete progress for the student achievements portal.
    """
    return AchievementEvaluator.get_user_progress(db, current_user.id)
