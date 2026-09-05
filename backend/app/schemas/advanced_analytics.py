from typing import List, Optional, Dict, Any
from pydantic import BaseModel


class TopicMasteryDistributionItem(BaseModel):
    topic: str
    novice_count: int
    developing_count: int
    proficient_count: int
    mastered_count: int
    avg_score: int
    is_weak_topic: bool = False


class FunnelStep(BaseModel):
    step_name: str
    count: int
    percentage: float
    drop_off_rate: float


class AdvancedAnalyticsResponse(BaseModel):
    total_students: int
    topic_mastery_distribution: List[TopicMasteryDistributionItem] = []
    weak_topics: List[str] = []
    completion_funnel: List[FunnelStep] = []
    drop_off_insights: List[str] = []
    quiz_difficulty_signals: List[Dict[str, Any]] = []
    challenge_difficulty_signals: List[Dict[str, Any]] = []


class CourseInsightsResponse(BaseModel):
    course_id: int
    course_title: str
    total_enrolled: int
    completion_rate: float
    avg_quiz_score: float
    challenge_success_rate: float
    most_challenging_lesson: Optional[str] = None
    most_successful_lesson: Optional[str] = None
    drop_off_points: List[str] = []
    ai_insights: List[str] = []
    notice: str = "AI Insights are pedagogical recommendations derived from measured statistics."
