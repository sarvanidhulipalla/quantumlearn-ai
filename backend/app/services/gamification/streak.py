from datetime import date, datetime, timedelta, timezone
from sqlalchemy.orm import Session

from app.models.streak import UserStreak


class StreakService:
    """
    Learning Streak mechanism with daily deduplication and consecutive-day tracking.
    """

    @staticmethod
    def record_daily_activity(db: Session, user_id: int) -> UserStreak:
        streak = db.query(UserStreak).filter(UserStreak.user_id == user_id).first()
        today_str = date.today().isoformat()
        yesterday_str = (date.today() - timedelta(days=1)).isoformat()

        if not streak:
            streak = UserStreak(
                user_id=user_id,
                current_streak=1,
                longest_streak=1,
                last_activity_date=today_str,
            )
            db.add(streak)
            db.commit()
            db.refresh(streak)
            return streak

        # Same-day activity is idempotent (does NOT increment streak twice)
        if streak.last_activity_date == today_str:
            return streak

        # Consecutive day -> increment streak
        if streak.last_activity_date == yesterday_str:
            streak.current_streak += 1
            if streak.current_streak > streak.longest_streak:
                streak.longest_streak = streak.current_streak
        else:
            # Broken streak -> reset to 1
            streak.current_streak = 1
            if streak.longest_streak == 0:
                streak.longest_streak = 1

        streak.last_activity_date = today_str
        streak.updated_at = datetime.now(timezone.utc)
        db.commit()
        db.refresh(streak)
        return streak

    @staticmethod
    def get_user_streak(db: Session, user_id: int) -> UserStreak:
        streak = db.query(UserStreak).filter(UserStreak.user_id == user_id).first()
        if not streak:
            streak = UserStreak(
                user_id=user_id,
                current_streak=1,
                longest_streak=1,
                last_activity_date=date.today().isoformat(),
            )
            db.add(streak)
            db.commit()
            db.refresh(streak)
        return streak
