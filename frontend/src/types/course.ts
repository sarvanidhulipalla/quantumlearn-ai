export interface LessonSummary {
  id: number;
  title: string;
  slug: string;
  lesson_type: string;
  order: number;
  duration_minutes: number;
  is_completed: boolean;
}

export interface ModuleWithLessons {
  id: number;
  title: string;
  description?: string;
  order: number;
  lessons: LessonSummary[];
}

export interface InstructorSummary {
  id: number;
  full_name: string;
  role: string;
  bio?: string;
  avatar_url?: string;
}

export interface CourseListItem {
  id: number;
  title: string;
  slug: string;
  short_description?: string;
  level: string;
  estimated_hours: number;
  modules_count: number;
  lessons_count: number;
  is_enrolled: boolean;
  progress_percentage: number;
}

export interface CourseDetailResponse {
  id: number;
  title: string;
  slug: string;
  description: string;
  short_description?: string;
  level: string;
  estimated_hours: number;
  instructor: InstructorSummary;
  modules: ModuleWithLessons[];
  is_enrolled: boolean;
  progress_percentage: number;
  current_lesson_id?: number;
}

export interface LessonDetailResponse {
  id: number;
  title: string;
  slug: string;
  content: string;
  lesson_type: string;
  order: number;
  duration_minutes: number;
  is_completed: boolean;
  module_id: number;
  module_title: string;
  course_id: number;
  course_title: string;
  prev_lesson_id?: number;
  next_lesson_id?: number;
}

export interface LessonCompleteResponse {
  lesson_id: number;
  is_completed: boolean;
  course_id: number;
  course_progress_percentage: number;
  is_course_completed: boolean;
  points_awarded: number;
  next_lesson_id?: number;
}

export interface RecentActivityItem {
  id: string;
  title: string;
  activity_type: string;
  timestamp: string;
  description: string;
  route: string;
}

export interface ActiveCourseSummary {
  course_id: number;
  course_title: string;
  current_lesson_id: number;
  current_lesson_title: string;
  progress_percentage: number;
}

export interface StudentProgressStats {
  overall_progress_percentage: number;
  completed_lessons_count: number;
  total_lessons_count: number;
  in_progress_courses_count: number;
  completed_courses_count: number;
  total_learning_hours: number;
  current_streak_days: number;
  total_points: number;
  today_goal_completed: boolean;
  active_course?: ActiveCourseSummary;
  recommended_course?: CourseListItem;
  recent_activities: RecentActivityItem[];
}
