from typing import List, Dict, Any, Tuple
from sqlalchemy.orm import Session
from datetime import datetime, timezone

from app.models.achievement import Achievement, UserAchievement
from app.models.enrollment import LessonProgress, Enrollment
from app.models.assessment import QuizAttempt, ChallengeAttempt, Challenge
from app.models.quantum import Circuit, CodeSubmission
from app.models.streak import UserStreak
from app.schemas.achievement import AchievementItem, AchievementProgressResponse
from app.services.gamification.streak import StreakService


class AchievementEvaluator:
    """
    Automatic event-driven achievement evaluation engine.
    Ensures idempotency, zero duplicate awards, and accurate progress computation.
    """

    @staticmethod
    def evaluate_and_award(db: Session, user_id: int) -> List[Achievement]:
        """
        Evaluates criteria across user progress and unlocks any eligible achievements.
        """
        # 1. Fetch all unlocked achievement IDs
        unlocked_records = db.query(UserAchievement).filter(
            UserAchievement.user_id == user_id
        ).all()
        unlocked_ids = {ua.achievement_id for ua in unlocked_records}

        # 2. Gather student telemetry
        lessons_count = db.query(LessonProgress).filter(
            LessonProgress.user_id == user_id,
            LessonProgress.is_completed == True
        ).count()

        completed_courses_count = db.query(Enrollment).filter(
            Enrollment.user_id == user_id,
            Enrollment.is_completed == True
        ).count()

        challenges_solved = db.query(ChallengeAttempt).filter(
            ChallengeAttempt.user_id == user_id,
            ChallengeAttempt.solved == True
        ).all()
        challenges_solved_count = len(challenges_solved)
        solved_challenge_ids = {ca.challenge_id for ca in challenges_solved}

        quiz_attempts = db.query(QuizAttempt).filter(QuizAttempt.user_id == user_id).all()
        has_perfect_quiz = any(qa.score_percentage >= 100 for qa in quiz_attempts)
        avg_quiz = int(sum([qa.score_percentage for qa in quiz_attempts]) / len(quiz_attempts)) if quiz_attempts else 0

        circuits_count = db.query(Circuit).filter(Circuit.user_id == user_id).count()
        qiskit_count = db.query(CodeSubmission).filter(CodeSubmission.user_id == user_id).count()

        streak = StreakService.get_user_streak(db, user_id)
        current_streak = streak.current_streak

        total_points = (lessons_count * 25) + (challenges_solved_count * 50) + int(avg_quiz * 1.5)

        # 3. Check locked achievements
        all_achievements = db.query(Achievement).all()
        newly_awarded: List[Achievement] = []

        for ach in all_achievements:
            if ach.id in unlocked_ids:
                continue

            unlocked = False
            ctype = ach.criteria_type
            thresh = ach.criteria_threshold
            target = ach.criteria_target

            if ctype == "lessons_completed" and lessons_count >= thresh:
                unlocked = True
            elif ctype == "courses_completed" and completed_courses_count >= thresh:
                unlocked = True
            elif ctype == "challenges_solved" and challenges_solved_count >= thresh:
                unlocked = True
            elif ctype == "challenges_solved_target" and target:
                target_ch = db.query(Challenge).filter(Challenge.slug == target).first()
                if target_ch and target_ch.id in solved_challenge_ids:
                    unlocked = True
            elif ctype == "circuits_created" and circuits_count >= thresh:
                unlocked = True
            elif ctype == "qiskit_runs" and qiskit_count >= thresh:
                unlocked = True
            elif ctype == "quiz_perfect" and has_perfect_quiz:
                unlocked = True
            elif ctype == "streak_days" and current_streak >= thresh:
                unlocked = True
            elif ctype == "points_threshold" and total_points >= thresh:
                unlocked = True

            if unlocked:
                ua = UserAchievement(user_id=user_id, achievement_id=ach.id)
                db.add(ua)
                newly_awarded.append(ach)

        if newly_awarded:
            db.commit()

        return newly_awarded

    @staticmethod
    def get_user_progress(db: Session, user_id: int) -> AchievementProgressResponse:
        """
        Returns complete achievement progress for the achievements page.
        """
        # Run evaluation first to catch any pending unlocks
        AchievementEvaluator.evaluate_and_award(db, user_id)

        all_achievements = db.query(Achievement).order_by(Achievement.id.asc()).all()
        unlocked_records = db.query(UserAchievement).filter(
            UserAchievement.user_id == user_id
        ).all()
        unlocked_map = {ua.achievement_id: ua.earned_at for ua in unlocked_records}

        # Telemetry counts for progress bars
        lessons_count = db.query(LessonProgress).filter(
            LessonProgress.user_id == user_id,
            LessonProgress.is_completed == True
        ).count()
        courses_count = db.query(Enrollment).filter(
            Enrollment.user_id == user_id,
            Enrollment.is_completed == True
        ).count()
        challenges_solved = db.query(ChallengeAttempt).filter(
            ChallengeAttempt.user_id == user_id,
            ChallengeAttempt.solved == True
        ).all()
        challenges_count = len(challenges_solved)
        solved_ch_ids = {ca.challenge_id for ca in challenges_solved}

        circuits_count = db.query(Circuit).filter(Circuit.user_id == user_id).count()
        qiskit_count = db.query(CodeSubmission).filter(CodeSubmission.user_id == user_id).count()

        streak = StreakService.get_user_streak(db, user_id)
        current_streak = streak.current_streak

        quiz_attempts = db.query(QuizAttempt).filter(QuizAttempt.user_id == user_id).all()
        has_perfect_quiz = any(qa.score_percentage >= 100 for qa in quiz_attempts)
        avg_quiz = int(sum([qa.score_percentage for qa in quiz_attempts]) / len(quiz_attempts)) if quiz_attempts else 0

        total_points = (lessons_count * 25) + (challenges_count * 50) + int(avg_quiz * 1.5)

        items: List[AchievementItem] = []
        points_earned = 0

        for ach in all_achievements:
            is_unlocked = ach.id in unlocked_map
            earned_at_str = unlocked_map[ach.id].isoformat() if is_unlocked else None

            if is_unlocked:
                points_earned += ach.points

            # Calculate current progress toward locked criteria
            ctype = ach.criteria_type
            thresh = max(1, ach.criteria_threshold)
            target = ach.criteria_target

            if is_unlocked:
                current_val = thresh
            elif ctype == "lessons_completed":
                current_val = lessons_count
            elif ctype == "courses_completed":
                current_val = courses_count
            elif ctype == "challenges_solved":
                current_val = challenges_count
            elif ctype == "challenges_solved_target" and target:
                target_ch = db.query(Challenge).filter(Challenge.slug == target).first()
                current_val = 1 if (target_ch and target_ch.id in solved_ch_ids) else 0
            elif ctype == "circuits_created":
                current_val = circuits_count
            elif ctype == "qiskit_runs":
                current_val = qiskit_count
            elif ctype == "quiz_perfect":
                current_val = 1 if has_perfect_quiz else 0
            elif ctype == "streak_days":
                current_val = current_streak
            elif ctype == "points_threshold":
                current_val = total_points
            else:
                current_val = 0

            pct = 100 if is_unlocked else int(min(100, (current_val / thresh) * 100))

            items.append(
                AchievementItem(
                    id=ach.id,
                    slug=ach.slug,
                    title=ach.title,
                    description=ach.description,
                    icon=ach.icon,
                    points=ach.points,
                    badge_category=ach.badge_category,
                    criteria_type=ach.criteria_type,
                    criteria_threshold=ach.criteria_threshold,
                    is_unlocked=is_unlocked,
                    earned_at=earned_at_str,
                    progress_current=min(current_val, thresh),
                    progress_percentage=pct,
                )
            )

        return AchievementProgressResponse(
            total_unlocked=len(unlocked_map),
            total_achievements=len(all_achievements),
            total_points_earned=points_earned,
            current_streak=streak.current_streak,
            longest_streak=streak.longest_streak,
            achievements=items,
        )
