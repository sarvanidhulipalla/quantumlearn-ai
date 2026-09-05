import React from 'react';
import { GateType, SingleQubitGate, MultiQubitGate, MeasurementGate } from '../../types/circuit';
import Badge from '../common/Badge';

export interface GatePaletteProps {
  selectedGate: GateType | null;
  onSelectGate: (gate: GateType | null) => void;
}

interface GateDef {
  type: GateType;
  name: string;
  symbol: string;
  category: 'single' | 'multi' | 'measure';
  color: string;
  bgGradient: string;
  description: string;
  matrixSummary: string;
}

const GATES: GateDef[] = [
  // Single-Qubit Gates
  {
    type: 'H',
    name: 'Hadamard',
    symbol: 'H',
    category: 'single',
    color: 'border-cyan-400 text-white',
    bgGradient: 'from-cyan-600 to-blue-600 shadow-cyan-500/20',
    description: 'Creates equal superposition: |0⟩ → |+⟩, |1⟩ → |-⟩',
    matrixSummary: '1/√2 [[1, 1], [1, -1]]',
  },
  {
    type: 'X',
    name: 'Pauli-X',
    symbol: 'X',
    category: 'single',
    color: 'border-purple-400 text-white',
    bgGradient: 'from-purple-600 to-indigo-600 shadow-purple-500/20',
    description: 'Quantum NOT gate / bit-flip: |0⟩ ↔ |1⟩',
    matrixSummary: '[[0, 1], [1, 0]]',
  },
  {
    type: 'Y',
    name: 'Pauli-Y',
    symbol: 'Y',
    category: 'single',
    color: 'border-pink-400 text-white',
    bgGradient: 'from-pink-600 to-rose-600 shadow-pink-500/20',
    description: 'Bit-flip + Phase-flip around Y axis',
    matrixSummary: '[[0, -i], [i, 0]]',
  },
  {
    type: 'Z',
    name: 'Pauli-Z',
    symbol: 'Z',
    category: 'single',
    color: 'border-indigo-400 text-white',
    bgGradient: 'from-indigo-600 to-blue-700 shadow-indigo-500/20',
    description: 'Phase flip: |1⟩ → -|1⟩, leaves |0⟩ unchanged',
    matrixSummary: '[[1, 0], [0, -1]]',
  },
  {
    type: 'S',
    name: 'Phase (S)',
    symbol: 'S',
    category: 'single',
    color: 'border-teal-400 text-white',
    bgGradient: 'from-teal-600 to-emerald-600 shadow-teal-500/20',
    description: 'Rotates relative phase by π/2 (90° around Z axis)',
    matrixSummary: '[[1, 0], [0, i]]',
  },
  {
    type: 'T',
    name: 'π/8 Gate (T)',
    symbol: 'T',
    category: 'single',
    color: 'border-amber-400 text-white',
    bgGradient: 'from-amber-600 to-orange-600 shadow-amber-500/20',
    description: 'Rotates relative phase by π/4 (45° around Z axis)',
    matrixSummary: '[[1, 0], [0, e^{iπ/4}]]',
  },

  // Multi-Qubit Gates
  {
    type: 'CX',
    name: 'Controlled-NOT',
    symbol: 'CX',
    category: 'multi',
    color: 'border-violet-400 text-white',
    bgGradient: 'from-violet-600 to-purple-800 shadow-violet-500/20',
    description: 'Flips target qubit if control qubit is in state |1⟩ (Creates Entanglement)',
    matrixSummary: '4x4 Controlled Unitary',
  },

  // Measurement
  {
    type: 'M',
    name: 'Measurement',
    symbol: 'M',
    category: 'measure',
    color: 'border-slate-400 text-white',
    bgGradient: 'from-slate-700 to-slate-800 shadow-slate-500/20',
    description: 'Collapses qubit wavefunction into classical register bit',
    matrixSummary: 'Projection onto computational basis',
  },
];

export const GatePalette: React.FC<GatePaletteProps> = ({
  selectedGate,
  onSelectGate,
}) => {
  const handleDragStart = (e: React.DragEvent, gateType: GateType) => {
    e.dataTransfer.setData('application/quantum-gate', gateType);
    e.dataTransfer.effectAllowed = 'copy';
  };

  return (
    <div className="p-4 rounded-2xl bg-[#0b0f19] border border-slate-800 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200">
            Quantum Gate Palette
          </h4>
          <p className="text-[11px] text-slate-400">
            Drag to circuit wire, or click to place on grid.
          </p>
        </div>
        {selectedGate && (
          <button
            onClick={() => onSelectGate(null)}
            className="text-[10px] text-cyan-400 hover:underline font-mono cursor-pointer"
          >
            Deselect ({selectedGate})
          </button>
        )}
      </div>

      {/* Gates Grid */}
      <div className="grid grid-cols-4 sm:grid-cols-8 gap-2.5">
        {GATES.map((gate) => {
          const isSelected = selectedGate === gate.type;

          return (
            <div
              key={gate.type}
              draggable
              onDragStart={(e) => handleDragStart(e, gate.type)}
              onClick={() => onSelectGate(isSelected ? null : gate.type)}
              title={`${gate.name}: ${gate.description}\nMatrix: ${gate.matrixSummary}`}
              className={`p-2.5 rounded-xl border flex flex-col items-center justify-center gap-1 cursor-grab active:cursor-grabbing transition-all select-none group relative bg-gradient-to-tr ${gate.bgGradient} ${
                isSelected
                  ? 'ring-2 ring-cyan-400 ring-offset-2 ring-offset-[#0b0f19] scale-105 shadow-lg'
                  : 'hover:scale-105 hover:shadow-md'
              } ${gate.color}`}
            >
              <span className="font-extrabold text-base font-mono leading-none tracking-tight">
                {gate.symbol}
              </span>
              <span className="text-[10px] font-semibold text-white/90 truncate w-full text-center">
                {gate.name}
              </span>
            </div>
          );
        })}
      </div>

      {/* Active Selected Tool Indicator */}
      {selectedGate && (
        <div className="p-2.5 rounded-xl bg-cyan-950/80 border border-cyan-500/30 flex items-center justify-between text-xs text-cyan-300">
          <span className="font-medium">
            Active Gate Tool: <span className="font-bold font-mono">[{selectedGate}]</span> — Click any grid cell to place.
          </span>
          <Badge variant="cyan" size="xs">Active</Badge>
        </div>
      )}
    </div>
  );
};

export default GatePalette;
