from typing import List, Dict, Any, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.core.dependencies import get_current_user
from app.models.user import User
from app.schemas.assessment import (
    ChallengeSummaryResponse,
    ChallengeDetailResponse,
    ChallengeSubmitRequest,
    ChallengeSubmitResponse,
    ChallengeAttemptSummary,
    ChallengeHintResponse,
)
from app.services.assessment.challenge import (
    list_challenges,
    get_challenge_detail,
    submit_challenge_circuit,
    get_challenge_attempts,
    get_challenge_hint,
)

router = APIRouter(prefix="/challenges", tags=["Quantum Challenges"])


@router.get("", response_model=List[ChallengeSummaryResponse])
def get_all_challenges(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Lists all quantum challenges with student completion status.
    """
    return list_challenges(db=db, user_id=current_user.id)


@router.get("/{challenge_id}", response_model=ChallengeDetailResponse)
def get_challenge_by_id(
    challenge_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Retrieves challenge details, starter circuit, and target specifications.
    """
    return get_challenge_detail(challenge_id_or_slug=challenge_id, db=db, user_id=current_user.id)


@router.post("/{challenge_id}/submit", response_model=ChallengeSubmitResponse)
def submit_challenge(
    challenge_id: int,
    payload: ChallengeSubmitRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Submits a quantum circuit for automated deterministic evaluation and XP awards.
    """
    return submit_challenge_circuit(
        challenge_id=challenge_id,
        user_id=current_user.id,
        circuit_data=payload.circuit,
        db=db,
    )


@router.get("/{challenge_id}/attempts", response_model=List[ChallengeAttemptSummary])
def get_attempts(
    challenge_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Retrieves previous submission attempts for this challenge.
    """
    return get_challenge_attempts(
        challenge_id=challenge_id,
        user_id=current_user.id,
        db=db,
    )


@router.post("/{challenge_id}/hint", response_model=ChallengeHintResponse)
def get_hint(
    challenge_id: int,
    hint_level: int = 1,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Retrieves progressive Socratic hints for a quantum challenge.
    """
    return get_challenge_hint(
        challenge_id=challenge_id,
        hint_level=hint_level,
        db=db,
    )
