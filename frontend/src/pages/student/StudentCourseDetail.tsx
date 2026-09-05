import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  BookOpen,
  Clock,
  CheckCircle2,
  ChevronRight,
  ArrowLeft,
  Layers,
  User,
  Sparkles,
  Play,
  FileText,
  Cpu,
} from 'lucide-react';
import { courseService } from '../../services/courseService';
import { CourseDetailResponse } from '../../types/course';
import PageContainer from '../../components/common/PageContainer';
import Card, { CardHeader } from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import ProgressBar from '../../components/common/ProgressBar';
import LoadingState from '../../components/common/LoadingState';
import ErrorState from '../../components/common/ErrorState';

export const StudentCourseDetail: React.FC = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();

  const [course, setCourse] = useState<CourseDetailResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fetchCourse = async () => {
    if (!courseId) return;
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const data = await courseService.getCourseById(courseId);
      setCourse(data);
    } catch (err) {
      console.error('Failed to load course details:', err);
      setErrorMsg('Failed to load course from server. Showing offline syllabus preview.');
      // Fallback
      setCourse({
        id: Number(courseId) || 2,
        title: 'Quantum Bits and Superposition',
        slug: 'qubits-and-superposition',
        description: 'Dive deep into the phenomenon of quantum superposition. Visualize single-qubit states on the 3D Bloch sphere, apply unitary transformations, and understand how quantum measurement collapses continuous states.',
        short_description: 'Master the core principle of superposition, the 3D Bloch sphere representation, and quantum probability amplitudes.',
        level: 'Beginner',
        estimated_hours: 8.0,
        instructor: {
          id: 2,
          full_name: 'Dr. Priya Iyer',
          role: 'Instructor',
          bio: 'Quantum Computing Researcher & Professor.',
        },
        modules: [
          {
            id: 1,
            title: 'Module 1 — Superposition & The Bloch Sphere',
            description: 'Geometric intuition and physical visualization of quantum superpositions.',
            order: 1,
            lessons: [
              {
                id: 4,
                title: 'Understanding Superposition',
                slug: 'understanding-superposition',
                lesson_type: 'interactive',
                order: 1,
                duration_minutes: 20,
                is_completed: true,
              },
              {
                id: 5,
                title: 'Visualizing Superposition with the Bloch Sphere',
                slug: 'visualizing-superposition',
                lesson_type: 'interactive',
                order: 2,
                duration_minutes: 25,
                is_completed: false,
              },
              {
                id: 6,
                title: 'Measurement & State Collapse',
                slug: 'quantum-measurement',
                lesson_type: 'theory',
                order: 3,
                duration_minutes: 15,
                is_completed: false,
              },
            ],
          },
        ],
        is_enrolled: true,
        progress_percentage: 66.7,
        current_lesson_id: 5,
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCourse();
  }, [courseId]);

  if (isLoading) {
    return <LoadingState message="Loading quantum course curriculum..." />;
  }

  if (!course) {
    return (
      <PageContainer title="Course Not Found">
        <ErrorState
          type="error"
          message="The requested quantum course could not be located."
          action={
            <Link to="/student/courses">
              <Button variant="outline" size="sm">Back to Courses</Button>
            </Link>
          }
        />
      </PageContainer>
    );
  }

  const isDone = course.progress_percentage >= 99.9;
  const targetLessonId = course.current_lesson_id || (course.modules[0]?.lessons[0]?.id) || 1;

  const totalLessons = course.modules.reduce((acc, m) => acc + m.lessons.length, 0);
  const completedLessons = course.modules.reduce(
    (acc, m) => acc + m.lessons.filter((l) => l.is_completed).length,
    0
  );

  return (
    <PageContainer
      title={course.title}
      subtitle={course.short_description || course.description}
      badge={<Badge variant={course.level === 'Beginner' ? 'cyan' : 'purple'} size="sm">{course.level}</Badge>}
      actions={
        <div className="flex items-center gap-2">
          <Link to="/student/courses">
            <Button variant="outline" size="sm" leftIcon={<ArrowLeft className="w-4 h-4" />}>
              All Courses
            </Button>
          </Link>
          <Link to={`/student/lessons/${targetLessonId}`}>
            <Button
              variant="primary"
              size="sm"
              leftIcon={<Play className="w-4 h-4 fill-white" />}
            >
              {course.is_enrolled ? (isDone ? 'Review Lesson 1' : 'Continue Learning') : 'Start Course'}
            </Button>
          </Link>
        </div>
      }
    >
      <div className="space-y-8">
        {errorMsg && (
          <ErrorState type="warning" message={errorMsg} onRetry={fetchCourse} />
        )}

        {/* Top Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Left Course Overview */}
          <div className="md:col-span-8 space-y-6">
            <Card variant="glass" padding="lg">
              <h3 className="text-base font-bold text-white mb-3">About this Course</h3>
              <p className="text-sm text-slate-300 leading-relaxed">
                {course.description}
              </p>

              {/* Course Meta Specs */}
              <div className="mt-6 pt-5 border-t border-white/5 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                <div>
                  <span className="text-slate-400 block mb-1">Difficulty</span>
                  <span className="font-bold text-cyan-300">{course.level}</span>
                </div>
                <div>
                  <span className="text-slate-400 block mb-1">Estimated Time</span>
                  <span className="font-bold text-white">{course.estimated_hours} Hours</span>
                </div>
                <div>
                  <span className="text-slate-400 block mb-1">Curriculum</span>
                  <span className="font-bold text-white">{course.modules.length} Modules ({totalLessons} Lessons)</span>
                </div>
                <div>
                  <span className="text-slate-400 block mb-1">Simulations</span>
                  <span className="font-bold text-purple-300">Bloch Sphere & Circuits</span>
                </div>
              </div>
            </Card>
          </div>

          {/* Right Instructor & Progress */}
          <div className="md:col-span-4 space-y-6">
            {/* Progress Card */}
            <Card variant="glow" padding="md" className="border-cyan-500/30 space-y-3">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400 font-semibold uppercase tracking-wider">Your Progress</span>
                <span className="text-cyan-400 font-bold font-mono">{Math.round(course.progress_percentage)}%</span>
              </div>
              <ProgressBar value={course.progress_percentage} size="md" variant="gradient" />
              <p className="text-[11px] text-slate-400">
                {completedLessons} of {totalLessons} lessons completed
              </p>
            </Card>

            {/* Instructor Profile */}
            <Card variant="glass" padding="md" className="space-y-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Lead Instructor
              </span>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-950/80 border border-purple-500/40 flex items-center justify-center text-purple-300 font-bold text-sm">
                  {course.instructor.full_name.charAt(0)}
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">{course.instructor.full_name}</h4>
                  <p className="text-xs text-slate-400">{course.instructor.role}</p>
                </div>
              </div>
              {course.instructor.bio && (
                <p className="text-xs text-slate-400 leading-relaxed pt-1">
                  {course.instructor.bio}
                </p>
              )}
            </Card>
          </div>
        </div>

        {/* Course Curriculum & Modules */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold text-white tracking-tight">Course Curriculum</h3>
              <p className="text-xs text-slate-400 mt-1">Step-by-step modular lessons and interactive quantum simulations.</p>
            </div>
            <Badge variant="purple" size="sm">{course.modules.length} Modules</Badge>
          </div>

          <div className="space-y-4">
            {course.modules.map((module, modIdx) => (
              <Card key={module.id} variant="glass" padding="lg" className="border-slate-800">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-white/5 mb-4">
                  <div>
                    <h4 className="text-base font-bold text-white flex items-center gap-2">
                      <span className="text-xs font-mono text-cyan-400 bg-cyan-950/70 border border-cyan-500/30 px-2 py-0.5 rounded">
                        0{modIdx + 1}
                      </span>
                      <span>{module.title}</span>
                    </h4>
                    {module.description && (
                      <p className="text-xs text-slate-400 mt-1">{module.description}</p>
                    )}
                  </div>
                  <span className="text-xs text-slate-400 whitespace-nowrap">
                    {module.lessons.length} {module.lessons.length === 1 ? 'Lesson' : 'Lessons'}
                  </span>
                </div>

                {/* Lessons List in Module */}
                <div className="space-y-2.5">
                  {module.lessons.map((lesson) => {
                    const isCurrent = lesson.id === course.current_lesson_id && !lesson.is_completed;
                    
                    return (
                      <div
                        key={lesson.id}
                        onClick={() => navigate(`/student/lessons/${lesson.id}`)}
                        className={`p-3.5 rounded-xl border flex items-center justify-between gap-4 transition-all duration-200 cursor-pointer ${
                          isCurrent
                            ? 'bg-gradient-to-r from-cyan-950/40 to-purple-950/40 border-cyan-400/50 shadow-md shadow-cyan-500/10'
                            : lesson.is_completed
                            ? 'bg-slate-900/60 border-slate-800/80 hover:border-slate-700'
                            : 'bg-slate-900/30 border-slate-800/50 hover:border-slate-700'
                        }`}
                      >
                        <div className="flex items-center gap-3.5 min-w-0">
                          {/* Completion / Status Icon */}
                          <div className="shrink-0">
                            {lesson.is_completed ? (
                              <div className="w-7 h-7 rounded-full bg-emerald-950/80 border border-emerald-500 text-emerald-400 flex items-center justify-center">
                                <CheckCircle2 className="w-4 h-4" />
                              </div>
                            ) : isCurrent ? (
                              <div className="w-7 h-7 rounded-full bg-cyan-950/80 border border-cyan-400 text-cyan-300 flex items-center justify-center animate-pulse">
                                <Play className="w-3.5 h-3.5 fill-cyan-400 ml-0.5" />
                              </div>
                            ) : (
                              <div className="w-7 h-7 rounded-full bg-slate-800 border border-slate-700 text-slate-400 flex items-center justify-center text-xs font-mono">
                                {lesson.order}
                              </div>
                            )}
                          </div>

                          {/* Lesson Title & Specs */}
                          <div className="truncate">
                            <div className="flex items-center gap-2">
                              <h5 className={`text-xs sm:text-sm font-semibold truncate ${
                                isCurrent ? 'text-cyan-300' : 'text-white'
                              }`}>
                                {lesson.title}
                              </h5>
                              {isCurrent && (
                                <Badge variant="cyan" size="xs">Current</Badge>
                              )}
                            </div>
                            <div className="flex items-center gap-3 text-[11px] text-slate-400 mt-0.5">
                              <span className="flex items-center gap-1 font-mono">
                                <Clock className="w-3 h-3" />
                                {lesson.duration_minutes} min
                              </span>
                              <span>•</span>
                              <span className="capitalize">{lesson.lesson_type.replace('_', ' ')}</span>
                            </div>
                          </div>
                        </div>

                        {/* Action Button */}
                        <div className="shrink-0">
                          <Button
                            variant={isCurrent ? 'primary' : 'outline'}
                            size="sm"
                            rightIcon={<ChevronRight className="w-3.5 h-3.5" />}
                          >
                            {lesson.is_completed ? 'Review' : isCurrent ? 'Continue' : 'Start'}
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </PageContainer>
  );
};

export default StudentCourseDetail;
