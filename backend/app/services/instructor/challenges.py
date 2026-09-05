import re
import json
from datetime import datetime, timezone
from typing import List, Dict, Any, Optional
from sqlalchemy.orm import Session
from fastapi import HTTPException, status

from app.models.assessment import Challenge, ChallengeAttempt
from app.schemas.instructor import (
    InstructorChallengeCreate,
    InstructorChallengeUpdate,
    InstructorChallengeListItem,
    InstructorChallengeDetail,
)


def _generate_challenge_slug(title: str, db: Session, challenge_id: Optional[int] = None) -> str:
    base_slug = re.sub(r'[^a-zA-Z0-9]+', '-', title.lower()).strip('-')
    if not base_slug:
        base_slug = "quantum-challenge"
    
    slug = base_slug
    counter = 1
    while True:
        query = db.query(Challenge).filter(Challenge.slug == slug)
        if challenge_id:
            query = query.filter(Challenge.id != challenge_id)
        if not query.first():
            break
        slug = f"{base_slug}-{counter}"
        counter += 1
    return slug


def check_challenge_ownership(challenge_id: int, instructor_id: int, db: Session) -> Challenge:
    ch = db.query(Challenge).filter(Challenge.id == challenge_id).first()
    if not ch:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Challenge with ID {challenge_id} not found."
        )
    if ch.creator_id and ch.creator_id != instructor_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have permission to modify this challenge."
        )
    return ch


def list_instructor_challenges(instructor_id: int, db: Session) -> List[InstructorChallengeListItem]:
    challenges = db.query(Challenge).filter(
        (Challenge.creator_id == instructor_id) | (Challenge.creator_id.is_(None))
    ).order_by(Challenge.created_at.desc()).all()

    results: List[InstructorChallengeListItem] = []
    for ch in challenges:
        attempts_count = db.query(ChallengeAttempt).filter(ChallengeAttempt.challenge_id == ch.id).count()
        solved_count = db.query(ChallengeAttempt).filter(ChallengeAttempt.challenge_id == ch.id, ChallengeAttempt.solved == True).count()

        results.append(InstructorChallengeListItem(
            id=ch.id,
            title=ch.title,
            slug=ch.slug,
            difficulty=ch.difficulty,
            category=ch.category,
            description=ch.description,
            points_reward=ch.points_reward,
            is_published=ch.is_published,
            attempts_count=attempts_count,
            solved_count=solved_count,
            created_at=ch.created_at,
        ))

    return results


def create_instructor_challenge(instructor_id: int, data: InstructorChallengeCreate, db: Session) -> Dict[str, Any]:
    slug = data.slug if data.slug else _generate_challenge_slug(data.title, db)

    starter_circuit = data.starter_circuit_json
    if starter_circuit and not isinstance(starter_circuit, str):
        starter_circuit = json.dumps(starter_circuit)

    ch = Challenge(
        title=data.title,
        slug=slug,
        difficulty=data.difficulty,
        category=data.category,
        description=data.description,
        target_state_vector=data.target_state_vector,
        starter_qiskit_code=data.starter_qiskit_code,
        starter_circuit_json=starter_circuit,
        test_cases_json=data.test_cases_json,
        points_reward=data.points_reward,
        is_published=data.is_published,
        creator_id=instructor_id,
        created_at=datetime.now(timezone.utc),
    )
    db.add(ch)
    db.commit()
    db.refresh(ch)

    return {
        "id": ch.id,
        "title": ch.title,
        "slug": ch.slug,
        "is_published": ch.is_published,
        "message": "Challenge created successfully."
    }


def get_instructor_challenge(challenge_id: int, instructor_id: int, db: Session) -> InstructorChallengeDetail:
    ch = check_challenge_ownership(challenge_id, instructor_id, db)
    attempts_count = db.query(ChallengeAttempt).filter(ChallengeAttempt.challenge_id == ch.id).count()
    solved_count = db.query(ChallengeAttempt).filter(ChallengeAttempt.challenge_id == ch.id, ChallengeAttempt.solved == True).count()

    return InstructorChallengeDetail(
        id=ch.id,
        title=ch.title,
        slug=ch.slug,
        difficulty=ch.difficulty,
        category=ch.category,
        description=ch.description,
        target_state_vector=ch.target_state_vector,
        starter_qiskit_code=ch.starter_qiskit_code,
        starter_circuit_json=ch.starter_circuit_json,
        test_cases_json=ch.test_cases_json,
        points_reward=ch.points_reward,
        is_published=ch.is_published,
        attempts_count=attempts_count,
        solved_count=solved_count,
        created_at=ch.created_at,
    )


def update_instructor_challenge(challenge_id: int, instructor_id: int, data: InstructorChallengeUpdate, db: Session) -> Dict[str, Any]:
    ch = check_challenge_ownership(challenge_id, instructor_id, db)

    if data.title is not None and data.title != ch.title:
        ch.title = data.title
        if not data.slug:
            ch.slug = _generate_challenge_slug(data.title, db, challenge_id=ch.id)
    if data.slug is not None:
        ch.slug = data.slug
    if data.difficulty is not None:
        ch.difficulty = data.difficulty
    if data.category is not None:
        ch.category = data.category
    if data.description is not None:
        ch.description = data.description
    if data.target_state_vector is not None:
        ch.target_state_vector = data.target_state_vector
    if data.starter_qiskit_code is not None:
        ch.starter_qiskit_code = data.starter_qiskit_code
    if data.starter_circuit_json is not None:
        ch.starter_circuit_json = data.starter_circuit_json if isinstance(data.starter_circuit_json, str) else json.dumps(data.starter_circuit_json)
    if data.test_cases_json is not None:
        ch.test_cases_json = data.test_cases_json
    if data.points_reward is not None:
        ch.points_reward = data.points_reward
    if data.is_published is not None:
        ch.is_published = data.is_published

    db.commit()
    db.refresh(ch)

    return {
        "id": ch.id,
        "title": ch.title,
        "is_published": ch.is_published,
        "message": "Challenge updated successfully."
    }


def delete_instructor_challenge(challenge_id: int, instructor_id: int, db: Session) -> Dict[str, str]:
    ch = check_challenge_ownership(challenge_id, instructor_id, db)
    db.delete(ch)
    db.commit()
    return {"message": f"Challenge '{ch.title}' deleted successfully."}


def set_challenge_published(challenge_id: int, instructor_id: int, is_published: bool, db: Session) -> Dict[str, Any]:
    ch = check_challenge_ownership(challenge_id, instructor_id, db)
    ch.is_published = is_published
    db.commit()
    return {
        "id": ch.id,
        "is_published": ch.is_published,
        "message": f"Challenge {'published' if is_published else 'unpublished'} successfully."
    }
