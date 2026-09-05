from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field


class TopicMasteryItem(BaseModel):
    topic: str
    mastery_score: int  # 0 to 100
    level: str  # Novice, Developing, Proficient, Mastered
    lessons_completed: int
    quiz_avg_score: int
    challenges_solved: int
    status: str  # "Strong", "Developing", "Needs Review"


class TopicMasteryResponse(BaseModel):
    user_id: int
    overall_mastery_percentage: int
    strong_topics: List[str] = []
    weak_topics: List[str] = []
    topics: List[TopicMasteryItem] = []


class PersonalizedRecommendationItem(BaseModel):
    id: str
    title: str
    reason: str
    target_type: str  # "lesson", "challenge", "quiz", "review"
    target_id: Optional[int] = None
    target_slug: Optional[str] = None
    priority: str  # "high", "medium", "low"
    action_label: str
    route: str
    topic: str


class PersonalizedRecommendationsResponse(BaseModel):
    user_id: int
    focus_area: str
    next_best_lesson: Optional[PersonalizedRecommendationItem] = None
    suggested_challenge: Optional[PersonalizedRecommendationItem] = None
    recommendations: List[PersonalizedRecommendationItem] = []


class AILearningSummaryResponse(BaseModel):
    user_id: int
    student_name: str
    generated_at: str
    total_xp: int
    current_streak: int
    strong_areas: List[str]
    weak_areas: List[str]
    recent_achievements: List[str]
    improvements_summary: str
    pedagogical_advice: str
    next_study_targets: List[str]
    notice: str = "AI Generated Learning Summary — Grounded on your active curriculum metrics."
