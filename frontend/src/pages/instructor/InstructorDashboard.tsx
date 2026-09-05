import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Users,
  UserCheck,
  BookOpen,
  Award,
  CheckCircle2,
  Trophy,
  ArrowRight,
  TrendingUp,
  AlertCircle,
  Clock,
  Plus,
  BarChart2,
  ExternalLink,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import PageContainer from '../../components/common/PageContainer';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import LoadingState from '../../components/common/LoadingState';
import ErrorState from '../../components/common/ErrorState';
import ProgressBar from '../../components/common/ProgressBar';

import instructorService, { InstructorDashboardData } from '../../services/instructorService';
import { useAuth } from '../../contexts/AuthContext';

export const InstructorDashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [data, setData] = useState<InstructorDashboardData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboard = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const res = await instructorService.getDashboard();
      setData(res);
    } catch (err: any) {
      console.error('Failed to load instructor dashboard:', err);
      setError(err.response?.data?.detail || 'Unable to load instructor dashboard metrics.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  if (isLoading) {
    return (
      <PageContainer title="Instructor Dashboard" subtitle="Loading metrics...">
        <LoadingState message="Aggregating curriculum analytics and student performance..." />
      </PageContainer>
    );
  }

  if (error || !data) {
    return (
      <PageContainer title="Instructor Dashboard" subtitle="Monitor learning activity">
        <ErrorState message={error || 'Failed to load dashboard.'} onRetry={fetchDashboard} />
      </PageContainer>
    );
  }

  const { metrics, course_performance, top_students, students_needing_attention } = data;

  const metricCards = [
    {
      title: 'Total Students',
      value: metrics.total_students,
      icon: Users,
      color: 'from-blue-500/20 to-cyan-500/20 text-cyan-400 border-cyan-500/30',
      subtitle: 'Enrolled across all courses',
    },
    {
      title: 'Active Students',
      value: metrics.active_students,
      icon: UserCheck,
      color: 'from-emerald-500/20 to-teal-500/20 text-emerald-400 border-emerald-500/30',
      subtitle: 'Active this week',
    },
    {
      title: 'Published Courses',
      value: metrics.published_courses,
      icon: BookOpen,
      color: 'from-purple-500/20 to-indigo-500/20 text-purple-400 border-purple-500/30',
      subtitle: 'Live in catalog',
    },
    {
      title: 'Average Quiz Score',
      value: `${metrics.avg_quiz_score}%`,
      icon: Award,
      color: 'from-amber-500/20 to-orange-500/20 text-amber-400 border-amber-500/30',
      subtitle: 'Passing threshold: 70%',
    },
    {
      title: 'Course Completion Rate',
      value: `${metrics.course_completion_rate}%`,
      icon: CheckCircle2,
      color: 'from-indigo-500/20 to-blue-500/20 text-indigo-400 border-indigo-500/30',
      subtitle: 'Across all cohorts',
    },
    {
      title: 'Challenges Completed',
      value: metrics.challenges_completed,
      icon: Trophy,
      color: 'from-pink-500/20 to-rose-500/20 text-pink-400 border-pink-500/30',
      subtitle: 'Quantum state benchmarks',
    },
  ];

  return (
    <PageContainer
      title="Instructor Dashboard"
      subtitle="Monitor learning activity and manage your quantum curriculum."
      actions={
        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/instructor/analytics')}
            leftIcon={<BarChart2 className="w-4 h-4 text-purple-400" />}
          >
            Full Analytics
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={() => navigate('/instructor/courses/create')}
            leftIcon={<Plus className="w-4 h-4" />}
          >
            Create Course
          </Button>
        </div>
      }
    >
      <div className="space-y-8">
        {/* ============================================================ */}
        {/* 1. KEY METRICS CARDS */}
        {/* ============================================================ */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          {metricCards.map((card, idx) => {
            const Icon = card.icon;
            return (
              <div
                key={idx}
                className={`p-4 rounded-2xl bg-gradient-to-br ${card.color} border backdrop-blur-xl relative overflow-hidden transition-all duration-300 hover:scale-[1.02] shadow-lg`}
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-semibold text-slate-300 truncate">{card.title}</span>
                  <div className="p-2 rounded-xl bg-slate-900/60 border border-white/10">
                    <Icon className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-2xl font-bold text-white tracking-tight">{card.value}</div>
                <div className="text-[11px] text-slate-400 mt-1 truncate">{card.subtitle}</div>
              </div>
            );
          })}
        </div>

        {/* ============================================================ */}
        {/* 2. COURSE PERFORMANCE & COMPLETION CHART */}
        {/* ============================================================ */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Course Performance Table */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-purple-400" />
                  <span>Course Performance</span>
                </h2>
                <p className="text-xs text-slate-400">Enrollment numbers, completion rates, and average quiz scores.</p>
              </div>
              <Link
                to="/instructor/courses"
                className="text-xs font-semibold text-purple-400 hover:text-purple-300 flex items-center gap-1"
              >
                Manage Courses <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="glass-panel rounded-2xl border-slate-800 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-slate-300">
                  <thead className="bg-slate-900/80 text-xs uppercase text-slate-400 border-b border-white/10">
                    <tr>
                      <th className="py-3.5 px-4 font-semibold">Course</th>
                      <th className="py-3.5 px-4 font-semibold text-center">Students</th>
                      <th className="py-3.5 px-4 font-semibold">Completion</th>
                      <th className="py-3.5 px-4 font-semibold text-center">Avg Score</th>
                      <th className="py-3.5 px-4 font-semibold text-center">Status</th>
                      <th className="py-3.5 px-4 font-semibold text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {course_performance.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-8 text-center text-slate-500 text-xs">
                          No courses created yet. Click "Create Course" to get started.
                        </td>
                      </tr>
                    ) : (
                      course_performance.map((c) => (
                        <tr key={c.course_id} className="hover:bg-slate-800/40 transition-colors">
                          <td className="py-3 px-4 font-medium text-white max-w-[220px] truncate">
                            {c.title}
                          </td>
                          <td className="py-3 px-4 text-center font-mono text-slate-300">
                            {c.students_count}
                          </td>
                          <td className="py-3 px-4 w-40">
                            <div className="space-y-1">
                              <div className="flex justify-between text-xs font-mono">
                                <span>{c.completion_rate}%</span>
                              </div>
                              <ProgressBar value={c.completion_rate} variant="purple" size="sm" />
                            </div>
                          </td>
                          <td className="py-3 px-4 text-center font-mono font-semibold text-cyan-400">
                            {c.avg_score}%
                          </td>
                          <td className="py-3 px-4 text-center">
                            <Badge
                              variant={c.status === 'Published' ? 'emerald' : 'amber'}
                              size="xs"
                            >
                              {c.status}
                            </Badge>
                          </td>
                          <td className="py-3 px-4 text-right">
                            <Button
                              variant="ghost"
                              size="xs"
                              onClick={() => navigate(`/instructor/courses`)}
                            >
                              Edit
                            </Button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Quick Chart Visualization */}
          <div className="space-y-4">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-cyan-400" />
                <span>Completion Comparison</span>
              </h2>
              <p className="text-xs text-slate-400">Course completion breakdown (%)</p>
            </div>

            <Card variant="glass" padding="md" className="space-y-4">
              {course_performance.length > 0 ? (
                <div className="space-y-3.5 pt-1">
                  {course_performance.map((c) => (
                    <div key={c.course_id} className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-medium text-slate-200 truncate max-w-[180px]">
                          {c.title}
                        </span>
                        <span className="font-mono font-bold text-purple-400">
                          {c.completion_rate}%
                        </span>
                      </div>
                      <div className="w-full bg-slate-800/80 rounded-full h-2 overflow-hidden border border-slate-700/50">
                        <div
                          className="h-full bg-gradient-to-r from-purple-500 to-cyan-400 rounded-full transition-all duration-500"
                          style={{ width: `${Math.min(c.completion_rate, 100)}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center text-slate-500 text-xs py-8">No completion data yet.</div>
              )}
            </Card>
          </div>
        </div>

        {/* ============================================================ */}
        {/* 3. STUDENT PERFORMANCE SECTIONS */}
        {/* ============================================================ */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top Performing Students */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Trophy className="w-5 h-5 text-amber-400" />
                <span>Top Performing Students</span>
              </h2>
              <Link
                to="/instructor/students"
                className="text-xs font-semibold text-purple-400 hover:text-purple-300 flex items-center gap-1"
              >
                All Students <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="glass-panel rounded-2xl border-slate-800 p-4 space-y-3">
              {top_students.length === 0 ? (
                <div className="py-6 text-center text-slate-500 text-xs">
                  No top performers identified yet.
                </div>
              ) : (
                top_students.map((st) => (
                  <div
                    key={st.student_id}
                    className="p-3 rounded-xl bg-slate-900/50 border border-white/5 flex items-center justify-between hover:border-purple-500/30 transition-colors cursor-pointer"
                    onClick={() => navigate('/instructor/students')}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-amber-500/20 to-purple-600/30 border border-amber-500/30 flex items-center justify-center text-amber-300 font-bold text-xs">
                        {st.name.charAt(0)}
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-white">{st.name}</div>
                        <div className="text-[11px] text-slate-400">{st.course_title}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-mono font-bold text-emerald-400">
                        {st.avg_score}% Avg
                      </div>
                      <div className="text-[11px] text-slate-400 font-mono">
                        {st.progress}% Progress
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Students Needing Attention */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-rose-400" />
                <span>Students Needing Attention</span>
              </h2>
              <Link
                to="/instructor/students?filter=needs_attention"
                className="text-xs font-semibold text-rose-400 hover:text-rose-300 flex items-center gap-1"
              >
                Inspect Cohort <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="glass-panel rounded-2xl border-slate-800 p-4 space-y-3">
              {students_needing_attention.length === 0 ? (
                <div className="py-6 text-center text-slate-400 text-xs flex flex-col items-center gap-1">
                  <CheckCircle2 className="w-6 h-6 text-emerald-400 mb-1" />
                  <span>All active students are performing above threshold (&gt;70%).</span>
                </div>
              ) : (
                students_needing_attention.map((st) => (
                  <div
                    key={st.student_id}
                    className="p-3 rounded-xl bg-rose-950/20 border border-rose-500/20 flex items-center justify-between hover:border-rose-500/40 transition-colors cursor-pointer"
                    onClick={() => navigate('/instructor/students')}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-rose-500/20 border border-rose-500/30 flex items-center justify-center text-rose-300 font-bold text-xs">
                        {st.name.charAt(0)}
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-white">{st.name}</div>
                        <div className="text-[11px] text-slate-400">{st.course_title}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge variant="rose" size="xs">
                        {st.avg_score}% Avg
                      </Badge>
                      <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                        {st.progress}% Completed
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* ============================================================ */}
        {/* 4. MANAGEMENT HUB SHORTCUTS */}
        {/* ============================================================ */}
        <div className="space-y-4 pt-4 border-t border-white/5">
          <h2 className="text-lg font-bold text-white">Quantum Curriculum Hub</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link
              to="/instructor/courses"
              className="p-4 rounded-2xl glass-panel border-slate-800 hover:border-purple-500/40 transition-all group flex flex-col justify-between"
            >
              <div>
                <div className="w-10 h-10 rounded-xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-purple-400 mb-3 group-hover:scale-110 transition-transform">
                  <BookOpen className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-white text-sm">Course Management</h3>
                <p className="text-xs text-slate-400 mt-1">
                  Manage syllabus, publish new curricula, and organize modules.
                </p>
              </div>
              <div className="mt-4 flex items-center gap-1 text-xs font-semibold text-purple-400 group-hover:translate-x-1 transition-transform">
                <span>View Courses</span> <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </Link>

            <Link
              to="/instructor/lessons"
              className="p-4 rounded-2xl glass-panel border-slate-800 hover:border-purple-500/40 transition-all group flex flex-col justify-between"
            >
              <div>
                <div className="w-10 h-10 rounded-xl bg-blue-500/20 border border-blue-500/30 flex items-center justify-center text-blue-400 mb-3 group-hover:scale-110 transition-transform">
                  <Sparkles className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-white text-sm">Lesson Editor</h3>
                <p className="text-xs text-slate-400 mt-1">
                  Craft interactive quantum theory notes and circuit laboratory setups.
                </p>
              </div>
              <div className="mt-4 flex items-center gap-1 text-xs font-semibold text-blue-400 group-hover:translate-x-1 transition-transform">
                <span>Manage Lessons</span> <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </Link>

            <Link
              to="/instructor/quizzes"
              className="p-4 rounded-2xl glass-panel border-slate-800 hover:border-purple-500/40 transition-all group flex flex-col justify-between"
            >
              <div>
                <div className="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400 mb-3 group-hover:scale-110 transition-transform">
                  <Award className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-white text-sm">Quiz Builder</h3>
                <p className="text-xs text-slate-400 mt-1">
                  Design multiple choice, conceptual, and circuit prediction questions.
                </p>
              </div>
              <div className="mt-4 flex items-center gap-1 text-xs font-semibold text-cyan-400 group-hover:translate-x-1 transition-transform">
                <span>Build Quizzes</span> <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </Link>

            <Link
              to="/instructor/challenges"
              className="p-4 rounded-2xl glass-panel border-slate-800 hover:border-purple-500/40 transition-all group flex flex-col justify-between"
            >
              <div>
                <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 mb-3 group-hover:scale-110 transition-transform">
                  <Trophy className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-white text-sm">Challenge Lab</h3>
                <p className="text-xs text-slate-400 mt-1">
                  Set target state vectors and verify student circuits with Qiskit Aer.
                </p>
              </div>
              <div className="mt-4 flex items-center gap-1 text-xs font-semibold text-amber-400 group-hover:translate-x-1 transition-transform">
                <span>Configure Challenges</span> <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </Link>
          </div>
        </div>
      </div>
    </PageContainer>
  );
};

export default InstructorDashboard;
