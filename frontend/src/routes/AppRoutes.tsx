import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// Layouts
import PublicLayout from '../layouts/PublicLayout';
import StudentLayout from '../layouts/StudentLayout';
import InstructorLayout from '../layouts/InstructorLayout';
import ProtectedRoute from './ProtectedRoute';

// Public Pages
import LandingPage from '../pages/LandingPage';
import LoginPage from '../pages/LoginPage';
import RegisterPage from '../pages/RegisterPage';
import NotFoundPage from '../pages/NotFoundPage';

// Student Pages
import StudentDashboard from '../pages/student/StudentDashboard';
import StudentCourses from '../pages/student/StudentCourses';
import StudentCourseDetail from '../pages/student/StudentCourseDetail';
import StudentLessonView from '../pages/student/StudentLessonView';
import StudentPlayground from '../pages/student/StudentPlayground';
import StudentQiskitLab from '../pages/student/StudentQiskitLab';
import StudentAITutor from '../pages/student/StudentAITutor';
import StudentQuizzes from '../pages/student/StudentQuizzes';
import StudentQuizAttempt from '../pages/student/StudentQuizAttempt';
import StudentChallenges from '../pages/student/StudentChallenges';
import StudentChallengeSolver from '../pages/student/StudentChallengeSolver';
import StudentProgress from '../pages/student/StudentProgress';
import StudentAchievements from '../pages/student/StudentAchievements';
import StudentProfile from '../pages/student/StudentProfile';

// Instructor Pages
import InstructorDashboard from '../pages/instructor/InstructorDashboard';
import InstructorCourses from '../pages/instructor/InstructorCourses';
import InstructorCreateCourse from '../pages/instructor/InstructorCreateCourse';
import InstructorLessons from '../pages/instructor/InstructorLessons';
import InstructorQuizzes from '../pages/instructor/InstructorQuizzes';
import InstructorChallenges from '../pages/instructor/InstructorChallenges';
import InstructorStudents from '../pages/instructor/InstructorStudents';
import InstructorAnalytics from '../pages/instructor/InstructorAnalytics';

export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* 1. Public Routes */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
      </Route>

      {/* 2. Student Routes (Role-Protected) */}
      <Route
        path="/student"
        element={
          <ProtectedRoute allowedRoles={['Student', 'Admin']}>
            <StudentLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/student/dashboard" replace />} />
        <Route path="dashboard" element={<StudentDashboard />} />
        <Route path="courses" element={<StudentCourses />} />
        <Route path="courses/:courseId" element={<StudentCourseDetail />} />
        <Route path="lessons/:lessonId" element={<StudentLessonView />} />
        <Route path="playground" element={<StudentPlayground />} />
        <Route path="qiskit-lab" element={<StudentQiskitLab />} />
        <Route path="ai-tutor" element={<StudentAITutor />} />
        <Route path="quizzes" element={<StudentQuizzes />} />
        <Route path="quizzes/:quizId" element={<StudentQuizAttempt />} />
        <Route path="challenges" element={<StudentChallenges />} />
        <Route path="challenges/:challengeId" element={<StudentChallengeSolver />} />
        <Route path="progress" element={<StudentProgress />} />
        <Route path="achievements" element={<StudentAchievements />} />
        <Route path="profile" element={<StudentProfile />} />
      </Route>

      {/* 3. Instructor Routes (Role-Protected) */}
      <Route
        path="/instructor"
        element={
          <ProtectedRoute allowedRoles={['Instructor', 'Admin']}>
            <InstructorLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/instructor/dashboard" replace />} />
        <Route path="dashboard" element={<InstructorDashboard />} />
        <Route path="courses" element={<InstructorCourses />} />
        <Route path="courses/create" element={<InstructorCreateCourse />} />
        <Route path="lessons" element={<InstructorLessons />} />
        <Route path="quizzes" element={<InstructorQuizzes />} />
        <Route path="challenges" element={<InstructorChallenges />} />
        <Route path="students" element={<InstructorStudents />} />
        <Route path="analytics" element={<InstructorAnalytics />} />
      </Route>

      {/* 4. Top-level Redirect Aliases */}
      <Route path="/courses/:courseId" element={<Navigate to="/student/courses/:courseId" replace />} />
      <Route path="/lessons/:lessonId" element={<Navigate to="/student/lessons/:lessonId" replace />} />

      {/* 5. 404 Catch-All */}
      <Route element={<PublicLayout />}>
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
};

export default AppRoutes;
