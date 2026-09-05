import { api } from './api';

export interface AchievementItem {
  id: number;
  slug: string;
  title: string;
  description: string;
  icon: string;
  points: number;
  badge_category: string;
  criteria_type: string;
  criteria_threshold: number;
  is_unlocked: boolean;
  earned_at?: string;
  progress_current: number;
  progress_percentage: number;
}

export interface AchievementProgressResponse {
  total_unlocked: number;
  total_achievements: number;
  total_points_earned: number;
  current_streak: number;
  longest_streak: number;
  achievements: AchievementItem[];
}

export const achievementService = {
  async getAchievementProgress(): Promise<AchievementProgressResponse> {
    const response = await api.get('/achievements/progress');
    return response.data;
  },
};
