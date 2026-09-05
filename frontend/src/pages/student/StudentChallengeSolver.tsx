import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Play,
  RotateCcw,
  Sparkles,
  Award,
  CheckCircle2,
  XCircle,
  Lightbulb,
  Bot,
  Send,
  ArrowLeft,
  ShieldCheck,
  Cpu,
  Trash2,
} from 'lucide-react';
import {
  challengeService,
  ChallengeDetail,
  ChallengeSubmitResult,
} from '../../services/challengeService';
import {
  CircuitGridState,
  GateType,
  PlacedGate,
} from '../../types/circuit';
import PageContainer from '../../components/common/PageContainer';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import GatePalette from '../../components/playground/GatePalette';
import CircuitGrid from '../../components/playground/CircuitGrid';
import LoadingState from '../../components/common/LoadingState';
import ErrorState from '../../components/common/ErrorState';

export const StudentChallengeSolver: React.FC = () => {
  const { challengeId } = useParams<{ challengeId: string }>();
  const navigate = useNavigate();

  const [challenge, setChallenge] = useState<ChallengeDetail | null>(null);
  const [circuit, setCircuit] = useState<CircuitGridState>({
    numQubits: 1,
    numClassicalBits: 1,
    numCols: 5,
    gates: [],
  });
  const [selectedGate, setSelectedGate] = useState<GateType | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [evalResult, setEvalResult] = useState<ChallengeSubmitResult | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Progressive Hints
  const [hintLevel, setHintLevel] = useState<number>(1);
  const [currentHint, setCurrentHint] = useState<string | null>(null);
  const [isLoadingHint, setIsLoadingHint] = useState<boolean>(false);

  useEffect(() => {
    fetchChallenge();
  }, [challengeId]);

  const fetchChallenge = async () => {
    if (!challengeId) return;
    setIsLoading(true);
    setErrorMsg(null);
    setEvalResult(null);
    setCurrentHint(null);
    setHintLevel(1);

    try {
      const data = await challengeService.getChallengeById(challengeId);
      setChallenge(data);

      if (data.starter_circuit && data.starter_circuit.numQubits) {
        setCircuit(data.starter_circuit);
      } else {
        // Default based on challenge difficulty/slug
        const numQ = data.slug.includes('ghz') ? 3 : data.slug.includes('bell') || data.slug.includes('cnot') ? 2 : 1;
        setCircuit({
          numQubits: numQ,
          numClassicalBits: numQ,
          numCols: 5,
          gates: [],
        });
      }
    } catch (err: any) {
      console.error('Failed to load challenge:', err);
      setErrorMsg('Failed to load challenge details. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Circuit gate placement & manipulation handlers
  const handlePlaceGate = (gateData: Omit<PlacedGate, 'id'>) => {
    const filtered = circuit.gates.filter(
      (g) => !(g.qubitIndex === gateData.qubitIndex && g.colIndex === gateData.colIndex)
    );

    const newGate: PlacedGate = {
      ...gateData,
      id: `gate_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
    };

    setCircuit((prev) => ({
      ...prev,
      gates: [...filtered, newGate],
    }));
  };

  const handleRemoveGate = (gateId: string) => {
    setCircuit((prev) => ({
      ...prev,
      gates: prev.gates.filter((g) => g.id !== gateId),
    }));
  };

  const handleUpdateGate = (updatedGate: PlacedGate) => {
    setCircuit((prev) => ({
      ...prev,
      gates: prev.gates.map((g) => (g.id === updatedGate.id ? updatedGate : g)),
    }));
  };

  const handleAddQubit = () => {
    if (circuit.numQubits >= 6) return;
    setCircuit((prev) => ({ ...prev, numQubits: prev.numQubits + 1 }));
  };

  const handleRemoveQubit = () => {
    if (circuit.numQubits <= 1) return;
    const newCount = circuit.numQubits - 1;
    setCircuit((prev) => ({
      ...prev,
      numQubits: newCount,
      gates: prev.gates.filter((g) => g.qubitIndex < newCount && (!g.targetQubitIndex || g.targetQubitIndex < newCount)),
    }));
  };

  const handleAddClassicalBit = () => {
    if (circuit.numClassicalBits >= 6) return;
    setCircuit((prev) => ({ ...prev, numClassicalBits: prev.numClassicalBits + 1 }));
  };

  const handleRemoveClassicalBit = () => {
    if (circuit.numClassicalBits <= 0) return;
    setCircuit((prev) => ({ ...prev, numClassicalBits: prev.numClassicalBits - 1 }));
  };

  const handleAddColumn = () => {
    if (circuit.numCols >= 12) return;
    setCircuit((prev) => ({ ...prev, numCols: prev.numCols + 1 }));
  };

  const handleRemoveColumn = () => {
    if (circuit.numCols <= 4) return;
    const newCols = circuit.numCols - 1;
    setCircuit((prev) => ({
      ...prev,
      numCols: newCols,
      gates: prev.gates.filter((g) => g.colIndex < newCols),
    }));
  };

  const handleResetCircuit = () => {
    setCircuit((prev) => ({
      ...prev,
      gates: [],
    }));
    setEvalResult(null);
  };

  // Submit circuit for automated evaluation
  const handleSubmitEvaluation = async () => {
    if (!challenge) return;
    setIsSubmitting(true);
    setEvalResult(null);
    setErrorMsg(null);

    try {
      const result = await challengeService.submitChallenge(challenge.id, circuit);
      setEvalResult(result);
    } catch (err: any) {
      console.error('Challenge evaluation failed:', err);
      setErrorMsg('Failed to evaluate challenge circuit. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Fetch Progressive Socratic Hint
  const handleRequestHint = async () => {
    if (!challenge) return;
    setIsLoadingHint(true);
    try {
      const hintData = await challengeService.getChallengeHint(challenge.id, hintLevel);
      setCurrentHint(hintData.hint);
      setHintLevel((prev) => prev + 1);
    } catch (err) {
      console.error('Failed to retrieve hint:', err);
    } finally {
      setIsLoadingHint(false);
    }
  };

  if (isLoading) {
    return (
      <PageContainer title="Loading Challenge..." subtitle="Setting up quantum simulator environment.">
        <LoadingState message="Configuring challenge parameters..." />
      </PageContainer>
    );
  }

  if (errorMsg && !challenge) {
    return (
      <PageContainer title="Challenge Error" subtitle="Unable to load challenge.">
        <ErrorState title="Challenge Unavailable" message={errorMsg} onRetry={fetchChallenge} />
      </PageContainer>
    );
  }

  if (!challenge) return null;

  return (
    <PageContainer
      title={challenge.title}
      subtitle={`Category: ${challenge.category} • Difficulty: ${challenge.difficulty}`}
      badge={<Badge variant="purple" size="sm">+{challenge.points_reward} XP Reward</Badge>}
      actions={
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/student/challenges')}
            leftIcon={<ArrowLeft className="w-3.5 h-3.5" />}
          >
            All Challenges
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handleResetCircuit}
            leftIcon={<RotateCcw className="w-3.5 h-3.5" />}
          >
            Reset
          </Button>

          <Button
            variant="glow"
            size="sm"
            onClick={handleSubmitEvaluation}
            isLoading={isSubmitting}
            leftIcon={<Send className="w-3.5 h-3.5" />}
          >
            Submit for Evaluation
          </Button>
        </div>
      }
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* ============================================================ */}
        {/* LEFT COLUMN: Challenge Requirements & Specs (3 Cols) */}
        {/* ============================================================ */}
        <div className="lg:col-span-3 space-y-4">
          <Card variant="glass" padding="md" className="space-y-4">
            <div>
              <span className="text-[10px] uppercase font-bold text-cyan-400 tracking-wider">
                Objective
              </span>
              <h3 className="text-base font-bold text-white mt-0.5">{challenge.title}</h3>
              <p className="text-xs text-slate-300 leading-relaxed mt-2">
                {challenge.description}
              </p>
            </div>

            {challenge.target_state_vector && (
              <div className="p-3 rounded-xl bg-purple-950/40 border border-purple-500/30 space-y-1">
                <span className="text-[10px] uppercase font-bold text-purple-300">
                  Target State
                </span>
                <p className="font-mono text-xs font-bold text-purple-200">
                  {challenge.target_state_vector}
                </p>
              </div>
            )}

            <div className="pt-2 border-t border-white/5 space-y-2 text-xs text-slate-400">
              <div className="flex items-center justify-between">
                <span>Qubits Available:</span>
                <strong className="text-white font-mono">{circuit.numQubits}</strong>
              </div>
              <div className="flex items-center justify-between">
                <span>Classical Registers:</span>
                <strong className="text-white font-mono">{circuit.numClassicalBits}</strong>
              </div>
              <div className="flex items-center justify-between">
                <span>Evaluation Backend:</span>
                <strong className="text-cyan-400">Qiskit Aer Simulator</strong>
              </div>
            </div>
          </Card>
        </div>

        {/* ============================================================ */}
        {/* CENTER COLUMN: Gate Palette & Interactive Circuit Grid (6 Cols) */}
        {/* ============================================================ */}
        <div className="lg:col-span-6 space-y-4">
          {/* Gate Palette */}
          <div className="glass-panel rounded-2xl p-3 border-slate-800">
            <GatePalette
              selectedGate={selectedGate}
              onSelectGate={(g: GateType | null) => setSelectedGate(g)}
            />
          </div>

          {/* Interactive Circuit Canvas */}
          <div className="glass-panel rounded-2xl p-4 border-slate-800">
            <div className="flex items-center justify-between pb-3 mb-2 border-b border-white/5">
              <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                <Cpu className="w-4 h-4 text-cyan-400" />
                <span>Quantum Circuit Canvas</span>
              </span>
              <span className="text-[11px] text-slate-400">
                Click grid to place {selectedGate ? `[${selectedGate}]` : 'selected gate'}
              </span>
            </div>

            <CircuitGrid
              circuit={circuit}
              selectedGate={selectedGate}
              onPlaceGate={handlePlaceGate}
              onRemoveGate={handleRemoveGate}
              onUpdateGate={handleUpdateGate}
              onAddQubit={handleAddQubit}
              onRemoveQubit={handleRemoveQubit}
              onAddClassicalBit={handleAddClassicalBit}
              onRemoveClassicalBit={handleRemoveClassicalBit}
              onAddColumn={handleAddColumn}
              onRemoveColumn={handleRemoveColumn}
            />
          </div>
        </div>

        {/* ============================================================ */}
        {/* RIGHT COLUMN: Evaluation Outcome, Hints & AI Help (3 Cols) */}
        {/* ============================================================ */}
        <div className="lg:col-span-3 space-y-4">
          {/* Evaluation Results Card */}
          {evalResult && (
            <Card
              variant="glass"
              padding="md"
              className={`border animate-in fade-in duration-300 ${
                evalResult.solved ? 'border-emerald-500/50 bg-emerald-950/20' : 'border-rose-500/50 bg-rose-950/20'
              }`}
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Badge variant={evalResult.solved ? 'emerald' : 'rose'} size="xs">
                    {evalResult.solved ? (
                      <span className="flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> Challenge Solved!
                      </span>
                    ) : (
                      <span className="flex items-center gap-1">
                        <XCircle className="w-3 h-3" /> Criteria Not Met
                      </span>
                    )}
                  </Badge>

                  {evalResult.awarded_xp > 0 && (
                    <span className="text-xs font-bold text-amber-300 flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5" /> +{evalResult.awarded_xp} XP
                    </span>
                  )}
                </div>

                <p className="text-xs font-medium text-white leading-relaxed">
                  {evalResult.message}
                </p>

                {/* Detailed Test Checks */}
                {evalResult.detailed_checks && evalResult.detailed_checks.length > 0 && (
                  <div className="space-y-1.5 pt-2 border-t border-white/5 text-[11px] font-mono">
                    {evalResult.detailed_checks.map((check, cIdx) => (
                      <p
                        key={cIdx}
                        className={check.includes('✓') || check.includes('Passed') ? 'text-emerald-400' : 'text-rose-400'}
                      >
                        {check}
                      </p>
                    ))}
                  </div>
                )}

                {/* Ask AI Feedback button if failed */}
                {!evalResult.solved && (
                  <div className="pt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full"
                      onClick={() =>
                        navigate('/student/ai-tutor', {
                          state: {
                            initialPrompt: `I am attempting the quantum challenge '${challenge.title}' with target '${challenge.target_state_vector}'. My circuit failed with message: '${evalResult.message}'. Can you guide me through fixing this circuit without giving away the full answer?`,
                            circuit: circuit,
                            simulationResults: evalResult.simulation_results,
                          },
                        })
                      }
                      leftIcon={<Bot className="w-4 h-4 text-purple-400" />}
                    >
                      Ask AI Tutor for Feedback
                    </Button>
                  </div>
                )}
              </div>
            </Card>
          )}

          {/* Socratic Hints Box */}
          <Card variant="glass" padding="md" className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase text-slate-300 flex items-center gap-1.5">
                <Lightbulb className="w-4 h-4 text-amber-400" />
                <span>Progressive Hints</span>
              </h4>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleRequestHint}
                isLoading={isLoadingHint}
                className="text-amber-300 hover:text-amber-200 text-xs px-2 py-1"
              >
                {currentHint ? 'Next Hint' : 'Get Hint'}
              </Button>
            </div>

            {currentHint ? (
              <div className="p-3 rounded-xl bg-amber-950/30 border border-amber-500/20 text-xs text-amber-200 leading-relaxed">
                {currentHint}
              </div>
            ) : (
              <p className="text-xs text-slate-500">
                Stuck on gate order or target states? Request a progressive Socratic hint.
              </p>
            )}
          </Card>
        </div>
      </div>
    </PageContainer>
  );
};

export default StudentChallengeSolver;
