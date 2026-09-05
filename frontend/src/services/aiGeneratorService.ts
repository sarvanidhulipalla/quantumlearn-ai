import { api } from './api';

export interface AICourseGenerateParams {
  topic: string;
  target_audience?: string;
  difficulty: string;
  num_modules: number;
  estimated_hours: number;
  learning_objectives?: string;
  prerequisites?: string;
  teaching_style?: string;
}

export interface AICourseLessonDraft {
  title: string;
  slug: string;
  lesson_type: string;
  order: number;
  duration_minutes: number;
  objectives: string[];
  content: string;
  suggested_circuit_gates?: string[];
  suggested_qiskit_code?: string;
  key_takeaways: string[];
}

export interface AICourseModuleDraft {
  title: string;
  description: string;
  order: number;
  lessons: AICourseLessonDraft[];
}

export interface AICourseDraftResponse {
  title: string;
  slug: string;
  short_description: string;
  description: string;
  level: string;
  estimated_hours: number;
  learning_objectives: string[];
  prerequisites: string[];
  modules: AICourseModuleDraft[];
  model_used: string;
  is_draft: boolean;
  notice: string;
}

export interface AIRegenerateLessonParams {
  course_title: string;
  module_title: string;
  lesson_title: string;
  lesson_order: number;
  difficulty: string;
  guidance?: string;
}

export interface AIQuizGenerateParams {
  course_id?: number;
  module_id?: number;
  lesson_id?: number;
  topic?: string;
  difficulty: string;
  num_questions: number;
  question_types?: string[];
  passing_score: number;
  time_limit_minutes: number;
}

export interface AIQuizQuestionOption {
  id: string;
  text: string;
}

export interface AIQuizQuestionDraft {
  prompt: string;
  question_type: string;
  options: AIQuizQuestionOption[];
  correct_answer: string;
  explanation: string;
  topic: string;
  difficulty: string;
  points: number;
  order: number;
}

export interface AIQuizDraftResponse {
  title: string;
  description: string;
  course_id?: number;
  lesson_id?: number;
  passing_score_percentage: number;
  time_limit_minutes: number;
  questions: AIQuizQuestionDraft[];
  model_used: string;
  is_draft: boolean;
  notice: string;
}

export interface AIRegenerateQuestionParams {
  topic: string;
  difficulty: string;
  question_type: string;
  guidance?: string;
  question_order: number;
}

export const aiGeneratorService = {
  async generateCourseDraft(params: AICourseGenerateParams): Promise<AICourseDraftResponse> {
    const response = await api.post('/ai/course-generation', params);
    return response.data;
  },

  async regenerateLesson(params: AIRegenerateLessonParams): Promise<AICourseLessonDraft> {
    const response = await api.post('/ai/course-generation/regenerate-lesson', params);
    return response.data;
  },

  async generateQuizDraft(params: AIQuizGenerateParams): Promise<AIQuizDraftResponse> {
    const response = await api.post('/ai/quiz-generation', params);
    return response.data;
  },

  async regenerateQuestion(params: AIRegenerateQuestionParams): Promise<AIQuizQuestionDraft> {
    const response = await api.post('/ai/quiz-generation/regenerate-question', params);
    return response.data;
  },
};
