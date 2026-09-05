import React, { useState } from 'react';
import {
  BarChart3,
  Globe,
  Binary,
  Sparkles,
  Zap,
  RotateCcw,
  CheckCircle2,
  Clock,
} from 'lucide-react';
import { QuantumSimulationResult } from '../../types/circuit';
import Card from '../common/Card';
import Badge from '../common/Badge';

export interface ResultsPanelProps {
  results: QuantumSimulationResult | null;
  isRunning: boolean;
}

export const ResultsPanel: React.FC<ResultsPanelProps> = ({ results, isRunning }) => {
  const [activeTab, setActiveTab] = useState<'statevector' | 'histogram' | 'bloch'>('histogram');

  if (!results) {
    return (
      <div className="p-8 rounded-2xl bg-[#0b0f19] border border-slate-800 text-center space-y-3">
        <Sparkles className="w-8 h-8 text-cyan-400 mx-auto animate-pulse" />
        <h4 className="text-sm font-bold text-white">Simulation Results Standby</h4>
        <p className="text-xs text-slate-400 max-w-sm mx-auto">
          Place quantum gates on the circuit grid and click &quot;Run Simulation&quot; to calculate the statevector, measurement histogram, and Bloch spheres.
        </p>
      </div>
    );
  }

  // Filter significant states (prob > 0.0001) for Dirac equation display
  const nonZeroStates = results.statevector.filter((s) => s.probability > 0.0001);
  const diracFormula = nonZeroStates.length > 0
    ? nonZeroStates
        .map((s) => {
          const sign = s.real < 0 || s.imag < 0 ? '-' : '+';
          const ampStr = s.imag === 0
            ? `${Math.abs(s.real).toFixed(3)}`
            : `(${s.real.toFixed(2)}${s.imag >= 0 ? '+' : ''}${s.imag.toFixed(2)}i)`;
          return `${ampStr}|${s.stateBinary}⟩`;
        })
        .join(' + ')
    : '|00⟩';

  return (
    <div className="p-5 rounded-2xl bg-[#0b0f19] border border-slate-800 space-y-5">
      {/* Header & Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/5">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-purple-950/80 border border-purple-500/30 text-purple-400">
            <Zap className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-white">Quantum Simulation Results</h4>
            <span className="text-[11px] text-slate-400 flex items-center gap-1 font-mono">
              <Clock className="w-3 h-3 text-cyan-400" />
              Calculated in {results.executionTimeMs}ms • {results.totalShots} Shots Simulated
            </span>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-950 border border-slate-800">
          <button
            onClick={() => setActiveTab('histogram')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'histogram'
                ? 'bg-cyan-950/80 text-cyan-300 border border-cyan-500/30 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>Histogram</span>
          </button>

          <button
            onClick={() => setActiveTab('statevector')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'statevector'
                ? 'bg-cyan-950/80 text-cyan-300 border border-cyan-500/30 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Binary className="w-3.5 h-3.5" />
            <span>Statevector</span>
          </button>

          <button
            onClick={() => setActiveTab('bloch')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'bloch'
                ? 'bg-cyan-950/80 text-cyan-300 border border-cyan-500/30 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Globe className="w-3.5 h-3.5" />
            <span>Bloch Spheres</span>
          </button>
        </div>
      </div>

      {/* Dirac Notation Banner */}
      <div className="p-3.5 rounded-xl bg-slate-950 border border-cyan-500/20 font-mono text-xs text-cyan-300 overflow-x-auto flex items-center gap-2 shadow-inner">
        <span className="text-slate-400 font-bold shrink-0">|ψ⟩ =</span>
        <span className="font-semibold">{diracFormula}</span>
      </div>

      {/* TAB 1: HISTOGRAM VIEW */}
      {activeTab === 'histogram' && (
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-slate-950 border border-white/5 space-y-4">
            <div className="text-xs font-bold text-slate-300 flex items-center justify-between">
              <span>Measurement Probability Distribution</span>
              <span className="text-slate-500 font-mono text-[11px]">N = {results.totalShots} shots</span>
            </div>

            {/* Custom SVG Bar Chart */}
            <div className="space-y-3 font-mono">
              {results.statevector.map((entry) => {
                const shotCount = results.counts[entry.stateBinary] || 0;
                const shotPercent = Math.round((shotCount / results.totalShots) * 100);
                const theoreticalPercent = Math.round(entry.probability * 100);

                if (theoreticalPercent === 0 && shotPercent === 0) return null;

                return (
                  <div key={entry.stateBinary} className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-cyan-300 font-bold">|{entry.stateBinary}⟩</span>
                      <span className="text-slate-300 text-[11px]">
                        {shotCount} shots ({shotPercent}%) • Theoretical: {theoreticalPercent}%
                      </span>
                    </div>

                    {/* Progress Bar with Gradient */}
                    <div className="w-full h-4 bg-slate-900 rounded-full overflow-hidden flex">
                      <div
                        className="h-full bg-gradient-to-r from-cyan-500 to-purple-600 transition-all duration-500 rounded-full shadow-sm shadow-cyan-500/30"
                        style={{ width: `${Math.max(shotPercent, theoreticalPercent)}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: STATEVECTOR VIEW */}
      {activeTab === 'statevector' && (
        <div className="overflow-x-auto rounded-xl border border-white/5 bg-slate-950 font-mono text-xs">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-900/90 text-slate-400 text-[11px] border-b border-white/5">
                <th className="py-2.5 px-3">Basis State</th>
                <th className="py-2.5 px-3">Real (α)</th>
                <th className="py-2.5 px-3">Imag (β)</th>
                <th className="py-2.5 px-3">Magnitude</th>
                <th className="py-2.5 px-3">Probability</th>
                <th className="py-2.5 px-3">Phase Angle</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {results.statevector.map((entry) => (
                <tr
                  key={entry.stateBinary}
                  className={`hover:bg-slate-900/40 transition-colors ${
                    entry.probability > 0.001 ? 'text-white' : 'text-slate-500'
                  }`}
                >
                  <td className="py-2 px-3 font-bold text-cyan-300">
                    |{entry.stateBinary}⟩ ({entry.stateDecimal})
                  </td>
                  <td className="py-2 px-3">{entry.real.toFixed(3)}</td>
                  <td className="py-2 px-3">{entry.imag.toFixed(3)}</td>
                  <td className="py-2 px-3">{entry.magnitude.toFixed(3)}</td>
                  <td className="py-2 px-3 font-semibold text-purple-300">
                    {(entry.probability * 100).toFixed(1)}%
                  </td>
                  <td className="py-2 px-3 text-slate-400">{entry.phaseDegrees}°</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* TAB 3: BLOCH SPHERE VIEW */}
      {activeTab === 'bloch' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {results.blochSpheres.map((bloch) => {
            const radTheta = (bloch.theta * Math.PI) / 180;
            const radPhi = (bloch.phi * Math.PI) / 180;
            const r = 50;
            const cx = 75;
            const cy = 75;
            const x = cx + r * Math.sin(radTheta) * Math.cos(radPhi);
            const y = cy - r * Math.cos(radTheta) * 0.9;

            return (
              <div
                key={`bloch-q${bloch.qubitIndex}`}
                className="p-4 rounded-xl bg-slate-950 border border-white/5 flex flex-col items-center space-y-3 font-mono"
              >
                <div className="flex items-center justify-between w-full text-xs">
                  <span className="font-bold text-cyan-300">Qubit q_{bloch.qubitIndex}</span>
                  <Badge variant="purple" size="xs">{bloch.stateLabel}</Badge>
                </div>

                {/* Mini Bloch Sphere SVG */}
                <div className="relative w-36 h-36 flex items-center justify-center">
                  <svg viewBox="0 0 150 150" className="w-full h-full">
                    {/* Sphere outlines */}
                    <circle cx="75" cy="75" r="50" fill="none" stroke="#334155" strokeWidth="1" strokeDasharray="3 3" />
                    <ellipse cx="75" cy="75" rx="50" ry="16" fill="none" stroke="#475569" strokeWidth="1" />

                    {/* Axes */}
                    <line x1="75" y1="15" x2="75" y2="135" stroke="#00f0ff" strokeWidth="1" strokeOpacity="0.6" />
                    <line x1="30" y1="105" x2="120" y2="45" stroke="#8b5cf6" strokeWidth="1" strokeOpacity="0.5" />

                    <text x="75" y="12" fill="#00f0ff" fontSize="9" textAnchor="middle">|0⟩</text>
                    <text x="75" y="145" fill="#00f0ff" fontSize="9" textAnchor="middle">|1⟩</text>

                    {/* Vector */}
                    <line x1="75" y1="75" x2={x} y2={y} stroke="#a855f7" strokeWidth="2.5" strokeLinecap="round" />
                    <circle cx={x} cy={y} r="4" fill="#00f0ff" />
                  </svg>
                </div>

                <div className="w-full text-[11px] text-slate-400 space-y-1">
                  <div className="flex justify-between">
                    <span>θ = {bloch.theta}°, φ = {bloch.phi}°</span>
                  </div>
                  <div className="flex justify-between text-cyan-400">
                    <span>P(|0⟩): {Math.round(bloch.prob0 * 100)}%</span>
                    <span>P(|1⟩): {Math.round(bloch.prob1 * 100)}%</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ResultsPanel;
