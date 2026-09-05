import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  HelpCircle,
  Clock,
  Award,
  CheckCircle2,
  AlertCircle,
  Play,
  RotateCcw,
  Search,
  Sparkles,
  Flame,
  ShieldCheck,
} from 'lucide-react';
import { quizService, QuizSummary } from '../../services/quizService';
import PageContainer from '../../components/common/PageContainer';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import LoadingState from '../../components/common/LoadingState';
import ErrorState from '../../components/common/ErrorState';

export const StudentQuizzes: React.FC = () => {
  const navigate = useNavigate();
  const [quizzes, setQuizzes] = useState<QuizSummary[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filterDifficulty, setFilterDifficulty] = useState<string>('all');

  useEffect(() => {
    fetchQuizzes();
  }, []);

  const fetchQuizzes = async () => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const data = await quizService.getQuizzes();
      setQuizzes(data);
    } catch (err: any) {
      console.error('Failed to load quizzes:', err);
      setErrorMsg('Could not load quizzes. Please check your network connection.');
    } finally {
      setIsLoading(false);
    }
  };

  const filteredQuizzes = quizzes.filter((q) => {
    const matchesSearch =
      q.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (q.description && q.description.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesSearch;
  });

  if (isLoading) {
    return (
      <PageContainer title="Quantum Assessments" subtitle="Validate your quantum computing knowledge with interactive quizzes.">
        <LoadingState message="Loading quizzes and assessment catalog..." />
      </PageContainer>
    );
  }

  if (errorMsg) {
    return (
      <PageContainer title="Quantum Assessments" subtitle="Validate your quantum computing knowledge with interactive quizzes.">
        <ErrorState title="Failed to Load Quizzes" message={errorMsg} onRetry={fetchQuizzes} />
      </PageContainer>
    );
  }

  return (
    <PageContainer
      title="Quantum Assessments & Quizzes"
      subtitle="Test your conceptual understanding of quantum gates, superposition, and entanglement with instant feedback."
      badge={<Badge variant="purple" size="sm">Graded Assessments</Badge>}
    >
      <div className="space-y-6">
        {/* Search and Filters Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl glass-panel border-slate-800">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search quizzes by topic..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[#080c14] text-xs text-white placeholder-slate-500 rounded-xl pl-9 pr-4 py-2.5 border border-slate-800 focus:outline-none focus:border-cyan-400 transition-colors"
            />
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-400">
            <ShieldCheck className="w-4 h-4 text-cyan-400" />
            <span>Authoritative backend grading with full explanations</span>
          </div>
        </div>

        {/* Quizzes Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredQuizzes.length === 0 ? (
            <div className="col-span-full text-center py-12 text-slate-500 glass-panel rounded-2xl p-8 border-slate-800">
              <HelpCircle className="w-12 h-12 mx-auto mb-3 text-slate-600 opacity-60" />
              <p className="text-sm font-semibold text-slate-300">No quizzes match your search.</p>
              <p className="text-xs text-slate-500 mt-1">Try searching for other quantum topics or clear your filter.</p>
            </div>
          ) : (
            filteredQuizzes.map((quiz) => {
              const hasAttempted = quiz.attempt_count > 0;
              return (
                <Card
                  key={quiz.id}
                  variant="glass"
                  padding="lg"
                  className="flex flex-col justify-between hover:border-cyan-500/40 transition-all group"
                >
                  <div className="space-y-4">
                    {/* Header Badges */}
                    <div className="flex items-center justify-between">
                      <Badge variant="cyan" size="xs">
                        {quiz.question_count} Questions
                      </Badge>

                      {quiz.is_passed ? (
                        <Badge variant="emerald" size="xs">
                          <CheckCircle2 className="w-3 h-3 mr-1" /> Passed
                        </Badge>
                      ) : hasAttempted ? (
                        <Badge variant="amber" size="xs">
                          <AlertCircle className="w-3 h-3 mr-1" /> In Progress
                        </Badge>
                      ) : (
                        <Badge variant="slate" size="xs">
                          Not Started
                        </Badge>
                      )}
                    </div>

                    {/* Title & Description */}
                    <div>
                      <h3 className="text-base font-bold text-white group-hover:text-cyan-300 transition-colors">
                        {quiz.title}
                      </h3>
                      <p className="text-xs text-slate-400 line-clamp-2 mt-1.5 leading-relaxed">
                        {quiz.description || 'Test your knowledge on core quantum principles and circuits.'}
                      </p>
                    </div>

                    {/* Stats List */}
                    <div className="grid grid-cols-2 gap-2 pt-2 text-[11px] text-slate-400 border-t border-white/5">
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-cyan-400" />
                        <span>~{quiz.time_limit_minutes} mins</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Award className="w-3.5 h-3.5 text-purple-400" />
                        <span>Pass: {quiz.passing_score_percentage}%</span>
                      </div>
                      {hasAttempted && (
                        <>
                          <div className="flex items-center gap-1.5 text-slate-300">
                            <span>Attempts: {quiz.attempt_count}</span>
                          </div>
                          <div className="flex items-center gap-1.5 font-bold text-emerald-400">
                            <span>Best: {quiz.best_score}%</span>
                          </div>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Start / Retake Action Button */}
                  <div className="pt-5 mt-4 border-t border-white/5">
                    <Button
                      variant={quiz.is_passed ? 'outline' : 'glow'}
                      size="sm"
                      className="w-full"
                      onClick={() => navigate(`/student/quizzes/${quiz.id}`)}
                      rightIcon={quiz.is_passed ? <RotateCcw className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 fill-current" />}
                    >
                      {quiz.is_passed ? 'Retake Quiz' : hasAttempted ? 'Continue Quiz' : 'Start Quiz'}
                    </Button>
                  </div>
                </Card>
              );
            })
          )}
        </div>
      </div>
    </PageContainer>
  );
};

export default StudentQuizzes;
