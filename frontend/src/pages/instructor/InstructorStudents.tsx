import React, { useState, useEffect } from 'react';
import {
  Users,
  Search,
  CheckCircle2,
  AlertCircle,
  Eye,
  BookOpen,
  Award,
  Trophy,
  Clock,
  GraduationCap,
  Calendar,
  Layers,
  ChevronRight,
  TrendingUp,
} from 'lucide-react';

import PageContainer from '../../components/common/PageContainer';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import Modal from '../../components/common/Modal';
import LoadingState from '../../components/common/LoadingState';
import ErrorState from '../../components/common/ErrorState';
import ProgressBar from '../../components/common/ProgressBar';

import instructorService, {
  InstructorStudentItem,
  InstructorStudentDetail,
} from '../../services/instructorService';

export const InstructorStudents: React.FC = () => {
  const [students, setStudents] = useState<InstructorStudentItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterType, setFilterType] = useState<string>('all');

  // Selected Student Detail Modal state
  const [selectedStudent, setSelectedStudent] = useState<InstructorStudentDetail | null>(null);
  const [isLoadingDetail, setIsLoadingDetail] = useState<boolean>(false);

  const fetchStudents = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const res = await instructorService.listStudents(filterType, searchQuery);
      setStudents(res);
    } catch (err: any) {
      console.error('Failed to load students:', err);
      setError(err.response?.data?.detail || 'Failed to fetch student cohort list.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, [filterType]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchStudents();
  };

  const handleOpenStudentDetail = async (studentId: number) => {
    try {
      setIsLoadingDetail(true);
      const detail = await instructorService.getStudent(studentId);
      setSelectedStudent(detail);
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Failed to load student performance history.');
    } finally {
      setIsLoadingDetail(false);
    }
  };

  if (isLoading && !students.length) {
    return (
      <PageContainer title="Student Cohort Management" subtitle="Loading students...">
        <LoadingState message="Fetching student cohort records..." />
      </PageContainer>
    );
  }

  if (error) {
    return (
      <PageContainer title="Student Cohort Management" subtitle="Manage students">
        <ErrorState message={error} onRetry={fetchStudents} />
      </PageContainer>
    );
  }

  return (
    <PageContainer
      title="Student Cohort Management"
      subtitle="Monitor learner progress, inspect quiz mastery distributions, and identify students needing attention."
    >
      <div className="space-y-6">
        {/* Filter & Search Bar */}
        <div className="p-4 rounded-2xl glass-panel border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <form onSubmit={handleSearchSubmit} className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by student name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#090d16] text-xs text-slate-200 placeholder-slate-500 rounded-xl border border-slate-700/80 pl-9 pr-3 py-2 focus:outline-none focus:border-purple-400 transition-colors"
            />
          </form>

          <div className="flex bg-[#090d16] p-1 rounded-xl border border-slate-800 text-xs">
            {[
              { label: 'All Students', value: 'all' },
              { label: 'Active', value: 'active' },
              { label: 'Needs Attention', value: 'needs_attention' },
            ].map((f) => (
              <button
                key={f.value}
                onClick={() => setFilterType(f.value)}
                className={`px-3 py-1 rounded-lg capitalize transition-colors cursor-pointer ${
                  filterType === f.value
                    ? 'bg-purple-900/40 text-purple-300 font-semibold border border-purple-500/30'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Students Table */}
        <div className="glass-panel rounded-2xl border-slate-800 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="bg-slate-900/80 text-xs uppercase text-slate-400 border-b border-white/10">
                <tr>
                  <th className="py-3.5 px-4 font-semibold">Student</th>
                  <th className="py-3.5 px-4 font-semibold text-center">Courses</th>
                  <th className="py-3.5 px-4 font-semibold">Overall Progress</th>
                  <th className="py-3.5 px-4 font-semibold text-center">Avg Quiz Score</th>
                  <th className="py-3.5 px-4 font-semibold text-center">Challenges Solved</th>
                  <th className="py-3.5 px-4 font-semibold text-center">Status</th>
                  <th className="py-3.5 px-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {students.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-slate-500 text-xs">
                      No students found matching current filters.
                    </td>
                  </tr>
                ) : (
                  students.map((st) => (
                    <tr key={st.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-purple-500/20 to-cyan-500/20 border border-purple-500/30 flex items-center justify-center text-xs font-bold text-white">
                            {st.full_name.charAt(0)}
                          </div>
                          <div>
                            <div className="font-semibold text-white">{st.full_name}</div>
                            <div className="text-[11px] text-slate-400 font-mono">{st.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-center font-mono text-xs text-slate-300">
                        {st.enrolled_courses_count}
                      </td>
                      <td className="py-3.5 px-4 w-36">
                        <div className="space-y-1">
                          <div className="text-xs font-mono text-slate-300">{st.overall_progress}%</div>
                          <ProgressBar value={st.overall_progress} variant="purple" size="sm" />
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-center font-mono font-semibold text-cyan-400">
                        {st.avg_quiz_score}%
                      </td>
                      <td className="py-3.5 px-4 text-center font-mono text-amber-400 font-bold">
                        {st.challenges_completed}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <Badge
                          variant={st.status === 'Active' ? 'emerald' : 'rose'}
                          size="xs"
                        >
                          {st.status}
                        </Badge>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <Button
                          variant="ghost"
                          size="xs"
                          onClick={() => handleOpenStudentDetail(st.id)}
                          leftIcon={<Eye className="w-3.5 h-3.5 text-purple-400" />}
                        >
                          Inspect History
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Student Detail Modal */}
      <Modal
        isOpen={!!selectedStudent}
        onClose={() => setSelectedStudent(null)}
        title={selectedStudent ? `Student Performance: ${selectedStudent.full_name}` : 'Student History'}
        size="lg"
        footer={
          <div className="flex justify-end">
            <Button variant="outline" size="sm" onClick={() => setSelectedStudent(null)}>
              Close
            </Button>
          </div>
        }
      >
        {selectedStudent && (
          <div className="space-y-6 py-2 max-h-[70vh] overflow-y-auto pr-2">
            {/* Header Profile Info */}
            <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-purple-300 font-bold text-lg">
                  {selectedStudent.full_name.charAt(0)}
                </div>
                <div>
                  <h3 className="font-bold text-white text-base">{selectedStudent.full_name}</h3>
                  <p className="text-xs text-slate-400 font-mono">{selectedStudent.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant={selectedStudent.status === 'Active' ? 'emerald' : 'rose'} size="sm">
                  {selectedStudent.status}
                </Badge>
                <Badge variant="cyan" size="sm">
                  {selectedStudent.quantum_experience || 'Beginner'}
                </Badge>
              </div>
            </div>

            {/* Enrolled Courses */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <BookOpen className="w-4 h-4 text-purple-400" />
                <span>Enrolled Courses & Progress</span>
              </h4>
              <div className="grid grid-cols-1 gap-2.5">
                {selectedStudent.enrolled_courses.length === 0 ? (
                  <p className="text-xs text-slate-500 italic">No courses currently enrolled.</p>
                ) : (
                  selectedStudent.enrolled_courses.map((ec) => (
                    <div
                      key={ec.course_id}
                      className="p-3 rounded-xl bg-slate-950/40 border border-slate-800 flex items-center justify-between"
                    >
                      <div>
                        <div className="font-semibold text-white text-xs">{ec.title}</div>
                        <div className="text-[11px] text-slate-500">Tier: {ec.level}</div>
                      </div>
                      <div className="w-36 space-y-1 text-right">
                        <span className="text-xs font-mono font-bold text-cyan-400">
                          {ec.completed_percentage}%
                        </span>
                        <ProgressBar value={ec.completed_percentage} variant="purple" size="sm" />
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Quiz Performance History */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Award className="w-4 h-4 text-amber-400" />
                <span>Quiz Scores & Mastery History</span>
              </h4>
              <div className="grid grid-cols-1 gap-2">
                {selectedStudent.quiz_attempts.length === 0 ? (
                  <p className="text-xs text-slate-500 italic">No quiz attempts recorded yet.</p>
                ) : (
                  selectedStudent.quiz_attempts.map((qa, idx) => (
                    <div
                      key={idx}
                      className="p-2.5 rounded-xl bg-slate-950/40 border border-white/5 flex items-center justify-between text-xs"
                    >
                      <div className="font-medium text-slate-200">{qa.title}</div>
                      <div className="flex items-center gap-3">
                        <span className="font-mono font-bold text-cyan-400">
                          {qa.score_percentage}%
                        </span>
                        <Badge variant={qa.passed ? 'emerald' : 'rose'} size="xs">
                          {qa.passed ? 'Passed' : 'Failed'}
                        </Badge>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Challenge Attempts */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Trophy className="w-4 h-4 text-pink-400" />
                <span>Quantum Challenge Submissions</span>
              </h4>
              <div className="grid grid-cols-1 gap-2">
                {selectedStudent.challenge_attempts.length === 0 ? (
                  <p className="text-xs text-slate-500 italic">No challenge submissions recorded yet.</p>
                ) : (
                  selectedStudent.challenge_attempts.map((ca, idx) => (
                    <div
                      key={idx}
                      className="p-2.5 rounded-xl bg-slate-950/40 border border-white/5 flex items-center justify-between text-xs"
                    >
                      <div className="font-medium text-slate-200">{ca.title}</div>
                      <div className="flex items-center gap-3">
                        <span className="font-mono text-slate-400">
                          Fidelity: <strong className="text-white">{(ca.fidelity_score * 100).toFixed(1)}%</strong>
                        </span>
                        <Badge variant={ca.solved ? 'emerald' : 'rose'} size="xs">
                          {ca.solved ? 'Solved' : 'Attempted'}
                        </Badge>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}
      </Modal>
    </PageContainer>
  );
};

export default InstructorStudents;
