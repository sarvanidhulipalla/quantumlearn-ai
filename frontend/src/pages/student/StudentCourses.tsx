import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Search,
  BookOpen,
  Clock,
  ChevronRight,
  Layers,
  Sparkles,
  Play,
  CheckCircle2,
} from 'lucide-react';
import { courseService } from '../../services/courseService';
import { CourseListItem } from '../../types/course';
import PageContainer from '../../components/common/PageContainer';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import ProgressBar from '../../components/common/ProgressBar';
import LoadingState from '../../components/common/LoadingState';
import ErrorState from '../../components/common/ErrorState';

export const StudentCourses: React.FC = () => {
  const [courses, setCourses] = useState<CourseListItem[]>([]);
  const [filterLevel, setFilterLevel] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fetchCourses = async () => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const data = await courseService.getCourses();
      setCourses(data);
    } catch (err) {
      console.error('Failed to load courses from API:', err);
      setErrorMsg('Failed to load live courses from server. Showing available courses.');
      // Fallback initial courses
      setCourses([
        {
          id: 1,
          title: 'Introduction to Quantum Computing',
          slug: 'intro-to-quantum',
          short_description: 'Grasp the foundational transition from classical binary logic to quantum mechanics, qubits, and state vectors.',
          level: 'Beginner',
          estimated_hours: 6.0,
          modules_count: 1,
          lessons_count: 3,
          is_enrolled: true,
          progress_percentage: 100.0,
        },
        {
          id: 2,
          title: 'Quantum Bits and Superposition',
          slug: 'qubits-and-superposition',
          short_description: 'Master the core principle of superposition, the 3D Bloch sphere representation, and quantum probability amplitudes.',
          level: 'Beginner',
          estimated_hours: 8.0,
          modules_count: 1,
          lessons_count: 3,
          is_enrolled: true,
          progress_percentage: 66.7,
        },
        {
          id: 3,
          title: 'Quantum Gates and Circuits',
          slug: 'quantum-gates-and-circuits',
          short_description: 'Explore unitary quantum gates including Pauli, Hadamard, Phase, and Controlled-NOT operators.',
          level: 'Intermediate',
          estimated_hours: 10.0,
          modules_count: 2,
          lessons_count: 4,
          is_enrolled: false,
          progress_percentage: 0.0,
        },
        {
          id: 4,
          title: 'Quantum Entanglement',
          slug: 'quantum-entanglement',
          short_description: 'Explore EPR pairs, non-locality, Bell state construction, and quantum teleportation protocols.',
          level: 'Intermediate',
          estimated_hours: 8.0,
          modules_count: 1,
          lessons_count: 2,
          is_enrolled: false,
          progress_percentage: 0.0,
        },
        {
          id: 5,
          title: 'Introduction to Quantum Algorithms',
          slug: 'quantum-algorithms',
          short_description: 'Discover quantum speedup, phase kickback, oracles, Deutsch-Jozsa, and Grover search algorithm.',
          level: 'Advanced',
          estimated_hours: 14.0,
          modules_count: 1,
          lessons_count: 3,
          is_enrolled: false,
          progress_percentage: 0.0,
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  // Filter and Search logic
  const filteredCourses = courses.filter((c) => {
    const matchesFilter = filterLevel === 'All' || c.level.toLowerCase() === filterLevel.toLowerCase();
    const matchesSearch =
      c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.short_description && c.short_description.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesFilter && matchesSearch;
  });

  const levelBadges: Record<string, 'cyan' | 'purple' | 'amber'> = {
    Beginner: 'cyan',
    Intermediate: 'purple',
    Advanced: 'amber',
  };

  return (
    <PageContainer
      title="Quantum Learning Courses"
      subtitle="Explore interactive modular courses structured from single-qubit fundamentals to multi-qubit algorithms."
      badge={<Badge variant="cyan" size="sm">{courses.length} Available Tracks</Badge>}
    >
      <div className="space-y-6">
        {errorMsg && (
          <ErrorState
            type="warning"
            message={errorMsg}
            onRetry={fetchCourses}
          />
        )}

        {/* Search & Filter Toolbar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Difficulty Filter Tabs */}
          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-900 border border-slate-800 w-full sm:w-auto overflow-x-auto">
            {['All', 'Beginner', 'Intermediate', 'Advanced'].map((lvl) => (
              <button
                key={lvl}
                onClick={() => setFilterLevel(lvl)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer select-none whitespace-nowrap ${
                  filterLevel === lvl
                    ? 'bg-cyan-950/80 text-cyan-300 border border-cyan-500/40 shadow-sm shadow-cyan-500/10'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                {lvl}
              </button>
            ))}
          </div>

          {/* Search Input */}
          <div className="relative w-full sm:w-72">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              placeholder="Search quantum courses..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#0b0f19] text-xs text-slate-100 placeholder-slate-500 rounded-xl border border-slate-700/80 pl-9 pr-3.5 py-2 focus:outline-none focus:border-cyan-400"
            />
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <LoadingState message="Loading interactive quantum courses..." />
        )}

        {/* Empty State */}
        {!isLoading && filteredCourses.length === 0 && (
          <Card variant="glass" className="p-12 text-center space-y-3">
            <BookOpen className="w-10 h-10 text-slate-500 mx-auto" />
            <h4 className="text-base font-bold text-white">No courses match your criteria</h4>
            <p className="text-xs text-slate-400">Try adjusting your search query or difficulty filter.</p>
            <Button variant="outline" size="sm" onClick={() => { setSearchQuery(''); setFilterLevel('All'); }}>
              Reset Filters
            </Button>
          </Card>
        )}

        {/* Courses Grid */}
        {!isLoading && filteredCourses.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCourses.map((course) => {
              const badgeVariant = levelBadges[course.level] || 'cyan';
              const isDone = course.progress_percentage >= 99.9;

              return (
                <Card
                  key={course.id}
                  variant="interactive"
                  padding="lg"
                  className="flex flex-col justify-between border-slate-700/80 group"
                >
                  <div>
                    {/* Header */}
                    <div className="flex items-center justify-between mb-3">
                      <Badge variant={badgeVariant} size="xs">
                        {course.level}
                      </Badge>
                      <span className="text-[11px] text-slate-400 font-mono flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        {course.estimated_hours} hrs
                      </span>
                    </div>

                    {/* Title & Description */}
                    <h3 className="text-lg font-bold text-white group-hover:text-cyan-300 transition-colors mb-2">
                      {course.title}
                    </h3>
                    <p className="text-xs text-slate-400 leading-relaxed mb-6">
                      {course.short_description}
                    </p>

                    {/* Course Metrics */}
                    <div className="flex items-center gap-4 text-xs text-slate-300 pb-4 border-b border-white/5">
                      <span className="flex items-center gap-1 text-slate-400">
                        <Layers className="w-3.5 h-3.5 text-purple-400" />
                        {course.modules_count} {course.modules_count === 1 ? 'Module' : 'Modules'}
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1 text-slate-400">
                        <BookOpen className="w-3.5 h-3.5 text-cyan-400" />
                        {course.lessons_count} Lessons
                      </span>
                    </div>

                    {/* Progress indicator if enrolled */}
                    {course.is_enrolled && (
                      <div className="mt-4 space-y-1">
                        <div className="flex justify-between text-[11px]">
                          <span className="text-slate-400 font-medium">Your Progress</span>
                          <span className={isDone ? 'text-emerald-400 font-bold' : 'text-cyan-400 font-bold'}>
                            {Math.round(course.progress_percentage)}%
                          </span>
                        </div>
                        <ProgressBar
                          value={course.progress_percentage}
                          size="sm"
                          variant={isDone ? 'cyan' : 'gradient'}
                        />
                      </div>
                    )}
                  </div>

                  {/* Footer Action */}
                  <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-between">
                    {course.is_enrolled ? (
                      isDone ? (
                        <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1">
                          <CheckCircle2 className="w-4 h-4" /> Completed
                        </span>
                      ) : (
                        <span className="text-xs text-cyan-300 font-semibold">In Progress</span>
                      )
                    ) : (
                      <span className="text-xs text-slate-400">Ready to start</span>
                    )}

                    <Link to={`/student/courses/${course.id}`}>
                      <Button
                        variant={course.is_enrolled && !isDone ? 'primary' : 'outline'}
                        size="sm"
                        rightIcon={<ChevronRight className="w-3.5 h-3.5" />}
                      >
                        {course.is_enrolled ? (isDone ? 'Review Course' : 'Continue') : 'View Course'}
                      </Button>
                    </Link>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </PageContainer>
  );
};

export default StudentCourses;
