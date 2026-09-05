import React, { useState, useEffect } from 'react';
import {
  Award,
  Sparkles,
  CheckCircle2,
  Lock,
  Flame,
  Zap,
  Shield,
  Cpu,
  BookOpen,
  Trophy,
  Filter,
} from 'lucide-react';
import PageContainer from '../../components/common/PageContainer';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import ProgressBar from '../../components/common/ProgressBar';
import LoadingState from '../../components/common/LoadingState';
import {
  achievementService,
  AchievementProgressResponse,
  AchievementItem,
} from '../../services/achievementService';

export const StudentAchievements: React.FC = () => {
  const [data, setData] = useState<AchievementProgressResponse | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchAchievements = async () => {
    try {
      setIsLoading(true);
      const res = await achievementService.getAchievementProgress();
      setData(res);
    } catch (err) {
      console.error('Failed to load achievement progress:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAchievements();
  }, []);

  if (isLoading) {
    return (
      <PageContainer title="Achievements" subtitle="Loading badges...">
        <LoadingState message="Evaluating quantum credentials and badges..." />
      </PageContainer>
    );
  }

  const getIcon = (iconName: string, isUnlocked: boolean) => {
    const className = `w-6 h-6 ${isUnlocked ? 'text-cyan-300' : 'text-slate-500'}`;
    switch (iconName) {
      case 'Flame':
        return <Flame className={`w-6 h-6 ${isUnlocked ? 'text-amber-400' : 'text-slate-500'}`} />;
      case 'Cpu':
        return <Cpu className={className} />;
      case 'BookOpen':
        return <BookOpen className={className} />;
      case 'Trophy':
        return <Trophy className={`w-6 h-6 ${isUnlocked ? 'text-yellow-400' : 'text-slate-500'}`} />;
      case 'Sparkles':
        return <Sparkles className={`w-6 h-6 ${isUnlocked ? 'text-purple-400' : 'text-slate-500'}`} />;
      case 'Shield':
        return <Shield className={className} />;
      default:
        return <Award className={className} />;
    }
  };

  const categories = ['All', 'Foundation', 'Playground', 'Assessment', 'Streak', 'Mastery'];

  const filteredAchievements = data?.achievements.filter((a) => {
    if (selectedCategory === 'All') return true;
    return a.badge_category.toLowerCase() === selectedCategory.toLowerCase();
  }) || [];

  return (
    <PageContainer
      title="Quantum Mastery Badges & Achievements"
      subtitle="Unlock verified quantum credentials and track your milestones across circuits, assessments, and learning streaks."
      badge={<Badge variant="cyan" size="sm">Credentials</Badge>}
    >
      <div className="space-y-8">
        {/* Top Summary Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <Card variant="glass" className="p-5 border-cyan-500/20 space-y-1">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-xs font-medium">Badges Unlocked</span>
              <Trophy className="w-4 h-4 text-cyan-400" />
            </div>
            <div className="text-2xl font-black text-white font-mono">
              {data?.total_unlocked || 0} / {data?.total_achievements || 11}
            </div>
            <p className="text-[11px] text-cyan-300">
              {Math.round(((data?.total_unlocked || 0) / (data?.total_achievements || 11)) * 100)}% Completed
            </p>
          </Card>

          <Card variant="glass" className="p-5 border-emerald-500/20 space-y-1">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-xs font-medium">Achievement Points</span>
              <Zap className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-2xl font-black text-emerald-400 font-mono">
              +{data?.total_points_earned || 0} XP
            </div>
            <p className="text-[11px] text-slate-400">Bonus points awarded</p>
          </Card>

          <Card variant="glass" className="p-5 border-amber-500/20 space-y-1">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-xs font-medium">Current Streak</span>
              <Flame className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-2xl font-black text-amber-400 font-mono">
              {data?.current_streak || 1} Days
            </div>
            <p className="text-[11px] text-slate-400">Active learning run</p>
          </Card>

          <Card variant="glass" className="p-5 border-purple-500/20 space-y-1">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-xs font-medium">Longest Streak</span>
              <Sparkles className="w-4 h-4 text-purple-400" />
            </div>
            <div className="text-2xl font-black text-purple-400 font-mono">
              {data?.longest_streak || 1} Days
            </div>
            <p className="text-[11px] text-slate-400">Personal best record</p>
          </Card>
        </div>

        {/* Category Filters */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-900 border border-slate-800">
            {categories.map((cat) => (
              <Button
                key={cat}
                variant={selectedCategory === cat ? 'primary' : 'ghost'}
                size="xs"
                onClick={() => setSelectedCategory(cat)}
              >
                {cat}
              </Button>
            ))}
          </div>

          <span className="text-xs text-slate-400">
            Showing {filteredAchievements.length} of {data?.total_achievements || 11} badges
          </span>
        </div>

        {/* Badges Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAchievements.map((badge) => (
            <Card
              key={badge.id}
              variant={badge.is_unlocked ? 'glow' : 'glass'}
              className={`p-6 flex flex-col justify-between transition-all duration-300 ${
                badge.is_unlocked
                  ? 'border-cyan-500/40'
                  : 'border-slate-800 bg-slate-900/40 opacity-80'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div
                    className={`p-3 rounded-2xl border ${
                      badge.is_unlocked
                        ? 'bg-cyan-950/80 border-cyan-400/50'
                        : 'bg-slate-900/90 border-slate-800'
                    }`}
                  >
                    {getIcon(badge.icon, badge.is_unlocked)}
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="purple" size="xs">
                      +{badge.points} XP
                    </Badge>
                    <Badge variant={badge.is_unlocked ? 'emerald' : 'slate'} size="xs">
                      {badge.is_unlocked ? 'Unlocked' : 'Locked'}
                    </Badge>
                  </div>
                </div>

                <h3 className="text-base font-bold text-white mb-1.5">{badge.title}</h3>
                <p className="text-xs text-slate-400 leading-relaxed mb-4">{badge.description}</p>
              </div>

              <div className="pt-3 border-t border-white/5 space-y-2">
                {badge.is_unlocked ? (
                  <div className="flex items-center justify-between text-[11px] text-emerald-400">
                    <span className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Completed
                    </span>
                    {badge.earned_at && (
                      <span className="text-slate-500 font-mono">
                        {new Date(badge.earned_at).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                ) : (
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-[11px]">
                      <span className="text-slate-400 flex items-center gap-1">
                        <Lock className="w-3 h-3 text-slate-500" /> Progress
                      </span>
                      <span className="font-mono text-cyan-400">
                        {badge.progress_current} / {badge.criteria_threshold} ({badge.progress_percentage}%)
                      </span>
                    </div>
                    <ProgressBar value={badge.progress_percentage} size="sm" variant="gradient" />
                  </div>
                )}

                <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono pt-1">
                  <span className="uppercase tracking-wider">{badge.badge_category}</span>
                  <span>Criteria: {badge.criteria_type}</span>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </PageContainer>
  );
};

export default StudentAchievements;
