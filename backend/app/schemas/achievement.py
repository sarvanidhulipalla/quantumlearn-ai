from typing import List, Optional
from pydantic import BaseModel


class AchievementItem(BaseModel):
    id: int
    slug: str
    title: str
    description: str
    icon: str
    points: int
    badge_category: str
    criteria_type: str
    criteria_threshold: int
    is_unlocked: bool = False
    earned_at: Optional[str] = None
    progress_current: int = 0
    progress_percentage: int = 0


class AchievementProgressResponse(BaseModel):
    total_unlocked: int
    total_achievements: int
    total_points_earned: int
    current_streak: int
    longest_streak: int
    achievements: List[AchievementItem] = []
