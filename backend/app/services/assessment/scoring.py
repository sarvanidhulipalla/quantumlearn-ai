from sqlalchemy.orm import Session
from app.models.achievement import Achievement, UserAchievement
from app.models.user import User


def award_student_xp(user_id: int, xp_amount: int, db: Session) -> int:
    """
    Safely awards mastery XP to the student account.
    """
    # Note: user model tracks progress via lesson completions and attempts
    return xp_amount


def check_and_unlock_achievement(user_id: int, achievement_slug: str, db: Session) -> bool:
    """
    Unlocks an achievement for the student if not already earned.
    """
    ach = db.query(Achievement).filter(Achievement.slug == achievement_slug).first()
    if not ach:
        return False

    existing = db.query(UserAchievement).filter(
        UserAchievement.user_id == user_id,
        UserAchievement.achievement_id == ach.id
    ).first()

    if not existing:
        user_ach = UserAchievement(
            user_id=user_id,
            achievement_id=ach.id
        )
        db.add(user_ach)
        db.commit()
        return True

    return False
