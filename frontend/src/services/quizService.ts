import api from './api';

export interface QuestionPublic {
  id: number;
  prompt: string;
  question_type: string;
  options: Array<{ id: string; text: string }>;
  points: number;
  order: number;
}

export interface QuizSummary {
  id: number;
  title: string;
  description?: string;
  course_id?: number;
  lesson_id?: number;
  passing_score_percentage: number;
  time_limit_minutes: number;
  question_count: number;
  attempt_count: number;
  best_score: number;
  is_passed: boolean;
}

export interface QuizDetail {
  id: number;
  title: string;
  description?: string;
  course_id?: number;
  lesson_id?: number;
  passing_score_percentage: number;
  time_limit_minutes: number;
  questions: QuestionPublic[];
}

export interface QuestionGraded {
  question_id: number;
  prompt: string;
  question_type: string;
  options: Array<{ id: string; text: string }>;
  student_answer: string;
  correct_answer: string;
  is_correct: boolean;
  points_earned: number;
  points_possible: number;
  explanation: string;
}

export interface QuizSubmitResult {
  attempt_id: number;
  quiz_id: number;
  quiz_title: string;
  score_percentage: number;
  earned_points: number;
  total_possible_points: number;
  correct_count: number;
  total_questions: number;
  passed: boolean;
  passing_score_percentage: number;
  xp_earned: number;
  breakdown: QuestionGraded[];
  completed_at: string;
}

export interface QuizAttemptItem {
  id: number;
  quiz_id: number;
  score_percentage: number;
  passed: boolean;
  completed_at: string;
}

export const quizService = {
  /**
   * Retrieves all quantum quizzes with student progress.
   */
  async getQuizzes(): Promise<QuizSummary[]> {
    const response = await api.get<QuizSummary[]>('/quizzes');
    return response.data;
  },

  /**
   * Retrieves quiz questions for taking a quiz.
   */
  async getQuizById(quizId: number | string): Promise<QuizDetail> {
    const response = await api.get<QuizDetail>(`/quizzes/${quizId}`);
    return response.data;
  },

  /**
   * Submits answers for authoritative backend grading.
   */
  async submitQuiz(quizId: number | string, answers: Record<string, string>): Promise<QuizSubmitResult> {
    const response = await api.post<QuizSubmitResult>(`/quizzes/${quizId}/submit`, {
      answers,
    });
    return response.data;
  },

  /**
   * Retrieves previous attempts for a quiz.
   */
  async getQuizAttempts(quizId: number | string): Promise<QuizAttemptItem[]> {
    const response = await api.get<QuizAttemptItem[]>(`/quizzes/${quizId}/attempts`);
    return response.data;
  },
};

export default quizService;
