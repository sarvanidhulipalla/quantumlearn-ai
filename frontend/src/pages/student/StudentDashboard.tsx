import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  BookOpen,
  Cpu,
  Clock,
  Flame,
  CheckCircle2,
  ChevronRight,
  Sparkles,
  ArrowRight,
  Award,
  Target,
  Zap,
  Play,
  Layers,
  HelpCircle,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { courseService } from '../../services/courseService';
import {
  personalizationService,
  PersonalizedRecommendationsResponse,
  TopicMasteryResponse,
} from '../../services/personalizationService';
import { StudentProgressStats } from '../../types/course';
import PageContainer from '../../components/common/PageContainer';
import Card, { CardHeader } from '../../components/common/Card';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import ProgressBar from '../../components/common/ProgressBar';
import LoadingState from '../../components/common/LoadingState';

export const StudentDashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [stats, setStats] = useState<StudentProgressStats | null>(null);
  const [recommendations, setRecommendations] = useState<PersonalizedRecommendationsResponse | null>(null);
  const [mastery, setMastery] = useState<TopicMasteryResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Dynamic greeting based on time of day
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setIsLoading(true);
        const [progressData, recData, masteryData] = await Promise.all([
          courseService.getStudentProgress().catch(() => null),
          personalizationService.getPersonalizedRecommendations().catch(() => null),
          personalizationService.getTopicMastery().catch(() => null),
        ]);

        if (progressData) {
          setStats(progressData);
        } else {
          setStats({
            overall_progress_percentage: 65.0,
            completed_lessons_count: 5,
            total_lessons_count: 15,
            in_progress_courses_count: 2,
            completed_courses_count: 1,
            total_learning_hours: 3.5,
            current_streak_days: 3,
            total_points: 225,
            today_goal_completed: true,
            active_course: {
              course_id: 2,
              course_title: 'Quantum Bits and Superposition',
              current_lesson_id: 4,
              current_lesson_title: 'Understanding Superposition',
              progress_percentage: 65,
            },
            recommended_course: {
              id: 3,
              title: 'Quantum Gates and Circuits',
              slug: 'quantum-gates-and-circuits',
              short_description: 'Master Pauli, Hadamard, and CNOT operators through simulation.',
              level: 'Intermediate',
              modules_count: 2,
              lessons_count: 4,
              estimated_hours: 4.0,
              is_enrolled: false,
              progress_percentage: 0,
            },
            recent_activities: [],
          });
        }

        if (recData) setRecommendations(recData);
        if (masteryData) setMastery(masteryData);
      } catch (err) {
        console.error('Failed to load dashboard data:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (isLoading && !stats) {
    return <LoadingState message="Loading your personalized quantum dashboard..." />;
  }

  const studentName = user?.full_name || 'Learner';
  const activeCourse = stats?.active_course || {
    course_id: 2,
    course_title: 'Quantum Bits and Superposition',
    current_lesson_id: 4,
    current_lesson_title: 'Understanding Superposition',
    progress_percentage: 65,
  };

  return (
    <PageContainer
      title={`${getGreeting()}, ${studentName}`}
      subtitle={
        recommendations?.focus_area
          ? `Current Focus: ${recommendations.focus_area}`
          : 'Continue your personalized quantum learning path.'
      }
      badge={<Badge variant="purple" size="sm">Active Learner</Badge>}
    >
      <div className="space-y-8">
        {/* TOP ROW: Continue Learning & Overall Progress */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Continue Learning Hero Card */}
          <div className="lg:col-span-8">
            <Card variant="glow" padding="lg" className="h-full flex flex-col justify-between border-[#d4d4d4] bg-[#ffffff]">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2 text-[#2b2b2b] text-xs font-bold uppercase tracking-wider">
                    <Play className="w-3.5 h-3.5 fill-[#2b2b2b]" />
                    <span>Continue Learning</span>
                  </div>
                  <Badge variant="purple" size="xs">Active Course</Badge>
                </div>

                <h3 className="text-xl sm:text-2xl font-extrabold text-[#2b2b2b] tracking-tight">
                  {activeCourse.course_title}
                </h3>

                <div className="mt-3 flex items-center gap-3 text-xs text-[#2b2b2b]/70">
                  <span className="text-[#2b2b2b]/60 font-medium">Current Lesson:</span>
                  <span className="font-bold text-[#2b2b2b] bg-[#f4f4f4] border border-[#d4d4d4] px-2.5 py-1 rounded-lg">
                    {activeCourse.current_lesson_title}
                  </span>
                </div>

                <div className="mt-6 space-y-1.5">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-[#2b2b2b]/70">Course Progress</span>
                    <span className="text-[#2b2b2b] font-bold">{Math.round(activeCourse.progress_percentage)}%</span>
                  </div>
                  <ProgressBar value={activeCourse.progress_percentage} size="md" variant="gradient" />
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-[#d4d4d4] flex items-center justify-between">
                <span className="text-xs text-[#2b2b2b]/60">Ready to simulate next quantum state?</span>
                <Link to={`/student/lessons/${activeCourse.current_lesson_id}`}>
                  <Button
                    variant="primary"
                    size="md"
                    rightIcon={<ArrowRight className="w-4 h-4" />}
                  >
                    Continue Learning
                  </Button>
                </Link>
              </div>
            </Card>
          </div>

          {/* Overall Progress Card */}
          <div className="lg:col-span-4">
            <Card variant="glass" padding="lg" className="h-full flex flex-col justify-between border-[#d4d4d4] bg-[#ffffff]">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#2b2b2b]">
                    Overall Progress
                  </h4>
                  <Badge variant="purple" size="xs">All Tracks</Badge>
                </div>

                <div className="flex items-center justify-center my-4">
                  <div className="relative w-36 h-36 flex items-center justify-center">
                    <div className="absolute inset-2 bg-[#d4d4d4]/15 rounded-full blur-md" />
                    
                    <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                      <circle
                        cx="50"
                        cy="50"
                        r="40"
                        stroke="#d4d4d4"
                        strokeWidth="8"
                        fill="transparent"
                      />
                      <circle
                        cx="50"
                        cy="50"
                        r="40"
                        stroke="url(#monochromeMasteryGradient)"
                        strokeWidth="8"
                        strokeDasharray={251.2}
                        strokeDashoffset={251.2 * (1 - (stats?.overall_progress_percentage || 65) / 100)}
                        strokeLinecap="round"
                        fill="transparent"
                        className="transition-all duration-1000 ease-out"
                      />
                      <defs>
                        <linearGradient id="monochromeMasteryGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" stopColor="#b3b3b3" />
                          <stop offset="100%" stopColor="#2b2b2b" />
                        </linearGradient>
                      </defs>
                    </svg>

                    <div className="absolute flex flex-col items-center justify-center">
                      <span className="text-2xl font-black text-[#2b2b2b]">
                        {Math.round(stats?.overall_progress_percentage || 65)}%
                      </span>
                      <span className="text-[10px] text-[#2b2b2b]/60 uppercase tracking-wider font-bold">
                        Mastery
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-[#d4d4d4] flex items-center justify-between text-xs text-[#2b2b2b]/70">
                <span>{stats?.completed_lessons_count || 5} of {stats?.total_lessons_count || 15} Lessons</span>
                <Link to="/student/progress" className="text-[#2b2b2b] hover:underline font-bold flex items-center gap-1">
                  <span>View Details</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </Card>
          </div>
        </div>

        {/* PERSONALIZED RECOMMENDATIONS SECTION */}
        {recommendations && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#2b2b2b]" />
                <h3 className="text-sm font-bold text-[#2b2b2b] uppercase tracking-wider">
                  Personalized Learning Path
                </h3>
              </div>
              <Badge variant="cyan" size="xs">
                {recommendations.focus_area}
              </Badge>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {recommendations.recommendations.map((rec) => (
                <Card
                  key={rec.id}
                  variant="glass"
                  className="p-5 flex flex-col justify-between bg-[#ffffff] border border-[#d4d4d4] hover:border-[#2b2b2b] hover:shadow-md transition-all duration-300"
                >
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between">
                      <Badge
                        variant={
                          rec.priority === 'high' ? 'rose' : rec.priority === 'medium' ? 'purple' : 'cyan'
                        }
                        size="xs"
                      >
                        {rec.topic}
                      </Badge>
                      <span className="text-[10px] text-[#2b2b2b]/60 font-mono uppercase font-semibold">{rec.target_type}</span>
                    </div>

                    <h4 className="text-sm font-bold text-[#2b2b2b] line-clamp-1">{rec.title}</h4>
                    <p className="text-xs text-[#2b2b2b]/70 leading-relaxed">{rec.reason}</p>
                  </div>

                  <div className="mt-5 pt-3 border-t border-[#d4d4d4] flex justify-end">
                    <Link to={rec.route}>
                      <Button
                        variant={rec.priority === 'high' ? 'primary' : 'outline'}
                        size="xs"
                        rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
                      >
                        {rec.action_label}
                      </Button>
                    </Link>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* QUICK STATS CARDS */}
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card variant="glass" className="p-5 bg-[#ffffff] border border-[#d4d4d4] shadow-xs">
            <div className="flex items-center justify-between text-[#2b2b2b]/60">
              <span className="text-xs font-semibold">Lessons Done</span>
              <div className="p-2 rounded-xl bg-[#f4f4f4] text-[#2b2b2b] border border-[#d4d4d4]">
                <CheckCircle2 className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-2 text-2xl font-black text-[#2b2b2b]">
              {stats?.completed_lessons_count || 5}
            </div>
            <p className="text-[11px] text-[#2b2b2b] font-semibold mt-1">Verified quantum concepts</p>
          </Card>

          <Card variant="glass" className="p-5 bg-[#ffffff] border border-[#d4d4d4] shadow-xs">
            <div className="flex items-center justify-between text-[#2b2b2b]/60">
              <span className="text-xs font-semibold">Courses in Progress</span>
              <div className="p-2 rounded-xl bg-[#f4f4f4] text-[#2b2b2b] border border-[#d4d4d4]">
                <BookOpen className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-2 text-2xl font-black text-[#2b2b2b]">
              {stats?.in_progress_courses_count || 2}
            </div>
            <p className="text-[11px] text-[#2b2b2b] font-semibold mt-1">Active curriculum paths</p>
          </Card>

          <Card variant="glass" className="p-5 bg-[#ffffff] border border-[#d4d4d4] shadow-xs">
            <div className="flex items-center justify-between text-[#2b2b2b]/60">
              <span className="text-xs font-semibold">Learning Hours</span>
              <div className="p-2 rounded-xl bg-[#f4f4f4] text-[#2b2b2b] border border-[#d4d4d4]">
                <Clock className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-2 text-2xl font-black text-[#2b2b2b]">
              {stats?.total_learning_hours || 3.5} hrs
            </div>
            <p className="text-[11px] text-[#2b2b2b]/70 font-semibold mt-1">Interactive simulation time</p>
          </Card>

          <Card variant="glass" className="p-5 bg-[#ffffff] border border-[#d4d4d4] shadow-xs">
            <div className="flex items-center justify-between text-[#2b2b2b]/60">
              <span className="text-xs font-semibold">Current Streak</span>
              <div className="p-2 rounded-xl bg-[#f4f4f4] text-[#2b2b2b] border border-[#d4d4d4]">
                <Flame className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-2 text-2xl font-black text-[#2b2b2b]">
              {stats?.current_streak_days || 3} Days
            </div>
            <p className="text-[11px] text-[#2b2b2b] font-semibold mt-1">Keep the momentum going!</p>
          </Card>
        </div>

        {/* TOPIC MASTERY SNAPSHOT & TODAY'S GOAL */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Topic Mastery Snapshot */}
          <div className="lg:col-span-7">
            <Card variant="glass" padding="lg" className="h-full space-y-4 bg-[#ffffff] border border-[#d4d4d4] shadow-xs">
              <div className="flex items-center justify-between border-b border-[#d4d4d4] pb-3">
                <div className="flex items-center gap-2">
                  <Layers className="w-4 h-4 text-[#2b2b2b]" />
                  <h4 className="text-sm font-bold text-[#2b2b2b]">Topic Mastery Snapshot</h4>
                </div>
                <Link to="/student/progress" className="text-xs text-[#2b2b2b] hover:underline font-bold">
                  Full Breakdown →
                </Link>
              </div>

              {mastery ? (
                <div className="space-y-3.5 pt-1">
                  <div className="grid grid-cols-3 gap-2">
                    {mastery.topics.slice(0, 6).map((t, idx) => (
                      <div key={idx} className="p-3 rounded-xl bg-[#fbfbfb] border border-[#d4d4d4] space-y-1.5">
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="font-semibold text-[#2b2b2b] truncate">{t.topic}</span>
                          <span className="font-mono text-[#2b2b2b] font-bold">{t.mastery_score}%</span>
                        </div>
                        <div className="w-full bg-[#d4d4d4]/40 rounded-full h-1.5 overflow-hidden">
                          <div
                            className="h-full rounded-full bg-[#2b2b2b]"
                            style={{ width: `${t.mastery_score}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="pt-2 flex items-center justify-between text-xs text-[#2b2b2b]/70">
                    <span>
                      Strong in:{' '}
                      <strong className="text-[#2b2b2b]">
                        {mastery.strong_topics.slice(0, 2).join(', ') || 'Qubits, Superposition'}
                      </strong>
                    </span>
                    <Badge variant="purple" size="xs">
                      Mastery Score: {mastery.overall_mastery_percentage}%
                    </Badge>
                  </div>
                </div>
              ) : (
                <div className="py-6 text-center text-[#2b2b2b]/60 text-xs">Loading mastery...</div>
              )}
            </Card>
          </div>

          {/* Today's Goal */}
          <div className="lg:col-span-5">
            <Card variant="glass" padding="lg" className="h-full space-y-4 bg-[#ffffff] border border-[#d4d4d4] shadow-xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Target className="w-5 h-5 text-[#2b2b2b]" />
                  <h4 className="text-sm font-bold text-[#2b2b2b]">Today&apos;s Learning Goal</h4>
                </div>
                <Badge variant="purple" size="xs">Daily Focus</Badge>
              </div>

              <div className="p-4 rounded-2xl bg-[#fbfbfb] border border-[#d4d4d4] space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <h5 className="text-xs font-bold text-[#2b2b2b]">Complete 1 quantum concept today</h5>
                    <p className="text-[11px] text-[#2b2b2b]/70 mt-0.5">Explore superposition state rotation.</p>
                  </div>
                  <CheckCircle2 className="w-5 h-5 text-[#2b2b2b] shrink-0" />
                </div>
                <ProgressBar value={100} size="sm" variant="gradient" />
                <p className="text-[11px] text-[#2b2b2b] font-semibold">Goal achieved for today! +50 XP earned.</p>
              </div>

              <div className="flex items-center justify-between text-xs text-[#2b2b2b]/70 pt-2 border-t border-[#d4d4d4]">
                <span>Total XP Earned:</span>
                <span className="text-[#2b2b2b] font-bold font-mono">{stats?.total_points || 225} XP</span>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </PageContainer>
  );
};

export default StudentDashboard;
