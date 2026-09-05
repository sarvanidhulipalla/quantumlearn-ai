import React from 'react';
import { Cpu, ArrowRight } from 'lucide-react';
import Badge from '../common/Badge';

export interface QuantumCircuitViewerProps {
  initialState?: string;
  gateName?: string;
  outputState?: string;
  explanation?: string;
}

export const QuantumCircuitViewer: React.FC<QuantumCircuitViewerProps> = ({
  initialState = '|0⟩',
  gateName = 'H',
  outputState = '|+⟩ = (|0⟩ + |1⟩)/√2',
  explanation = 'The Hadamard (H) gate transforms the ground state |0⟩ into a balanced superposition state |+⟩ with 50% chance of measuring 0 or 1.',
}) => {
  return (
    <div className="p-6 rounded-2xl bg-[#0b0f19] border border-slate-700/80 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Cpu className="w-4 h-4 text-cyan-400" />
          <span className="text-xs font-bold text-slate-200 tracking-wider uppercase font-mono">
            Quantum Circuit Diagram
          </span>
        </div>
        <Badge variant="cyan" size="xs">1-Qubit Register</Badge>
      </div>

      {/* Schematic Circuit Wire */}
      <div className="p-5 rounded-xl bg-slate-950 border border-white/5 font-mono text-xs overflow-x-auto">
        <div className="flex items-center justify-between min-w-[380px] py-3">
          {/* Wire Label & Start State */}
          <div className="flex items-center gap-2">
            <span className="text-slate-400 font-bold">q₀:</span>
            <span className="px-2 py-1 rounded bg-slate-900 border border-slate-700 text-cyan-400 font-bold">
              {initialState}
            </span>
          </div>

          {/* Wire connector */}
          <div className="flex-1 h-0.5 bg-slate-700 mx-3 relative flex items-center justify-center">
            {/* Gate Box */}
            <div className="px-3 py-2 rounded-lg bg-gradient-to-tr from-purple-700 to-indigo-600 border border-purple-400 text-white font-bold text-sm shadow-md shadow-purple-500/30">
              {gateName}
            </div>
          </div>

          {/* Measurement Box */}
          <div className="px-2.5 py-1.5 rounded-lg bg-slate-800 border border-slate-600 text-slate-300 font-bold text-xs flex items-center gap-1">
            <span>M</span>
          </div>

          {/* Classical wire */}
          <div className="w-12 h-1 bg-slate-700 border-t border-b border-slate-600 mx-2" />

          {/* Classical bit label */}
          <span className="text-slate-400 font-bold">c₀</span>
        </div>

        {/* State Evolution Timeline */}
        <div className="mt-4 pt-3 border-t border-white/5 grid grid-cols-2 gap-4 text-[11px]">
          <div className="p-2.5 rounded-lg bg-slate-900/80 border border-cyan-500/20">
            <span className="text-slate-400 block mb-0.5">Input State:</span>
            <span className="text-cyan-300 font-bold">{initialState}</span>
          </div>
          <div className="p-2.5 rounded-lg bg-slate-900/80 border border-purple-500/20">
            <span className="text-slate-400 block mb-0.5">After {gateName} Gate:</span>
            <span className="text-purple-300 font-bold">{outputState}</span>
          </div>
        </div>
      </div>

      {/* Description */}
      <p className="text-xs text-slate-400 leading-relaxed">
        {explanation}
      </p>
    </div>
  );
};

export default QuantumCircuitViewer;
