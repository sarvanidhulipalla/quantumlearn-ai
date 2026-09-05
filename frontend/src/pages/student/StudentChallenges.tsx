import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Zap,
  Award,
  CheckCircle2,
  AlertCircle,
  Play,
  Sparkles,
  Flame,
  Search,
  Filter,
  Cpu,
  ShieldCheck,
} from 'lucide-react';
import { challengeService, ChallengeSummary } from '../../services/challengeService';
import PageContainer from '../../components/common/PageContainer';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import LoadingState from '../../components/common/LoadingState';
import ErrorState from '../../components/common/ErrorState';

export const StudentChallenges: React.FC = () => {
  const navigate = useNavigate();
  const [challenges, setChallenges] = useState<ChallengeSummary[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('All');
  const [searchTerm, setSearchTerm] = useState<string>('');

  useEffect(() => {
    fetchChallenges();
  }, []);

  const fetchChallenges = async () => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const data = await challengeService.getChallenges();
      setChallenges(data);
    } catch (err: any) {
      console.error('Failed to load quantum challenges:', err);
      setErrorMsg('Could not load quantum challenges. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const filteredChallenges = challenges.filter((c) => {
    const matchesDifficulty =
      selectedDifficulty === 'All' || c.difficulty.toLowerCase() === selectedDifficulty.toLowerCase();
    const matchesSearch =
      c.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesDifficulty && matchesSearch;
  });

  if (isLoading) {
    return (
      <PageContainer title="Quantum Algorithm Challenges" subtitle="Solve interactive circuit puzzles with automated validation.">
        <LoadingState message="Loading quantum challenges..." />
      </PageContainer>
    );
  }

  if (errorMsg) {
    return (
      <PageContainer title="Quantum Algorithm Challenges" subtitle="Solve interactive circuit puzzles with automated validation.">
        <ErrorState title="Failed to Load Challenges" message={errorMsg} onRetry={fetchChallenges} />
      </PageContainer>
    );
  }

  return (
    <PageContainer
      title="Quantum Algorithm Challenges"
      subtitle="Hands-on quantum circuit puzzles evaluated deterministically on Qiskit Aer simulation."
      badge={<Badge variant="cyan" size="sm">Automated Evaluation</Badge>}
    >
      <div className="space-y-6">
        {/* Filter and Search Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl glass-panel border-slate-800">
          {/* Difficulty Tabs */}
          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-950 border border-slate-800 w-full sm:w-auto overflow-x-auto">
            {['All', 'Beginner', 'Intermediate', 'Advanced'].map((diff) => (
              <button
                key={diff}
                onClick={() => setSelectedDifficulty(diff)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                  selectedDifficulty === diff
                    ? 'bg-gradient-to-r from-purple-700 to-indigo-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {diff}
              </button>
            ))}
          </div>

          {/* Search Input */}
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search challenges..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[#080c14] text-xs text-white placeholder-slate-500 rounded-xl pl-9 pr-4 py-2 border border-slate-800 focus:outline-none focus:border-cyan-400 transition-colors"
            />
          </div>
        </div>

        {/* Challenge Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredChallenges.length === 0 ? (
            <div className="col-span-full text-center py-12 glass-panel rounded-2xl p-8 border-slate-800 text-slate-500">
              <Zap className="w-12 h-12 mx-auto mb-3 text-slate-600 opacity-60" />
              <p className="text-sm font-semibold text-slate-300">No challenges found matching your filters.</p>
            </div>
          ) : (
            filteredChallenges.map((ch) => {
              const diffColor =
                ch.difficulty === 'Beginner'
                  ? 'cyan'
                  : ch.difficulty === 'Intermediate'
                  ? 'purple'
                  : 'pink';

              return (
                <Card
                  key={ch.id}
                  variant="glass"
                  padding="lg"
                  className="flex flex-col justify-between hover:border-cyan-500/40 transition-all group"
                >
                  <div className="space-y-4">
                    {/* Header Badges */}
                    <div className="flex items-center justify-between">
                      <Badge variant={diffColor as any} size="xs">
                        {ch.difficulty}
                      </Badge>

                      {ch.is_solved ? (
                        <Badge variant="emerald" size="xs">
                          <CheckCircle2 className="w-3 h-3 mr-1" /> Solved
                        </Badge>
                      ) : ch.attempt_count > 0 ? (
                        <Badge variant="amber" size="xs">
                          <AlertCircle className="w-3 h-3 mr-1" /> Attempted
                        </Badge>
                      ) : (
                        <Badge variant="slate" size="xs">
                          Unsolved
                        </Badge>
                      )}
                    </div>

                    {/* Title & Description */}
                    <div>
                      <span className="text-[10px] uppercase font-bold text-cyan-400 tracking-wider">
                        {ch.category}
                      </span>
                      <h3 className="text-base font-bold text-white group-hover:text-cyan-300 transition-colors mt-0.5">
                        {ch.title}
                      </h3>
                      <p className="text-xs text-slate-400 line-clamp-3 mt-1.5 leading-relaxed">
                        {ch.description}
                      </p>
                    </div>

                    {/* Reward & Fidelity Stats */}
                    <div className="grid grid-cols-2 gap-2 pt-2 text-[11px] text-slate-400 border-t border-white/5">
                      <div className="flex items-center gap-1.5 font-semibold text-amber-300">
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>+{ch.points_reward} XP</span>
                      </div>

                      {ch.is_solved && (
                        <div className="flex items-center gap-1.5 text-emerald-400 font-semibold">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Fidelity: {Math.round(ch.best_fidelity * 100)}%</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Action Button */}
                  <div className="pt-5 mt-4 border-t border-white/5">
                    <Button
                      variant={ch.is_solved ? 'outline' : 'glow'}
                      size="sm"
                      className="w-full"
                      onClick={() => navigate(`/student/challenges/${ch.id}`)}
                      rightIcon={<Play className="w-3.5 h-3.5 fill-current" />}
                    >
                      {ch.is_solved ? 'Solve Again' : 'Solve Challenge'}
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

export default StudentChallenges;
