import json
from datetime import datetime, timezone
from typing import List, Dict, Any, Optional
from sqlalchemy.orm import Session
from fastapi import HTTPException, status

from app.models.assessment import Challenge, ChallengeAttempt
from app.models.user import User
from app.services.assessment.evaluator import evaluate_challenge_submission
from app.services.assessment.scoring import award_student_xp, check_and_unlock_achievement

CHALLENGE_HINTS: Dict[str, List[str]] = {
    "create-superposition": [
        "Recall that single-qubit quantum gates perform rotations on the Bloch sphere.",
        "Look for the Hadamard (H) gate in your palette. When applied to |0⟩, it rotates the state vector to the equatorial X-axis.",
        "Place an H gate on wire q0 at Step 0, followed by a Measurement (M) gate to classical register c0.",
    ],
    "create-bell-state": [
        "A Bell State (|Φ⁺⟩) requires two qubits and creates maximal entanglement.",
        "First, put the control qubit (q0) into superposition using a Hadamard (H) gate.",
        "Then, add a CNOT (CX) gate with control=0 and target=1 to correlate the two qubits.",
    ],
    "create-ghz-state": [
        "A GHZ state is a 3-qubit entangled state: (|000⟩ + |111⟩)/√2.",
        "Apply H on q0, then CNOT from q0 to q1, then CNOT from q1 to q2.",
        "Add measurements on all three qubits to classical registers c0, c1, and c2.",
    ],
    "implement-x-gate": [
        "The Pauli-X gate acts as a quantum bit flip, rotating the state 180° around the X-axis.",
        "Apply an X gate to qubit 0 to transform the ground state |0⟩ into the excited state |1⟩ with 100% certainty.",
    ],
}


def list_challenges(db: Session, user_id: Optional[int] = None) -> List[Dict[str, Any]]:
    """
    Retrieves all published quantum challenges with student completion status.
    """
    challenges = db.query(Challenge).filter(Challenge.is_published == True).order_by(Challenge.id).all()
    results: List[Dict[str, Any]] = []

    for ch in challenges:
        user_attempts = []
        is_solved = False
        best_fidelity = 0.0

        if user_id:
            user_attempts = db.query(ChallengeAttempt).filter(
                ChallengeAttempt.challenge_id == ch.id,
                ChallengeAttempt.user_id == user_id,
            ).all()
            if user_attempts:
                is_solved = any(a.solved for a in user_attempts)
                best_fidelity = max(a.fidelity_score for a in user_attempts)

        results.append({
            "id": ch.id,
            "title": ch.title,
            "slug": ch.slug,
            "difficulty": ch.difficulty,
            "category": ch.category,
            "description": ch.description,
            "points_reward": ch.points_reward,
            "is_solved": is_solved,
            "best_fidelity": round(best_fidelity, 3),
            "attempt_count": len(user_attempts) if user_id and user_attempts else 0,
        })

    return results


def get_challenge_detail(challenge_id_or_slug: str, db: Session, user_id: Optional[int] = None) -> Dict[str, Any]:
    """
    Retrieves challenge specifications, starter circuit, and target state description.
    """
    if challenge_id_or_slug.isdigit():
        ch = db.query(Challenge).filter(Challenge.id == int(challenge_id_or_slug), Challenge.is_published == True).first()
    else:
        ch = db.query(Challenge).filter(Challenge.slug == challenge_id_or_slug, Challenge.is_published == True).first()

    if not ch:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Challenge '{challenge_id_or_slug}' not found."
        )

    starter_circuit = {}
    if ch.starter_circuit_json:
        try:
            starter_circuit = json.loads(ch.starter_circuit_json)
        except Exception:
            starter_circuit = {}

    is_solved = False
    best_fidelity = 0.0
    if user_id:
        user_attempts = db.query(ChallengeAttempt).filter(
            ChallengeAttempt.challenge_id == ch.id,
            ChallengeAttempt.user_id == user_id,
        ).all()
        if user_attempts:
            is_solved = any(a.solved for a in user_attempts)
            best_fidelity = max(a.fidelity_score for a in user_attempts)

    return {
        "id": ch.id,
        "title": ch.title,
        "slug": ch.slug,
        "difficulty": ch.difficulty,
        "category": ch.category,
        "description": ch.description,
        "points_reward": ch.points_reward,
        "starter_circuit": starter_circuit,
        "starter_qiskit_code": ch.starter_qiskit_code,
        "target_state_vector": ch.target_state_vector,
        "is_solved": is_solved,
        "best_fidelity": round(best_fidelity, 3),
    }


def submit_challenge_circuit(
    challenge_id: int,
    user_id: int,
    circuit_data: Dict[str, Any],
    db: Session,
) -> Dict[str, Any]:
    """
    Evaluates student's submitted quantum circuit against target challenge rules.
    """
    ch = db.query(Challenge).filter(Challenge.id == challenge_id).first()
    if not ch:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Challenge with ID {challenge_id} not found."
        )

    # 1. Run deterministic automated evaluation
    eval_result = evaluate_challenge_submission(ch.slug, circuit_data)

    solved = eval_result["solved"]
    fidelity = eval_result["fidelity_score"]

    # 2. Persist attempt
    attempt = ChallengeAttempt(
        user_id=user_id,
        challenge_id=ch.id,
        solved=solved,
        submitted_circuit_json=json.dumps(circuit_data),
        fidelity_score=fidelity,
        attempted_at=datetime.now(timezone.utc),
    )
    db.add(attempt)
    db.commit()
    db.refresh(attempt)

    # 3. Award XP & achievements on success
    awarded_xp = 0
    if solved:
        awarded_xp = ch.points_reward
        award_student_xp(user_id, awarded_xp, db)

    from app.services.gamification.streak import StreakService
    from app.services.gamification.evaluator import AchievementEvaluator
    StreakService.record_daily_activity(db, user_id)
    AchievementEvaluator.evaluate_and_award(db, user_id)

    return {
        "attempt_id": attempt.id,
        "challenge_id": ch.id,
        "challenge_title": ch.title,
        "solved": solved,
        "fidelity_score": fidelity,
        "message": eval_result["message"],
        "detailed_checks": eval_result["detailed_checks"],
        "simulation_results": eval_result.get("simulation_results"),
        "awarded_xp": awarded_xp,
        "attempted_at": attempt.attempted_at.isoformat(),
    }


def get_challenge_attempts(challenge_id: int, user_id: int, db: Session) -> List[Dict[str, Any]]:
    """
    Retrieves student's previous submissions for a challenge.
    """
    attempts = db.query(ChallengeAttempt).filter(
        ChallengeAttempt.challenge_id == challenge_id,
        ChallengeAttempt.user_id == user_id,
    ).order_by(ChallengeAttempt.attempted_at.desc()).all()

    return [
        {
            "id": a.id,
            "challenge_id": a.challenge_id,
            "solved": a.solved,
            "fidelity_score": a.fidelity_score,
            "attempted_at": a.attempted_at.isoformat(),
        }
        for a in attempts
    ]


def get_challenge_hint(challenge_id: int, hint_level: int, db: Session) -> Dict[str, Any]:
    """
    Returns progressive hints for a challenge.
    """
    ch = db.query(Challenge).filter(Challenge.id == challenge_id).first()
    if not ch:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Challenge not found."
        )

    hints = CHALLENGE_HINTS.get(ch.slug, [
        "Review the target state and construct the required gate sequence.",
        "Check which single-qubit gates or two-qubit operations can produce the requested amplitudes.",
        "Verify your measurement register connections.",
    ])

    clamped_level = max(1, min(len(hints), hint_level))
    return {
        "challenge_id": ch.id,
        "hint_level": clamped_level,
        "total_hints": len(hints),
        "hint": hints[clamped_level - 1],
    }
