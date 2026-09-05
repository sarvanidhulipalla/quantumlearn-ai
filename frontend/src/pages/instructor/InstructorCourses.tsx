import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BookOpen,
  Plus,
  Search,
  CheckCircle2,
  AlertCircle,
  Eye,
  Edit,
  Trash2,
  Clock,
  Layers,
  Users,
  TrendingUp,
  FileCheck,
  Globe,
  Lock,
} from 'lucide-react';

import PageContainer from '../../components/common/PageContainer';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import Modal from '../../components/common/Modal';
import LoadingState from '../../components/common/LoadingState';
import ErrorState from '../../components/common/ErrorState';
import ProgressBar from '../../components/common/ProgressBar';

import instructorService, { InstructorCourse } from '../../services/instructorService';

export const InstructorCourses: React.FC = () => {
  const navigate = useNavigate();

  const [courses, setCourses] = useState<InstructorCourse[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'published' | 'draft'>('all');

  // Confirmation Modal state
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    confirmLabel: string;
    isDestructive: boolean;
    onConfirm: () => Promise<void>;
  }>({
    isOpen: false,
    title: '',
    message: '',
    confirmLabel: 'Confirm',
    isDestructive: false,
    onConfirm: async () => {},
  });

  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  const fetchCourses = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const res = await instructorService.listCourses();
      setCourses(res);
    } catch (err: any) {
      console.error('Failed to fetch instructor courses:', err);
      setError(err.response?.data?.detail || 'Failed to load courses.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  // Filtered courses
  const filteredCourses = courses.filter((c) => {
    const matchesSearch =
      c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus =
      statusFilter === 'all' ||
      (statusFilter === 'published' && c.is_published) ||
      (statusFilter === 'draft' && !c.is_published);
    return matchesSearch && matchesStatus;
  });

  const handleTogglePublish = (course: InstructorCourse) => {
    const nextState = !course.is_published;
    setConfirmModal({
      isOpen: true,
      title: nextState ? `Publish Course: ${course.title}?` : `Unpublish Course: ${course.title}?`,
      message: nextState
        ? 'Publishing this course makes all its published modules and lessons visible to students in the course catalog.'
        : 'Unpublishing this course will hide it and its lessons from student enrollment.',
      confirmLabel: nextState ? 'Publish Course' : 'Unpublish Course',
      isDestructive: !nextState,
      onConfirm: async () => {
        try {
          setIsProcessing(true);
          if (nextState) {
            await instructorService.publishCourse(course.id);
          } else {
            await instructorService.unpublishCourse(course.id);
          }
          await fetchCourses();
          setConfirmModal((prev) => ({ ...prev, isOpen: false }));
        } catch (err: any) {
          alert(err.response?.data?.detail || 'Failed to change publication status.');
        } finally {
          setIsProcessing(false);
        }
      },
    });
  };

  const handleDeleteCourse = (course: InstructorCourse) => {
    setConfirmModal({
      isOpen: true,
      title: `Delete Course: ${course.title}?`,
      message:
        'Are you sure you want to delete this course? This will permanently remove all modules, lessons, and student progress associated with it. This action cannot be undone.',
      confirmLabel: 'Delete Course',
      isDestructive: true,
      onConfirm: async () => {
        try {
          setIsProcessing(true);
          await instructorService.deleteCourse(course.id);
          await fetchCourses();
          setConfirmModal((prev) => ({ ...prev, isOpen: false }));
        } catch (err: any) {
          alert(err.response?.data?.detail || 'Failed to delete course.');
        } finally {
          setIsProcessing(false);
        }
      },
    });
  };

  if (isLoading) {
    return (
      <PageContainer title="Course Management" subtitle="Loading curriculum...">
        <LoadingState message="Fetching instructor courses..." />
      </PageContainer>
    );
  }

  if (error) {
    return (
      <PageContainer title="Course Management" subtitle="Manage courses">
        <ErrorState message={error} onRetry={fetchCourses} />
      </PageContainer>
    );
  }

  return (
    <PageContainer
      title="Course Management"
      subtitle="Author, publish, and manage quantum curricula and structured learning paths."
      actions={
        <Button
          variant="primary"
          size="sm"
          onClick={() => navigate('/instructor/courses/create')}
          leftIcon={<Plus className="w-4 h-4" />}
        >
          Create Course
        </Button>
      }
    >
      <div className="space-y-6">
        {/* Filter & Search Bar */}
        <div className="p-4 rounded-2xl glass-panel border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search course title or description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#090d16] text-xs text-slate-200 placeholder-slate-500 rounded-xl border border-slate-700/80 pl-9 pr-3 py-2 focus:outline-none focus:border-purple-400 transition-colors"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <span className="text-xs text-slate-400 hidden sm:inline">Status:</span>
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
        </div>

        {/* Courses Table / Cards */}
        {filteredCourses.length === 0 ? (
          <Card variant="glass" padding="lg" className="text-center py-12 space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 mx-auto">
              <BookOpen className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-white">No Courses Found</h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              {searchQuery
                ? `No courses matching "${searchQuery}".`
                : 'You have not created any courses in this filter tier.'}
            </p>
            <Button
              variant="primary"
              size="sm"
              onClick={() => navigate('/instructor/courses/create')}
              leftIcon={<Plus className="w-4 h-4" />}
            >
              Create New Course
            </Button>
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {filteredCourses.map((c) => (
              <div
                key={c.id}
                className="p-5 rounded-2xl glass-panel border-slate-800 hover:border-purple-500/30 transition-all space-y-4"
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  {/* Title & Metadata */}
                  <div className="space-y-1.5 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-base font-bold text-white tracking-tight">{c.title}</h3>
                      <Badge
                        variant={c.is_published ? 'emerald' : 'amber'}
                        size="xs"
                      >
                        {c.is_published ? (
                          <span className="flex items-center gap-1">
                            <Globe className="w-3 h-3" /> Published
                          </span>
                        ) : (
                          <span className="flex items-center gap-1">
                            <Lock className="w-3 h-3" /> Draft
                          </span>
                        )}
                      </Badge>
                      <Badge variant="cyan" size="xs">
                        {c.level}
                      </Badge>
                      <span className="text-xs text-slate-400 flex items-center gap-1">
                        <Clock className="w-3 h-3 text-slate-500" /> {c.estimated_hours} Hours
                      </span>
                    </div>
                    <p className="text-xs text-slate-300 line-clamp-2">{c.description}</p>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-2 shrink-0">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigate(`/courses/${c.id}`)}
                      leftIcon={<Eye className="w-3.5 h-3.5" />}
                    >
                      Preview
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigate(`/instructor/courses/create?edit=${c.id}`)}
                      leftIcon={<Edit className="w-3.5 h-3.5 text-purple-400" />}
                    >
                      Edit & Curriculum
                    </Button>
                    <Button
                      variant={c.is_published ? 'secondary' : 'primary'}
                      size="sm"
                      onClick={() => handleTogglePublish(c)}
                    >
                      {c.is_published ? 'Unpublish' : 'Publish'}
                    </Button>
                    <button
                      onClick={() => handleDeleteCourse(c)}
                      className="p-2 rounded-xl text-rose-400 hover:text-white hover:bg-rose-950/40 border border-rose-500/20 transition-colors cursor-pointer"
                      title="Delete Course"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Course Metrics Footer */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-white/5 text-xs text-slate-400">
                  <div className="flex items-center gap-2">
                    <Layers className="w-4 h-4 text-purple-400" />
                    <span>
                      Modules: <strong className="text-white">{c.modules_count || 0}</strong>
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <FileCheck className="w-4 h-4 text-blue-400" />
                    <span>
                      Lessons: <strong className="text-white">{c.lessons_count || 0}</strong>
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-emerald-400" />
                    <span>
                      Students Enrolled: <strong className="text-white">{c.students_count || 0}</strong>
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-cyan-400" />
                    <span>
                      Avg Completion: <strong className="text-white">{c.avg_completion_percentage || 0}%</strong>
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Confirmation Modal */}
      <Modal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal((prev) => ({ ...prev, isOpen: false }))}
        title={confirmModal.title}
        size="md"
        footer={
          <div className="flex justify-end gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setConfirmModal((prev) => ({ ...prev, isOpen: false }))}
              disabled={isProcessing}
            >
              Cancel
            </Button>
            <Button
              variant={confirmModal.isDestructive ? 'primary' : 'secondary'}
              size="sm"
              onClick={confirmModal.onConfirm}
              isLoading={isProcessing}
              className={confirmModal.isDestructive ? 'bg-rose-600 hover:bg-rose-700 text-white' : ''}
            >
              {confirmModal.confirmLabel}
            </Button>
          </div>
        }
      >
        <div className="py-2 text-sm text-slate-300 space-y-2">
          <p>{confirmModal.message}</p>
        </div>
      </Modal>
    </PageContainer>
  );
};

export default InstructorCourses;
