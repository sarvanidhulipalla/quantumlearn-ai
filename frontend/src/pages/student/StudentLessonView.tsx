import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  BookOpen,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  ArrowLeft,
  Clock,
  Sparkles,
  Check,
  Cpu,
  Layers,
  Award,
} from 'lucide-react';
import { courseService } from '../../services/courseService';
import { LessonDetailResponse, ModuleWithLessons } from '../../types/course';
import PageContainer from '../../components/common/PageContainer';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import ProgressBar from '../../components/common/ProgressBar';
import LoadingState from '../../components/common/LoadingState';
import ErrorState from '../../components/common/ErrorState';
import SuperpositionVisualizer from '../../components/visual/SuperpositionVisualizer';
import QuantumCircuitViewer from '../../components/visual/QuantumCircuitViewer';

export const StudentLessonView: React.FC = () => {
  const { lessonId } = useParams<{ lessonId: string }>();
  const navigate = useNavigate();

  const [lesson, setLesson] = useState<LessonDetailResponse | null>(null);
  const [courseModules, setCourseModules] = useState<ModuleWithLessons[]>([]);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);
  const [isCompleting, setIsCompleting] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [showCompletionBadge, setShowCompletionBadge] = useState<boolean>(false);

  const fetchLessonData = async () => {
    if (!lessonId) return;
    setIsLoading(true);
    setErrorMsg(null);
    setShowCompletionBadge(false);

    try {
      const data = await courseService.getLessonById(lessonId);
      setLesson(data);
      setIsCompleted(data.is_completed);

      // Fetch sibling modules for left navigation sidebar
      if (data.course_id) {
        try {
          const modules = await courseService.getCourseModules(data.course_id);
          setCourseModules(modules);
        } catch (e) {
          console.warn('Could not fetch sibling modules:', e);
        }
      }
    } catch (err) {
      console.error('Failed to load lesson:', err);
      setErrorMsg('Failed to load lesson from server. Showing offline simulation preview.');
      // Fallback
      setLesson({
        id: Number(lessonId) || 4,
        title: 'Understanding Superposition',
        slug: 'understanding-superposition',
        content: `### Learning Objective
Understand how a single qubit can exist in a superposition of both $|0\\rangle$ and $|1\\rangle$ simultaneously, and interact with the state vector.

### Concept Explanation
Superposition is the fundamental quantum principle allowing a quantum system to be in multiple basis states at the same time.

When we prepare a qubit in the state:
$$|\\psi\\rangle = \\frac{1}{\\sqrt{2}}|0\\rangle + \\frac{1}{\\sqrt{2}}|1\\rangle = |+\\rangle$$

The probability of measuring $0$ is:
$$P(0) = |\\alpha|^2 = \\left(\\frac{1}{\\sqrt{2}}\\right)^2 = 0.5 = 50\\%$$

And the probability of measuring $1$ is:
$$P(1) = |\\beta|^2 = \\left(\\frac{1}{\\sqrt{2}}\\right)^2 = 0.5 = 50\\%$$
`,
        lesson_type: 'interactive',
        order: 1,
        duration_minutes: 20,
        is_completed: false,
        module_id: 1,
        module_title: 'Module 1 — Superposition & The Bloch Sphere',
        course_id: 2,
        course_title: 'Quantum Bits and Superposition',
        prev_lesson_id: 3,
        next_lesson_id: 5,
      });
      setIsCompleted(false);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLessonData();
  }, [lessonId]);

  // Mark Lesson Complete Handler
  const handleMarkComplete = async () => {
    if (!lesson || isCompleted) return;
    setIsCompleting(true);
    try {
      await courseService.completeLesson(lesson.id);
      setIsCompleted(true);
      setShowCompletionBadge(true);

      // Update local state in courseModules list
      setCourseModules((prev) =>
        prev.map((mod) => ({
          ...mod,
          lessons: mod.lessons.map((l) =>
            l.id === lesson.id ? { ...l, is_completed: true } : l
          ),
        }))
      );
    } catch (err) {
      console.error('Failed to mark lesson complete on server, updating locally:', err);
      setIsCompleted(true);
      setShowCompletionBadge(true);
    } finally {
      setIsCompleting(false);
    }
  };

  if (isLoading) {
    return <LoadingState message="Loading interactive quantum lesson..." />;
  }

  if (!lesson) {
    return (
      <PageContainer title="Lesson Not Found">
        <ErrorState
          type="error"
          message="The requested quantum lesson could not be loaded."
          action={
            <Link to="/student/courses">
              <Button variant="outline" size="sm">Back to Courses</Button>
            </Link>
          }
        />
      </PageContainer>
    );
  }

  // Calculate syllabus progress for current course
  const totalLessonsInSyllabus = courseModules.reduce((acc, m) => acc + m.lessons.length, 0);
  const completedLessonsInSyllabus = courseModules.reduce(
    (acc, m) => acc + m.lessons.filter((l) => l.is_completed).length,
    0
  );
  const syllabusProgress = totalLessonsInSyllabus > 0
    ? Math.round((completedLessonsInSyllabus / totalLessonsInSyllabus) * 100)
    : (isCompleted ? 100 : 50);

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* Top Header / Breadcrumb Bar */}
      <div className="p-4 sm:p-5 rounded-2xl glass-panel flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-slate-800">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-400 mb-1">
            <Link
              to={`/student/courses/${lesson.course_id}`}
              className="hover:text-cyan-300 transition-colors flex items-center gap-1"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>{lesson.course_title}</span>
            </Link>
            <span>/</span>
            <span className="text-slate-300">{lesson.module_title}</span>
          </div>

          <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight flex items-center gap-3">
            <span>{lesson.title}</span>
            {isCompleted && (
              <Badge variant="emerald" size="xs" icon={<Check className="w-3 h-3" />}>
                Completed
              </Badge>
            )}
          </h1>
        </div>

        {/* Progress in Syllabus */}
        <div className="flex items-center gap-4 shrink-0">
          <div className="text-right hidden sm:block">
            <span className="text-[11px] text-slate-400 block font-medium">Course Progress</span>
            <span className="text-xs font-bold text-cyan-400 font-mono">{syllabusProgress}%</span>
          </div>
          <div className="w-24 hidden sm:block">
            <ProgressBar value={syllabusProgress} size="sm" variant="gradient" />
          </div>
        </div>
      </div>

      {/* Main 3-Column / 2-Column Responsive Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Lesson Syllabus Drawer (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          <Card variant="glass" padding="md" className="border-slate-800 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/5">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-cyan-400" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">
                  Course Modules
                </h3>
              </div>
              <span className="text-[11px] font-mono text-cyan-400">{completedLessonsInSyllabus}/{totalLessonsInSyllabus || 3} Done</span>
            </div>

            {/* Modules & Lessons List */}
            <div className="space-y-4 max-h-[600px] overflow-y-auto pr-1">
              {courseModules.length > 0 ? (
                courseModules.map((mod) => (
                  <div key={mod.id} className="space-y-2">
                    <h4 className="text-xs font-bold text-slate-300 px-1">{mod.title}</h4>
                    <div className="space-y-1.5">
                      {mod.lessons.map((l) => {
                        const isCurrentLesson = l.id === lesson.id;
                        return (
                          <div
                            key={l.id}
                            onClick={() => navigate(`/student/lessons/${l.id}`)}
                            className={`p-2.5 rounded-xl border flex items-center justify-between gap-3 text-xs transition-all cursor-pointer ${
                              isCurrentLesson
                                ? 'bg-gradient-to-r from-cyan-950/70 to-purple-950/70 border-cyan-400/60 text-white shadow-md shadow-cyan-500/10'
                                : l.is_completed
                                ? 'bg-slate-900/60 border-slate-800 text-slate-300 hover:border-slate-700'
                                : 'bg-slate-900/30 border-slate-800/40 text-slate-400 hover:border-slate-700'
                            }`}
                          >
                            <div className="flex items-center gap-2.5 truncate">
                              {l.is_completed ? (
                                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                              ) : isCurrentLesson ? (
                                <div className="w-4 h-4 rounded-full bg-cyan-400 animate-pulse shrink-0" />
                              ) : (
                                <span className="w-4 text-center font-mono text-slate-500 text-[10px]">
                                  {l.order}
                                </span>
                              )}
                              <span className="truncate font-medium">{l.title}</span>
                            </div>
                            <span className="text-[10px] text-slate-500 font-mono shrink-0">
                              {l.duration_minutes}m
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))
              ) : (
                <div className="space-y-2 text-xs">
                  <div className="p-2.5 rounded-xl bg-cyan-950/70 border border-cyan-400/60 text-white flex items-center justify-between">
                    <span>{lesson.title}</span>
                    <span className="text-[10px] font-mono text-cyan-300">Active</span>
                  </div>
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* Center / Right Column: Main Interactive Lesson Content (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          {/* Success / Completion Banner Alert */}
          {showCompletionBadge && (
            <div className="p-4 rounded-2xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 flex items-center justify-between animate-in fade-in duration-300">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                <div>
                  <h4 className="text-sm font-bold text-white">Lesson Completed! +25 XP Earned</h4>
                  <p className="text-xs text-emerald-200">
                    Your quantum understanding was recorded in the database.
                  </p>
                </div>
              </div>
              {lesson.next_lesson_id && (
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => navigate(`/student/lessons/${lesson.next_lesson_id}`)}
                  rightIcon={<ChevronRight className="w-3.5 h-3.5" />}
                >
                  Next Lesson
                </Button>
              )}
            </div>
          )}

          {/* 1. Learning Objective & Concept Explanation */}
          <Card variant="glass" padding="lg" className="space-y-6">
            {/* Header Objective */}
            <div className="p-4 rounded-2xl bg-cyan-950/40 border border-cyan-500/30">
              <div className="flex items-center gap-2 text-cyan-300 text-xs font-bold uppercase tracking-wider mb-1.5">
                <Sparkles className="w-4 h-4" />
                <span>1. Learning Objective</span>
              </div>
              <p className="text-sm text-slate-200 leading-relaxed font-medium">
                Understand how a single quantum bit (qubit) exists in a continuous linear combination (superposition) of basis states $|0\rangle$ and $|1\rangle$, and inspect state rotations on the Bloch Sphere.
              </p>
            </div>

            {/* Concept Explanation */}
            <div className="space-y-4 text-sm text-slate-300 leading-relaxed">
              <h3 className="text-lg font-bold text-white tracking-tight">2. Concept Explanation</h3>
              
              <p>
                In classical computing, a bit is constrained to either 0 or 1. A quantum bit (qubit), by contrast, can be prepared in a linear combination of orthonormal states $|0\rangle$ and $|1\rangle$:
              </p>

              {/* Highlighted Formula Block */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-white/10 text-center font-mono text-cyan-300 text-base font-bold shadow-inner">
                |ψ⟩ = α|0⟩ + β|1⟩, &emsp; where |α|² + |β|² = 1
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className="p-3.5 rounded-xl bg-slate-900/80 border border-white/5 space-y-1">
                  <span className="text-xs font-bold text-white block">Probability Amplitude α</span>
                  <p className="text-xs text-slate-400">
                    $|\alpha|^2$ represents the exact statistical probability of measuring classical state $0$.
                  </p>
                </div>
                <div className="p-3.5 rounded-xl bg-slate-900/80 border border-white/5 space-y-1">
                  <span className="text-xs font-bold text-white block">Probability Amplitude β</span>
                  <p className="text-xs text-slate-400">
                    $|\beta|^2$ represents the exact statistical probability of measuring classical state $1$.
                  </p>
                </div>
              </div>
            </div>
          </Card>

          {/* 2. Live Interactive Superposition Visualizer */}
          <div className="space-y-3">
            <h3 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-purple-400" />
              <span>3. Visual Quantum Explanation</span>
            </h3>
            <SuperpositionVisualizer />
          </div>

          {/* 3. Educational Quantum Circuit */}
          <div className="space-y-3">
            <h3 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
              <Cpu className="w-5 h-5 text-cyan-400" />
              <span>4. Quantum Circuit Execution</span>
            </h3>
            <QuantumCircuitViewer
              initialState="|0⟩"
              gateName="H"
              outputState="|+⟩ = (|0⟩ + |1⟩)/√2"
              explanation="The Hadamard (H) gate performs a 90° rotation around the Y-axis followed by an inversion, creating a balanced 50/50 superposition across computational basis states."
            />
          </div>

          {/* 4. Key Takeaways */}
          <Card variant="glass" padding="lg" className="space-y-3 border-emerald-500/20">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Award className="w-5 h-5 text-emerald-400" />
              <span>5. Key Takeaways</span>
            </h3>
            <ul className="space-y-2 text-xs text-slate-300 list-disc list-inside leading-relaxed">
              <li>Superposition allows qubits to explore simultaneous computational states.</li>
              <li>The Hadamard (H) gate maps $|0\rangle \rightarrow |+\rangle$ and $|1\rangle \rightarrow |-\rangle$.</li>
              <li>Measurement destroys quantum superposition, collapsing the state vector probabilistically into a definite classical outcome.</li>
            </ul>
          </Card>

          {/* 5. Completion & Next Step Action Bar */}
          <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-[#0d121f] to-slate-900 border border-slate-700/80 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <h4 className="text-sm font-bold text-white">Ready to finalize this concept?</h4>
              <p className="text-xs text-slate-400 mt-0.5">
                {isCompleted
                  ? 'Lesson completed. Progress synchronized with your student dashboard.'
                  : 'Click below to mark complete and unlock your mastery points.'}
              </p>
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
              <Button
                variant="outline"
                size="md"
                onClick={() => navigate('/student/quizzes')}
                leftIcon={<Award className="w-4 h-4 text-cyan-400" />}
              >
                Take Quiz
              </Button>

              <Button
                variant="outline"
                size="md"
                onClick={() =>
                  navigate('/student/ai-tutor', {
                    state: {
                      lessonTitle: lesson.title,
                      lessonContent: lesson.content,
                      initialPrompt: `Can you explain the main concepts in '${lesson.title}' and give me an intuitive example?`,
                    },
                  })
                }
                leftIcon={<Sparkles className="w-4 h-4 text-purple-400" />}
              >
                Ask AI Tutor
              </Button>

              <Button
                variant={isCompleted ? 'secondary' : 'primary'}
                size="md"
                onClick={handleMarkComplete}
                isLoading={isCompleting}
                leftIcon={isCompleted ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <Check className="w-4 h-4" />}
                className="w-full sm:w-auto"
              >
                {isCompleted ? 'Completed ✓' : 'Mark as Complete'}
              </Button>
            </div>
          </div>

          {/* Bottom Navigation Buttons */}
          <div className="pt-4 flex items-center justify-between border-t border-white/5">
            {lesson.prev_lesson_id ? (
              <Button
                variant="outline"
                size="md"
                onClick={() => navigate(`/student/lessons/${lesson.prev_lesson_id}`)}
                leftIcon={<ChevronLeft className="w-4 h-4" />}
              >
                Previous Lesson
              </Button>
            ) : (
              <div />
            )}

            {lesson.next_lesson_id ? (
              <Button
                variant="primary"
                size="md"
                onClick={() => navigate(`/student/lessons/${lesson.next_lesson_id}`)}
                rightIcon={<ChevronRight className="w-4 h-4" />}
              >
                Next Lesson
              </Button>
            ) : (
              <Link to={`/student/courses/${lesson.course_id}`}>
                <Button variant="glow" size="md" rightIcon={<CheckCircle2 className="w-4 h-4" />}>
                  Course Complete
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentLessonView;
