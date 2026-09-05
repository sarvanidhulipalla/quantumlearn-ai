import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Award,
  Plus,
  Search,
  CheckCircle2,
  AlertCircle,
  Eye,
  Edit2,
  Trash2,
  Clock,
  BookOpen,
  HelpCircle,
  Save,
  Globe,
  Lock,
  PlusCircle,
  ChevronDown,
  ChevronUp,
  Sparkles,
} from 'lucide-react';

import PageContainer from '../../components/common/PageContainer';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import Modal from '../../components/common/Modal';
import LoadingState from '../../components/common/LoadingState';
import ErrorState from '../../components/common/ErrorState';

import instructorService, {
  InstructorQuiz,
  InstructorQuestion,
  InstructorCourse,
} from '../../services/instructorService';
import {
  aiGeneratorService,
  AIQuizDraftResponse,
  AIQuizQuestionDraft,
} from '../../services/aiGeneratorService';

export const InstructorQuizzes: React.FC = () => {
  const navigate = useNavigate();

  const [quizzes, setQuizzes] = useState<InstructorQuiz[]>([]);
  const [courses, setCourses] = useState<InstructorCourse[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'published' | 'draft'>('all');

  // AI Quiz Generator State
  const [isAIModalOpen, setIsAIModalOpen] = useState<boolean>(false);
  const [aiTopic, setAiTopic] = useState<string>('Superposition and Bloch Sphere Representation');
  const [aiDifficulty, setAiDifficulty] = useState<string>('Intermediate');
  const [aiNumQuestions, setAiNumQuestions] = useState<number>(4);
  const [aiPassingScore, setAiPassingScore] = useState<number>(70);
  const [aiTimeLimit, setAiTimeLimit] = useState<number>(15);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [generatedQuizDraft, setGeneratedQuizDraft] = useState<AIQuizDraftResponse | null>(null);
  const [regeneratingQOrder, setRegeneratingQOrder] = useState<number | null>(null);
  const [questionGuidances, setQuestionGuidances] = useState<Record<number, string>>({});

  // Quiz Editor state
  const [editorModal, setEditorModal] = useState<{
    isOpen: boolean;
    quizId?: number;
    title: string;
    description: string;
    courseId?: number;
    lessonId?: number;
    passingScore: number;
    timeLimit: number;
    isPublished: boolean;
    questions: InstructorQuestion[];
  }>({
    isOpen: false,
    title: '',
    description: '',
    passingScore: 70,
    timeLimit: 15,
    isPublished: true,
    questions: [],
  });

  const [activeQuestionIndex, setActiveQuestionIndex] = useState<number>(0);
  const [previewMode, setPreviewMode] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);

  // Delete Modal
  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; quiz: InstructorQuiz | null }>({
    isOpen: false,
    quiz: null,
  });

  const fetchData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const [quizzesRes, coursesRes] = await Promise.all([
        instructorService.listQuizzes(),
        instructorService.listCourses(),
      ]);
      setQuizzes(quizzesRes);
      setCourses(coursesRes);
    } catch (err: any) {
      console.error('Failed to fetch quizzes:', err);
      setError(err.response?.data?.detail || 'Failed to load quizzes.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openQuizEditor = async (quiz?: InstructorQuiz) => {
    if (quiz) {
      try {
        const detail = await instructorService.getQuiz(quiz.id);
        setEditorModal({
          isOpen: true,
          quizId: detail.id,
          title: detail.title,
          description: detail.description || '',
          courseId: detail.course_id,
          lessonId: detail.lesson_id,
          passingScore: detail.passing_score_percentage,
          timeLimit: detail.time_limit_minutes,
          isPublished: detail.is_published,
          questions: detail.questions || [],
        });
        setActiveQuestionIndex(0);
      } catch (err: any) {
        alert(err.response?.data?.detail || 'Failed to load quiz detail.');
      }
    } else {
      setEditorModal({
        isOpen: true,
        title: '',
        description: '',
        courseId: courses[0]?.id,
        passingScore: 70,
        timeLimit: 15,
        isPublished: true,
        questions: [
          {
            prompt: '',
            question_type: 'multiple_choice',
            options_json: JSON.stringify([
              { id: 'A', text: '' },
              { id: 'B', text: '' },
              { id: 'C', text: '' },
              { id: 'D', text: '' },
            ]),
            correct_answer: 'A',
            explanation: '',
            points: 10,
            order: 1,
          },
        ],
      });
      setActiveQuestionIndex(0);
    }
    setPreviewMode(false);
  };

  const handleAddQuestion = () => {
    const newQ: InstructorQuestion = {
      prompt: '',
      question_type: 'multiple_choice',
      options_json: JSON.stringify([
        { id: 'A', text: '' },
        { id: 'B', text: '' },
        { id: 'C', text: '' },
        { id: 'D', text: '' },
      ]),
      correct_answer: 'A',
      explanation: '',
      points: 10,
      order: editorModal.questions.length + 1,
    };
    setEditorModal((prev) => ({
      ...prev,
      questions: [...prev.questions, newQ],
    }));
    setActiveQuestionIndex(editorModal.questions.length);
  };

  const handleDeleteQuestion = (idx: number) => {
    if (editorModal.questions.length <= 1) {
      alert('A quiz must have at least one question.');
      return;
    }
    const filtered = editorModal.questions.filter((_, i) => i !== idx);
    setEditorModal((prev) => ({ ...prev, questions: filtered }));
    setActiveQuestionIndex(Math.max(0, idx - 1));
  };

  const handleUpdateCurrentQuestion = (field: keyof InstructorQuestion, value: any) => {
    setEditorModal((prev) => {
      const updated = [...prev.questions];
      updated[activeQuestionIndex] = {
        ...updated[activeQuestionIndex],
        [field]: value,
      };
      return { ...prev, questions: updated };
    });
  };

  const handleSaveQuiz = async () => {
    if (!editorModal.title.trim()) {
      alert('Please enter a quiz title.');
      return;
    }
    if (editorModal.questions.length === 0) {
      alert('Please add at least one question.');
      return;
    }
    for (let i = 0; i < editorModal.questions.length; i++) {
      const q = editorModal.questions[i];
      if (!q.prompt.trim()) {
        alert(`Question ${i + 1} prompt cannot be empty.`);
        return;
      }
      if (!q.correct_answer.trim()) {
        alert(`Question ${i + 1} must have a correct answer selected.`);
        return;
      }
    }

    try {
      setIsSaving(true);
      if (editorModal.quizId) {
        await instructorService.updateQuiz(editorModal.quizId, {
          title: editorModal.title.trim(),
          description: editorModal.description.trim(),
          course_id: editorModal.courseId,
          lesson_id: editorModal.lessonId,
          passing_score_percentage: editorModal.passingScore,
          time_limit_minutes: editorModal.timeLimit,
          is_published: editorModal.isPublished,
          questions: editorModal.questions,
        });
      } else {
        await instructorService.createQuiz({
          title: editorModal.title.trim(),
          description: editorModal.description.trim(),
          course_id: editorModal.courseId,
          lesson_id: editorModal.lessonId,
          passing_score_percentage: editorModal.passingScore,
          time_limit_minutes: editorModal.timeLimit,
          is_published: editorModal.isPublished,
          questions: editorModal.questions,
        });
      }
      await fetchData();
      setEditorModal((prev) => ({ ...prev, isOpen: false }));
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Failed to save quiz.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleTogglePublish = async (quiz: InstructorQuiz) => {
    try {
      if (quiz.is_published) {
        await instructorService.unpublishQuiz(quiz.id);
      } else {
        await instructorService.publishQuiz(quiz.id);
      }
      await fetchData();
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Failed to toggle publication status.');
    }
  };

  const handleDeleteQuiz = async () => {
    if (!deleteModal.quiz) return;
    try {
      await instructorService.deleteQuiz(deleteModal.quiz.id);
      await fetchData();
      setDeleteModal({ isOpen: false, quiz: null });
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Failed to delete quiz.');
    }
  };

  const filteredQuizzes = quizzes.filter((q) => {
    const matchesSearch =
      q.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.course_title?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus =
      statusFilter === 'all' ||
      (statusFilter === 'published' && q.is_published) ||
      (statusFilter === 'draft' && !q.is_published);
    return matchesSearch && matchesStatus;
  });

  const currentQ = editorModal.questions[activeQuestionIndex];
  let parsedOptions: { id: string; text: string }[] = [];
  if (currentQ?.options_json) {
    try {
      parsedOptions = JSON.parse(currentQ.options_json);
    } catch (e) {
      parsedOptions = [];
    }
  }

  const handleGenerateAIQuizDraft = async () => {
    if (!aiTopic.trim()) {
      alert('Please specify a quantum assessment topic.');
      return;
    }
    try {
      setIsGenerating(true);
      const draft = await aiGeneratorService.generateQuizDraft({
        topic: aiTopic.trim(),
        difficulty: aiDifficulty,
        num_questions: aiNumQuestions,
        passing_score: aiPassingScore,
        time_limit_minutes: aiTimeLimit,
      });
      setGeneratedQuizDraft(draft);
    } catch (err: any) {
      console.error('Quiz generation failed:', err);
      alert(err.response?.data?.detail || 'Failed to generate quiz draft with AI.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleRegenerateQuestion = async (q: AIQuizQuestionDraft, qIdx: number) => {
    try {
      setRegeneratingQOrder(q.order);
      const guidance = questionGuidances[q.order];
      const regenerated = await aiGeneratorService.regenerateQuestion({
        topic: aiTopic.trim(),
        difficulty: aiDifficulty,
        question_type: q.question_type,
        guidance: guidance?.trim() || undefined,
        question_order: q.order,
      });

      if (generatedQuizDraft) {
        const updatedQuestions = [...generatedQuizDraft.questions];
        updatedQuestions[qIdx] = regenerated;
        setGeneratedQuizDraft({ ...generatedQuizDraft, questions: updatedQuestions });
      }
    } catch (err: any) {
      console.error('Question regeneration failed:', err);
      alert(err.response?.data?.detail || 'Failed to regenerate question.');
    } finally {
      setRegeneratingQOrder(null);
    }
  };

  const handleApplyQuizDraftToEditor = () => {
    if (!generatedQuizDraft) return;
    const formattedQuestions: InstructorQuestion[] = generatedQuizDraft.questions.map((q, idx) => ({
      prompt: q.prompt,
      question_type: q.question_type,
      options_json: JSON.stringify(q.options),
      correct_answer: q.correct_answer,
      explanation: q.explanation,
      points: q.points,
      order: idx + 1,
    }));

    setEditorModal({
      isOpen: true,
      quizId: undefined,
      title: generatedQuizDraft.title,
      description: generatedQuizDraft.description,
      courseId: undefined,
      lessonId: undefined,
      passingScore: generatedQuizDraft.passing_score_percentage,
      timeLimit: generatedQuizDraft.time_limit_minutes,
      isPublished: false,
      questions: formattedQuestions,
    });
    setActiveQuestionIndex(0);
    setIsAIModalOpen(false);
  };

  if (isLoading) {
    return (
      <PageContainer title="Quiz Management" subtitle="Loading quizzes...">
        <LoadingState message="Fetching quizzes and question banks..." />
      </PageContainer>
    );
  }

  if (error) {
    return (
      <PageContainer title="Quiz Management" subtitle="Manage assessments">
        <ErrorState message={error} onRetry={fetchData} />
      </PageContainer>
    );
  }

  return (
    <PageContainer
      title="Quiz & Assessment Builder"
      subtitle="Design conceptual questions, configure scoring rules, and verify quantum circuit predictions."
      actions={
        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsAIModalOpen(true)}
            className="border-purple-500/40 text-purple-300 hover:bg-purple-950/40"
            leftIcon={<Sparkles className="w-4 h-4 text-purple-400" />}
          >
            Generate Quiz with AI
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={() => openQuizEditor()}
            leftIcon={<Plus className="w-4 h-4" />}
          >
            Create Quiz
          </Button>
        </div>
      }
    >
      <div className="space-y-6">
        {/* Filter & Search Bar */}
        <div className="p-4 rounded-2xl glass-panel border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search quiz by title or course..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#090d16] text-xs text-slate-200 placeholder-slate-500 rounded-xl border border-slate-700/80 pl-9 pr-3 py-2 focus:outline-none focus:border-purple-400 transition-colors"
            />
          </div>

          <div className="flex bg-[#090d16] p-1 rounded-xl border border-slate-800 text-xs">
            {(['all', 'published', 'draft'] as const).map((filter) => (
              <button
                key={filter}
                onClick={() => setStatusFilter(filter)}
                className={`px-3 py-1 rounded-lg capitalize transition-colors cursor-pointer ${
                  statusFilter === filter
                    ? 'bg-purple-900/40 text-purple-300 font-semibold border border-purple-500/30'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {filter}
              </button>
            ))}
          </div>
        </div>

        {/* Quizzes Table */}
        <div className="glass-panel rounded-2xl border-slate-800 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="bg-slate-900/80 text-xs uppercase text-slate-400 border-b border-white/10">
                <tr>
                  <th className="py-3.5 px-4 font-semibold">Quiz Title</th>
                  <th className="py-3.5 px-4 font-semibold">Linked Course</th>
                  <th className="py-3.5 px-4 font-semibold text-center">Questions</th>
                  <th className="py-3.5 px-4 font-semibold text-center">Passing Score</th>
                  <th className="py-3.5 px-4 font-semibold text-center">Attempts</th>
                  <th className="py-3.5 px-4 font-semibold text-center">Status</th>
                  <th className="py-3.5 px-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredQuizzes.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-slate-500 text-xs">
                      No quizzes found. Click "Create Quiz" to author a new assessment.
                    </td>
                  </tr>
                ) : (
                  filteredQuizzes.map((q) => (
                    <tr key={q.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-white">{q.title}</div>
                        <div className="text-[11px] text-slate-500 flex items-center gap-1">
                          <Clock className="w-3 h-3" /> {q.time_limit_minutes} min limit
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-xs font-medium text-slate-300 max-w-[200px] truncate">
                        {q.course_title || 'General Curriculum'}
                      </td>
                      <td className="py-3.5 px-4 text-center font-mono text-cyan-400 font-semibold">
                        {q.question_count || 0}
                      </td>
                      <td className="py-3.5 px-4 text-center font-mono text-amber-400 font-semibold">
                        {q.passing_score_percentage}%
                      </td>
                      <td className="py-3.5 px-4 text-center font-mono text-slate-300">
                        {q.attempts_count || 0}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <Badge variant={q.is_published ? 'emerald' : 'amber'} size="xs">
                          {q.is_published ? 'Published' : 'Draft'}
                        </Badge>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Button
                            variant="ghost"
                            size="xs"
                            onClick={() => openQuizEditor(q)}
                            title="Edit Questions & Grading"
                          >
                            <Edit2 className="w-3.5 h-3.5 text-purple-400" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="xs"
                            onClick={() => handleTogglePublish(q)}
                            title={q.is_published ? 'Unpublish' : 'Publish'}
                          >
                            {q.is_published ? (
                              <Lock className="w-3.5 h-3.5 text-amber-400" />
                            ) : (
                              <Globe className="w-3.5 h-3.5 text-emerald-400" />
                            )}
                          </Button>
                          <button
                            onClick={() => setDeleteModal({ isOpen: true, quiz: q })}
                            className="p-1.5 rounded-lg text-rose-400 hover:text-white hover:bg-rose-950/40 transition-colors"
                            title="Delete Quiz"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Quiz Editor Modal */}
      <Modal
        isOpen={editorModal.isOpen}
        onClose={() => setEditorModal((prev) => ({ ...prev, isOpen: false }))}
        title={editorModal.quizId ? `Edit Quiz: ${editorModal.title}` : 'Create Quantum Assessment'}
        size="lg"
        footer={
          <div className="flex items-center justify-between w-full">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setPreviewMode(!previewMode)}
              leftIcon={<Eye className="w-4 h-4" />}
            >
              {previewMode ? 'Question Editor' : 'Preview Student View'}
            </Button>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setEditorModal((prev) => ({ ...prev, isOpen: false }))}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={handleSaveQuiz}
                isLoading={isSaving}
                leftIcon={<Save className="w-4 h-4" />}
              >
                Save Quiz
              </Button>
            </div>
          </div>
        }
      >
        {previewMode ? (
          <div className="space-y-6 py-2 max-h-[65vh] overflow-y-auto pr-2">
            <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-white text-base">{editorModal.title || 'Untitled Assessment'}</h3>
                <Badge variant="cyan" size="xs">
                  Passing: {editorModal.passingScore}%
                </Badge>
              </div>
              <p className="text-xs text-slate-400">{editorModal.description}</p>
            </div>

            {/* Questions preview */}
            <div className="space-y-4">
              {editorModal.questions.map((q, idx) => {
                let opts: { id: string; text: string }[] = [];
                try {
                  opts = JSON.parse(q.options_json);
                } catch (e) {}

                return (
                  <div
                    key={idx}
                    className="p-4 rounded-xl bg-slate-900/40 border border-slate-800 space-y-3"
                  >
                    <div className="flex items-center justify-between text-xs text-slate-400 border-b border-white/5 pb-2">
                      <span className="font-bold text-white">Question {idx + 1}</span>
                      <Badge variant="purple" size="xs">
                        {q.points} Points
                      </Badge>
                    </div>
                    <p className="text-sm font-medium text-slate-200">{q.prompt}</p>

                    <div className="grid grid-cols-1 gap-2 pt-2">
                      {opts.map((opt) => (
                        <div
                          key={opt.id}
                          className={`p-2.5 rounded-lg border text-xs flex items-center justify-between ${
                            opt.id === q.correct_answer
                              ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-300 font-semibold'
                              : 'bg-slate-950/60 border-slate-800 text-slate-300'
                          }`}
                        >
                          <span>
                            <strong className="mr-2 font-mono">[{opt.id}]</strong>
                            {opt.text}
                          </span>
                          {opt.id === q.correct_answer && (
                            <span className="text-[10px] text-emerald-400 flex items-center gap-1 font-mono">
                              <CheckCircle2 className="w-3 h-3" /> Correct Answer
                            </span>
                          )}
                        </div>
                      ))}
                    </div>

                    {q.explanation && (
                      <div className="p-2.5 rounded-lg bg-purple-950/20 border border-purple-500/20 text-xs text-purple-300 mt-2">
                        <strong>Explanation:</strong> {q.explanation}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="space-y-6 py-2 max-h-[65vh] overflow-y-auto pr-2">
            {/* Top Parameters */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-2 space-y-1.5">
                <label className="block text-xs font-semibold text-slate-300">Quiz Title *</label>
                <input
                  type="text"
                  value={editorModal.title}
                  onChange={(e) => setEditorModal((prev) => ({ ...prev, title: e.target.value }))}
                  placeholder="e.g. Single-Qubit Transformations & Bloch Geometry"
                  className="w-full bg-[#090d16] text-xs text-white rounded-xl border border-slate-700/80 px-3.5 py-2.5 focus:outline-none focus:border-purple-400"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-300">Linked Course</label>
                <select
                  value={editorModal.courseId || ''}
                  onChange={(e) =>
                    setEditorModal((prev) => ({
                      ...prev,
                      courseId: parseInt(e.target.value, 10) || undefined,
                    }))
                  }
                  className="w-full bg-[#090d16] text-xs text-white rounded-xl border border-slate-700/80 px-3.5 py-2.5 focus:outline-none focus:border-purple-400 cursor-pointer"
                >
                  <option value="">General (No Course)</option>
                  {courses.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.title}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-300">Passing Score (%)</label>
                <input
                  type="number"
                  min="10"
                  max="100"
                  value={editorModal.passingScore}
                  onChange={(e) =>
                    setEditorModal((prev) => ({
                      ...prev,
                      passingScore: parseFloat(e.target.value) || 70,
                    }))
                  }
                  className="w-full bg-[#090d16] text-xs text-white rounded-xl border border-slate-700/80 px-3.5 py-2 focus:outline-none focus:border-purple-400"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-300">Time Limit (Mins)</label>
                <input
                  type="number"
                  min="5"
                  max="120"
                  value={editorModal.timeLimit}
                  onChange={(e) =>
                    setEditorModal((prev) => ({
                      ...prev,
                      timeLimit: parseInt(e.target.value, 10) || 15,
                    }))
                  }
                  className="w-full bg-[#090d16] text-xs text-white rounded-xl border border-slate-700/80 px-3.5 py-2 focus:outline-none focus:border-purple-400"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-300">Publication Status</label>
                <select
                  value={editorModal.isPublished ? 'published' : 'draft'}
                  onChange={(e) =>
                    setEditorModal((prev) => ({
                      ...prev,
                      isPublished: e.target.value === 'published',
                    }))
                  }
                  className="w-full bg-[#090d16] text-xs text-white rounded-xl border border-slate-700/80 px-3.5 py-2 focus:outline-none focus:border-purple-400 cursor-pointer"
                >
                  <option value="published">Published</option>
                  <option value="draft">Draft</option>
                </select>
              </div>
            </div>

            {/* Question Tabs & Question Editor */}
            <div className="space-y-4 pt-4 border-t border-white/5">
              <div className="flex items-center justify-between">
                <div className="flex flex-wrap items-center gap-1.5">
                  {editorModal.questions.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveQuestionIndex(idx)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-mono font-semibold transition-all cursor-pointer ${
                        activeQuestionIndex === idx
                          ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                          : 'bg-slate-900/80 text-slate-400 hover:text-white border border-slate-800'
                      }`}
                    >
                      Q{idx + 1}
                    </button>
                  ))}
                  <Button
                    variant="ghost"
                    size="xs"
                    onClick={handleAddQuestion}
                    leftIcon={<Plus className="w-3.5 h-3.5" />}
                  >
                    Add Question
                  </Button>
                </div>

                {editorModal.questions.length > 1 && (
                  <button
                    onClick={() => handleDeleteQuestion(activeQuestionIndex)}
                    className="text-xs text-rose-400 hover:text-rose-300 flex items-center gap-1 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Remove Q{activeQuestionIndex + 1}
                  </button>
                )}
              </div>

              {/* Active Question Editor Body */}
              {currentQ && (
                <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="sm:col-span-2 space-y-1.5">
                      <label className="block text-xs font-semibold text-slate-300">Question Type</label>
                      <select
                        value={currentQ.question_type}
                        onChange={(e) => {
                          const newType = e.target.value;
                          let opts = parsedOptions;
                          if (newType === 'true_false') {
                            opts = [
                              { id: 'True', text: 'True' },
                              { id: 'False', text: 'False' },
                            ];
                          }
                          handleUpdateCurrentQuestion('question_type', newType);
                          handleUpdateCurrentQuestion('options_json', JSON.stringify(opts));
                        }}
                        className="w-full bg-[#090d16] text-xs text-white rounded-xl border border-slate-700/80 px-3.5 py-2 focus:outline-none focus:border-purple-400 cursor-pointer"
                      >
                        <option value="multiple_choice">Multiple Choice</option>
                        <option value="true_false">True / False</option>
                        <option value="conceptual">Conceptual Question</option>
                        <option value="circuit_prediction">Circuit Output Prediction</option>
                        <option value="code_output">Qiskit Code Output</option>
                        <option value="error_identification">Error Identification</option>
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-xs font-semibold text-slate-300">Points</label>
                      <input
                        type="number"
                        min="1"
                        max="100"
                        value={currentQ.points}
                        onChange={(e) =>
                          handleUpdateCurrentQuestion('points', parseInt(e.target.value, 10) || 10)
                        }
                        className="w-full bg-[#090d16] text-xs text-white rounded-xl border border-slate-700/80 px-3.5 py-2 focus:outline-none focus:border-purple-400"
                      />
                    </div>
                  </div>

                  {/* Prompt */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold text-slate-300">Question Prompt *</label>
                    <textarea
                      rows={3}
                      value={currentQ.prompt}
                      onChange={(e) => handleUpdateCurrentQuestion('prompt', e.target.value)}
                      placeholder="e.g. What is the state vector after applying H on |0⟩?"
                      className="w-full bg-[#090d16] text-xs text-white rounded-xl border border-slate-700/80 p-3 focus:outline-none focus:border-purple-400"
                    />
                  </div>

                  {/* Options Builder */}
                  <div className="space-y-2">
                    <label className="block text-xs font-semibold text-slate-300">
                      Answer Choices & Authoritative Correct Answer
                    </label>
                    <div className="space-y-2">
                      {parsedOptions.map((opt, oIdx) => (
                        <div key={opt.id || oIdx} className="flex items-center gap-2">
                          <span className="w-8 text-center text-xs font-mono font-bold text-slate-400">
                            {opt.id}
                          </span>
                          <input
                            type="text"
                            value={opt.text}
                            onChange={(e) => {
                              const updatedOpts = [...parsedOptions];
                              updatedOpts[oIdx] = { ...opt, text: e.target.value };
                              handleUpdateCurrentQuestion('options_json', JSON.stringify(updatedOpts));
                            }}
                            placeholder={`Choice ${opt.id} description...`}
                            className="flex-1 bg-[#090d16] text-xs text-white rounded-xl border border-slate-700/80 px-3 py-2 focus:outline-none focus:border-purple-400"
                          />
                          <button
                            type="button"
                            onClick={() => handleUpdateCurrentQuestion('correct_answer', opt.id)}
                            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                              currentQ.correct_answer === opt.id
                                ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-500/30'
                                : 'bg-slate-800 text-slate-400 hover:text-white'
                            }`}
                          >
                            {currentQ.correct_answer === opt.id ? '✓ Correct' : 'Set Correct'}
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Conceptual Explanation */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold text-slate-300">
                      Detailed Conceptual Explanation (Revealed to student after submission)
                    </label>
                    <textarea
                      rows={2}
                      value={currentQ.explanation || ''}
                      onChange={(e) => handleUpdateCurrentQuestion('explanation', e.target.value)}
                      placeholder="Explain the mathematical/physical reason why this answer is correct..."
                      className="w-full bg-[#090d16] text-xs text-white rounded-xl border border-slate-700/80 p-3 focus:outline-none focus:border-purple-400"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, quiz: null })}
        title="Delete Quiz"
        size="sm"
        footer={
          <div className="flex justify-end gap-2.5">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setDeleteModal({ isOpen: false, quiz: null })}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleDeleteQuiz}
              className="bg-rose-600 hover:bg-rose-700 text-white"
            >
              Delete Quiz
            </Button>
          </div>
        }
      >
        <p className="text-xs text-slate-300">
          Are you sure you want to delete quiz <strong className="text-white">{deleteModal.quiz?.title}</strong>? All
          previous student attempts will be deleted.
        </p>
      </Modal>

      {/* AI Quiz Generator Modal */}
      <Modal
        isOpen={isAIModalOpen}
        onClose={() => setIsAIModalOpen(false)}
        title="AI Quiz & Assessment Generator"
        size="lg"
        footer={
          <div className="flex items-center justify-between w-full">
            <span className="text-[11px] text-slate-400 italic">
              AI Generated Assessment Draft — Authoritative answers hidden from student endpoints.
            </span>
            <div className="flex gap-2.5">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsAIModalOpen(false)}
              >
                Close
              </Button>
              {generatedQuizDraft && (
                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleApplyQuizDraftToEditor}
                  leftIcon={<CheckCircle2 className="w-4 h-4" />}
                >
                  Load into Quiz Editor
                </Button>
              )}
            </div>
          </div>
        }
      >
        <div className="space-y-5 max-h-[70vh] overflow-y-auto pr-1">
          {/* Generation Configuration */}
          <div className="p-4 rounded-2xl bg-purple-950/20 border border-purple-500/20 space-y-4">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-purple-400" />
              <h4 className="text-xs font-semibold text-purple-200 uppercase tracking-wider">
                Grounded Quantum Assessment Synthesizer
              </h4>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              <div className="md:col-span-2 space-y-1">
                <label className="text-[11px] font-medium text-slate-300">Assessment Topic</label>
                <input
                  type="text"
                  value={aiTopic}
                  onChange={(e) => setAiTopic(e.target.value)}
                  placeholder="e.g. Superposition, Hadamard Gates, and Bloch Sphere"
                  className="w-full bg-[#090d16] text-xs text-white rounded-xl border border-slate-700/80 px-3 py-2 focus:outline-none focus:border-purple-400"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-medium text-slate-300">Difficulty Level</label>
                <select
                  value={aiDifficulty}
                  onChange={(e) => setAiDifficulty(e.target.value)}
                  className="w-full bg-[#090d16] text-xs text-white rounded-xl border border-slate-700/80 px-3 py-2 focus:outline-none focus:border-purple-400"
                >
                  <option value="Beginner">Beginner</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Advanced">Advanced</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-medium text-slate-300">Number of Questions (1-8)</label>
                <input
                  type="number"
                  min="1"
                  max="8"
                  value={aiNumQuestions}
                  onChange={(e) => setAiNumQuestions(parseInt(e.target.value, 10) || 4)}
                  className="w-full bg-[#090d16] text-xs text-white rounded-xl border border-slate-700/80 px-3 py-2 focus:outline-none focus:border-purple-400"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-medium text-slate-300">Passing Score (%)</label>
                <input
                  type="number"
                  min="10"
                  max="100"
                  value={aiPassingScore}
                  onChange={(e) => setAiPassingScore(parseInt(e.target.value, 10) || 70)}
                  className="w-full bg-[#090d16] text-xs text-white rounded-xl border border-slate-700/80 px-3 py-2 focus:outline-none focus:border-purple-400"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-medium text-slate-300">Time Limit (Minutes)</label>
                <input
                  type="number"
                  min="5"
                  max="120"
                  value={aiTimeLimit}
                  onChange={(e) => setAiTimeLimit(parseInt(e.target.value, 10) || 15)}
                  className="w-full bg-[#090d16] text-xs text-white rounded-xl border border-slate-700/80 px-3 py-2 focus:outline-none focus:border-purple-400"
                />
              </div>
            </div>

            <div className="flex justify-end pt-1">
              <Button
                variant="primary"
                size="sm"
                onClick={handleGenerateAIQuizDraft}
                isLoading={isGenerating}
                leftIcon={<Sparkles className="w-4 h-4" />}
              >
                {generatedQuizDraft ? 'Regenerate Assessment' : 'Generate Assessment Draft'}
              </Button>
            </div>
          </div>

          {/* Generated Questions List Preview */}
          {generatedQuizDraft && (
            <div className="space-y-4 pt-2 border-t border-slate-800">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                  Generated Questions ({generatedQuizDraft.questions.length})
                </h4>
                <Badge variant="cyan" size="sm">
                  Pass Mark: {generatedQuizDraft.passing_score_percentage}%
                </Badge>
              </div>

              <div className="space-y-3">
                {generatedQuizDraft.questions.map((q, qIdx) => (
                  <div
                    key={qIdx}
                    className="p-3.5 rounded-xl bg-[#090d16] border border-slate-800 space-y-2.5 text-xs"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-md bg-purple-950/60 border border-purple-500/40 text-purple-300 text-[10px] flex items-center justify-center font-bold">
                          {q.order}
                        </span>
                        <span className="font-medium text-white">{q.prompt}</span>
                      </div>
                      <Badge variant="outline" size="xs">
                        {q.question_type}
                      </Badge>
                    </div>

                    {/* Options list */}
                    <div className="space-y-1 pl-7">
                      {q.options.map((opt) => (
                        <div
                          key={opt.id}
                          className={`px-2.5 py-1.5 rounded-lg border text-[11px] flex items-center justify-between ${
                            opt.id === q.correct_answer
                              ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-200'
                              : 'bg-slate-900/60 border-slate-800 text-slate-400'
                          }`}
                        >
                          <span>
                            <strong className="mr-1.5">{opt.id}:</strong> {opt.text}
                          </span>
                          {opt.id === q.correct_answer && (
                            <span className="text-[10px] text-emerald-400 font-semibold uppercase tracking-wider">
                              Correct Answer
                            </span>
                          )}
                        </div>
                      ))}
                    </div>

                    {/* Explanation */}
                    <div className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800/80 text-[11px] text-slate-400 pl-7">
                      <strong className="text-purple-300">Explanation:</strong> {q.explanation}
                    </div>

                    {/* Granular Question Regeneration */}
                    <div className="flex items-center gap-2 pt-1 pl-7">
                      <input
                        type="text"
                        placeholder="Adjust question focus/guidance..."
                        value={questionGuidances[q.order] || ''}
                        onChange={(e) =>
                          setQuestionGuidances({ ...questionGuidances, [q.order]: e.target.value })
                        }
                        className="flex-1 bg-slate-900 text-[11px] text-white rounded-lg border border-slate-700/60 px-2.5 py-1 focus:outline-none focus:border-purple-400"
                      />
                      <Button
                        variant="outline"
                        size="xs"
                        onClick={() => handleRegenerateQuestion(q, qIdx)}
                        isLoading={regeneratingQOrder === q.order}
                        leftIcon={<Sparkles className="w-3 h-3 text-purple-400" />}
                      >
                        Regenerate
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </Modal>
    </PageContainer>
  );
};

export default InstructorQuizzes;
