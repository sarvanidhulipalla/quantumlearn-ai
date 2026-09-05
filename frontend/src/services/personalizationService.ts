import { api } from './api';

export interface TopicMasteryItem {
  topic: string;
  mastery_score: number;
  level: string; // Novice, Developing, Proficient, Mastered
  lessons_completed: number;
  quiz_avg_score: number;
  challenges_solved: number;
  status: string; // Strong, Developing, Needs Review
}

export interface TopicMasteryResponse {
  user_id: number;
  overall_mastery_percentage: number;
  strong_topics: string[];
  weak_topics: string[];
  topics: TopicMasteryItem[];
}

export interface PersonalizedRecommendationItem {
  id: string;
  title: string;
  reason: string;
  target_type: string; // lesson, challenge, quiz, review
  target_id?: number;
  target_slug?: string;
  priority: string; // high, medium, low
  action_label: string;
  route: string;
  topic: string;
}

export interface PersonalizedRecommendationsResponse {
  user_id: number;
  focus_area: string;
  next_best_lesson?: PersonalizedRecommendationItem;
  suggested_challenge?: PersonalizedRecommendationItem;
  recommendations: PersonalizedRecommendationItem[];
}

export interface AILearningSummaryResponse {
  user_id: number;
  student_name: string;
  generated_at: string;
  total_xp: number;
  current_streak: number;
  strong_areas: string[];
  weak_areas: string[];
  recent_achievements: string[];
  improvements_summary: string;
  pedagogical_advice: string;
  next_study_targets: string[];
  notice: string;
}

export const personalizationService = {
  async getPersonalizedRecommendations(): Promise<PersonalizedRecommendationsResponse> {
    const response = await api.get('/personalization/recommendations');
    return response.data;
  },

  async getTopicMastery(): Promise<TopicMasteryResponse> {
    const response = await api.get('/personalization/mastery');
    return response.data;
  },

  async getAILearningSummary(): Promise<AILearningSummaryResponse> {
    const response = await api.get('/personalization/learning-summary');
    return response.data;
  },
};
