import React, { useState } from 'react';
import {
  Plus,
  Minus,
  Trash2,
  X,
  PlusCircle,
  HelpCircle,
  Link as LinkIcon,
} from 'lucide-react';
import {
  CircuitGridState,
  GateType,
  PlacedGate,
} from '../../types/circuit';
import Button from '../common/Button';
import Badge from '../common/Badge';

export interface CircuitGridProps {
  circuit: CircuitGridState;
  selectedGate: GateType | null;
  onPlaceGate: (gate: Omit<PlacedGate, 'id'>) => void;
  onRemoveGate: (gateId: string) => void;
  onUpdateGate: (gate: PlacedGate) => void;
  onAddQubit: () => void;
  onRemoveQubit: () => void;
  onAddClassicalBit: () => void;
  onRemoveClassicalBit: () => void;
  onAddColumn: () => void;
  onRemoveColumn: () => void;
}

export const CircuitGrid: React.FC<CircuitGridProps> = ({
  circuit,
  selectedGate,
  onPlaceGate,
  onRemoveGate,
  onUpdateGate,
  onAddQubit,
  onRemoveQubit,
  onAddClassicalBit,
  onRemoveClassicalBit,
  onAddColumn,
  onRemoveColumn,
}) => {
  const [hoveredGateId, setHoveredGateId] = useState<string | null>(null);

  // Handle native drop from palette
  const handleDrop = (e: React.DragEvent, qubitIndex: number, colIndex: number) => {
    e.preventDefault();
    const gateType = e.dataTransfer.getData('application/quantum-gate') as GateType;
    if (!gateType) return;

    let targetQubit: number | undefined = undefined;
    if (gateType === 'CX') {
      // Pick adjacent qubit as default target
      targetQubit = qubitIndex === circuit.numQubits - 1 ? qubitIndex - 1 : qubitIndex + 1;
    }

    onPlaceGate({
      type: gateType,
      qubitIndex,
      colIndex,
      targetQubitIndex: targetQubit,
      classicalBitIndex: gateType === 'M' ? Math.min(qubitIndex, circuit.numClassicalBits - 1) : undefined,
    });
  };

  // Handle click to place
  const handleCellClick = (qubitIndex: number, colIndex: number) => {
    if (!selectedGate) return;

    let targetQubit: number | undefined = undefined;
    if (selectedGate === 'CX') {
      targetQubit = qubitIndex === circuit.numQubits - 1 ? qubitIndex - 1 : qubitIndex + 1;
    }

    onPlaceGate({
      type: selectedGate,
      qubitIndex,
      colIndex,
      targetQubitIndex: targetQubit,
      classicalBitIndex: selectedGate === 'M' ? Math.min(qubitIndex, circuit.numClassicalBits - 1) : undefined,
    });
  };

  // Find gate at specific coordinate
  const getGateAt = (qubitIndex: number, colIndex: number): PlacedGate | undefined => {
    return circuit.gates.find(
      (g) => g.qubitIndex === qubitIndex && g.colIndex === colIndex
    );
  };

  // Check if a cell is covered by a CNOT target
  const getCNOTTargetAt = (qubitIndex: number, colIndex: number): PlacedGate | undefined => {
    return circuit.gates.find(
      (g) => g.type === 'CX' && g.targetQubitIndex === qubitIndex && g.colIndex === colIndex
    );
  };

  // Color mapping for gates
  const getGateStyle = (type: GateType) => {
    switch (type) {
      case 'H':
        return 'from-cyan-600 to-blue-600 border-cyan-300 text-white';
      case 'X':
        return 'from-purple-600 to-indigo-600 border-purple-300 text-white';
      case 'Y':
        return 'from-pink-600 to-rose-600 border-pink-300 text-white';
      case 'Z':
        return 'from-indigo-600 to-blue-700 border-indigo-300 text-white';
      case 'S':
        return 'from-teal-600 to-emerald-600 border-teal-300 text-white';
      case 'T':
        return 'from-amber-600 to-orange-600 border-amber-300 text-white';
      case 'CX':
        return 'from-violet-600 to-purple-800 border-violet-300 text-white';
      case 'M':
        return 'from-slate-700 to-slate-800 border-slate-400 text-white';
      default:
        return 'from-slate-700 to-slate-800 border-slate-500 text-white';
    }
  };

  return (
    <div className="p-5 rounded-2xl bg-[#070b14] border border-slate-800 space-y-4">
      {/* Controls Bar: Add/Remove Qubits, Bits, Columns */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-white/5 text-xs">
        {/* Qubit Count Controls */}
        <div className="flex items-center gap-2">
          <span className="font-semibold text-slate-300 uppercase tracking-wider text-[11px]">
            Qubits:
          </span>
          <div className="flex items-center bg-slate-900 border border-slate-700 rounded-lg overflow-hidden">
            <button
              onClick={onRemoveQubit}
              disabled={circuit.numQubits <= 1}
              className="p-1.5 hover:bg-slate-800 disabled:opacity-30 text-slate-300 cursor-pointer disabled:cursor-not-allowed"
              title="Remove Qubit wire"
            >
              <Minus className="w-3.5 h-3.5" />
            </button>
            <span className="px-2.5 font-bold font-mono text-cyan-400">
              {circuit.numQubits}
            </span>
            <button
              onClick={onAddQubit}
              disabled={circuit.numQubits >= 6}
              className="p-1.5 hover:bg-slate-800 disabled:opacity-30 text-slate-300 cursor-pointer disabled:cursor-not-allowed"
              title="Add Qubit wire (max 6)"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Classical Bit Controls */}
        <div className="flex items-center gap-2">
          <span className="font-semibold text-slate-300 uppercase tracking-wider text-[11px]">
            Classical Bits:
          </span>
          <div className="flex items-center bg-slate-900 border border-slate-700 rounded-lg overflow-hidden">
            <button
              onClick={onRemoveClassicalBit}
              disabled={circuit.numClassicalBits <= 1}
              className="p-1.5 hover:bg-slate-800 disabled:opacity-30 text-slate-300 cursor-pointer disabled:cursor-not-allowed"
              title="Remove Classical Bit"
            >
              <Minus className="w-3.5 h-3.5" />
            </button>
            <span className="px-2.5 font-bold font-mono text-slate-200">
              {circuit.numClassicalBits}
            </span>
            <button
              onClick={onAddClassicalBit}
              disabled={circuit.numClassicalBits >= 6}
              className="p-1.5 hover:bg-slate-800 disabled:opacity-30 text-slate-300 cursor-pointer disabled:cursor-not-allowed"
              title="Add Classical Bit"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Column Time Step Controls */}
        <div className="flex items-center gap-2">
          <span className="font-semibold text-slate-300 uppercase tracking-wider text-[11px]">
            Time Steps:
          </span>
          <div className="flex items-center bg-slate-900 border border-slate-700 rounded-lg overflow-hidden">
            <button
              onClick={onRemoveColumn}
              disabled={circuit.numCols <= 4}
              className="p-1.5 hover:bg-slate-800 disabled:opacity-30 text-slate-300 cursor-pointer disabled:cursor-not-allowed"
              title="Remove Column"
            >
              <Minus className="w-3.5 h-3.5" />
            </button>
            <span className="px-2.5 font-bold font-mono text-purple-400">
              {circuit.numCols}
            </span>
            <button
              onClick={onAddColumn}
              disabled={circuit.numCols >= 14}
              className="p-1.5 hover:bg-slate-800 disabled:opacity-30 text-slate-300 cursor-pointer disabled:cursor-not-allowed"
              title="Add Column"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Circuit Diagram Scroll Container */}
      <div className="overflow-x-auto p-4 bg-slate-950/80 rounded-xl border border-white/5 font-mono select-none">
        <div className="min-w-fit space-y-6">
          {/* Column Header Steps */}
          <div className="flex items-center pl-24">
            {Array.from({ length: circuit.numCols }).map((_, cIdx) => (
              <div
                key={cIdx}
                className="w-16 text-center text-[10px] font-bold text-slate-500 uppercase"
              >
                Step {cIdx + 1}
              </div>
            ))}
          </div>

          {/* Qubit Wire Rows */}
          {Array.from({ length: circuit.numQubits }).map((_, qIdx) => (
            <div key={`qubit-${qIdx}`} className="flex items-center relative group">
              {/* Qubit Label & Initial State */}
              <div className="w-24 flex items-center gap-2 pr-3 shrink-0">
                <span className="text-xs font-bold text-slate-300">q_{qIdx}:</span>
                <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-700 text-cyan-400 text-xs font-bold shadow-inner">
                  |0⟩
                </span>
              </div>

              {/* Wire Grid Cells */}
              <div className="flex items-center relative">
                {/* Horizontal Quantum Wire Line */}
                <div className="absolute inset-x-0 h-0.5 bg-slate-700 pointer-events-none" />

                {Array.from({ length: circuit.numCols }).map((_, cIdx) => {
                  const gate = getGateAt(qIdx, cIdx);
                  const cnotTarget = getCNOTTargetAt(qIdx, cIdx);

                  return (
                    <div
                      key={`cell-${qIdx}-${cIdx}`}
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={(e) => handleDrop(e, qIdx, cIdx)}
                      onClick={() => handleCellClick(qIdx, cIdx)}
                      className="w-16 h-16 flex items-center justify-center relative z-10 cursor-pointer"
                    >
                      {/* Empty Drop / Place Target Hover Box */}
                      {!gate && !cnotTarget && (
                        <div
                          className={`w-10 h-10 rounded-lg border border-dashed transition-all flex items-center justify-center ${
                            selectedGate
                              ? 'border-cyan-500/50 bg-cyan-500/10 hover:border-cyan-400 hover:bg-cyan-500/20'
                              : 'border-slate-800 hover:border-slate-600 bg-slate-900/30'
                          }`}
                        >
                          {selectedGate && (
                            <Plus className="w-3 h-3 text-cyan-400/60" />
                          )}
                        </div>
                      )}

                      {/* Render Placed Gate */}
                      {gate && (
                        <div
                          onMouseEnter={() => setHoveredGateId(gate.id)}
                          onMouseLeave={() => setHoveredGateId(null)}
                          className={`w-12 h-12 rounded-xl bg-gradient-to-tr border shadow-lg flex flex-col items-center justify-center relative transition-all group ${getGateStyle(
                            gate.type
                          )}`}
                        >
                          {/* Gate Symbol */}
                          <span className="font-extrabold text-sm font-mono">
                            {gate.type === 'CX' ? '•' : gate.type}
                          </span>

                          {/* CX Target selector hint or delete button on hover */}
                          {hoveredGateId === gate.id && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onRemoveGate(gate.id);
                              }}
                              className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-red-600 border border-red-300 text-white flex items-center justify-center hover:bg-red-500 shadow-md cursor-pointer z-30"
                              title="Delete gate"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          )}

                          {/* If CX gate, allow picking target qubit */}
                          {gate.type === 'CX' && (
                            <div
                              onClick={(e) => {
                                e.stopPropagation();
                                // Cycle target qubit
                                const currentT = gate.targetQubitIndex ?? (qIdx + 1);
                                let nextT = (currentT + 1) % circuit.numQubits;
                                if (nextT === qIdx) nextT = (nextT + 1) % circuit.numQubits;
                                onUpdateGate({ ...gate, targetQubitIndex: nextT });
                              }}
                              className="absolute -bottom-2 text-[9px] px-1 py-0.2 rounded bg-slate-900 border border-violet-400 text-violet-300 font-sans cursor-pointer hover:bg-violet-950"
                              title="Click to change target qubit"
                            >
                              → q{gate.targetQubitIndex}
                            </div>
                          )}
                        </div>
                      )}

                      {/* Render CNOT Target (oplus symbol) if this cell is target of a CX gate */}
                      {cnotTarget && !gate && (
                        <div className="w-10 h-10 rounded-full bg-violet-900 border-2 border-violet-400 flex items-center justify-center text-violet-200 font-bold text-sm shadow-md shadow-violet-500/30 relative z-20">
                          ⊕
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}

          {/* Classical Wire Rows */}
          <div className="pt-2 border-t border-slate-800/80 space-y-4">
            {Array.from({ length: circuit.numClassicalBits }).map((_, cIdx) => (
              <div key={`classical-${cIdx}`} className="flex items-center relative">
                {/* Classical Bit Label */}
                <div className="w-24 flex items-center gap-2 pr-3 shrink-0">
                  <span className="text-xs font-bold text-slate-400">c_{cIdx}:</span>
                  <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-400 text-xs font-bold">
                    0
                  </span>
                </div>

                {/* Double Wire Line for Classical Register */}
                <div className="flex items-center relative">
                  <div className="absolute inset-x-0 h-1 border-t border-b border-slate-700 pointer-events-none" />

                  {Array.from({ length: circuit.numCols }).map((_, colIdx) => (
                    <div
                      key={`c-cell-${cIdx}-${colIdx}`}
                      className="w-16 h-8 flex items-center justify-center relative z-10"
                    >
                      {/* Check if any measurement gate targets this bit */}
                      {circuit.gates.some(
                        (g) =>
                          g.type === 'M' &&
                          g.colIndex === colIdx &&
                          (g.classicalBitIndex === cIdx ||
                            (g.classicalBitIndex === undefined && g.qubitIndex === cIdx))
                      ) && (
                        <div className="w-6 h-6 rounded bg-slate-800 border border-slate-600 text-cyan-400 text-[10px] font-bold flex items-center justify-center">
                          c_{cIdx}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Grid Usage Tips */}
      <div className="flex flex-wrap items-center justify-between text-[11px] text-slate-400 px-1">
        <span className="flex items-center gap-1.5">
          <HelpCircle className="w-3.5 h-3.5 text-cyan-400" />
          <span>Tip: Click on <span className="text-violet-300 font-mono">[→ qTarget]</span> on a CNOT gate to cycle target wires.</span>
        </span>
        <span>Total Gates Placed: <span className="font-mono text-cyan-400 font-bold">{circuit.gates.length}</span></span>
      </div>
    </div>
  );
};

export default CircuitGrid;
