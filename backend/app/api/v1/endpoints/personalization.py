from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.models.user import User
from app.core.dependencies import get_current_user
from app.schemas.personalization import (
    TopicMasteryResponse,
    PersonalizedRecommendationsResponse,
    AILearningSummaryResponse,
)
from app.services.personalization.mastery import MasteryCalculator
from app.services.personalization.recommendations import RecommendationEngine
from app.services.personalization.summary import AILearningSummaryEngine

router = APIRouter()


@router.post("/recommendations", response_model=PersonalizedRecommendationsResponse)
@router.get("/recommendations", response_model=PersonalizedRecommendationsResponse)
def get_personalized_recommendations(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Computes tailored next-action recommendations based on active student learning telemetry.
    """
    return RecommendationEngine.get_recommendations(db, current_user.id)


@router.get("/mastery", response_model=TopicMasteryResponse)
def get_student_topic_mastery(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Calculates deterministic topic mastery scores and categorical tiers across 9 quantum domains.
    """
    return MasteryCalculator.calculate_topic_mastery(db, current_user.id)


@router.get("/learning-summary", response_model=AILearningSummaryResponse)
def get_student_ai_learning_summary(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Generates an AI Learning Summary synthesizing real student metrics into pedagogical advice.
    """
    return AILearningSummaryEngine.generate_summary(db, current_user)
