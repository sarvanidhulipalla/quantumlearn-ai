import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Trophy,
  Plus,
  Search,
  CheckCircle2,
  AlertCircle,
  Eye,
  Edit2,
  Trash2,
  Cpu,
  Globe,
  Lock,
  Save,
  Zap,
  Code,
} from 'lucide-react';

import PageContainer from '../../components/common/PageContainer';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import Modal from '../../components/common/Modal';
import LoadingState from '../../components/common/LoadingState';
import ErrorState from '../../components/common/ErrorState';

import instructorService, { InstructorChallenge } from '../../services/instructorService';

export const InstructorChallenges: React.FC = () => {
  const navigate = useNavigate();

  const [challenges, setChallenges] = useState<InstructorChallenge[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'published' | 'draft'>('all');

  // Challenge Editor Modal
  const [editorModal, setEditorModal] = useState<{
    isOpen: boolean;
    challengeId?: number;
    title: string;
    slug: string;
    difficulty: string;
    category: string;
    description: string;
    targetStateVector: string;
    starterQiskitCode: string;
    starterCircuitJson: string;
    pointsReward: number;
    isPublished: boolean;
  }>({
    isOpen: false,
    title: '',
    slug: '',
    difficulty: 'Beginner',
    category: 'Quantum Gates',
    description: '',
    targetStateVector: '',
    starterQiskitCode: '',
    starterCircuitJson: '',
    pointsReward: 50,
    isPublished: true,
  });

  const [previewMode, setPreviewMode] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);

  // Delete Modal
  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; challenge: InstructorChallenge | null }>({
    isOpen: false,
    challenge: null,
  });

  const fetchData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const res = await instructorService.listChallenges();
      setChallenges(res);
    } catch (err: any) {
      console.error('Failed to load challenges:', err);
      setError(err.response?.data?.detail || 'Failed to fetch challenge lab items.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openEditor = async (challenge?: InstructorChallenge) => {
    if (challenge) {
      try {
        const detail = await instructorService.getChallenge(challenge.id);
        setEditorModal({
          isOpen: true,
          challengeId: detail.id,
          title: detail.title,
          slug: detail.slug,
          difficulty: detail.difficulty,
          category: detail.category,
          description: detail.description,
          targetStateVector: detail.target_state_vector || '',
          starterQiskitCode: detail.starter_qiskit_code || '',
          starterCircuitJson: detail.starter_circuit_json || '',
          pointsReward: detail.points_reward,
          isPublished: detail.is_published,
        });
      } catch (err: any) {
        alert(err.response?.data?.detail || 'Failed to fetch challenge specifications.');
      }
    } else {
      setEditorModal({
        isOpen: true,
        title: '',
        slug: '',
        difficulty: 'Beginner',
        category: 'Quantum Gates',
        description: '',
        targetStateVector: '0.7071|0⟩ + 0.7071|1⟩',
        starterQiskitCode: 'from qiskit import QuantumCircuit\nqc = QuantumCircuit(1, 1)\nqc.measure(0, 0)',
        starterCircuitJson: JSON.stringify({ numQubits: 1, numClassicalBits: 1, numCols: 4, gates: [] }),
        pointsReward: 50,
        isPublished: true,
      });
    }
    setPreviewMode(false);
  };

  const handleSaveChallenge = async () => {
    if (!editorModal.title.trim()) {
      alert('Please provide a challenge title.');
      return;
    }
    if (!editorModal.description.trim() || editorModal.description.length < 10) {
      alert('Challenge description must be at least 10 characters.');
      return;
    }

    try {
      setIsSaving(true);
      if (editorModal.challengeId) {
        await instructorService.updateChallenge(editorModal.challengeId, {
          title: editorModal.title.trim(),
          slug: editorModal.slug.trim() || undefined,
          difficulty: editorModal.difficulty,
          category: editorModal.category,
          description: editorModal.description.trim(),
          target_state_vector: editorModal.targetStateVector.trim() || undefined,
          starter_qiskit_code: editorModal.starterQiskitCode || undefined,
          starter_circuit_json: editorModal.starterCircuitJson || undefined,
          points_reward: editorModal.pointsReward,
          is_published: editorModal.isPublished,
        });
      } else {
        await instructorService.createChallenge({
          title: editorModal.title.trim(),
          slug: editorModal.slug.trim() || undefined,
          difficulty: editorModal.difficulty,
          category: editorModal.category,
          description: editorModal.description.trim(),
          target_state_vector: editorModal.targetStateVector.trim() || undefined,
          starter_qiskit_code: editorModal.starterQiskitCode || undefined,
          starter_circuit_json: editorModal.starterCircuitJson || undefined,
          points_reward: editorModal.pointsReward,
          is_published: editorModal.isPublished,
        });
      }
      await fetchData();
      setEditorModal((prev) => ({ ...prev, isOpen: false }));
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Failed to save challenge.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleTogglePublish = async (challenge: InstructorChallenge) => {
    try {
      if (challenge.is_published) {
        await instructorService.unpublishChallenge(challenge.id);
      } else {
        await instructorService.publishChallenge(challenge.id);
      }
      await fetchData();
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Failed to update publication status.');
    }
  };

  const handleDeleteChallenge = async () => {
    if (!deleteModal.challenge) return;
    try {
      await instructorService.deleteChallenge(deleteModal.challenge.id);
      await fetchData();
      setDeleteModal({ isOpen: false, challenge: null });
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Failed to delete challenge.');
    }
  };

  const filteredChallenges = challenges.filter((ch) => {
    const matchesSearch =
      ch.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ch.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ch.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus =
      statusFilter === 'all' ||
      (statusFilter === 'published' && ch.is_published) ||
      (statusFilter === 'draft' && !ch.is_published);
    return matchesSearch && matchesStatus;
  });

  if (isLoading) {
    return (
      <PageContainer title="Challenge Management" subtitle="Loading challenges...">
        <LoadingState message="Fetching quantum state evaluation challenges..." />
      </PageContainer>
    );
  }

  if (error) {
    return (
      <PageContainer title="Challenge Management" subtitle="Manage challenges">
        <ErrorState message={error} onRetry={fetchData} />
      </PageContainer>
    );
  }

  return (
    <PageContainer
      title="Quantum Challenge Management"
      subtitle="Design state vector synthesis challenges, specify fidelity benchmarks, and award learner XP."
      actions={
        <Button
          variant="primary"
          size="sm"
          onClick={() => openEditor()}
          leftIcon={<Plus className="w-4 h-4" />}
        >
          Create Challenge
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
              placeholder="Search challenge by title, category..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#090d16] text-xs text-slate-200 placeholder-slate-500 rounded-xl border border-slate-700/80 pl-9 pr-3 py-2 focus:outline-none focus:border-purple-400 transition-colors"
            />
          </div>

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

        {/* Challenges Table */}
        <div className="glass-panel rounded-2xl border-slate-800 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="bg-slate-900/80 text-xs uppercase text-slate-400 border-b border-white/10">
                <tr>
                  <th className="py-3.5 px-4 font-semibold">Challenge Title</th>
                  <th className="py-3.5 px-4 font-semibold">Category</th>
                  <th className="py-3.5 px-4 font-semibold text-center">Difficulty</th>
                  <th className="py-3.5 px-4 font-semibold text-center">XP Reward</th>
                  <th className="py-3.5 px-4 font-semibold text-center">Solved / Attempts</th>
                  <th className="py-3.5 px-4 font-semibold text-center">Status</th>
                  <th className="py-3.5 px-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredChallenges.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-slate-500 text-xs">
                      No challenges found. Click "Create Challenge" to author a new circuit exercise.
                    </td>
                  </tr>
                ) : (
                  filteredChallenges.map((ch) => (
                    <tr key={ch.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-white">{ch.title}</div>
                        <div className="text-[11px] text-slate-500 font-mono">slug: {ch.slug}</div>
                      </td>
                      <td className="py-3.5 px-4 text-xs font-medium text-slate-300">
                        {ch.category}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <Badge
                          variant={
                            ch.difficulty === 'Beginner'
                              ? 'cyan'
                              : ch.difficulty === 'Intermediate'
                              ? 'purple'
                              : 'rose'
                          }
                          size="xs"
                        >
                          {ch.difficulty}
                        </Badge>
                      </td>
                      <td className="py-3.5 px-4 text-center font-mono font-bold text-amber-400">
                        +{ch.points_reward} XP
                      </td>
                      <td className="py-3.5 px-4 text-center font-mono text-xs text-slate-300">
                        <span className="text-emerald-400 font-semibold">{ch.solved_count || 0}</span> /{' '}
                        {ch.attempts_count || 0}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <Badge variant={ch.is_published ? 'emerald' : 'amber'} size="xs">
                          {ch.is_published ? 'Published' : 'Draft'}
                        </Badge>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Button
                            variant="ghost"
                            size="xs"
                            onClick={() => navigate(`/student/challenges/${ch.id}`)}
                            title="Preview Solver Interface"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="xs"
                            onClick={() => openEditor(ch)}
                            title="Edit Challenge"
                          >
                            <Edit2 className="w-3.5 h-3.5 text-purple-400" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="xs"
                            onClick={() => handleTogglePublish(ch)}
                            title={ch.is_published ? 'Unpublish' : 'Publish'}
                          >
                            {ch.is_published ? (
                              <Lock className="w-3.5 h-3.5 text-amber-400" />
                            ) : (
                              <Globe className="w-3.5 h-3.5 text-emerald-400" />
                            )}
                          </Button>
                          <button
                            onClick={() => setDeleteModal({ isOpen: true, challenge: ch })}
                            className="p-1.5 rounded-lg text-rose-400 hover:text-white hover:bg-rose-950/40 transition-colors"
                            title="Delete Challenge"
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

      {/* Challenge Editor Modal */}
      <Modal
        isOpen={editorModal.isOpen}
        onClose={() => setEditorModal((prev) => ({ ...prev, isOpen: false }))}
        title={editorModal.challengeId ? `Edit Challenge: ${editorModal.title}` : 'Create Quantum Challenge'}
        size="lg"
        footer={
          <div className="flex items-center justify-between w-full">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setPreviewMode(!previewMode)}
              leftIcon={<Eye className="w-4 h-4" />}
            >
              {previewMode ? 'Back to Editor' : 'Preview Challenge'}
            </Button>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setEditorModal((prev) => ({ ...prev, isOpen: false }))}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={handleSaveChallenge}
                isLoading={isSaving}
                leftIcon={<Save className="w-4 h-4" />}
              >
                Save Challenge
              </Button>
            </div>
          </div>
        }
      >
        {previewMode ? (
          <div className="space-y-4 py-2 max-h-[65vh] overflow-y-auto pr-2">
            <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-white text-base">{editorModal.title || 'Untitled Challenge'}</h3>
                <Badge variant="amber" size="xs">
                  +{editorModal.pointsReward} XP
                </Badge>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">{editorModal.description}</p>
              {editorModal.targetStateVector && (
                <div className="p-3 rounded-lg bg-slate-950/80 border border-white/5 font-mono text-xs text-cyan-300">
                  <span className="text-slate-400 block text-[10px] uppercase font-sans">
                    Target State:
                  </span>
                  {editorModal.targetStateVector}
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-4 py-2 max-h-[65vh] overflow-y-auto pr-2">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2 space-y-1.5">
                <label className="block text-xs font-semibold text-slate-300">Challenge Title *</label>
                <input
                  type="text"
                  value={editorModal.title}
                  onChange={(e) => setEditorModal((prev) => ({ ...prev, title: e.target.value }))}
                  placeholder="e.g. Construct the 3-Qubit W-State"
                  className="w-full bg-[#090d16] text-xs text-white rounded-xl border border-slate-700/80 px-3.5 py-2.5 focus:outline-none focus:border-purple-400"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-300">Difficulty</label>
                <select
                  value={editorModal.difficulty}
                  onChange={(e) =>
                    setEditorModal((prev) => ({ ...prev, difficulty: e.target.value }))
                  }
                  className="w-full bg-[#090d16] text-xs text-white rounded-xl border border-slate-700/80 px-3.5 py-2.5 focus:outline-none focus:border-purple-400 cursor-pointer"
                >
                  <option value="Beginner">Beginner</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Advanced">Advanced</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-300">Category</label>
                <input
                  type="text"
                  value={editorModal.category}
                  onChange={(e) => setEditorModal((prev) => ({ ...prev, category: e.target.value }))}
                  placeholder="e.g. Quantum Gates, Entanglement"
                  className="w-full bg-[#090d16] text-xs text-white rounded-xl border border-slate-700/80 px-3.5 py-2 focus:outline-none focus:border-purple-400"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-300">XP Reward</label>
                <input
                  type="number"
                  min="10"
                  max="500"
                  value={editorModal.pointsReward}
                  onChange={(e) =>
                    setEditorModal((prev) => ({
                      ...prev,
                      pointsReward: parseInt(e.target.value, 10) || 50,
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
                  <option value="published">Published</option>
                  <option value="draft">Draft</option>
                </select>
              </div>
            </div>

            {/* Description & Objective */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-300">
                Challenge Objective & Instructions *
              </label>
              <textarea
                rows={3}
                value={editorModal.description}
                onChange={(e) =>
                  setEditorModal((prev) => ({ ...prev, description: e.target.value }))
                }
                placeholder="Explain the circuit goals, target probability distribution, and unitary conditions..."
                className="w-full bg-[#090d16] text-xs text-white rounded-xl border border-slate-700/80 p-3 focus:outline-none focus:border-purple-400"
              />
            </div>

            {/* Target State Vector */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-300">
                Target State Vector Formula
              </label>
              <input
                type="text"
                value={editorModal.targetStateVector}
                onChange={(e) =>
                  setEditorModal((prev) => ({ ...prev, targetStateVector: e.target.value }))
                }
                placeholder="e.g. 0.7071|00⟩ + 0.7071|11⟩"
                className="w-full bg-[#090d16] text-xs text-cyan-400 font-mono rounded-xl border border-slate-700/80 px-3.5 py-2 focus:outline-none focus:border-purple-400"
              />
            </div>

            {/* Starter Code */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-300">
                Starter Qiskit Code Template
              </label>
              <textarea
                rows={4}
                value={editorModal.starterQiskitCode}
                onChange={(e) =>
                  setEditorModal((prev) => ({ ...prev, starterQiskitCode: e.target.value }))
                }
                className="w-full bg-[#090d16] text-xs text-slate-200 font-mono rounded-xl border border-slate-700/80 p-3 focus:outline-none focus:border-purple-400"
              />
            </div>
          </div>
        )}
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, challenge: null })}
        title="Delete Challenge"
        size="sm"
        footer={
          <div className="flex justify-end gap-2.5">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setDeleteModal({ isOpen: false, challenge: null })}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleDeleteChallenge}
              className="bg-rose-600 hover:bg-rose-700 text-white"
            >
              Delete Challenge
            </Button>
          </div>
        }
      >
        <p className="text-xs text-slate-300">
          Are you sure you want to delete challenge{' '}
          <strong className="text-white">{deleteModal.challenge?.title}</strong>?
        </p>
      </Modal>
    </PageContainer>
  );
};

export default InstructorChallenges;
