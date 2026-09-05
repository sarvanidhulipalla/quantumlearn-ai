import json
from datetime import datetime, timezone
from typing import List, Dict, Any, Optional
from sqlalchemy.orm import Session
from fastapi import HTTPException, status

from app.models.assessment import Quiz, Question, QuizAttempt
from app.models.user import User
from app.services.assessment.scoring import award_student_xp, check_and_unlock_achievement


def list_quizzes(db: Session, user_id: Optional[int] = None) -> List[Dict[str, Any]]:
    """
    Returns all published quizzes with student attempt metadata.
    Does NOT leak correct answers.
    """
    quizzes = db.query(Quiz).filter(Quiz.is_published == True).order_by(Quiz.id).all()
    results: List[Dict[str, Any]] = []

    for q in quizzes:
        attempts = []
        best_score = 0.0
        passed = False

        if user_id:
            user_attempts = db.query(QuizAttempt).filter(
                QuizAttempt.quiz_id == q.id,
                QuizAttempt.user_id == user_id
            ).all()
            if user_attempts:
                best_score = max(a.score_percentage for a in user_attempts)
                passed = any(a.passed for a in user_attempts)

        results.append({
            "id": q.id,
            "title": q.title,
            "description": q.description,
            "course_id": q.course_id,
            "lesson_id": q.lesson_id,
            "passing_score_percentage": q.passing_score_percentage,
            "time_limit_minutes": q.time_limit_minutes,
            "question_count": len(q.questions),
            "attempt_count": len(user_attempts) if user_id and user_attempts else 0,
            "best_score": round(best_score, 1),
            "is_passed": passed,
        })

    return results


def get_quiz_detail(quiz_id: int, db: Session) -> Dict[str, Any]:
    """
    Retrieves quiz questions for a test-taking session.
    IMPORTANT: Correct answers and explanations are safely omitted to prevent tampering.
    """
    quiz = db.query(Quiz).filter(Quiz.id == quiz_id, Quiz.is_published == True).first()
    if not quiz:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Quiz with ID {quiz_id} not found."
        )

    safe_questions: List[Dict[str, Any]] = []
    for qu in quiz.questions:
        try:
            options = json.loads(qu.options_json) if qu.options_json else []
        except Exception:
            options = []

        safe_questions.append({
            "id": qu.id,
            "prompt": qu.prompt,
            "question_type": qu.question_type,
            "options": options,
            "points": qu.points,
            "order": qu.order,
        })

    return {
        "id": quiz.id,
        "title": quiz.title,
        "description": quiz.description,
        "course_id": quiz.course_id,
        "lesson_id": quiz.lesson_id,
        "passing_score_percentage": quiz.passing_score_percentage,
        "time_limit_minutes": quiz.time_limit_minutes,
        "questions": safe_questions,
    }


def submit_quiz_answers(
    quiz_id: int,
    user_id: int,
    answers: Dict[str, str],
    db: Session
) -> Dict[str, Any]:
    """
    Authoritative backend grading engine for quiz submissions.
    Stores attempt, updates student XP, and returns full question-by-question breakdown.
    """
    quiz = db.query(Quiz).filter(Quiz.id == quiz_id).first()
    if not quiz:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Quiz with ID {quiz_id} not found."
        )

    questions = quiz.questions
    if not questions:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="This quiz has no questions."
        )

    total_possible_points = sum(q.points for q in questions) or 100
    earned_points = 0
    correct_count = 0
    breakdown: List[Dict[str, Any]] = []

    for qu in questions:
        student_ans = str(answers.get(str(qu.id), answers.get(qu.id, ""))).strip()
        is_correct = (student_ans.lower() == qu.correct_answer.strip().lower())

        if is_correct:
            earned_points += qu.points
            correct_count += 1

        try:
            options = json.loads(qu.options_json) if qu.options_json else []
        except Exception:
            options = []

        breakdown.append({
            "question_id": qu.id,
            "prompt": qu.prompt,
            "question_type": qu.question_type,
            "options": options,
            "student_answer": student_ans,
            "correct_answer": qu.correct_answer,
            "is_correct": is_correct,
            "points_earned": qu.points if is_correct else 0,
            "points_possible": qu.points,
            "explanation": qu.explanation or "No explanation provided.",
        })

    score_pct = round((earned_points / float(total_possible_points)) * 100.0, 1)
    passed = score_pct >= quiz.passing_score_percentage

    # Persist attempt
    attempt = QuizAttempt(
        user_id=user_id,
        quiz_id=quiz.id,
        score_percentage=score_pct,
        passed=passed,
        answers_json=json.dumps(answers),
        completed_at=datetime.now(timezone.utc),
    )
    db.add(attempt)
    db.commit()
    db.refresh(attempt)

    # Award XP & Achievements
    xp_earned = int(earned_points * 2.5) if passed else int(earned_points * 0.5)
    award_student_xp(user_id, xp_earned, db)
    
    from app.services.gamification.streak import StreakService
    from app.services.gamification.evaluator import AchievementEvaluator
    StreakService.record_daily_activity(db, user_id)
    AchievementEvaluator.evaluate_and_award(db, user_id)

    return {
        "attempt_id": attempt.id,
        "quiz_id": quiz.id,
        "quiz_title": quiz.title,
        "score_percentage": score_pct,
        "earned_points": earned_points,
        "total_possible_points": total_possible_points,
        "correct_count": correct_count,
        "total_questions": len(questions),
        "passed": passed,
        "passing_score_percentage": quiz.passing_score_percentage,
        "xp_earned": xp_earned,
        "breakdown": breakdown,
        "completed_at": attempt.completed_at.isoformat(),
    }


def get_quiz_attempts(quiz_id: int, user_id: int, db: Session) -> List[Dict[str, Any]]:
    """
    Retrieves student's attempt history for a quiz.
    """
    attempts = db.query(QuizAttempt).filter(
        QuizAttempt.quiz_id == quiz_id,
        QuizAttempt.user_id == user_id,
    ).order_by(QuizAttempt.completed_at.desc()).all()

    return [
        {
            "id": a.id,
            "quiz_id": a.quiz_id,
            "score_percentage": a.score_percentage,
            "passed": a.passed,
            "completed_at": a.completed_at.isoformat(),
        }
        for a in attempts
    ]
