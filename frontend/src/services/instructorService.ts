import api from './api';

// ==========================================
// TYPES & INTERFACES
// ==========================================

export interface InstructorDashboardMetrics {
  total_students: number;
  active_students: number;
  published_courses: number;
  avg_quiz_score: number;
  course_completion_rate: number;
  challenges_completed: number;
}

export interface InstructorCoursePerformanceItem {
  course_id: number;
  title: string;
  students_count: number;
  completion_rate: number;
  avg_score: number;
  status: string;
}

export interface InstructorStudentPerformanceItem {
  student_id: number;
  name: string;
  course_title: string;
  progress: number;
  avg_score: number;
  last_activity?: string;
}

export interface InstructorDashboardData {
  metrics: InstructorDashboardMetrics;
  course_performance: InstructorCoursePerformanceItem[];
  top_students: InstructorStudentPerformanceItem[];
  students_needing_attention: InstructorStudentPerformanceItem[];
}

export interface InstructorAnalyticsData {
  metrics: InstructorDashboardMetrics;
  course_completion_trends: { name: string; completionRate: number; students: number }[];
  quiz_score_distribution: { range: string; count: number }[];
  challenge_completion_stats: { challenge: string; solvedRate: number; attempts: number }[];
  student_engagement_activity: { studentName: string; action: string; timestamp: string }[];
}

export interface InstructorCourse {
  id: number;
  title: string;
  slug: string;
  description: string;
  short_description?: string;
  level: string;
  estimated_hours: number;
  thumbnail_url?: string;
  is_published: boolean;
  modules_count?: number;
  lessons_count?: number;
  students_count?: number;
  avg_completion_percentage?: number;
  created_at: string;
  updated_at: string;
  modules?: InstructorModule[];
}

export interface InstructorModule {
  id: number;
  course_id: number;
  title: string;
  description?: string;
  order: number;
  lessons?: InstructorLesson[];
}

export interface InstructorLesson {
  id: number;
  module_id: number;
  course_id?: number;
  course_title?: string;
  module_title?: string;
  title: string;
  slug: string;
  content: string;
  lesson_type: string;
  order: number;
  duration_minutes: number;
  is_published: boolean;
  initial_circuit_json?: string;
  initial_qiskit_code?: string;
  created_at: string;
  updated_at: string;
}

export interface InstructorQuestion {
  id?: number;
  prompt: string;
  question_type: string;
  options_json: string; // JSON string or array
  correct_answer: string;
  explanation?: string;
  points: number;
  order: number;
}

export interface InstructorQuiz {
  id: number;
  title: string;
  description?: string;
  course_id?: number;
  course_title?: string;
  lesson_id?: number;
  lesson_title?: string;
  passing_score_percentage: number;
  time_limit_minutes: number;
  question_count?: number;
  attempts_count?: number;
  is_published: boolean;
  questions?: InstructorQuestion[];
  created_at: string;
}

export interface InstructorChallenge {
  id: number;
  title: string;
  slug: string;
  difficulty: string;
  category: string;
  description: string;
  target_state_vector?: string;
  starter_qiskit_code?: string;
  starter_circuit_json?: string;
  test_cases_json?: string;
  points_reward: number;
  is_published: boolean;
  attempts_count?: number;
  solved_count?: number;
  created_at: string;
}

export interface InstructorStudentItem {
  id: number;
  full_name: string;
  email: string;
  education_level?: string;
  quantum_experience?: string;
  enrolled_courses_count: number;
  overall_progress: number;
  avg_quiz_score: number;
  challenges_completed: number;
  last_activity?: string;
  status: 'Active' | 'Needs Attention';
}

export interface InstructorStudentDetail extends InstructorStudentItem {
  bio?: string;
  created_at: string;
  enrolled_courses: {
    course_id: number;
    title: string;
    level: string;
    completed_percentage: number;
    enrolled_at: string;
  }[];
  completed_lessons: {
    lesson_id: number;
    title: string;
    lesson_type: string;
    completed_at: string;
  }[];
  quiz_attempts: {
    quiz_id: number;
    title: string;
    score_percentage: number;
    passed: boolean;
    completed_at: string;
  }[];
  challenge_attempts: {
    challenge_id: number;
    title: string;
    solved: boolean;
    fidelity_score: number;
    attempted_at: string;
  }[];
}

// ==========================================
// INSTRUCTOR API SERVICE
// ==========================================

export const instructorService = {
  // 1. Dashboard & Analytics
  async getDashboard(): Promise<InstructorDashboardData> {
    const res = await api.get<InstructorDashboardData>('/instructor/dashboard');
    return res.data;
  },

  async getAnalytics(): Promise<InstructorAnalyticsData> {
    const res = await api.get<InstructorAnalyticsData>('/instructor/analytics');
    return res.data;
  },

  async getCourseAnalytics(courseId: number): Promise<any> {
    const res = await api.get(`/instructor/courses/${courseId}/analytics`);
    return res.data;
  },

  // 2. Course Management
  async listCourses(): Promise<InstructorCourse[]> {
    const res = await api.get<InstructorCourse[]>('/instructor/courses');
    return res.data;
  },

  async createCourse(data: {
    title: string;
    description: string;
    short_description?: string;
    level: string;
    estimated_hours: number;
    thumbnail_url?: string;
    is_published?: boolean;
  }): Promise<{ id: number; title: string; slug: string; message: string }> {
    const res = await api.post('/instructor/courses', data);
    return res.data;
  },

  async getCourse(courseId: number): Promise<InstructorCourse> {
    const res = await api.get<InstructorCourse>(`/instructor/courses/${courseId}`);
    return res.data;
  },

  async updateCourse(
    courseId: number,
    data: Partial<InstructorCourse>
  ): Promise<{ id: number; title: string; is_published: boolean; message: string }> {
    const res = await api.put(`/instructor/courses/${courseId}`, data);
    return res.data;
  },

  async deleteCourse(courseId: number): Promise<{ message: string }> {
    const res = await api.delete(`/instructor/courses/${courseId}`);
    return res.data;
  },

  async publishCourse(courseId: number): Promise<{ id: number; is_published: boolean; message: string }> {
    const res = await api.post(`/instructor/courses/${courseId}/publish`);
    return res.data;
  },

  async unpublishCourse(courseId: number): Promise<{ id: number; is_published: boolean; message: string }> {
    const res = await api.post(`/instructor/courses/${courseId}/unpublish`);
    return res.data;
  },

  // 3. Module Management
  async createModule(data: {
    course_id: number;
    title: string;
    description?: string;
    order?: number;
  }): Promise<{ id: number; course_id: number; title: string; order: number; message: string }> {
    const res = await api.post('/instructor/modules', data);
    return res.data;
  },

  async updateModule(
    moduleId: number,
    data: { title?: string; description?: string; order?: number }
  ): Promise<{ id: number; title: string; order: number; message: string }> {
    const res = await api.put(`/instructor/modules/${moduleId}`, data);
    return res.data;
  },

  async deleteModule(moduleId: number): Promise<{ message: string }> {
    const res = await api.delete(`/instructor/modules/${moduleId}`);
    return res.data;
  },

  // 4. Lesson Management
  async listLessons(): Promise<InstructorLesson[]> {
    const res = await api.get<InstructorLesson[]>('/instructor/lessons');
    return res.data;
  },

  async createLesson(data: {
    module_id: number;
    title: string;
    content: string;
    lesson_type?: string;
    order?: number;
    duration_minutes?: number;
    is_published?: boolean;
    initial_circuit_json?: string;
    initial_qiskit_code?: string;
  }): Promise<{ id: number; title: string; is_published: boolean; message: string }> {
    const res = await api.post('/instructor/lessons', data);
    return res.data;
  },

  async getLesson(lessonId: number): Promise<InstructorLesson> {
    const res = await api.get<InstructorLesson>(`/instructor/lessons/${lessonId}`);
    return res.data;
  },

  async updateLesson(
    lessonId: number,
    data: Partial<InstructorLesson>
  ): Promise<{ id: number; title: string; is_published: boolean; message: string }> {
    const res = await api.put(`/instructor/lessons/${lessonId}`, data);
    return res.data;
  },

  async deleteLesson(lessonId: number): Promise<{ message: string }> {
    const res = await api.delete(`/instructor/lessons/${lessonId}`);
    return res.data;
  },

  async publishLesson(lessonId: number): Promise<{ id: number; is_published: boolean; message: string }> {
    const res = await api.post(`/instructor/lessons/${lessonId}/publish`);
    return res.data;
  },

  async unpublishLesson(lessonId: number): Promise<{ id: number; is_published: boolean; message: string }> {
    const res = await api.post(`/instructor/lessons/${lessonId}/unpublish`);
    return res.data;
  },

  // 5. Quiz Management
  async listQuizzes(): Promise<InstructorQuiz[]> {
    const res = await api.get<InstructorQuiz[]>('/instructor/quizzes');
    return res.data;
  },

  async createQuiz(data: {
    title: string;
    description?: string;
    course_id?: number;
    lesson_id?: number;
    passing_score_percentage?: number;
    time_limit_minutes?: number;
    is_published?: boolean;
    questions: InstructorQuestion[];
  }): Promise<{ id: number; title: string; question_count: number; is_published: boolean; message: string }> {
    const res = await api.post('/instructor/quizzes', data);
    return res.data;
  },

  async getQuiz(quizId: number): Promise<InstructorQuiz> {
    const res = await api.get<InstructorQuiz>(`/instructor/quizzes/${quizId}`);
    return res.data;
  },

  async updateQuiz(
    quizId: number,
    data: Partial<InstructorQuiz>
  ): Promise<{ id: number; title: string; is_published: boolean; message: string }> {
    const res = await api.put(`/instructor/quizzes/${quizId}`, data);
    return res.data;
  },

  async deleteQuiz(quizId: number): Promise<{ message: string }> {
    const res = await api.delete(`/instructor/quizzes/${quizId}`);
    return res.data;
  },

  async publishQuiz(quizId: number): Promise<{ id: number; is_published: boolean; message: string }> {
    const res = await api.post(`/instructor/quizzes/${quizId}/publish`);
    return res.data;
  },

  async unpublishQuiz(quizId: number): Promise<{ id: number; is_published: boolean; message: string }> {
    const res = await api.post(`/instructor/quizzes/${quizId}/unpublish`);
    return res.data;
  },

  // 6. Challenge Management
  async listChallenges(): Promise<InstructorChallenge[]> {
    const res = await api.get<InstructorChallenge[]>('/instructor/challenges');
    return res.data;
  },

  async createChallenge(data: {
    title: string;
    slug?: string;
    difficulty: string;
    category: string;
    description: string;
    target_state_vector?: string;
    starter_qiskit_code?: string;
    starter_circuit_json?: string;
    test_cases_json?: string;
    points_reward?: number;
    is_published?: boolean;
  }): Promise<{ id: number; title: string; is_published: boolean; message: string }> {
    const res = await api.post('/instructor/challenges', data);
    return res.data;
  },

  async getChallenge(challengeId: number): Promise<InstructorChallenge> {
    const res = await api.get<InstructorChallenge>(`/instructor/challenges/${challengeId}`);
    return res.data;
  },

  async updateChallenge(
    challengeId: number,
    data: Partial<InstructorChallenge>
  ): Promise<{ id: number; title: string; is_published: boolean; message: string }> {
    const res = await api.put(`/instructor/challenges/${challengeId}`, data);
    return res.data;
  },

  async deleteChallenge(challengeId: number): Promise<{ message: string }> {
    const res = await api.delete(`/instructor/challenges/${challengeId}`);
    return res.data;
  },

  async publishChallenge(challengeId: number): Promise<{ id: number; is_published: boolean; message: string }> {
    const res = await api.post(`/instructor/challenges/${challengeId}/publish`);
    return res.data;
  },

  async unpublishChallenge(challengeId: number): Promise<{ id: number; is_published: boolean; message: string }> {
    const res = await api.post(`/instructor/challenges/${challengeId}/unpublish`);
    return res.data;
  },

  // 7. Student Management
  async listStudents(filter: string = 'all', search?: string): Promise<InstructorStudentItem[]> {
    const params: Record<string, string> = { filter };
    if (search && search.trim()) {
      params.search = search.trim();
    }
    const res = await api.get<InstructorStudentItem[]>('/instructor/students', { params });
    return res.data;
  },

  async getStudent(studentId: number): Promise<InstructorStudentDetail> {
    const res = await api.get<InstructorStudentDetail>(`/instructor/students/${studentId}`);
    return res.data;
  },

  // 8. Advanced Analytics & AI Insights
  async getAdvancedAnalytics(): Promise<AdvancedAnalyticsResponse> {
    const res = await api.get<AdvancedAnalyticsResponse>('/instructor/analytics/advanced');
    return res.data;
  },

  async getCourseInsights(courseId: number): Promise<CourseInsightsResponse> {
    const res = await api.get<CourseInsightsResponse>(`/instructor/courses/${courseId}/insights`);
    return res.data;
  },
};

export interface TopicMasteryDistributionItem {
  topic: string;
  novice_count: number;
  developing_count: number;
  proficient_count: number;
  mastered_count: number;
  avg_score: number;
  is_weak_topic: boolean;
}

export interface FunnelStep {
  step_name: string;
  count: number;
  percentage: number;
  drop_off_rate: number;
}

export interface AdvancedAnalyticsResponse {
  total_students: number;
  topic_mastery_distribution: TopicMasteryDistributionItem[];
  weak_topics: string[];
  completion_funnel: FunnelStep[];
  drop_off_insights: string[];
  quiz_difficulty_signals: { quiz_id: number; title: string; avg_score: number; pass_rate: number; difficulty_signal: string }[];
  challenge_difficulty_signals: { challenge_id: number; title: string; solve_rate: number; difficulty: string; signal: string }[];
}

export interface CourseInsightsResponse {
  course_id: number;
  course_title: string;
  total_enrolled: number;
  completion_rate: number;
  avg_quiz_score: number;
  challenge_success_rate: number;
  most_challenging_lesson?: string;
  most_successful_lesson?: string;
  drop_off_points: string[];
  ai_insights: string[];
  notice: string;
}

export default instructorService;
