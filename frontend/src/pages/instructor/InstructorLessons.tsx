import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  FileText,
  Plus,
  Search,
  CheckCircle2,
  AlertCircle,
  Eye,
  Edit2,
  Trash2,
  Clock,
  BookOpen,
  Layers,
  Globe,
  Lock,
  Sparkles,
  Save,
  Code,
  Cpu,
} from 'lucide-react';

import PageContainer from '../../components/common/PageContainer';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import Modal from '../../components/common/Modal';
import LoadingState from '../../components/common/LoadingState';
import ErrorState from '../../components/common/ErrorState';

import instructorService, {
  InstructorLesson,
  InstructorCourse,
  InstructorModule,
} from '../../services/instructorService';

export const InstructorLessons: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const editLessonIdParam = searchParams.get('edit');
  const createForModuleParam = searchParams.get('createForModule');
  const courseIdParam = searchParams.get('courseId');

  const [lessons, setLessons] = useState<InstructorLesson[]>([]);
  const [courses, setCourses] = useState<InstructorCourse[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'published' | 'draft'>('all');
  const [selectedCourseFilter, setSelectedCourseFilter] = useState<string>('all');

  // Lesson Editor Modal state
  const [editorModal, setEditorModal] = useState<{
    isOpen: boolean;
    lessonId?: number;
    title: string;
    courseId: number;
    moduleId: number;
    content: string;
    lessonType: string;
    order: number;
    durationMinutes: number;
    isPublished: boolean;
    initialCircuitJson: string;
    initialQiskitCode: string;
  }>({
    isOpen: false,
    title: '',
    courseId: 0,
    moduleId: 0,
    content: '',
    lessonType: 'interactive',
    order: 1,
    durationMinutes: 15,
    isPublished: true,
    initialCircuitJson: '',
    initialQiskitCode: '',
  });

  const [previewMode, setPreviewMode] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);

  // Confirmation modal
  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; lesson: InstructorLesson | null }>({
    isOpen: false,
    lesson: null,
  });

  const fetchData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const [lessonsRes, coursesRes] = await Promise.all([
        instructorService.listLessons(),
        instructorService.listCourses(),
      ]);
      setLessons(lessonsRes);
      setCourses(coursesRes);

      // If URL has edit param, open editor
      if (editLessonIdParam) {
        const targetLesson = lessonsRes.find((l) => l.id === parseInt(editLessonIdParam, 10));
        if (targetLesson) {
          openEditor(targetLesson);
        }
      } else if (createForModuleParam && courseIdParam) {
        setEditorModal({
          isOpen: true,
          title: '',
          courseId: parseInt(courseIdParam, 10),
          moduleId: parseInt(createForModuleParam, 10),
          content: '### Learning Objective\n\n### Concept Explanation\n\n### Key Takeaways\n',
          lessonType: 'interactive',
          order: 1,
          durationMinutes: 15,
          isPublished: true,
          initialCircuitJson: '',
          initialQiskitCode: '',
        });
      }
    } catch (err: any) {
      console.error('Failed to load lessons:', err);
      setError(err.response?.data?.detail || 'Failed to load lesson roster.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openEditor = async (lesson?: InstructorLesson) => {
    if (lesson) {
      try {
        const detail = await instructorService.getLesson(lesson.id);
        setEditorModal({
          isOpen: true,
          lessonId: detail.id,
          title: detail.title,
          courseId: detail.course_id || 0,
          moduleId: detail.module_id,
          content: detail.content,
          lessonType: detail.lesson_type,
          order: detail.order,
          durationMinutes: detail.duration_minutes,
          isPublished: detail.is_published,
          initialCircuitJson: detail.initial_circuit_json || '',
          initialQiskitCode: detail.initial_qiskit_code || '',
        });
      } catch (err: any) {
        alert(err.response?.data?.detail || 'Failed to fetch lesson detail.');
      }
    } else {
      const defaultCourse = courses[0];
      const defaultModule = defaultCourse?.modules?.[0];
      setEditorModal({
        isOpen: true,
        title: '',
        courseId: defaultCourse?.id || 0,
        moduleId: defaultModule?.id || 0,
        content: '### Learning Objective\n\n### Concept Explanation\n\n### Key Takeaways\n',
        lessonType: 'interactive',
        order: 1,
        durationMinutes: 15,
        isPublished: true,
        initialCircuitJson: '',
        initialQiskitCode: '',
      });
    }
    setPreviewMode(false);
  };

  const handleSaveLesson = async () => {
    if (!editorModal.title.trim() || editorModal.title.length < 3) {
      alert('Please enter a valid lesson title (at least 3 characters).');
      return;
    }
    if (!editorModal.moduleId) {
      alert('Please select a parent module for this lesson.');
      return;
    }
    if (!editorModal.content.trim() || editorModal.content.length < 10) {
      alert('Lesson content must be at least 10 characters.');
      return;
    }

    try {
      setIsSaving(true);
      if (editorModal.lessonId) {
        await instructorService.updateLesson(editorModal.lessonId, {
          module_id: editorModal.moduleId,
          title: editorModal.title.trim(),
          content: editorModal.content.trim(),
          lesson_type: editorModal.lessonType,
          order: editorModal.order,
          duration_minutes: editorModal.durationMinutes,
          is_published: editorModal.isPublished,
          initial_circuit_json: editorModal.initialCircuitJson || undefined,
          initial_qiskit_code: editorModal.initialQiskitCode || undefined,
        });
      } else {
        await instructorService.createLesson({
          module_id: editorModal.moduleId,
          title: editorModal.title.trim(),
          content: editorModal.content.trim(),
          lesson_type: editorModal.lessonType,
          order: editorModal.order,
          duration_minutes: editorModal.durationMinutes,
          is_published: editorModal.isPublished,
          initial_circuit_json: editorModal.initialCircuitJson || undefined,
          initial_qiskit_code: editorModal.initialQiskitCode || undefined,
        });
      }
      await fetchData();
      setEditorModal((prev) => ({ ...prev, isOpen: false }));
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Failed to save lesson.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleTogglePublish = async (lesson: InstructorLesson) => {
    try {
      if (lesson.is_published) {
        await instructorService.unpublishLesson(lesson.id);
      } else {
        await instructorService.publishLesson(lesson.id);
      }
      await fetchData();
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Failed to update publication status.');
    }
  };

  const handleDeleteLesson = async () => {
    if (!deleteModal.lesson) return;
    try {
      await instructorService.deleteLesson(deleteModal.lesson.id);
      await fetchData();
      setDeleteModal({ isOpen: false, lesson: null });
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Failed to delete lesson.');
    }
  };

  // Find modules for selected course in editor
  const selectedCourseInEditor = courses.find((c) => c.id === editorModal.courseId);

  // Filter lessons
  const filteredLessons = lessons.filter((l) => {
    const matchesSearch =
      l.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.course_title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.module_title?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus =
      statusFilter === 'all' ||
      (statusFilter === 'published' && l.is_published) ||
      (statusFilter === 'draft' && !l.is_published);
    const matchesCourse =
      selectedCourseFilter === 'all' || l.course_id === parseInt(selectedCourseFilter, 10);
    return matchesSearch && matchesStatus && matchesCourse;
  });

  if (isLoading) {
    return (
      <PageContainer title="Lesson Management" subtitle="Loading lessons...">
        <LoadingState message="Fetching instructor curriculum modules..." />
      </PageContainer>
    );
  }

  if (error) {
    return (
      <PageContainer title="Lesson Management" subtitle="Manage lessons">
        <ErrorState message={error} onRetry={fetchData} />
      </PageContainer>
    );
  }

  return (
    <PageContainer
      title="Lesson & Content Management"
      subtitle="Craft educational theory, create quantum circuit experiments, and control student lesson publishing."
      actions={
        <Button
          variant="primary"
          size="sm"
          onClick={() => openEditor()}
          leftIcon={<Plus className="w-4 h-4" />}
        >
          Create Lesson
        </Button>
      }
    >
      <div className="space-y-6">
        {/* Filter & Search Bar */}
        <div className="p-4 rounded-2xl glass-panel border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="relative w-full md:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search lesson, course, or module..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#090d16] text-xs text-slate-200 placeholder-slate-500 rounded-xl border border-slate-700/80 pl-9 pr-3 py-2 focus:outline-none focus:border-purple-400 transition-colors"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            {/* Course Filter */}
            <select
              value={selectedCourseFilter}
              onChange={(e) => setSelectedCourseFilter(e.target.value)}
              className="bg-[#090d16] text-xs text-slate-200 rounded-xl border border-slate-700/80 px-3 py-2 focus:outline-none focus:border-purple-400 cursor-pointer"
            >
              <option value="all">All Courses</option>
              {courses.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.title}
                </option>
              ))}
            </select>

            {/* Status Filter */}
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

        {/* Lessons List Table */}
        <div className="glass-panel rounded-2xl border-slate-800 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="bg-slate-900/80 text-xs uppercase text-slate-400 border-b border-white/10">
                <tr>
                  <th className="py-3.5 px-4 font-semibold">Lesson</th>
                  <th className="py-3.5 px-4 font-semibold">Course & Module</th>
                  <th className="py-3.5 px-4 font-semibold text-center">Type</th>
                  <th className="py-3.5 px-4 font-semibold text-center">Duration</th>
                  <th className="py-3.5 px-4 font-semibold text-center">Status</th>
                  <th className="py-3.5 px-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredLessons.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-500 text-xs">
                      No lessons found. Click "Create Lesson" to author a new lesson.
                    </td>
                  </tr>
                ) : (
                  filteredLessons.map((l) => (
                    <tr key={l.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-white">{l.title}</div>
                        <div className="text-[11px] text-slate-500 font-mono">Order: {l.order}</div>
                      </td>
                      <td className="py-3.5 px-4 max-w-[200px]">
                        <div className="text-xs font-medium text-slate-200 truncate">
                          {l.course_title || 'Unassigned Course'}
                        </div>
                        <div className="text-[11px] text-slate-400 truncate">
                          {l.module_title || 'Module'}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <Badge variant="purple" size="xs">
                          {l.lesson_type}
                        </Badge>
                      </td>
                      <td className="py-3.5 px-4 text-center font-mono text-xs text-slate-400">
                        {l.duration_minutes} min
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <Badge
                          variant={l.is_published ? 'emerald' : 'amber'}
                          size="xs"
                        >
                          {l.is_published ? 'Published' : 'Draft'}
                        </Badge>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Button
                            variant="ghost"
                            size="xs"
                            onClick={() => navigate(`/lessons/${l.id}`)}
                            title="Preview in Student View"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="xs"
                            onClick={() => openEditor(l)}
                            title="Edit Lesson"
                          >
                            <Edit2 className="w-3.5 h-3.5 text-purple-400" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="xs"
                            onClick={() => handleTogglePublish(l)}
                            title={l.is_published ? 'Unpublish' : 'Publish'}
                          >
                            {l.is_published ? (
                              <Lock className="w-3.5 h-3.5 text-amber-400" />
                            ) : (
                              <Globe className="w-3.5 h-3.5 text-emerald-400" />
                            )}
                          </Button>
                          <button
                            onClick={() => setDeleteModal({ isOpen: true, lesson: l })}
                            className="p-1.5 rounded-lg text-rose-400 hover:text-white hover:bg-rose-950/40 transition-colors"
                            title="Delete Lesson"
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

      {/* Lesson Create / Edit Modal */}
      <Modal
        isOpen={editorModal.isOpen}
        onClose={() => setEditorModal((prev) => ({ ...prev, isOpen: false }))}
        title={editorModal.lessonId ? `Edit Lesson: ${editorModal.title}` : 'Create Quantum Lesson'}
        size="lg"
        footer={
          <div className="flex items-center justify-between w-full">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setPreviewMode(!previewMode)}
              leftIcon={<Eye className="w-4 h-4" />}
            >
              {previewMode ? 'Back to Editor' : 'Live Preview'}
            </Button>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setEditorModal((prev) => ({ ...prev, isOpen: false }))}
                disabled={isSaving}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={handleSaveLesson}
                isLoading={isSaving}
                leftIcon={<Save className="w-4 h-4" />}
              >
                Save Lesson
              </Button>
            </div>
          </div>
        }
      >
        {previewMode ? (
          <div className="space-y-4 py-2 max-h-[65vh] overflow-y-auto pr-2">
            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
              <h2 className="text-xl font-bold text-white mb-2">{editorModal.title || 'Untitled Lesson'}</h2>
              <div className="flex items-center gap-3 text-xs text-slate-400 pb-3 mb-4 border-b border-white/5">
                <span>Duration: {editorModal.durationMinutes} mins</span>
                <span>Type: {editorModal.lessonType}</span>
                <Badge variant={editorModal.isPublished ? 'emerald' : 'amber'} size="xs">
                  {editorModal.isPublished ? 'Published' : 'Draft'}
                </Badge>
              </div>
              <div className="prose prose-invert prose-sm max-w-none whitespace-pre-wrap font-sans text-slate-300">
                {editorModal.content}
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-4 py-2 max-h-[65vh] overflow-y-auto pr-2">
            {/* Title & Type */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2 space-y-1.5">
                <label className="block text-xs font-semibold text-slate-300">Lesson Title *</label>
                <input
                  type="text"
                  value={editorModal.title}
                  onChange={(e) => setEditorModal((prev) => ({ ...prev, title: e.target.value }))}
                  placeholder="e.g. The Hadamard Transformation & Wavefunction Symmetry"
                  className="w-full bg-[#090d16] text-xs text-white rounded-xl border border-slate-700/80 px-3.5 py-2.5 focus:outline-none focus:border-purple-400"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-300">Lesson Type</label>
                <select
                  value={editorModal.lessonType}
                  onChange={(e) =>
                    setEditorModal((prev) => ({ ...prev, lessonType: e.target.value }))
                  }
                  className="w-full bg-[#090d16] text-xs text-white rounded-xl border border-slate-700/80 px-3.5 py-2.5 focus:outline-none focus:border-purple-400 cursor-pointer"
                >
                  <option value="theory">Theory & Concepts</option>
                  <option value="interactive">Interactive Circuit Lab</option>
                  <option value="qiskit_code">Qiskit Code Sandbox</option>
                </select>
              </div>
            </div>

            {/* Course & Module selectors */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-300">Parent Course</label>
                <select
                  value={editorModal.courseId}
                  onChange={(e) => {
                    const cId = parseInt(e.target.value, 10);
                    const selCourse = courses.find((c) => c.id === cId);
                    setEditorModal((prev) => ({
                      ...prev,
                      courseId: cId,
                      moduleId: selCourse?.modules?.[0]?.id || 0,
                    }));
                  }}
                  className="w-full bg-[#090d16] text-xs text-white rounded-xl border border-slate-700/80 px-3.5 py-2.5 focus:outline-none focus:border-purple-400 cursor-pointer"
                >
                  {courses.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.title}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-300">Parent Module *</label>
                <select
                  value={editorModal.moduleId}
                  onChange={(e) =>
                    setEditorModal((prev) => ({
                      ...prev,
                      moduleId: parseInt(e.target.value, 10),
                    }))
                  }
                  className="w-full bg-[#090d16] text-xs text-white rounded-xl border border-slate-700/80 px-3.5 py-2.5 focus:outline-none focus:border-purple-400 cursor-pointer"
                >
                  {selectedCourseInEditor?.modules?.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.title}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Duration, Order, Publication */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-300">Duration (Minutes)</label>
                <input
                  type="number"
                  min="5"
                  max="180"
                  value={editorModal.durationMinutes}
                  onChange={(e) =>
                    setEditorModal((prev) => ({
                      ...prev,
                      durationMinutes: parseInt(e.target.value, 10) || 15,
                    }))
                  }
                  className="w-full bg-[#090d16] text-xs text-white rounded-xl border border-slate-700/80 px-3.5 py-2 focus:outline-none focus:border-purple-400"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-300">Sequence Order</label>
                <input
                  type="number"
                  min="1"
                  value={editorModal.order}
                  onChange={(e) =>
                    setEditorModal((prev) => ({
                      ...prev,
                      order: parseInt(e.target.value, 10) || 1,
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
                  <option value="published">Published (Visible to Students)</option>
                  <option value="draft">Draft (Instructor Only)</option>
                </select>
              </div>
            </div>

            {/* Markdown Content */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-300">
                Lesson Content (Markdown & LaTeX Supported) *
              </label>
              <textarea
                rows={10}
                value={editorModal.content}
                onChange={(e) => setEditorModal((prev) => ({ ...prev, content: e.target.value }))}
                placeholder="### Learning Objective&#10;Explain the physical meaning...&#10;&#10;### Concept Explanation&#10;Superposition is represented as $|\psi\rangle = \alpha|0\rangle + \beta|1\rangle$...&#10;&#10;### Key Takeaways&#10;- Core insight 1..."
                className="w-full bg-[#090d16] text-xs text-slate-200 font-mono rounded-xl border border-slate-700/80 p-3.5 focus:outline-none focus:border-purple-400"
              />
            </div>
          </div>
        )}
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, lesson: null })}
        title="Delete Lesson"
        size="sm"
        footer={
          <div className="flex justify-end gap-2.5">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setDeleteModal({ isOpen: false, lesson: null })}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleDeleteLesson}
              className="bg-rose-600 hover:bg-rose-700 text-white"
            >
              Delete Lesson
            </Button>
          </div>
        }
      >
        <p className="text-xs text-slate-300">
          Are you sure you want to delete lesson{' '}
          <strong className="text-white">{deleteModal.lesson?.title}</strong>? This will remove all
          associated learner progress records.
        </p>
      </Modal>
    </PageContainer>
  );
};

export default InstructorLessons;
