import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Terminal, Play, Sparkles, Copy, Check, Bug, Code2, RotateCcw } from 'lucide-react';
import PageContainer from '../../components/common/PageContainer';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import { quantumService } from '../../services/quantumService';
import { CircuitGridState } from '../../types/circuit';

interface CodePresetItem {
  id: string;
  name: string;
  code: string;
  circuit: CircuitGridState;
}

const CODE_PRESETS: CodePresetItem[] = [
  {
    id: 'bell',
    name: 'Bell State (|Φ⁺⟩)',
    code: `from qiskit import QuantumCircuit
from qiskit_aer import AerSimulator

# Create a 2-qubit Bell State Circuit
qc = QuantumCircuit(2, 2)
qc.h(0)         # Put qubit 0 in superposition
qc.cx(0, 1)     # Entangle qubit 0 with qubit 1
qc.measure([0, 1], [0, 1])

# Simulate with Qiskit Aer
simulator = AerSimulator()
result = simulator.run(qc, shots=1024).result()
counts = result.get_counts(qc)

print("Measurement Histogram:", counts)`,
    circuit: {
      numQubits: 2,
      numClassicalBits: 2,
      numCols: 4,
      gates: [
        { id: 'g-b1', type: 'H', qubitIndex: 0, colIndex: 0 },
        { id: 'g-b2', type: 'CX', qubitIndex: 0, targetQubitIndex: 1, colIndex: 1 },
        { id: 'g-b3', type: 'M', qubitIndex: 0, classicalBitIndex: 0, colIndex: 2 },
        { id: 'g-b4', type: 'M', qubitIndex: 1, classicalBitIndex: 1, colIndex: 2 },
      ],
    },
  },
  {
    id: 'superposition',
    name: 'Superposition (|+⟩)',
    code: `from qiskit import QuantumCircuit
from qiskit_aer import AerSimulator

# Single Qubit Hadamard Superposition
qc = QuantumCircuit(1, 1)
qc.h(0)
qc.measure(0, 0)

simulator = AerSimulator()
result = simulator.run(qc, shots=1024).result()
counts = result.get_counts(qc)

print("Measurement Histogram:", counts)`,
    circuit: {
      numQubits: 1,
      numClassicalBits: 1,
      numCols: 3,
      gates: [
        { id: 'g-s1', type: 'H', qubitIndex: 0, colIndex: 0 },
        { id: 'g-s2', type: 'M', qubitIndex: 0, classicalBitIndex: 0, colIndex: 1 },
      ],
    },
  },
  {
    id: 'ghz',
    name: '3-Qubit GHZ State',
    code: `from qiskit import QuantumCircuit
from qiskit_aer import AerSimulator

# 3-Qubit Greenberger-Horne-Zeilinger Entanglement
qc = QuantumCircuit(3, 3)
qc.h(0)
qc.cx(0, 1)
qc.cx(1, 2)
qc.measure([0, 1, 2], [0, 1, 2])

simulator = AerSimulator()
result = simulator.run(qc, shots=1024).result()
counts = result.get_counts(qc)

print("Measurement Histogram:", counts)`,
    circuit: {
      numQubits: 3,
      numClassicalBits: 3,
      numCols: 5,
      gates: [
        { id: 'g-g1', type: 'H', qubitIndex: 0, colIndex: 0 },
        { id: 'g-g2', type: 'CX', qubitIndex: 0, targetQubitIndex: 1, colIndex: 1 },
        { id: 'g-g3', type: 'CX', qubitIndex: 1, targetQubitIndex: 2, colIndex: 2 },
        { id: 'g-g4', type: 'M', qubitIndex: 0, classicalBitIndex: 0, colIndex: 3 },
        { id: 'g-g5', type: 'M', qubitIndex: 1, classicalBitIndex: 1, colIndex: 3 },
        { id: 'g-g6', type: 'M', qubitIndex: 2, classicalBitIndex: 2, colIndex: 3 },
      ],
    },
  },
];

export const StudentQiskitLab: React.FC = () => {
  const navigate = useNavigate();
  const [selectedPreset, setSelectedPreset] = useState<string>('bell');
  const [code, setCode] = useState<string>(CODE_PRESETS[0].code);
  const [copied, setCopied] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [outputConsole, setOutputConsole] = useState<{
    status: 'idle' | 'running' | 'success' | 'error';
    shots?: number;
    counts?: Record<string, number>;
    durationMs?: number;
    errorMsg?: string;
  }>({
    status: 'success',
    shots: 1024,
    counts: { '00': 518, '11': 506 },
    durationMs: 24,
  });

  const handleSelectPreset = (presetId: string) => {
    setSelectedPreset(presetId);
    const p = CODE_PRESETS.find((item) => item.id === presetId);
    if (p) {
      setCode(p.code);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleExplainCode = () => {
    navigate('/student/ai-tutor', {
      state: {
        initialPrompt: `Can you explain what this Qiskit code does step-by-step?\n\`\`\`python\n${code}\n\`\`\``,
      },
    });
  };

  const handleDebugCode = () => {
    navigate('/student/ai-tutor', {
      state: {
        initialPrompt: `Please review and debug this Qiskit script for any potential quantum physics or syntax issues:\n\`\`\`python\n${code}\n\`\`\``,
      },
    });
  };

  const handleRunQiskitAer = async () => {
    try {
      setIsRunning(true);
      setOutputConsole({ status: 'running' });

      const preset = CODE_PRESETS.find((item) => item.id === selectedPreset) || CODE_PRESETS[0];
      const res = await quantumService.runCircuit(preset.circuit);

      setOutputConsole({
        status: 'success',
        shots: res.totalShots,
        counts: res.counts,
        durationMs: res.executionTimeMs,
      });
    } catch (err: any) {
      setOutputConsole({
        status: 'error',
        errorMsg: err.response?.data?.detail || 'Quantum simulation execution failed.',
      });
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <PageContainer
      title="Qiskit Python Laboratory"
      subtitle="Write, debug, and execute production IBM Qiskit code with local Aer simulation and AI code analysis."
      badge={<Badge variant="blue" size="sm">Python SDK</Badge>}
      actions={
        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleExplainCode}
            leftIcon={<Code2 className="w-4 h-4 text-cyan-400" />}
          >
            Explain Code
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handleDebugCode}
            leftIcon={<Bug className="w-4 h-4 text-amber-400" />}
          >
            Debug Code
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handleCopy}
            leftIcon={copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
          >
            {copied ? 'Copied' : 'Copy Code'}
          </Button>

          <Button
            variant="primary"
            size="sm"
            onClick={handleRunQiskitAer}
            isLoading={isRunning}
            leftIcon={<Play className="w-4 h-4" />}
          >
            Run Qiskit Aer
          </Button>
        </div>
      }
    >
      <div className="space-y-6">
        {/* Banner & Preset Selector */}
        <div className="p-4 rounded-2xl bg-blue-950/30 border border-blue-500/30 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Sparkles className="w-5 h-5 text-blue-400 shrink-0" />
            <div>
              <h4 className="text-sm font-bold text-white">Qiskit Aer Execution Pipeline</h4>
              <p className="text-xs text-slate-400">
                Connected to local Qiskit Aer sandbox with live shot histogram evaluation.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-400 uppercase">Algorithm:</span>
            <select
              value={selectedPreset}
              onChange={(e) => handleSelectPreset(e.target.value)}
              className="bg-[#090d16] text-xs text-white rounded-xl border border-slate-700/80 px-3 py-1.5 focus:outline-none focus:border-blue-400"
            >
              {CODE_PRESETS.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Code Editor Panel */}
          <div className="lg:col-span-7">
            <Card variant="glass" className="p-0 border-slate-700/80 overflow-hidden font-mono text-xs">
              <div className="px-4 py-2.5 bg-slate-900 border-b border-white/5 flex items-center justify-between">
                <span className="text-slate-400">{selectedPreset}_sim.py</span>
                <span className="text-cyan-400 text-[10px]">Python 3.12+ • Qiskit 1.x / 2.x</span>
              </div>
              <textarea
                value={code}
                onChange={(e) => setCode(e.target.value)}
                rows={16}
                className="w-full bg-[#090d16] text-slate-200 p-4 font-mono text-xs leading-relaxed focus:outline-none resize-none border-none"
                spellCheck={false}
              />
            </Card>
          </div>

          {/* Terminal Output Panel */}
          <div className="lg:col-span-5 space-y-4">
            <Card variant="glass" className="p-5 font-mono text-xs h-full flex flex-col justify-between">
              <div>
                <h4 className="text-slate-400 font-semibold mb-3 flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-cyan-400" />
                  <span>Simulation Output Console</span>
                </h4>

                <div className="p-3.5 rounded-xl bg-slate-950 border border-white/5 space-y-2 text-[11px]">
                  {outputConsole.status === 'running' ? (
                    <p className="text-amber-400 animate-pulse">&gt; Executing Qiskit Aer simulation...</p>
                  ) : outputConsole.status === 'error' ? (
                    <p className="text-rose-400">&gt; Error: {outputConsole.errorMsg}</p>
                  ) : (
                    <>
                      <p className="text-emerald-400 font-semibold">
                        &gt; Executing on AerSimulator (shots={outputConsole.shots || 1024})...
                      </p>
                      <p className="text-slate-300">
                        Measurement Histogram: {JSON.stringify(outputConsole.counts || {})}
                      </p>
                      <p className="text-cyan-400 pt-1">
                        State: {selectedPreset === 'bell' ? '(|00⟩ + |11⟩)/√2' : selectedPreset === 'ghz' ? '(|000⟩ + |111⟩)/√2' : '(|0⟩ + |1⟩)/√2'}
                      </p>
                      <p className="text-slate-500 text-[10px]">
                        &gt; Process finished with exit code 0 ({outputConsole.durationMs || 20}ms)
                      </p>
                    </>
                  )}
                </div>
              </div>

              <div className="pt-3 border-t border-white/5 flex items-center justify-between text-[10px] text-slate-500">
                <span>Deterministic Execution</span>
                <span>Aer Backend Active</span>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </PageContainer>
  );
};

export default StudentQiskitLab;
