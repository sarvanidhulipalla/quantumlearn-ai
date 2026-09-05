import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  HelpCircle,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  XCircle,
  Award,
  Sparkles,
  RotateCcw,
  ArrowLeft,
  Bot,
  AlertTriangle,
  Send,
  BookOpen,
} from 'lucide-react';
import {
  quizService,
  QuizDetail,
  QuizSubmitResult,
  QuestionPublic,
} from '../../services/quizService';
import PageContainer from '../../components/common/PageContainer';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import ProgressBar from '../../components/common/ProgressBar';
import LoadingState from '../../components/common/LoadingState';
import ErrorState from '../../components/common/ErrorState';
import Modal from '../../components/common/Modal';

export const StudentQuizAttempt: React.FC = () => {
  const { quizId } = useParams<{ quizId: string }>();
  const navigate = useNavigate();

  const [quiz, setQuiz] = useState<QuizDetail | null>(null);
  const [currentIdx, setCurrentIdx] = useState<number>(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState<boolean>(false);
  const [result, setResult] = useState<QuizSubmitResult | null>(null);

  useEffect(() => {
    fetchQuiz();
  }, [quizId]);

  const fetchQuiz = async () => {
    if (!quizId) return;
    setIsLoading(true);
    setErrorMsg(null);
    setResult(null);
    setAnswers({});
    setCurrentIdx(0);

    try {
      const data = await quizService.getQuizById(quizId);
      setQuiz(data);
    } catch (err: any) {
      console.error('Failed to load quiz details:', err);
      setErrorMsg('Failed to load quiz questions. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectOption = (questionId: number, optionId: string) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId.toString()]: optionId,
    }));
  };

  const handleConfirmSubmit = async () => {
    if (!quizId) return;
    setIsConfirmModalOpen(false);
    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      const gradeResult = await quizService.submitQuiz(quizId, answers);
      setResult(gradeResult);
    } catch (err: any) {
      console.error('Quiz submission failed:', err);
      setErrorMsg('Failed to submit quiz. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <PageContainer title="Loading Quiz..." subtitle="Preparing your assessment questions.">
        <LoadingState message="Loading quiz questions and security session..." />
      </PageContainer>
    );
  }

  if (errorMsg && !quiz) {
    return (
      <PageContainer title="Quiz Error" subtitle="An error occurred while loading the quiz.">
        <ErrorState title="Quiz Unavailable" message={errorMsg} onRetry={fetchQuiz} />
      </PageContainer>
    );
  }

  if (!quiz || quiz.questions.length === 0) {
    return (
      <PageContainer title="Empty Quiz" subtitle="This quiz has no questions.">
        <div className="text-center py-12 glass-panel rounded-2xl p-8 border-slate-800">
          <p className="text-sm text-slate-300">This quiz does not contain any questions yet.</p>
          <Button variant="outline" size="sm" className="mt-4" onClick={() => navigate('/student/quizzes')}>
            Back to Quizzes
          </Button>
        </div>
      </PageContainer>
    );
  }

  // =========================================================================
  // RESULTS VIEW (Post Submission)
  // =========================================================================
  if (result) {
    return (
      <PageContainer
        title={result.quiz_title}
        subtitle="Assessment Completed — Detailed performance breakdown & explanations."
        badge={
          <Badge variant={result.passed ? 'emerald' : 'amber'} size="sm">
            {result.passed ? 'PASSED ✓' : 'NEEDS REVIEW'}
          </Badge>
        }
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={fetchQuiz}
              leftIcon={<RotateCcw className="w-3.5 h-3.5" />}
            >
              Retake Quiz
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => navigate('/student/quizzes')}
              leftIcon={<ArrowLeft className="w-3.5 h-3.5" />}
            >
              All Quizzes
            </Button>
          </div>
        }
      >
        <div className="space-y-6 max-w-4xl mx-auto">
          {/* Performance Summary Banner */}
          <div
            className={`p-6 rounded-2xl border flex flex-col sm:flex-row items-center justify-between gap-6 ${
              result.passed
                ? 'bg-gradient-to-r from-emerald-950/60 via-slate-900 to-cyan-950/40 border-emerald-500/40'
                : 'bg-gradient-to-r from-amber-950/60 via-slate-900 to-rose-950/40 border-amber-500/40'
            }`}
          >
            <div className="flex items-center gap-4 text-center sm:text-left">
              <div
                className={`w-16 h-16 rounded-2xl flex items-center justify-center font-extrabold text-2xl border ${
                  result.passed
                    ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300'
                    : 'bg-amber-500/20 border-amber-400 text-amber-300'
                }`}
              >
                {result.score_percentage}%
              </div>

              <div>
                <h3 className="text-lg font-bold text-white">
                  {result.passed ? 'Excellent Work! You Passed.' : 'Quiz Completed'}
                </h3>
                <p className="text-xs text-slate-300 mt-1">
                  You scored {result.correct_count} out of {result.total_questions} questions correctly ({result.earned_points}/{result.total_possible_points} points).
                </p>
                {result.xp_earned > 0 && (
                  <p className="text-xs text-cyan-300 font-semibold mt-1 flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5" /> +{result.xp_earned} Mastery XP Earned!
                  </p>
                )}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  navigate('/student/ai-tutor', {
                    state: {
                      initialPrompt: `I just completed the quiz '${result.quiz_title}' and scored ${result.score_percentage}%. Can you explain any misconceptions and help me review?`,
                    },
                  })
                }
                leftIcon={<Bot className="w-4 h-4 text-purple-400" />}
              >
                Ask AI Tutor to Review
              </Button>
            </div>
          </div>

          {/* Question Breakdown List */}
          <div className="space-y-4">
            <h4 className="text-sm font-bold text-slate-200 uppercase tracking-wider">
              Question-by-Question Review
            </h4>

            {result.breakdown.map((item, idx) => {
              return (
                <Card
                  key={item.question_id}
                  variant="glass"
                  padding="md"
                  className={`border transition-all ${
                    item.is_correct ? 'border-emerald-500/30' : 'border-rose-500/30'
                  }`}
                >
                  <div className="space-y-3">
                    {/* Question Header */}
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-lg bg-slate-800 text-slate-300 font-bold text-xs flex items-center justify-center">
                          {idx + 1}
                        </span>
                        <Badge variant={item.is_correct ? 'emerald' : 'rose'} size="xs">
                          {item.is_correct ? (
                            <span className="flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3" /> Correct (+{item.points_earned} pts)
                            </span>
                          ) : (
                            <span className="flex items-center gap-1">
                              <XCircle className="w-3 h-3" /> Incorrect (0/{item.points_possible} pts)
                            </span>
                          )}
                        </Badge>
                      </div>

                      <span className="text-[11px] font-mono text-slate-400">
                        {item.question_type.replace('_', ' ').toUpperCase()}
                      </span>
                    </div>

                    {/* Question Prompt */}
                    <p className="text-xs sm:text-sm font-medium text-slate-100 leading-relaxed">
                      {item.prompt}
                    </p>

                    {/* Options Breakdown */}
                    <div className="space-y-1.5 pt-1">
                      {item.options.map((opt) => {
                        const isStudentChoice = item.student_answer === opt.id;
                        const isCorrectChoice = item.correct_answer === opt.id;

                        let optStyle = 'bg-slate-900/60 border-slate-800 text-slate-400';
                        if (isCorrectChoice) {
                          optStyle = 'bg-emerald-950/50 border-emerald-500/60 text-emerald-200 font-semibold';
                        } else if (isStudentChoice && !item.is_correct) {
                          optStyle = 'bg-rose-950/50 border-rose-500/60 text-rose-200';
                        }

                        return (
                          <div
                            key={opt.id}
                            className={`p-2.5 rounded-xl border text-xs flex items-center justify-between ${optStyle}`}
                          >
                            <div className="flex items-center gap-2">
                              <span className="w-5 h-5 rounded-md bg-black/40 text-center font-bold text-[10px] flex items-center justify-center">
                                {opt.id}
                              </span>
                              <span>{opt.text}</span>
                            </div>

                            {isCorrectChoice && (
                              <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">
                                Correct Answer ✓
                              </span>
                            )}
                            {isStudentChoice && !isCorrectChoice && (
                              <span className="text-[10px] font-bold text-rose-400 uppercase tracking-wider">
                                Your Choice ✕
                              </span>
                            )}
                          </div>
                        );
                      })}
                    </div>

                    {/* Explanation Callout */}
                    <div className="p-3 rounded-xl bg-[#090e18] border border-white/5 text-xs text-slate-300 space-y-1">
                      <p className="font-bold text-cyan-400 text-[11px] flex items-center gap-1">
                        <BookOpen className="w-3.5 h-3.5" /> Conceptual Explanation:
                      </p>
                      <p className="text-slate-300 leading-relaxed">{item.explanation}</p>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      </PageContainer>
    );
  }

  // =========================================================================
  // ACTIVE QUESTION RUNNER VIEW
  // =========================================================================
  const currentQuestion: QuestionPublic = quiz.questions[currentIdx];
  const totalQuestions = quiz.questions.length;
  const progressPercentage = Math.round(((currentIdx + 1) / totalQuestions) * 100);
  const selectedOptionId = answers[currentQuestion.id.toString()] || '';
  const answeredCount = Object.keys(answers).length;

  const handleNext = () => {
    if (currentIdx < totalQuestions - 1) {
      setCurrentIdx(currentIdx + 1);
    }
  };

  const handlePrev = () => {
    if (currentIdx > 0) {
      setCurrentIdx(currentIdx - 1);
    }
  };

  return (
    <PageContainer
      title={quiz.title}
      subtitle={`Question ${currentIdx + 1} of ${totalQuestions} • Passing Score: ${quiz.passing_score_percentage}%`}
      badge={<Badge variant="purple" size="sm">Assessment in Progress</Badge>}
    >
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Progress Bar & Counter */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>
              Question <strong className="text-white">{currentIdx + 1}</strong> of{' '}
              <strong className="text-white">{totalQuestions}</strong>
            </span>
            <span>
              Answered: <strong className="text-cyan-400">{answeredCount}</strong>/{totalQuestions}
            </span>
          </div>
          <ProgressBar value={progressPercentage} variant="cyan" size="sm" />
        </div>

        {/* Question Card */}
        <Card variant="glass" padding="lg" className="space-y-6">
          {/* Question Header */}
          <div className="flex items-center justify-between border-b border-white/5 pb-3">
            <Badge variant="cyan" size="xs">
              {currentQuestion.question_type.replace('_', ' ').toUpperCase()}
            </Badge>
            <span className="text-xs font-mono text-slate-400">
              Worth {currentQuestion.points} Points
            </span>
          </div>

          {/* Prompt */}
          <div className="space-y-2">
            <h3 className="text-base sm:text-lg font-semibold text-white leading-relaxed">
              {currentQuestion.prompt}
            </h3>
          </div>

          {/* Options Selection */}
          <div className="space-y-2.5 pt-2">
            {currentQuestion.options.map((opt) => {
              const isSelected = selectedOptionId === opt.id;
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => handleSelectOption(currentQuestion.id, opt.id)}
                  className={`w-full p-4 rounded-xl border text-left text-xs sm:text-sm flex items-center gap-3.5 transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-gradient-to-r from-purple-900/60 to-indigo-900/50 border-purple-500 text-white shadow-md shadow-purple-500/10'
                      : 'bg-slate-900/70 hover:bg-slate-800/80 border-slate-800 text-slate-300'
                  }`}
                >
                  <span
                    className={`w-6 h-6 rounded-lg font-bold text-xs flex items-center justify-center shrink-0 border ${
                      isSelected
                        ? 'bg-purple-600 text-white border-purple-400'
                        : 'bg-slate-800 text-slate-400 border-slate-700'
                    }`}
                  >
                    {opt.id}
                  </span>
                  <span className="leading-relaxed">{opt.text}</span>
                </button>
              );
            })}
          </div>

          {/* Navigation & Submit Bar */}
          <div className="pt-4 border-t border-white/5 flex items-center justify-between gap-4">
            <Button
              variant="outline"
              size="sm"
              onClick={handlePrev}
              disabled={currentIdx === 0}
              leftIcon={<ChevronLeft className="w-4 h-4" />}
            >
              Previous
            </Button>

            <div className="flex items-center gap-2">
              {currentIdx < totalQuestions - 1 ? (
                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleNext}
                  rightIcon={<ChevronRight className="w-4 h-4" />}
                >
                  Next Question
                </Button>
              ) : (
                <Button
                  variant="glow"
                  size="sm"
                  onClick={() => setIsConfirmModalOpen(true)}
                  isLoading={isSubmitting}
                  leftIcon={<Send className="w-3.5 h-3.5" />}
                >
                  Submit Quiz
                </Button>
              )}
            </div>
          </div>
        </Card>

        {/* Question Navigator Dots */}
        <div className="flex flex-wrap items-center justify-center gap-2 p-3 rounded-xl glass-panel border-slate-800">
          {quiz.questions.map((q, idx) => {
            const isAnswered = Boolean(answers[q.id.toString()]);
            const isCurrent = currentIdx === idx;
            return (
              <button
                key={q.id}
                onClick={() => setCurrentIdx(idx)}
                className={`w-8 h-8 rounded-lg font-bold text-xs transition-all cursor-pointer ${
                  isCurrent
                    ? 'bg-cyan-500 text-black ring-2 ring-cyan-300'
                    : isAnswered
                    ? 'bg-purple-900/60 border border-purple-500/50 text-purple-200'
                    : 'bg-slate-900 text-slate-500 border border-slate-800'
                }`}
              >
                {idx + 1}
              </button>
            );
          })}
        </div>
      </div>

      {/* Confirmation Modal */}
      <Modal
        isOpen={isConfirmModalOpen}
        onClose={() => setIsConfirmModalOpen(false)}
        title="Submit Quiz for Grading?"
      >
        <div className="space-y-4 text-xs text-slate-300">
          <p>
            You have answered <strong className="text-white">{answeredCount}</strong> out of{' '}
            <strong className="text-white">{totalQuestions}</strong> questions.
          </p>
          {answeredCount < totalQuestions && (
            <div className="p-3 rounded-xl bg-amber-950/40 border border-amber-500/30 text-amber-300 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>You have unanswered questions. Are you sure you want to submit?</span>
            </div>
          )}
          <div className="flex items-center justify-end gap-2 pt-2">
            <Button variant="ghost" size="sm" onClick={() => setIsConfirmModalOpen(false)}>
              Keep Reviewing
            </Button>
            <Button variant="glow" size="sm" onClick={handleConfirmSubmit} isLoading={isSubmitting}>
              Confirm & Submit
            </Button>
          </div>
        </div>
      </Modal>
    </PageContainer>
  );
};

export default StudentQuizAttempt;
