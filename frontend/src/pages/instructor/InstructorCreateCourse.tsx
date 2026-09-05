import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  BookOpen,
  Save,
  Globe,
  Lock,
  Plus,
  Trash2,
  Edit2,
  ChevronDown,
  ChevronRight,
  Layers,
  FileText,
  Clock,
  Sparkles,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Eye,
} from 'lucide-react';

import PageContainer from '../../components/common/PageContainer';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Badge from '../../components/common/Badge';
import Modal from '../../components/common/Modal';
import LoadingState from '../../components/common/LoadingState';

import instructorService, { InstructorCourse, InstructorModule, InstructorLesson } from '../../services/instructorService';
import { aiGeneratorService, AICourseDraftResponse, AICourseLessonDraft } from '../../services/aiGeneratorService';

export const InstructorCreateCourse: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const editCourseId = searchParams.get('edit');

  const isEditMode = !!editCourseId;

  // Form State
  const [title, setTitle] = useState<string>('');
  const [shortDescription, setShortDescription] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [level, setLevel] = useState<string>('Beginner');
  const [estimatedHours, setEstimatedHours] = useState<number>(10);
  const [isPublished, setIsPublished] = useState<boolean>(false);

  // AI Course Generator State
  const [isAIModalOpen, setIsAIModalOpen] = useState<boolean>(false);
  const [aiTopic, setAiTopic] = useState<string>('Quantum Error Correction & Fault Tolerance');
  const [aiAudience, setAiAudience] = useState<string>('Undergraduate Students');
  const [aiDifficulty, setAiDifficulty] = useState<string>('Intermediate');
  const [aiNumModules, setAiNumModules] = useState<number>(3);
  const [aiHours, setAiHours] = useState<number>(8);
  const [aiObjectives, setAiObjectives] = useState<string>('Understand Shor and Steane codes, syndrome measurements, and fault-tolerant gates');
  const [aiPrerequisites, setAiPrerequisites] = useState<string>('Linear algebra, single and two qubit gates');
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [generatedDraft, setGeneratedDraft] = useState<AICourseDraftResponse | null>(null);
  const [regeneratingSlug, setRegeneratingSlug] = useState<string | null>(null);
  const [lessonGuidances, setLessonGuidances] = useState<Record<string, string>>({});

  // Curriculum State (for edit mode)
  const [modules, setModules] = useState<InstructorModule[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Module Modal state
  const [moduleModal, setModuleModal] = useState<{
    isOpen: boolean;
    moduleId?: number;
    title: string;
    description: string;
    order: number;
  }>({
    isOpen: false,
    title: '',
    description: '',
    order: 1,
  });

  // Load Course if in edit mode
  useEffect(() => {
    if (isEditMode && editCourseId) {
      const loadCourse = async () => {
        try {
          setIsLoading(true);
          const course = await instructorService.getCourse(parseInt(editCourseId, 10));
          setTitle(course.title);
          setDescription(course.description);
          setShortDescription(course.short_description || '');
          setLevel(course.level);
          setEstimatedHours(course.estimated_hours);
          setIsPublished(course.is_published);
          if (course.modules) {
            setModules(course.modules);
          }
        } catch (err: any) {
          console.error('Failed to load course for editing:', err);
          setFeedback({
            type: 'error',
            message: err.response?.data?.detail || 'Failed to load course details.',
          });
        } finally {
          setIsLoading(false);
        }
      };
      loadCourse();
    }
  }, [isEditMode, editCourseId]);

  const handleSaveCourse = async (publishImmediate: boolean = false) => {
    if (!title.trim() || title.length < 3) {
      setFeedback({ type: 'error', message: 'Please provide a valid course title (at least 3 characters).' });
      return;
    }
    if (!description.trim() || description.length < 10) {
      setFeedback({ type: 'error', message: 'Course description must be at least 10 characters.' });
      return;
    }

    try {
      setIsSaving(true);
      setFeedback(null);

      const targetPublish = publishImmediate ? true : isPublished;

      if (isEditMode && editCourseId) {
        await instructorService.updateCourse(parseInt(editCourseId, 10), {
          title: title.trim(),
          short_description: shortDescription.trim(),
          description: description.trim(),
          level,
          estimated_hours: estimatedHours,
          is_published: targetPublish,
        });
        setFeedback({ type: 'success', message: 'Course updated successfully!' });
      } else {
        const res = await instructorService.createCourse({
          title: title.trim(),
          short_description: shortDescription.trim() || description.trim().slice(0, 180),
          description: description.trim(),
          level,
          estimated_hours: estimatedHours,
          is_published: targetPublish,
        });
        setFeedback({ type: 'success', message: 'Course created successfully!' });
        setTimeout(() => {
          navigate(`/instructor/courses/create?edit=${res.id}`);
        }, 800);
      }
    } catch (err: any) {
      console.error('Failed to save course:', err);
      setFeedback({
        type: 'error',
        message: err.response?.data?.detail || 'Failed to save course. Please try again.',
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Module Handlers
  const handleSaveModule = async () => {
    if (!moduleModal.title.trim()) return;
    if (!editCourseId) return;

    try {
      if (moduleModal.moduleId) {
        await instructorService.updateModule(moduleModal.moduleId, {
          title: moduleModal.title.trim(),
          description: moduleModal.description.trim(),
          order: moduleModal.order,
        });
      } else {
        await instructorService.createModule({
          course_id: parseInt(editCourseId, 10),
          title: moduleModal.title.trim(),
          description: moduleModal.description.trim(),
          order: moduleModal.order,
        });
      }

      // Refresh course modules
      const updated = await instructorService.getCourse(parseInt(editCourseId, 10));
      if (updated.modules) setModules(updated.modules);
      setModuleModal({ isOpen: false, title: '', description: '', order: 1 });
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Failed to save module.');
    }
  };

  const handleDeleteModule = async (moduleId: number) => {
    if (!confirm('Are you sure you want to delete this module and its lessons?')) return;
    if (!editCourseId) return;

    try {
      await instructorService.deleteModule(moduleId);
      const updated = await instructorService.getCourse(parseInt(editCourseId, 10));
      if (updated.modules) setModules(updated.modules);
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Failed to delete module.');
    }
  };

  const handleGenerateAIDraft = async () => {
    if (!aiTopic.trim()) {
      alert('Please enter a quantum topic.');
      return;
    }
    try {
      setIsGenerating(true);
      const draft = await aiGeneratorService.generateCourseDraft({
        topic: aiTopic.trim(),
        target_audience: aiAudience.trim() || undefined,
        difficulty: aiDifficulty,
        num_modules: aiNumModules,
        estimated_hours: aiHours,
        learning_objectives: aiObjectives.trim() || undefined,
        prerequisites: aiPrerequisites.trim() || undefined,
      });
      setGeneratedDraft(draft);
    } catch (err: any) {
      console.error('Course generation failed:', err);
      alert(err.response?.data?.detail || 'Failed to generate course draft with AI.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleRegenerateLesson = async (moduleTitle: string, lesson: AICourseLessonDraft, modIdx: number, lesIdx: number) => {
    try {
      setRegeneratingSlug(lesson.slug);
      const guidance = lessonGuidances[lesson.slug];
      const regenerated = await aiGeneratorService.regenerateLesson({
        course_title: generatedDraft?.title || title,
        module_title: moduleTitle,
        lesson_title: lesson.title,
        lesson_order: lesson.order,
        difficulty: generatedDraft?.level || level,
        guidance: guidance?.trim() || undefined,
      });

      if (generatedDraft) {
        const updatedModules = [...generatedDraft.modules];
        updatedModules[modIdx].lessons[lesIdx] = regenerated;
        setGeneratedDraft({ ...generatedDraft, modules: updatedModules });
      }
    } catch (err: any) {
      console.error('Lesson regeneration failed:', err);
      alert(err.response?.data?.detail || 'Failed to regenerate lesson.');
    } finally {
      setRegeneratingSlug(null);
    }
  };

  const handleApplyDraftToForm = () => {
    if (!generatedDraft) return;
    setTitle(generatedDraft.title);
    setShortDescription(generatedDraft.short_description);
    setDescription(generatedDraft.description);
    setLevel(generatedDraft.level);
    setEstimatedHours(generatedDraft.estimated_hours);
    setIsAIModalOpen(false);
    setFeedback({
      type: 'success',
      message: 'AI Curriculum successfully loaded into the editor! Review metadata and click Save Draft.',
    });
  };

  if (isLoading) {
    return (
      <PageContainer title="Course Editor" subtitle="Loading course details...">
        <LoadingState message="Fetching course curriculum tree..." />
      </PageContainer>
    );
  }

  return (
    <PageContainer
      title={isEditMode ? `Edit Course: ${title || 'Curriculum'}` : 'Create Quantum Course'}
      subtitle={
        isEditMode
          ? 'Modify course metadata, organize structured modules, and manage lesson sequencing.'
          : 'Define a new quantum learning path, objectives, difficulty tier, and duration.'
      }
      actions={
        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/instructor/courses')}
            leftIcon={<ArrowLeft className="w-4 h-4" />}
          >
            Back to Courses
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsAIModalOpen(true)}
            className="border-purple-500/40 text-purple-300 hover:bg-purple-950/40"
            leftIcon={<Sparkles className="w-4 h-4 text-purple-400" />}
          >
            Generate with AI
          </Button>

          {isEditMode && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate(`/courses/${editCourseId}`)}
              leftIcon={<Eye className="w-4 h-4 text-purple-400" />}
            >
              Preview
            </Button>
          )}

          <Button
            variant="secondary"
            size="sm"
            onClick={() => handleSaveCourse(false)}
            isLoading={isSaving}
            leftIcon={<Save className="w-4 h-4" />}
          >
            Save Draft
          </Button>

          <Button
            variant="primary"
            size="sm"
            onClick={() => handleSaveCourse(true)}
            isLoading={isSaving}
            leftIcon={<Globe className="w-4 h-4" />}
          >
            {isPublished ? 'Update & Publish' : 'Publish Course'}
          </Button>
        </div>
      }
    >
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Feedback Alert */}
        {feedback && (
          <div
            className={`p-4 rounded-2xl border text-xs flex items-center justify-between animate-in fade-in duration-200 ${
              feedback.type === 'success'
                ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300'
                : 'bg-rose-950/40 border-rose-500/40 text-rose-300'
            }`}
          >
            <div className="flex items-center gap-2">
              {feedback.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              )}
              <span>{feedback.message}</span>
            </div>
            <button
              onClick={() => setFeedback(null)}
              className="text-slate-400 hover:text-white text-xs underline cursor-pointer"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* 1. Course Information Form */}
        <Card variant="glass" padding="lg" className="space-y-6">
          <div className="flex items-center justify-between border-b border-white/5 pb-4">
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-purple-400" />
                <span>Course Details</span>
              </h2>
              <p className="text-xs text-slate-400">Core parameters and catalog description.</p>
            </div>
            <Badge variant={isPublished ? 'emerald' : 'amber'} size="sm">
              {isPublished ? 'Status: Published' : 'Status: Draft'}
            </Badge>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Title */}
            <div className="md:col-span-2 space-y-1.5">
              <label className="block text-xs font-semibold text-slate-300">
                Course Title <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Introduction to Quantum Superposition & Entanglement"
                className="w-full bg-[#090d16] text-sm text-white rounded-xl border border-slate-700/80 px-4 py-2.5 focus:outline-none focus:border-purple-400 transition-colors"
              />
            </div>

            {/* Short Description */}
            <div className="md:col-span-2 space-y-1.5">
              <label className="block text-xs font-semibold text-slate-300">
                Short Tagline / Summary (Shown on Cards)
              </label>
              <input
                type="text"
                value={shortDescription}
                onChange={(e) => setShortDescription(e.target.value)}
                placeholder="A concise summary of what learners will accomplish in this course."
                className="w-full bg-[#090d16] text-sm text-white rounded-xl border border-slate-700/80 px-4 py-2.5 focus:outline-none focus:border-purple-400 transition-colors"
              />
            </div>

            {/* Difficulty Tier */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-300">Difficulty Level</label>
              <select
                value={level}
                onChange={(e) => setLevel(e.target.value)}
                className="w-full bg-[#090d16] text-sm text-white rounded-xl border border-slate-700/80 px-4 py-2.5 focus:outline-none focus:border-purple-400 transition-colors cursor-pointer"
              >
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
              </select>
            </div>

            {/* Estimated Hours */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-300">Estimated Duration (Hours)</label>
              <input
                type="number"
                min="0.5"
                max="100"
                step="0.5"
                value={estimatedHours}
                onChange={(e) => setEstimatedHours(parseFloat(e.target.value) || 1)}
                className="w-full bg-[#090d16] text-sm text-white rounded-xl border border-slate-700/80 px-4 py-2.5 focus:outline-none focus:border-purple-400 transition-colors"
              />
            </div>

            {/* Full Markdown Description */}
            <div className="md:col-span-2 space-y-1.5">
              <label className="block text-xs font-semibold text-slate-300">
                Full Course Description & Prerequisites <span className="text-rose-400">*</span>
              </label>
              <textarea
                rows={5}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Comprehensive syllabus overview, target audience, learning outcomes, and foundational requirements..."
                className="w-full bg-[#090d16] text-sm text-white rounded-xl border border-slate-700/80 p-4 focus:outline-none focus:border-purple-400 transition-colors"
              />
            </div>
          </div>
        </Card>

        {/* 2. Curriculum Tree Management (Only in Edit Mode) */}
        {isEditMode && (
          <Card variant="glass" padding="lg" className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-4">
              <div>
                <h2 className="text-base font-bold text-white flex items-center gap-2">
                  <Layers className="w-5 h-5 text-cyan-400" />
                  <span>Curriculum & Syllabus Structure</span>
                </h2>
                <p className="text-xs text-slate-400">
                  Organize modules, create interactive lessons, and control learner progression.
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  setModuleModal({
                    isOpen: true,
                    title: '',
                    description: '',
                    order: modules.length + 1,
                  })
                }
                leftIcon={<Plus className="w-4 h-4 text-cyan-400" />}
              >
                Add Module
              </Button>
            </div>

            {/* Modules List */}
            {modules.length === 0 ? (
              <div className="py-8 text-center text-slate-500 text-xs">
                No modules defined yet. Click "Add Module" to start structuring your course.
              </div>
            ) : (
              <div className="space-y-4">
                {modules.map((m, idx) => (
                  <div
                    key={m.id}
                    className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4"
                  >
                    {/* Module Header */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-7 h-7 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 text-xs font-bold font-mono">
                          {m.order || idx + 1}
                        </div>
                        <div>
                          <h3 className="text-sm font-bold text-white">{m.title}</h3>
                          {m.description && (
                            <p className="text-xs text-slate-400">{m.description}</p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="xs"
                          onClick={() =>
                            navigate(
                              `/instructor/lessons?createForModule=${m.id}&courseId=${editCourseId}`
                            )
                          }
                          leftIcon={<Plus className="w-3.5 h-3.5 text-purple-400" />}
                        >
                          Add Lesson
                        </Button>
                        <button
                          onClick={() =>
                            setModuleModal({
                              isOpen: true,
                              moduleId: m.id,
                              title: m.title,
                              description: m.description || '',
                              order: m.order,
                            })
                          }
                          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                          title="Edit Module"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteModule(m.id)}
                          className="p-1.5 rounded-lg text-rose-400 hover:text-white hover:bg-rose-950/40 transition-colors"
                          title="Delete Module"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Lessons inside Module */}
                    <div className="pl-10 space-y-2 border-l border-white/5">
                      {!m.lessons || m.lessons.length === 0 ? (
                        <div className="py-2 text-xs text-slate-500 italic">
                          No lessons in this module yet.
                        </div>
                      ) : (
                        m.lessons.map((l) => (
                          <div
                            key={l.id}
                            className="p-2.5 rounded-xl bg-slate-950/40 border border-white/5 flex items-center justify-between hover:border-slate-700 transition-colors"
                          >
                            <div className="flex items-center gap-2.5">
                              <FileText className="w-4 h-4 text-purple-400" />
                              <span className="text-xs font-medium text-slate-200">{l.title}</span>
                              <Badge
                                variant={l.is_published ? 'emerald' : 'amber'}
                                size="xs"
                              >
                                {l.is_published ? 'Published' : 'Draft'}
                              </Badge>
                              <span className="text-[11px] text-slate-500 flex items-center gap-1">
                                <Clock className="w-3 h-3" /> {l.duration_minutes}m
                              </span>
                            </div>

                            <div className="flex items-center gap-1.5">
                              <Button
                                variant="ghost"
                                size="xs"
                                onClick={() => navigate(`/lessons/${l.id}`)}
                              >
                                View
                              </Button>
                              <Button
                                variant="ghost"
                                size="xs"
                                onClick={() => navigate(`/instructor/lessons?edit=${l.id}`)}
                              >
                                Edit
                              </Button>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        )}
      </div>

      {/* Module Add/Edit Modal */}
      <Modal
        isOpen={moduleModal.isOpen}
        onClose={() => setModuleModal((prev) => ({ ...prev, isOpen: false }))}
        title={moduleModal.moduleId ? 'Edit Module' : 'Add New Module'}
        size="md"
        footer={
          <div className="flex justify-end gap-2.5">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setModuleModal((prev) => ({ ...prev, isOpen: false }))}
            >
              Cancel
            </Button>
            <Button variant="primary" size="sm" onClick={handleSaveModule}>
              Save Module
            </Button>
          </div>
        }
      >
        <div className="space-y-4 py-2">
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-300">Module Title</label>
            <input
              type="text"
              value={moduleModal.title}
              onChange={(e) => setModuleModal((prev) => ({ ...prev, title: e.target.value }))}
              placeholder="e.g. Module 2 — Multi-Qubit Systems and Entanglement"
              className="w-full bg-[#090d16] text-xs text-white rounded-xl border border-slate-700/80 px-3.5 py-2.5 focus:outline-none focus:border-purple-400"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-300">Module Description</label>
            <textarea
              rows={3}
              value={moduleModal.description}
              onChange={(e) =>
                setModuleModal((prev) => ({ ...prev, description: e.target.value }))
              }
              placeholder="Brief conceptual overview of this curriculum module..."
              className="w-full bg-[#090d16] text-xs text-white rounded-xl border border-slate-700/80 p-3 focus:outline-none focus:border-purple-400"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-300">Sequence Order</label>
            <input
              type="number"
              min="1"
              value={moduleModal.order}
              onChange={(e) =>
                setModuleModal((prev) => ({
                  ...prev,
                  order: parseInt(e.target.value, 10) || 1,
                }))
              }
              className="w-full bg-[#090d16] text-xs text-white rounded-xl border border-slate-700/80 px-3.5 py-2 focus:outline-none focus:border-purple-400"
            />
          </div>
        </div>
      </Modal>

      {/* AI Course Generator Modal */}
      <Modal
        isOpen={isAIModalOpen}
        onClose={() => setIsAIModalOpen(false)}
        title="AI Course & Curriculum Generator"
        size="lg"
        footer={
          <div className="flex items-center justify-between w-full">
            <span className="text-[11px] text-slate-400 italic">
              AI Generated Draft — Instructor review required before publishing.
            </span>
            <div className="flex gap-2.5">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsAIModalOpen(false)}
              >
                Close
              </Button>
              {generatedDraft && (
                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleApplyDraftToForm}
                  leftIcon={<CheckCircle2 className="w-4 h-4" />}
                >
                  Apply Curriculum to Form
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
                Grounded Quantum Syllabus Synthesizer
              </h4>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              <div className="md:col-span-2 space-y-1">
                <label className="text-[11px] font-medium text-slate-300">Quantum Subject / Topic</label>
                <input
                  type="text"
                  value={aiTopic}
                  onChange={(e) => setAiTopic(e.target.value)}
                  placeholder="e.g. Quantum Error Correction & Surface Codes"
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
                <label className="text-[11px] font-medium text-slate-300">Target Audience</label>
                <input
                  type="text"
                  value={aiAudience}
                  onChange={(e) => setAiAudience(e.target.value)}
                  placeholder="e.g. Undergraduate Students"
                  className="w-full bg-[#090d16] text-xs text-white rounded-xl border border-slate-700/80 px-3 py-2 focus:outline-none focus:border-purple-400"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-medium text-slate-300">Number of Modules (1-5)</label>
                <input
                  type="number"
                  min="1"
                  max="5"
                  value={aiNumModules}
                  onChange={(e) => setAiNumModules(parseInt(e.target.value, 10) || 3)}
                  className="w-full bg-[#090d16] text-xs text-white rounded-xl border border-slate-700/80 px-3 py-2 focus:outline-none focus:border-purple-400"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-medium text-slate-300">Estimated Duration (Hours)</label>
                <input
                  type="number"
                  min="1"
                  max="50"
                  value={aiHours}
                  onChange={(e) => setAiHours(parseFloat(e.target.value) || 8)}
                  className="w-full bg-[#090d16] text-xs text-white rounded-xl border border-slate-700/80 px-3 py-2 focus:outline-none focus:border-purple-400"
                />
              </div>

              <div className="md:col-span-2 space-y-1">
                <label className="text-[11px] font-medium text-slate-300">Custom Learning Objectives (Optional)</label>
                <textarea
                  rows={2}
                  value={aiObjectives}
                  onChange={(e) => setAiObjectives(e.target.value)}
                  placeholder="Specific quantum principles or mathematical algorithms to emphasize..."
                  className="w-full bg-[#090d16] text-xs text-white rounded-xl border border-slate-700/80 p-2.5 focus:outline-none focus:border-purple-400"
                />
              </div>
            </div>

            <div className="flex justify-end pt-1">
              <Button
                variant="primary"
                size="sm"
                onClick={handleGenerateAIDraft}
                isLoading={isGenerating}
                leftIcon={<Sparkles className="w-4 h-4" />}
              >
                {generatedDraft ? 'Regenerate Curriculum' : 'Generate Course Draft'}
              </Button>
            </div>
          </div>

          {/* Generated Course Preview */}
          {generatedDraft && (
            <div className="space-y-4 pt-2 border-t border-slate-800">
              <div className="p-4 rounded-2xl bg-[#090d16] border border-slate-800 space-y-3">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="text-sm font-semibold text-white">{generatedDraft.title}</h3>
                    <p className="text-xs text-slate-400 mt-1">{generatedDraft.short_description}</p>
                  </div>
                  <Badge variant="cyan" size="sm">
                    {generatedDraft.level}
                  </Badge>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-300 pt-1">
                  <div>
                    <span className="text-slate-500">Duration:</span> {generatedDraft.estimated_hours} Hours
                  </div>
                  <div>
                    <span className="text-slate-500">Modules:</span> {generatedDraft.modules.length} Modules
                  </div>
                </div>

                {generatedDraft.learning_objectives.length > 0 && (
                  <div className="pt-2">
                    <span className="text-[11px] font-medium text-purple-300">Objectives:</span>
                    <ul className="list-disc list-inside text-[11px] text-slate-400 mt-1 space-y-0.5">
                      {generatedDraft.learning_objectives.map((obj, i) => (
                        <li key={i}>{obj}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* Generated Modules Tree */}
              <div className="space-y-3">
                <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                  Generated Modules & Lessons ({generatedDraft.modules.length})
                </h4>

                {generatedDraft.modules.map((m, mIdx) => (
                  <div key={mIdx} className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800/80 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <div className="font-semibold text-xs text-purple-300">
                        Module {m.order}: {m.title}
                      </div>
                      <span className="text-[10px] text-slate-500">{m.lessons.length} Lessons</span>
                    </div>
                    <p className="text-[11px] text-slate-400">{m.description}</p>

                    <div className="space-y-2 pt-1">
                      {m.lessons.map((l, lIdx) => (
                        <div
                          key={lIdx}
                          className="p-3 rounded-lg bg-[#070a12] border border-slate-800 space-y-2 text-xs"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <FileText className="w-3.5 h-3.5 text-cyan-400" />
                              <span className="font-medium text-white">{l.title}</span>
                              <Badge variant="outline" size="xs">
                                {l.lesson_type}
                              </Badge>
                            </div>
                            <span className="text-[10px] text-slate-500">{l.duration_minutes} mins</span>
                          </div>

                          <p className="text-[11px] text-slate-400 line-clamp-2">{l.content}</p>

                          {/* Granular Lesson Regeneration Input */}
                          <div className="flex items-center gap-2 pt-1">
                            <input
                              type="text"
                              placeholder="Adjust lesson guidance (optional)..."
                              value={lessonGuidances[l.slug] || ''}
                              onChange={(e) =>
                                setLessonGuidances({ ...lessonGuidances, [l.slug]: e.target.value })
                              }
                              className="flex-1 bg-slate-900 text-[11px] text-white rounded-lg border border-slate-700/60 px-2.5 py-1 focus:outline-none focus:border-purple-400"
                            />
                            <Button
                              variant="outline"
                              size="xs"
                              onClick={() => handleRegenerateLesson(m.title, l, mIdx, lIdx)}
                              isLoading={regeneratingSlug === l.slug}
                              leftIcon={<Sparkles className="w-3 h-3 text-purple-400" />}
                            >
                              Regenerate
                            </Button>
                          </div>
                        </div>
                      ))}
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

export default InstructorCreateCourse;
