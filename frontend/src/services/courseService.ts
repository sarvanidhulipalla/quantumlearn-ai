import api from './api';
import {
  CourseListItem,
  CourseDetailResponse,
  ModuleWithLessons,
  LessonDetailResponse,
  LessonCompleteResponse,
  StudentProgressStats,
} from '../types/course';

export const courseService = {
  async getCourses(): Promise<CourseListItem[]> {
    const response = await api.get<CourseListItem[]>('/courses');
    return response.data;
  },

  async getCourseById(courseId: number | string): Promise<CourseDetailResponse> {
    const response = await api.get<CourseDetailResponse>(`/courses/${courseId}`);
    return response.data;
  },

  async getCourseModules(courseId: number | string): Promise<ModuleWithLessons[]> {
    const response = await api.get<ModuleWithLessons[]>(`/courses/${courseId}/modules`);
    return response.data;
  },

  async getLessonById(lessonId: number | string): Promise<LessonDetailResponse> {
    const response = await api.get<LessonDetailResponse>(`/lessons/${lessonId}`);
    return response.data;
  },

  async completeLesson(lessonId: number | string): Promise<LessonCompleteResponse> {
    const response = await api.post<LessonCompleteResponse>(`/lessons/${lessonId}/complete`);
    return response.data;
  },

  async getStudentProgress(): Promise<StudentProgressStats> {
    const response = await api.get<StudentProgressStats>('/student/progress');
    return response.data;
  },

  async getMyLearning(): Promise<CourseListItem[]> {
    const response = await api.get<CourseListItem[]>('/student/my-learning');
    return response.data;
  },
};

export default courseService;
