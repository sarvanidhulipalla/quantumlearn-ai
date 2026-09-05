import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  TrendingUp,
  Award,
  Trophy,
  Users,
  CheckCircle2,
  Clock,
  Activity,
  Calendar,
  Layers,
  Sparkles,
  AlertTriangle,
  Lightbulb,
  ArrowRight,
  Filter,
} from 'lucide-react';

import PageContainer from '../../components/common/PageContainer';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import LoadingState from '../../components/common/LoadingState';
import ErrorState from '../../components/common/ErrorState';
import ProgressBar from '../../components/common/ProgressBar';

import instructorService, {
  InstructorAnalyticsData,
  AdvancedAnalyticsResponse,
  CourseInsightsResponse,
  InstructorCourse,
} from '../../services/instructorService';

export const InstructorAnalytics: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'mastery' | 'insights'>('overview');

  const [analytics, setAnalytics] = useState<InstructorAnalyticsData | null>(null);
  const [advancedAnalytics, setAdvancedAnalytics] = useState<AdvancedAnalyticsResponse | null>(null);
  const [courses, setCourses] = useState<InstructorCourse[]>([]);
  const [selectedCourseId, setSelectedCourseId] = useState<number | null>(null);
  const [courseInsights, setCourseInsights] = useState<CourseInsightsResponse | null>(null);

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isInsightsLoading, setIsInsightsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAnalytics = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const [res, advRes, courseList] = await Promise.all([
        instructorService.getAnalytics(),
        instructorService.getAdvancedAnalytics(),
        instructorService.listCourses(),
      ]);
      setAnalytics(res);
      setAdvancedAnalytics(advRes);
      setCourses(courseList);
      if (courseList.length > 0) {
        setSelectedCourseId(courseList[0].id);
        fetchCourseInsights(courseList[0].id);
      }
    } catch (err: any) {
      console.error('Failed to load instructor analytics:', err);
      setError(err.response?.data?.detail || 'Failed to load analytics trends.');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCourseInsights = async (cId: number) => {
    try {
      setIsInsightsLoading(true);
      const res = await instructorService.getCourseInsights(cId);
      setCourseInsights(res);
    } catch (err: any) {
      console.error('Failed to load course insights:', err);
    } finally {
      setIsInsightsLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const handleCourseChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const cId = parseInt(e.target.value, 10);
    setSelectedCourseId(cId);
    fetchCourseInsights(cId);
  };

  if (isLoading) {
    return (
      <PageContainer title="Learning Analytics" subtitle="Loading metrics...">
        <LoadingState message="Aggregating curriculum analytics and score distributions..." />
      </PageContainer>
    );
  }

  if (error || !analytics) {
    return (
      <PageContainer title="Learning Analytics" subtitle="Curriculum metrics">
        <ErrorState message={error || 'Failed to load analytics.'} onRetry={fetchAnalytics} />
      </PageContainer>
    );
  }

  const {
    metrics,
    course_completion_trends,
    quiz_score_distribution,
    challenge_completion_stats,
    student_engagement_activity,
  } = analytics;

  const totalQuizAttempts = quiz_score_distribution.reduce((acc, curr) => acc + curr.count, 0) || 1;

  return (
    <PageContainer
      title="Curriculum & Learning Analytics"
      subtitle="Analyze cohort progression, topic mastery distributions, drop-off signals, and AI pedagogical insights."
      actions={
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-900 border border-slate-800">
          <Button
            variant={activeTab === 'overview' ? 'primary' : 'ghost'}
            size="sm"
            onClick={() => setActiveTab('overview')}
          >
            Cohort Overview
          </Button>
          <Button
            variant={activeTab === 'mastery' ? 'primary' : 'ghost'}
            size="sm"
            onClick={() => setActiveTab('mastery')}
            leftIcon={<Layers className="w-3.5 h-3.5 text-cyan-400" />}
          >
            Topic Mastery & Funnel
          </Button>
          <Button
            variant={activeTab === 'insights' ? 'primary' : 'ghost'}
            size="sm"
            onClick={() => setActiveTab('insights')}
            leftIcon={<Sparkles className="w-3.5 h-3.5 text-purple-400" />}
          >
            AI Course Insights
          </Button>
        </div>
      }
    >
      <div className="space-y-8">
        {/* Top Key Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-1">
            <span className="text-xs text-slate-400">Total Enrolled</span>
            <div className="text-xl font-bold text-white font-mono">{metrics.total_students}</div>
          </div>
          <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-1">
            <span className="text-xs text-slate-400">Active Students</span>
            <div className="text-xl font-bold text-emerald-400 font-mono">{metrics.active_students}</div>
          </div>
          <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-1">
            <span className="text-xs text-slate-400">Published Courses</span>
            <div className="text-xl font-bold text-purple-400 font-mono">{metrics.published_courses}</div>
          </div>
          <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-1">
            <span className="text-xs text-slate-400">Average Quiz Score</span>
            <div className="text-xl font-bold text-amber-400 font-mono">{metrics.avg_quiz_score}%</div>
          </div>
          <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-1">
            <span className="text-xs text-slate-400">Completion Rate</span>
            <div className="text-xl font-bold text-cyan-400 font-mono">{metrics.course_completion_rate}%</div>
          </div>
          <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-1">
            <span className="text-xs text-slate-400">Challenges Solved</span>
            <div className="text-xl font-bold text-pink-400 font-mono">{metrics.challenges_completed}</div>
          </div>
        </div>

        {/* TAB 1: OVERVIEW */}
        {activeTab === 'overview' && (
          <div className="space-y-8 animate-in fade-in duration-200">
            {/* Charts Row 1: Course Completion & Quiz Score Distribution */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Chart 1: Course Completion Breakdown */}
              <Card variant="glass" padding="lg" className="space-y-4">
                <div className="flex items-center justify-between border-b border-white/5 pb-3">
                  <div>
                    <h3 className="font-bold text-white text-base flex items-center gap-2">
                      <TrendingUp className="w-5 h-5 text-purple-400" />
                      <span>Course Completion Breakdown</span>
                    </h3>
                    <p className="text-xs text-slate-400">Average student completion percentage per course.</p>
                  </div>
                </div>

                <div className="space-y-4 pt-2">
                  {course_completion_trends.length === 0 ? (
                    <div className="py-12 text-center text-slate-500 text-xs">No course trends available.</div>
                  ) : (
                    course_completion_trends.map((c, idx) => (
                      <div key={idx} className="space-y-1.5">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-medium text-slate-200">{c.name}</span>
                          <div className="flex items-center gap-3">
                            <span className="text-slate-400 font-mono">{c.students} students</span>
                            <span className="font-bold font-mono text-purple-400">{c.completionRate}%</span>
                          </div>
                        </div>
                        <div className="w-full bg-slate-800/80 rounded-full h-2.5 overflow-hidden border border-slate-700/50">
                          <div
                            className="h-full bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full transition-all duration-500"
                            style={{ width: `${Math.min(c.completionRate, 100)}%` }}
                          />
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </Card>

              {/* Chart 2: Quiz Score Distribution */}
              <Card variant="glass" padding="lg" className="space-y-4">
                <div className="flex items-center justify-between border-b border-white/5 pb-3">
                  <div>
                    <h3 className="font-bold text-white text-base flex items-center gap-2">
                      <Award className="w-5 h-5 text-amber-400" />
                      <span>Quiz Score Distribution</span>
                    </h3>
                    <p className="text-xs text-slate-400">Assessment mastery across all cohorts.</p>
                  </div>
                </div>

                <div className="grid grid-cols-4 gap-3 pt-4 h-[200px] items-end">
                  {quiz_score_distribution.map((bucket, idx) => {
                    const heightPct = Math.max(12, Math.round((bucket.count / totalQuizAttempts) * 100));
                    const colors = [
                      'from-emerald-500 to-teal-600 border-emerald-400/40 text-emerald-300',
                      'from-blue-500 to-cyan-600 border-blue-400/40 text-blue-300',
                      'from-amber-500 to-orange-600 border-amber-400/40 text-amber-300',
                      'from-rose-500 to-pink-600 border-rose-400/40 text-rose-300',
                    ];

                    return (
                      <div key={idx} className="flex flex-col items-center gap-2 h-full justify-end">
                        <span className="text-xs font-mono font-bold text-white">{bucket.count}</span>
                        <div
                          className={`w-full rounded-xl bg-gradient-to-t ${colors[idx % colors.length]} border transition-all duration-500 flex items-center justify-center`}
                          style={{ height: `${heightPct}%` }}
                        />
                        <span className="text-[11px] font-mono text-slate-400 text-center">{bucket.range}</span>
                      </div>
                    );
                  })}
                </div>
              </Card>
            </div>

            {/* Charts Row 2: Challenge Success Rate & Recent Activity Feed */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Chart 3: Challenge Success Rate */}
              <Card variant="glass" padding="lg" className="space-y-4">
                <div className="flex items-center justify-between border-b border-white/5 pb-3">
                  <div>
                    <h3 className="font-bold text-white text-base flex items-center gap-2">
                      <Trophy className="w-5 h-5 text-pink-400" />
                      <span>Quantum Challenge Success Rates</span>
                    </h3>
                    <p className="text-xs text-slate-400">Percentage of attempted circuits evaluated as solved.</p>
                  </div>
                </div>

                <div className="space-y-3.5 pt-2">
                  {challenge_completion_stats.length === 0 ? (
                    <div className="py-12 text-center text-slate-500 text-xs">No challenge data available.</div>
                  ) : (
                    challenge_completion_stats.map((ch, idx) => (
                      <div key={idx} className="space-y-1.5">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-medium text-slate-200">{ch.challenge}</span>
                          <div className="flex items-center gap-3">
                            <span className="text-slate-400 font-mono">{ch.attempts} attempts</span>
                            <span className="font-bold font-mono text-pink-400">{ch.solvedRate}%</span>
                          </div>
                        </div>
                        <div className="w-full bg-slate-800/80 rounded-full h-2.5 overflow-hidden border border-slate-700/50">
                          <div
                            className="h-full bg-gradient-to-r from-pink-500 to-rose-500 rounded-full transition-all duration-500"
                            style={{ width: `${Math.min(ch.solvedRate, 100)}%` }}
                          />
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </Card>

              {/* Activity Feed */}
              <Card variant="glass" padding="lg" className="space-y-4">
                <div className="flex items-center justify-between border-b border-white/5 pb-3">
                  <div>
                    <h3 className="font-bold text-white text-base flex items-center gap-2">
                      <Activity className="w-5 h-5 text-cyan-400" />
                      <span>Recent Cohort Activity Feed</span>
                    </h3>
                    <p className="text-xs text-slate-400">Live stream of student milestones and completed lessons.</p>
                  </div>
                </div>

                <div className="space-y-2.5 max-h-[280px] overflow-y-auto pr-2">
                  {student_engagement_activity.length === 0 ? (
                    <div className="py-8 text-center text-slate-500 text-xs">No recent activity.</div>
                  ) : (
                    student_engagement_activity.map((item, idx) => (
                      <div
                        key={idx}
                        className="p-3 rounded-xl bg-slate-900/50 border border-white/5 flex items-center justify-between text-xs"
                      >
                        <div className="flex items-center gap-2.5">
                          <div className="w-2 h-2 rounded-full bg-cyan-400" />
                          <div>
                            <span className="font-semibold text-white mr-1.5">{item.studentName}</span>
                            <span className="text-slate-300">{item.action}</span>
                          </div>
                        </div>
                        <span className="text-[10px] text-slate-500 font-mono">
                          {new Date(item.timestamp).toLocaleDateString()}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </Card>
            </div>
          </div>
        )}

        {/* TAB 2: TOPIC MASTERY & COMPLETION FUNNEL */}
        {activeTab === 'mastery' && advancedAnalytics && (
          <div className="space-y-8 animate-in fade-in duration-200">
            {/* Weak Topics Banner */}
            {advancedAnalytics.weak_topics.length > 0 && (
              <div className="p-4 rounded-2xl bg-amber-950/30 border border-amber-500/30 flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold text-amber-200 uppercase tracking-wider">
                    Curriculum Attention Signal
                  </h4>
                  <p className="text-xs text-amber-300/90 mt-0.5">
                    Cohort average mastery is below 60% in:{' '}
                    <strong>{advancedAnalytics.weak_topics.join(', ')}</strong>. Consider adding targeted interactive
                    simulations or concept review sessions.
                  </p>
                </div>
              </div>
            )}

            {/* 9 Topics Mastery Grid */}
            <Card variant="glass" padding="lg" className="space-y-4">
              <div className="border-b border-white/5 pb-3 flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-white text-base flex items-center gap-2">
                    <Layers className="w-5 h-5 text-cyan-400" />
                    <span>Cohort Topic Mastery Distribution (9 Domains)</span>
                  </h3>
                  <p className="text-xs text-slate-400">
                    Aggregated proficiency tiers across all active student records.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                {advancedAnalytics.topic_mastery_distribution.map((tm, idx) => (
                  <div
                    key={idx}
                    className={`p-4 rounded-xl border ${
                      tm.is_weak_topic
                        ? 'bg-amber-950/20 border-amber-500/30'
                        : 'bg-slate-900/60 border-slate-800'
                    } space-y-3`}
                  >
                    <div className="flex items-start justify-between">
                      <span className="font-semibold text-xs text-white">{tm.topic}</span>
                      <Badge variant={tm.is_weak_topic ? 'rose' : tm.avg_score >= 70 ? 'cyan' : 'amber'} size="xs">
                        Avg {tm.avg_score}%
                      </Badge>
                    </div>

                    <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          tm.avg_score >= 70
                            ? 'bg-gradient-to-r from-cyan-500 to-blue-500'
                            : tm.avg_score >= 50
                            ? 'bg-gradient-to-r from-amber-500 to-yellow-500'
                            : 'bg-gradient-to-r from-rose-500 to-pink-500'
                        }`}
                        style={{ width: `${tm.avg_score}%` }}
                      />
                    </div>

                    <div className="grid grid-cols-4 gap-1 text-[10px] text-center pt-1 border-t border-white/5">
                      <div>
                        <span className="text-slate-500 block">Novice</span>
                        <span className="font-bold text-slate-300">{tm.novice_count}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block">Dev</span>
                        <span className="font-bold text-amber-400">{tm.developing_count}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block">Prof</span>
                        <span className="font-bold text-blue-400">{tm.proficient_count}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block">Master</span>
                        <span className="font-bold text-emerald-400">{tm.mastered_count}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Completion Funnel Analysis */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card variant="glass" padding="lg" className="lg:col-span-2 space-y-4">
                <div className="border-b border-white/5 pb-3">
                  <h3 className="font-bold text-white text-base flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-purple-400" />
                    <span>Learning Funnel & Drop-Off Analysis</span>
                  </h3>
                  <p className="text-xs text-slate-400">Step-by-step conversion and drop-off rate cards.</p>
                </div>

                <div className="space-y-3 pt-2">
                  {advancedAnalytics.completion_funnel.map((step, idx) => (
                    <div key={idx} className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-white">
                          {idx + 1}. {step.step_name}
                        </span>
                        <div className="flex items-center gap-3">
                          <span className="text-slate-400 font-mono">{step.count} events</span>
                          <span className="font-bold font-mono text-purple-400">{step.percentage}%</span>
                          {idx > 0 && (
                            <span className="text-[11px] font-mono text-rose-400 bg-rose-950/40 px-2 py-0.5 rounded-md border border-rose-500/30">
                              -{step.drop_off_rate}% drop
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full"
                          style={{ width: `${step.percentage}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </Card>

              {/* Drop-off Insights */}
              <Card variant="glass" padding="lg" className="space-y-4">
                <div className="border-b border-white/5 pb-3">
                  <h3 className="font-bold text-white text-base flex items-center gap-2">
                    <Lightbulb className="w-5 h-5 text-amber-400" />
                    <span>Pedagogical Insights</span>
                  </h3>
                  <p className="text-xs text-slate-400">Actionable recommendations based on drop-off data.</p>
                </div>

                <div className="space-y-3 pt-1">
                  {advancedAnalytics.drop_off_insights.map((ins, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-xl bg-[#090d16] border border-slate-800/80 text-xs text-slate-300 leading-relaxed"
                    >
                      {ins}
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          </div>
        )}

        {/* TAB 3: AI COURSE INSIGHTS */}
        {activeTab === 'insights' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            {/* Course Selector */}
            <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <Filter className="w-4 h-4 text-purple-400" />
                <label className="text-xs font-semibold text-slate-200">Select Target Course:</label>
                <select
                  value={selectedCourseId || ''}
                  onChange={handleCourseChange}
                  className="bg-[#090d16] text-xs text-white rounded-xl border border-slate-700/80 px-3.5 py-2 focus:outline-none focus:border-purple-400"
                >
                  {courses.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.title}
                    </option>
                  ))}
                </select>
              </div>

              {courseInsights && (
                <span className="text-[11px] text-slate-500 italic">
                  {courseInsights.notice}
                </span>
              )}
            </div>

            {isInsightsLoading ? (
              <LoadingState message="Synthesizing deep telemetry and AI pedagogical recommendations..." />
            ) : courseInsights ? (
              <div className="space-y-6">
                {/* Course Metrics Cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-1">
                    <span className="text-xs text-slate-400">Total Enrolled</span>
                    <div className="text-lg font-bold text-white font-mono">{courseInsights.total_enrolled}</div>
                  </div>
                  <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-1">
                    <span className="text-xs text-slate-400">Avg Completion</span>
                    <div className="text-lg font-bold text-cyan-400 font-mono">{courseInsights.completion_rate}%</div>
                  </div>
                  <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-1">
                    <span className="text-xs text-slate-400">Avg Quiz Score</span>
                    <div className="text-lg font-bold text-amber-400 font-mono">{courseInsights.avg_quiz_score}%</div>
                  </div>
                  <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-1">
                    <span className="text-xs text-slate-400">Challenge Solve Rate</span>
                    <div className="text-lg font-bold text-pink-400 font-mono">{courseInsights.challenge_success_rate}%</div>
                  </div>
                </div>

                {/* Challenging vs Successful Lessons */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="p-4 rounded-2xl bg-rose-950/20 border border-rose-500/20 space-y-2">
                    <span className="text-xs font-semibold text-rose-300 uppercase tracking-wider block">
                      Most Challenging Lesson
                    </span>
                    <h4 className="text-sm font-bold text-white">
                      {courseInsights.most_challenging_lesson || 'Multi-Qubit Operators'}
                    </h4>
                    <p className="text-xs text-slate-400">
                      Highest drop-off rate recorded. Students benefit from additional worked examples before moving forward.
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl bg-emerald-950/20 border border-emerald-500/20 space-y-2">
                    <span className="text-xs font-semibold text-emerald-300 uppercase tracking-wider block">
                      Highest Engagement Lesson
                    </span>
                    <h4 className="text-sm font-bold text-white">
                      {courseInsights.most_successful_lesson || 'Foundations & State Representation'}
                    </h4>
                    <p className="text-xs text-slate-400">
                      High completion and positive quiz retention recorded across all enrolled students.
                    </p>
                  </div>
                </div>

                {/* AI Pedagogical Recommendations */}
                <Card variant="glass" padding="lg" className="space-y-4">
                  <div className="border-b border-white/5 pb-3">
                    <h3 className="font-bold text-white text-base flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-purple-400" />
                      <span>AI Pedagogical Insights & Course Recommendations</span>
                    </h3>
                    <p className="text-xs text-slate-400">
                      Grounded recommendations generated from student telemetry and quiz patterns.
                    </p>
                  </div>

                  <div className="space-y-3 pt-2">
                    {courseInsights.ai_insights.map((rec, idx) => (
                      <div
                        key={idx}
                        className="p-3.5 rounded-xl bg-purple-950/20 border border-purple-500/20 flex items-start gap-3"
                      >
                        <div className="w-5 h-5 rounded-full bg-purple-500/20 text-purple-300 text-xs flex items-center justify-center font-bold shrink-0 mt-0.5">
                          {idx + 1}
                        </div>
                        <p className="text-xs text-purple-100 leading-relaxed">{rec}</p>
                      </div>
                    ))}
                  </div>
                </Card>
              </div>
            ) : null}
          </div>
        )}
      </div>
    </PageContainer>
  );
};

export default InstructorAnalytics;
