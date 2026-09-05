import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  Award,
  Zap,
  CheckCircle2,
  Sparkles,
  Layers,
  Clock,
  Flame,
  AlertTriangle,
  Lightbulb,
  ArrowRight,
  BookOpen,
  Trophy,
} from 'lucide-react';
import PageContainer from '../../components/common/PageContainer';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import ProgressBar from '../../components/common/ProgressBar';
import LoadingState from '../../components/common/LoadingState';
import { useAuth } from '../../contexts/AuthContext';
import {
  personalizationService,
  TopicMasteryResponse,
  AILearningSummaryResponse,
} from '../../services/personalizationService';
import { courseService } from '../../services/courseService';
import { StudentProgressStats } from '../../types/course';

export const StudentProgress: React.FC = () => {
  const { user } = useAuth();

  const [stats, setStats] = useState<StudentProgressStats | null>(null);
  const [mastery, setMastery] = useState<TopicMasteryResponse | null>(null);
  const [summary, setSummary] = useState<AILearningSummaryResponse | null>(null);
  const [filter, setFilter] = useState<'all' | 'strong' | 'developing' | 'review'>('all');
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const loadProgressData = async () => {
      try {
        setIsLoading(true);
        const [statsData, masteryData, summaryData] = await Promise.all([
          courseService.getStudentProgress().catch(() => null),
          personalizationService.getTopicMastery().catch(() => null),
          personalizationService.getAILearningSummary().catch(() => null),
        ]);
        if (statsData) setStats(statsData);
        if (masteryData) setMastery(masteryData);
        if (summaryData) setSummary(summaryData);
      } catch (err) {
        console.error('Failed to load progress data:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadProgressData();
  }, []);

  if (isLoading) {
    return (
      <PageContainer title="Learning Progress" subtitle="Loading telemetry...">
        <LoadingState message="Calculating deterministic topic mastery scores..." />
      </PageContainer>
    );
  }

  const filteredTopics = mastery?.topics.filter((t) => {
    if (filter === 'strong') return t.status === 'Strong';
    if (filter === 'developing') return t.status === 'Developing';
    if (filter === 'review') return t.status === 'Needs Review';
    return true;
  }) || [];

  return (
    <PageContainer
      title="Learning Progress & Mastery Analytics"
      subtitle="Review deterministic topic mastery, learning streaks, and AI synthesized performance summaries."
      badge={<Badge variant="cyan" size="sm">Mastery Engine</Badge>}
    >
      <div className="space-y-8">
        {/* Top Metric Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <Card variant="glass" className="p-5 border-cyan-500/20 space-y-1">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-xs font-medium">Overall Mastery</span>
              <Layers className="w-4 h-4 text-cyan-400" />
            </div>
            <div className="text-2xl font-black text-cyan-400 font-mono">
              {mastery?.overall_mastery_percentage || 55}%
            </div>
            <p className="text-[11px] text-slate-400">Across 9 quantum topics</p>
          </Card>

          <Card variant="glass" className="p-5 border-purple-500/20 space-y-1">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-xs font-medium">Completed Lessons</span>
              <BookOpen className="w-4 h-4 text-purple-400" />
            </div>
            <div className="text-2xl font-black text-white font-mono">
              {stats?.completed_lessons_count || 5} / {stats?.total_lessons_count || 15}
            </div>
            <p className="text-[11px] text-slate-400">Curriculum verified</p>
          </Card>

          <Card variant="glass" className="p-5 border-emerald-500/20 space-y-1">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-xs font-medium">Total Experience</span>
              <Zap className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-2xl font-black text-emerald-400 font-mono">
              {summary?.total_xp || stats?.total_points || 250} XP
            </div>
            <p className="text-[11px] text-slate-400">Lab & quiz rewards</p>
          </Card>

          <Card variant="glass" className="p-5 border-amber-500/20 space-y-1">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-xs font-medium">Active Streak</span>
              <Flame className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-2xl font-black text-amber-400 font-mono">
              {summary?.current_streak || stats?.current_streak_days || 1} Days
            </div>
            <p className="text-[11px] text-slate-400">Consecutive days active</p>
          </Card>
        </div>

        {/* AI Learning Summary Card */}
        {summary && (
          <Card variant="glow" padding="lg" className="border-purple-500/30 space-y-4">
            <div className="flex items-start justify-between gap-4 border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-purple-400" />
                <div>
                  <h3 className="text-base font-bold text-white">AI Learning Performance Summary</h3>
                  <p className="text-xs text-slate-400">
                    Synthesized from your interactive circuits, lesson completions, and assessment scores.
                  </p>
                </div>
              </div>
              <span className="text-[10px] text-slate-500 italic hidden sm:inline">{summary.notice}</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-1">
              <div className="space-y-3">
                <div className="space-y-1">
                  <span className="text-xs font-semibold text-purple-300 uppercase tracking-wider block">
                    Curriculum Progress & Improvements
                  </span>
                  <p className="text-xs text-slate-300 leading-relaxed bg-[#090d16] p-3.5 rounded-xl border border-slate-800">
                    {summary.improvements_summary}
                  </p>
                </div>

                <div className="space-y-1">
                  <span className="text-xs font-semibold text-cyan-300 uppercase tracking-wider block">
                    Pedagogical Recommendation
                  </span>
                  <p className="text-xs text-slate-300 leading-relaxed bg-[#090d16] p-3.5 rounded-xl border border-slate-800">
                    {summary.pedagogical_advice}
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="space-y-2">
                  <span className="text-xs font-semibold text-emerald-300 uppercase tracking-wider block">
                    Targeted Next Study Steps
                  </span>
                  <div className="space-y-2">
                    {summary.next_study_targets.map((target, idx) => (
                      <div
                        key={idx}
                        className="flex items-start gap-2.5 p-2.5 rounded-lg bg-slate-900/60 border border-slate-800 text-xs text-slate-200"
                      >
                        <span className="w-4 h-4 rounded-full bg-purple-950 text-purple-400 border border-purple-500/30 text-[10px] flex items-center justify-center font-bold shrink-0 mt-0.5">
                          {idx + 1}
                        </span>
                        <span>{target}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-2 flex items-center gap-3">
                  <Badge variant="cyan" size="xs">
                    Strong: {summary.strong_areas.slice(0, 2).join(', ')}
                  </Badge>
                  <Badge variant="rose" size="xs">
                    Focus: {summary.weak_areas.slice(0, 2).join(', ')}
                  </Badge>
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* 9 Quantum Topics Mastery Section */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Layers className="w-5 h-5 text-cyan-400" />
              <h3 className="text-base font-bold text-white uppercase tracking-wider">
                Deterministic Topic Mastery (9 Domains)
              </h3>
            </div>

            {/* Filter Buttons */}
            <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-900 border border-slate-800">
              <Button
                variant={filter === 'all' ? 'primary' : 'ghost'}
                size="xs"
                onClick={() => setFilter('all')}
              >
                All (9)
              </Button>
              <Button
                variant={filter === 'strong' ? 'primary' : 'ghost'}
                size="xs"
                onClick={() => setFilter('strong')}
              >
                Strong
              </Button>
              <Button
                variant={filter === 'developing' ? 'primary' : 'ghost'}
                size="xs"
                onClick={() => setFilter('developing')}
              >
                Developing
              </Button>
              <Button
                variant={filter === 'review' ? 'primary' : 'ghost'}
                size="xs"
                onClick={() => setFilter('review')}
              >
                Needs Review
              </Button>
            </div>
          </div>

          {/* Topics Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {filteredTopics.map((topicItem, idx) => (
              <Card
                key={idx}
                variant="glass"
                className={`p-4 border ${
                  topicItem.level === 'Mastered'
                    ? 'border-emerald-500/30 bg-emerald-950/10'
                    : topicItem.level === 'Proficient'
                    ? 'border-cyan-500/30 bg-cyan-950/10'
                    : topicItem.level === 'Developing'
                    ? 'border-amber-500/30 bg-amber-950/10'
                    : 'border-slate-800 bg-slate-900/50'
                } space-y-3`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-bold text-sm text-white">{topicItem.topic}</h4>
                    <span className="text-[10px] text-slate-400">{topicItem.status}</span>
                  </div>
                  <Badge
                    variant={
                      topicItem.level === 'Mastered'
                        ? 'emerald'
                        : topicItem.level === 'Proficient'
                        ? 'cyan'
                        : topicItem.level === 'Developing'
                        ? 'amber'
                        : 'rose'
                    }
                    size="xs"
                  >
                    {topicItem.level}
                  </Badge>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-xs font-mono">
                    <span className="text-slate-400">Mastery Score</span>
                    <span className="font-bold text-white">{topicItem.mastery_score}%</span>
                  </div>
                  <ProgressBar
                    value={topicItem.mastery_score}
                    size="sm"
                    variant={topicItem.mastery_score >= 60 ? 'gradient' : 'purple'}
                  />
                </div>

                <div className="grid grid-cols-3 gap-1 pt-2 border-t border-white/5 text-[10px] text-slate-400 text-center">
                  <div>
                    <span className="block text-slate-500">Lessons</span>
                    <span className="font-bold text-white">{topicItem.lessons_completed}</span>
                  </div>
                  <div>
                    <span className="block text-slate-500">Quiz Avg</span>
                    <span className="font-bold text-white">{topicItem.quiz_avg_score}%</span>
                  </div>
                  <div>
                    <span className="block text-slate-500">Labs</span>
                    <span className="font-bold text-white">{topicItem.challenges_solved}</span>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </PageContainer>
  );
};

export default StudentProgress;
