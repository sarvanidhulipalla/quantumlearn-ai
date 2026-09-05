import uuid
from typing import List, Optional
from sqlalchemy.orm import Session

from app.models.course import Course, Lesson, Module
from app.models.enrollment import Enrollment, LessonProgress
from app.models.assessment import Quiz, QuizAttempt, Challenge, ChallengeAttempt
from app.schemas.personalization import (
    PersonalizedRecommendationItem,
    PersonalizedRecommendationsResponse,
)
from app.services.personalization.mastery import MasteryCalculator


class RecommendationEngine:
    """
    Tailored learning path and next-action recommendation engine for QuantumLearn AI.
    Analyzes student prerequisite mastery, recent mistakes, and enrolled course sequence.
    """

    @staticmethod
    def get_recommendations(db: Session, user_id: int) -> PersonalizedRecommendationsResponse:
        mastery = MasteryCalculator.calculate_topic_mastery(db, user_id)

        # 1. Determine Focus Area
        if mastery.weak_topics:
            focus_area = f"Strengthen Foundations: {mastery.weak_topics[0]}"
        elif mastery.overall_mastery_percentage >= 75:
            focus_area = "Advanced Algorithm Synthesis & State Tomography"
        else:
            focus_area = "Multi-Qubit Operators & Bell State Entanglement"

        recommendations: List[PersonalizedRecommendationItem] = []

        # 2. Find Next Best Lesson in Enrolled/Active Courses
        completed_lessons = db.query(LessonProgress).filter(
            LessonProgress.user_id == user_id,
            LessonProgress.is_completed == True
        ).all()
        completed_lesson_ids = {lp.lesson_id for lp in completed_lessons}

        enrolled_courses = db.query(Enrollment).filter(Enrollment.user_id == user_id).all()
        enrolled_course_ids = [e.course_id for e in enrolled_courses]

        next_best_lesson: Optional[PersonalizedRecommendationItem] = None

        if enrolled_course_ids:
            # Find first uncompleted lesson in enrolled courses
            uncompleted_lesson = db.query(Lesson).join(Module).filter(
                Module.course_id.in_(enrolled_course_ids),
                Lesson.is_published == True,
                ~Lesson.id.in_(completed_lesson_ids) if completed_lesson_ids else True
            ).order_by(Module.order.asc(), Lesson.order.asc()).first()

            if uncompleted_lesson:
                next_best_lesson = PersonalizedRecommendationItem(
                    id=str(uuid.uuid4())[:8],
                    title=f"Continue: {uncompleted_lesson.title}",
                    reason="Next scheduled lesson in your active course curriculum.",
                    target_type="lesson",
                    target_id=uncompleted_lesson.id,
                    target_slug=uncompleted_lesson.slug,
                    priority="high",
                    action_label="Resume Lesson",
                    route=f"/lessons/{uncompleted_lesson.id}",
                    topic="Curriculum",
                )
                recommendations.append(next_best_lesson)

        # Fallback if no uncompleted lesson found in enrolled courses
        if not next_best_lesson:
            first_public_lesson = db.query(Lesson).filter(Lesson.is_published == True).first()
            if first_public_lesson:
                next_best_lesson = PersonalizedRecommendationItem(
                    id=str(uuid.uuid4())[:8],
                    title=f"Start: {first_public_lesson.title}",
                    reason="Recommended foundational lesson for quantum state exploration.",
                    target_type="lesson",
                    target_id=first_public_lesson.id,
                    target_slug=first_public_lesson.slug,
                    priority="high",
                    action_label="Start Lesson",
                    route=f"/lessons/{first_public_lesson.id}",
                    topic="Foundations",
                )
                recommendations.append(next_best_lesson)

        # 3. Find Suggested Quantum Challenge
        solved_challenges = db.query(ChallengeAttempt).filter(
            ChallengeAttempt.user_id == user_id,
            ChallengeAttempt.solved == True
        ).all()
        solved_ch_ids = {ca.challenge_id for ca in solved_challenges}

        unsolved_challenge = db.query(Challenge).filter(
            Challenge.is_published == True,
            ~Challenge.id.in_(solved_ch_ids) if solved_ch_ids else True
        ).order_by(Challenge.id.asc()).first()

        suggested_challenge: Optional[PersonalizedRecommendationItem] = None
        if unsolved_challenge:
            suggested_challenge = PersonalizedRecommendationItem(
                id=str(uuid.uuid4())[:8],
                title=f"Lab Challenge: {unsolved_challenge.title}",
                reason=f"Synthesize the target state on Qiskit Aer to earn +{unsolved_challenge.points_reward} XP.",
                target_type="challenge",
                target_id=unsolved_challenge.id,
                target_slug=unsolved_challenge.slug,
                priority="medium",
                action_label="Solve Challenge",
                route=f"/student/challenges/{unsolved_challenge.id}",
                topic=unsolved_challenge.category,
            )
            recommendations.append(suggested_challenge)

        # 4. Review Weak Topics Recommendations
        for weak in mastery.weak_topics[:2]:
            rec_item = PersonalizedRecommendationItem(
                id=str(uuid.uuid4())[:8],
                title=f"Review Conceptual Foundations: {weak}",
                reason=f"Your current topic score is in the developing range. Reinforcing {weak} will boost circuit problem solving.",
                target_type="review",
                target_id=None,
                target_slug=None,
                priority="high",
                action_label="Explore Knowledge Base",
                route="/student/tutor",
                topic=weak,
            )
            recommendations.append(rec_item)

        # 5. Suggest Quiz Practice
        quizzes = db.query(Quiz).filter(Quiz.is_published == True).all()
        quiz_attempts = db.query(QuizAttempt).filter(QuizAttempt.user_id == user_id).all()
        passed_quiz_ids = {qa.quiz_id for qa in quiz_attempts if qa.passed}

        unpassed_quiz = next((q for q in quizzes if q.id not in passed_quiz_ids), None)
        if unpassed_quiz:
            recommendations.append(
                PersonalizedRecommendationItem(
                    id=str(uuid.uuid4())[:8],
                    title=f"Assessment: {unpassed_quiz.title}",
                    reason="Verify your conceptual understanding and validate quantum gate prediction accuracy.",
                    target_type="quiz",
                    target_id=unpassed_quiz.id,
                    target_slug=None,
                    priority="medium",
                    action_label="Take Assessment",
                    route=f"/student/quizzes/{unpassed_quiz.id}",
                    topic="Assessment",
                )
            )

        return PersonalizedRecommendationsResponse(
            user_id=user_id,
            focus_area=focus_area,
            next_best_lesson=next_best_lesson,
            suggested_challenge=suggested_challenge,
            recommendations=recommendations,
        )
