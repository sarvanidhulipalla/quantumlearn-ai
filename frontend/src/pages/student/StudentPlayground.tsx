import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Play,
  RotateCcw,
  Undo2,
  Redo2,
  Code2,
  Save,
  Trash2,
  FolderOpen,
  Sparkles,
  Layers,
  AlertTriangle,
  FileCode,
  Cpu,
  Zap,
  CheckCircle2,
  XCircle,
  Bot,
} from 'lucide-react';
import {
  CircuitGridState,
  GateType,
  PlacedGate,
  QuantumSimulationResult,
  CircuitTemplate,
} from '../../types/circuit';
import { simulateCircuit } from '../../utils/quantumSimulator';
import { generateQiskitCode } from '../../utils/qiskitExporter';
import { quantumService } from '../../services/quantumService';
import PageContainer from '../../components/common/PageContainer';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import GatePalette from '../../components/playground/GatePalette';
import CircuitGrid from '../../components/playground/CircuitGrid';
import ResultsPanel from '../../components/playground/ResultsPanel';
import QiskitCodeModal from '../../components/playground/QiskitCodeModal';
import SaveCircuitModal from '../../components/playground/SaveCircuitModal';

// Pre-built Circuit Templates
const CIRCUIT_TEMPLATES: CircuitTemplate[] = [
  {
    id: 'bell-state',
    name: 'Bell State (|Φ⁺⟩)',
    description: '2-qubit maximally entangled state (|00⟩ + |11⟩)/√2',
    numQubits: 2,
    numClassicalBits: 2,
    gates: [
      { type: 'H', qubitIndex: 0, colIndex: 0 },
      { type: 'CX', qubitIndex: 0, colIndex: 1, targetQubitIndex: 1 },
      { type: 'M', qubitIndex: 0, colIndex: 2, classicalBitIndex: 0 },
      { type: 'M', qubitIndex: 1, colIndex: 2, classicalBitIndex: 1 },
    ],
  },
  {
    id: 'superposition',
    name: 'Superposition State (|+⟩)',
    description: 'Single-qubit balanced 50/50 superposition state',
    numQubits: 1,
    numClassicalBits: 1,
    gates: [
      { type: 'H', qubitIndex: 0, colIndex: 0 },
      { type: 'M', qubitIndex: 0, colIndex: 1, classicalBitIndex: 0 },
    ],
  },
  {
    id: 'ghz-state',
    name: '3-Qubit GHZ State',
    description: 'Tripartite maximally entangled state (|000⟩ + |111⟩)/√2',
    numQubits: 3,
    numClassicalBits: 3,
    gates: [
      { type: 'H', qubitIndex: 0, colIndex: 0 },
      { type: 'CX', qubitIndex: 0, colIndex: 1, targetQubitIndex: 1 },
      { type: 'CX', qubitIndex: 1, colIndex: 2, targetQubitIndex: 2 },
      { type: 'M', qubitIndex: 0, colIndex: 3, classicalBitIndex: 0 },
      { type: 'M', qubitIndex: 1, colIndex: 3, classicalBitIndex: 1 },
      { type: 'M', qubitIndex: 2, colIndex: 3, classicalBitIndex: 2 },
    ],
  },
  {
    id: 'teleportation-prep',
    name: 'Quantum Teleportation Prep',
    description: 'Creates EPR channel between Alice (q1) and Bob (q2)',
    numQubits: 3,
    numClassicalBits: 2,
    gates: [
      { type: 'H', qubitIndex: 1, colIndex: 0 },
      { type: 'CX', qubitIndex: 1, colIndex: 1, targetQubitIndex: 2 },
      { type: 'CX', qubitIndex: 0, colIndex: 2, targetQubitIndex: 1 },
      { type: 'H', qubitIndex: 0, colIndex: 3 },
      { type: 'M', qubitIndex: 0, colIndex: 4, classicalBitIndex: 0 },
      { type: 'M', qubitIndex: 1, colIndex: 4, classicalBitIndex: 1 },
    ],
  },
];

// Initial default circuit: 2-Qubit Bell State
const INITIAL_CIRCUIT: CircuitGridState = {
  numQubits: 2,
  numClassicalBits: 2,
  numCols: 6,
  gates: [
    { id: 'g_init_1', type: 'H', qubitIndex: 0, colIndex: 0 },
    { id: 'g_init_2', type: 'CX', qubitIndex: 0, colIndex: 1, targetQubitIndex: 1 },
    { id: 'g_init_3', type: 'M', qubitIndex: 0, colIndex: 2, classicalBitIndex: 0 },
    { id: 'g_init_4', type: 'M', qubitIndex: 1, colIndex: 2, classicalBitIndex: 1 },
  ],
};

type ExecutionMode = 'preview' | 'qiskit_aer';
type ExecutionStatus = 'idle' | 'running' | 'completed' | 'failed';

export const StudentPlayground: React.FC = () => {
  const navigate = useNavigate();
  const [circuit, setCircuit] = useState<CircuitGridState>(INITIAL_CIRCUIT);
  const [selectedGate, setSelectedGate] = useState<GateType | null>(null);

  // Execution Engine & Settings
  const [execMode, setExecMode] = useState<ExecutionMode>('qiskit_aer');
  const [shots, setShots] = useState<number>(1024);
  const [execStatus, setExecStatus] = useState<ExecutionStatus>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Undo / Redo History Stacks
  const [history, setHistory] = useState<CircuitGridState[]>([]);
  const [redoStack, setRedoStack] = useState<CircuitGridState[]>([]);

  // Simulation State
  const [results, setResults] = useState<QuantumSimulationResult | null>(null);
  const [isRunning, setIsRunning] = useState<boolean>(false);

  // Modals
  const [isCodeModalOpen, setIsCodeModalOpen] = useState<boolean>(false);
  const [isSaveModalOpen, setIsSaveModalOpen] = useState<boolean>(false);

  // Run Simulation Calculation (Client Preview or Real Qiskit Aer Backend)
  const runSimulation = useCallback(
    async (currentCircuit: CircuitGridState, forceMode?: ExecutionMode) => {
      const activeMode = forceMode || execMode;
      setIsRunning(true);
      setExecStatus('running');
      setErrorMessage(null);

      if (activeMode === 'qiskit_aer') {
        try {
          const res = await quantumService.runCircuit(currentCircuit, shots);
          setResults(res);
          setExecStatus('completed');
        } catch (err: any) {
          console.error('Qiskit Aer backend execution failed:', err);
          const detail =
            err.response?.data?.detail ||
            'Quantum execution failed on backend. Falling back to local simulation.';
          setErrorMessage(typeof detail === 'string' ? detail : JSON.stringify(detail));
          setExecStatus('failed');

          // Fallback to local simulator for uninterrupted user experience
          const fallbackRes = simulateCircuit(currentCircuit, shots);
          setResults(fallbackRes);
        } finally {
          setIsRunning(false);
        }
      } else {
        // Fast Preview mode
        try {
          const res = simulateCircuit(currentCircuit, shots);
          setResults(res);
          setExecStatus('completed');
        } catch (e: any) {
          console.error('Preview simulation error:', e);
          setErrorMessage('Local simulation error: ' + (e.message || 'Invalid state'));
          setExecStatus('failed');
        } finally {
          setIsRunning(false);
        }
      }
    },
    [execMode, shots]
  );

  // Run on initial mount
  useEffect(() => {
    runSimulation(circuit);
  }, []);

  // Update circuit with history snapshot
  const updateCircuitState = (newCircuit: CircuitGridState) => {
    setHistory((prev) => [...prev, circuit]);
    setRedoStack([]);
    setCircuit(newCircuit);

    // If in fast preview, run immediately; if in Qiskit Aer, run immediately or let user press Run
    runSimulation(newCircuit);
  };

  // Undo
  const handleUndo = () => {
    if (history.length === 0) return;
    const previous = history[history.length - 1];
    setHistory((prev) => prev.slice(0, prev.length - 1));
    setRedoStack((prev) => [...prev, circuit]);
    setCircuit(previous);
    runSimulation(previous);
  };

  // Redo
  const handleRedo = () => {
    if (redoStack.length === 0) return;
    const next = redoStack[redoStack.length - 1];
    setRedoStack((prev) => prev.slice(0, prev.length - 1));
    setHistory((prev) => [...prev, circuit]);
    setCircuit(next);
    runSimulation(next);
  };

  // Reset / Clear Circuit
  const handleClearCircuit = () => {
    const emptyCircuit: CircuitGridState = {
      numQubits: circuit.numQubits,
      numClassicalBits: circuit.numClassicalBits,
      numCols: circuit.numCols,
      gates: [],
    };
    updateCircuitState(emptyCircuit);
    setSelectedGate(null);
  };

  // Load Template
  const handleLoadTemplate = (template: CircuitTemplate) => {
    const newCircuit: CircuitGridState = {
      numQubits: template.numQubits,
      numClassicalBits: template.numClassicalBits,
      numCols: Math.max(6, template.gates.reduce((max, g) => Math.max(max, g.colIndex + 2), 6)),
      gates: template.gates.map((g, idx) => ({
        ...g,
        id: `tpl_gate_${idx}_${Date.now()}`,
      })),
    };
    updateCircuitState(newCircuit);
    setSelectedGate(null);
  };

  // Place Gate on Cell
  const handlePlaceGate = (gateData: Omit<PlacedGate, 'id'>) => {
    const filtered = circuit.gates.filter(
      (g) => !(g.qubitIndex === gateData.qubitIndex && g.colIndex === gateData.colIndex)
    );

    const newGate: PlacedGate = {
      ...gateData,
      id: `gate_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
    };

    updateCircuitState({
      ...circuit,
      gates: [...filtered, newGate],
    });
  };

  // Remove Gate
  const handleRemoveGate = (gateId: string) => {
    updateCircuitState({
      ...circuit,
      gates: circuit.gates.filter((g) => g.id !== gateId),
    });
  };

  // Update Gate (e.g. change CNOT target)
  const handleUpdateGate = (updatedGate: PlacedGate) => {
    updateCircuitState({
      ...circuit,
      gates: circuit.gates.map((g) => (g.id === updatedGate.id ? updatedGate : g)),
    });
  };

  // Add / Remove Qubits
  const handleAddQubit = () => {
    if (circuit.numQubits >= 6) return;
    updateCircuitState({
      ...circuit,
      numQubits: circuit.numQubits + 1,
    });
  };

  const handleRemoveQubit = () => {
    if (circuit.numQubits <= 1) return;
    const nextQubits = circuit.numQubits - 1;
    updateCircuitState({
      ...circuit,
      numQubits: nextQubits,
      gates: circuit.gates.filter(
        (g) => g.qubitIndex < nextQubits && (g.targetQubitIndex === undefined || g.targetQubitIndex < nextQubits)
      ),
    });
  };

  // Add / Remove Classical Bits
  const handleAddClassicalBit = () => {
    if (circuit.numClassicalBits >= 6) return;
    updateCircuitState({
      ...circuit,
      numClassicalBits: circuit.numClassicalBits + 1,
    });
  };

  const handleRemoveClassicalBit = () => {
    if (circuit.numClassicalBits <= 1) return;
    updateCircuitState({
      ...circuit,
      numClassicalBits: circuit.numClassicalBits - 1,
    });
  };

  // Add / Remove Columns
  const handleAddColumn = () => {
    if (circuit.numCols >= 14) return;
    updateCircuitState({
      ...circuit,
      numCols: circuit.numCols + 1,
    });
  };

  const handleRemoveColumn = () => {
    if (circuit.numCols <= 4) return;
    const nextCols = circuit.numCols - 1;
    updateCircuitState({
      ...circuit,
      numCols: nextCols,
      gates: circuit.gates.filter((g) => g.colIndex < nextCols),
    });
  };

  const generatedQiskit = generateQiskitCode(circuit);

  return (
    <PageContainer
      title="Quantum Circuit Playground"
      subtitle="Interactive circuit builder with real Python Qiskit Aer simulation, statevectors, and Bloch spheres."
      badge={<Badge variant="purple" size="sm">Qiskit Aer Ready</Badge>}
      actions={
        <div className="flex flex-wrap items-center gap-2">
          {/* Ask AI About Circuit Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              navigate('/student/ai-tutor', {
                state: {
                  initialPrompt:
                    'Can you analyze this quantum circuit and explain the physical effect of each gate in sequence?',
                  circuit: circuit,
                  simulationResults: results,
                },
              })
            }
            leftIcon={<Bot className="w-4 h-4 text-[#2b2b2b]" />}
          >
            Ask AI
          </Button>

          {/* Export Qiskit Code Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsCodeModalOpen(true)}
            leftIcon={<Code2 className="w-4 h-4 text-[#2b2b2b]" />}
          >
            Qiskit Code
          </Button>

          {/* Save Circuit Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsSaveModalOpen(true)}
            leftIcon={<Save className="w-4 h-4 text-[#2b2b2b]" />}
          >
            Save / Load
          </Button>

          {/* Run Circuit Button */}
          <Button
            variant="primary"
            size="sm"
            onClick={() => runSimulation(circuit)}
            isLoading={isRunning}
            leftIcon={<Play className="w-4 h-4 fill-white" />}
          >
            {execMode === 'qiskit_aer' ? 'Run on Qiskit Aer' : 'Run Fast Preview'}
          </Button>
        </div>
      }
    >
      <div className="space-y-6">
        {/* EXECUTION ENGINE & SETTINGS BAR */}
        <div className="p-4 rounded-2xl bg-[#ffffff] border border-[#d4d4d4] shadow-xs flex flex-wrap items-center justify-between gap-4">
          {/* Execution Mode Switcher */}
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold uppercase tracking-wider text-[#2b2b2b] flex items-center gap-1.5">
              <Cpu className="w-4 h-4 text-[#2b2b2b]" />
              <span>Backend Engine:</span>
            </span>

            <div className="flex items-center gap-1 p-1 rounded-xl bg-[#f4f4f4] border border-[#d4d4d4]">
              <button
                onClick={() => {
                  setExecMode('qiskit_aer');
                  runSimulation(circuit, 'qiskit_aer');
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  execMode === 'qiskit_aer'
                    ? 'bg-[#2b2b2b] text-[#ffffff] shadow-xs'
                    : 'text-[#2b2b2b]/70 hover:text-[#2b2b2b]'
                }`}
              >
                Qiskit Aer Backend
              </button>

              <button
                onClick={() => {
                  setExecMode('preview');
                  runSimulation(circuit, 'preview');
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  execMode === 'preview'
                    ? 'bg-[#2b2b2b] text-[#ffffff] shadow-xs'
                    : 'text-[#2b2b2b]/70 hover:text-[#2b2b2b]'
                }`}
              >
                Fast Preview
              </button>
            </div>
          </div>

          {/* Shots Selector & Status Badge */}
          <div className="flex items-center gap-3">
            {/* Shots Selector */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-[#2b2b2b]/70 font-semibold">Shots:</span>
              <select
                value={shots}
                onChange={(e) => {
                  const newShots = Number(e.target.value);
                  setShots(newShots);
                  runSimulation(circuit);
                }}
                className="bg-[#ffffff] text-xs font-mono text-[#2b2b2b] font-bold rounded-lg border border-[#d4d4d4] px-2.5 py-1 focus:outline-none focus:border-[#2b2b2b] cursor-pointer shadow-xs"
              >
                <option value={128}>128 shots</option>
                <option value={256}>256 shots</option>
                <option value={512}>512 shots</option>
                <option value={1024}>1024 shots</option>
                <option value={2048}>2048 shots</option>
                <option value={4096}>4096 shots</option>
              </select>
            </div>

            {/* Status Indicator */}
            {execStatus === 'running' && (
              <Badge variant="cyan" size="xs">
                <span className="animate-pulse">Running Aer...</span>
              </Badge>
            )}
            {execStatus === 'completed' && (
              <Badge variant="purple" size="xs">
                <span className="flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-[#2b2b2b]" />
                  {execMode === 'qiskit_aer' ? 'Aer Verified' : 'Preview Active'}
                </span>
              </Badge>
            )}
            {execStatus === 'failed' && (
              <Badge variant="rose" size="xs">
                <span className="flex items-center gap-1">
                  <XCircle className="w-3 h-3" /> Error
                </span>
              </Badge>
            )}
          </div>
        </div>

        {/* Error Alert Banner */}
        {errorMessage && (
          <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center justify-between animate-in fade-in duration-200">
            <div className="flex items-center gap-2.5">
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
              <div>
                <span className="font-bold block text-stone-900">Execution Issue</span>
                <span>{errorMessage}</span>
              </div>
            </div>
            <button
              onClick={() => setErrorMessage(null)}
              className="text-rose-600 hover:text-rose-800 text-xs underline cursor-pointer font-semibold"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* TOP TOOLBAR: Templates, Undo, Redo, Clear */}
        <div className="p-3.5 rounded-2xl bg-[#ffffff] border border-[#d4d4d4] shadow-xs flex flex-wrap items-center justify-between gap-3">
          {/* Templates Dropdown */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-[#2b2b2b]/70 uppercase tracking-wider hidden sm:inline">
              Templates:
            </span>
            <select
              onChange={(e) => {
                const tpl = CIRCUIT_TEMPLATES.find((t) => t.id === e.target.value);
                if (tpl) handleLoadTemplate(tpl);
              }}
              defaultValue="bell-state"
              className="bg-[#ffffff] text-xs text-[#2b2b2b] font-semibold rounded-xl border border-[#d4d4d4] px-3 py-1.5 focus:outline-none focus:border-[#2b2b2b] cursor-pointer shadow-xs"
            >
              {CIRCUIT_TEMPLATES.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
          </div>

          {/* Action Tools */}
          <div className="flex items-center gap-1.5">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleUndo}
              disabled={history.length === 0}
              leftIcon={<Undo2 className="w-4 h-4" />}
              title="Undo last change"
            >
              Undo
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={handleRedo}
              disabled={redoStack.length === 0}
              leftIcon={<Redo2 className="w-4 h-4" />}
              title="Redo change"
            >
              Redo
            </Button>

            <div className="w-px h-5 bg-[#d4d4d4] mx-1" />

            <Button
              variant="ghost"
              size="sm"
              onClick={handleClearCircuit}
              leftIcon={<Trash2 className="w-4 h-4 text-rose-600" />}
              className="text-rose-600 hover:text-rose-700 hover:bg-rose-50"
            >
              Clear
            </Button>
          </div>
        </div>

        {/* GATE PALETTE */}
        <GatePalette
          selectedGate={selectedGate}
          onSelectGate={setSelectedGate}
        />

        {/* CIRCUIT CANVAS GRID */}
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

        {/* RESULTS PANEL (Statevector, Histogram, Bloch Spheres) */}
        <ResultsPanel results={results} isRunning={isRunning} />
      </div>

      {/* MODALS */}
      <QiskitCodeModal
        isOpen={isCodeModalOpen}
        onClose={() => setIsCodeModalOpen(false)}
        qiskitCode={generatedQiskit}
      />

      <SaveCircuitModal
        isOpen={isSaveModalOpen}
        onClose={() => setIsSaveModalOpen(false)}
        currentCircuit={circuit}
        onLoadCircuit={(loaded) => updateCircuitState(loaded)}
      />
    </PageContainer>
  );
};

export default StudentPlayground;
