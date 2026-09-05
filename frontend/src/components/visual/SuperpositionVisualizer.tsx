import React, { useState } from 'react';
import { Sparkles, RotateCcw, Zap, Eye, Play } from 'lucide-react';
import Button from '../common/Button';
import Badge from '../common/Badge';

export type QuantumStateName = '|0⟩' | '|1⟩' | '|+⟩' | '|-⟩';

export const SuperpositionVisualizer: React.FC = () => {
  const [theta, setTheta] = useState<number>(0); // 0 deg = |0>, 180 deg = |1>, 90 deg = equator
  const [phi, setPhi] = useState<number>(0);     // Phase angle
  const [stateName, setStateName] = useState<QuantumStateName>('|0⟩');
  const [historyText, setHistoryText] = useState<string>(
    'Initial state prepared in ground state |0⟩ (North pole of Bloch Sphere).'
  );
  const [isMeasured, setIsMeasured] = useState<boolean>(false);
  const [measuredValue, setMeasuredValue] = useState<string | null>(null);

  // Apply Hadamard Gate (creates superposition from |0> or |1>)
  const handleApplyHadamard = () => {
    setIsMeasured(false);
    setMeasuredValue(null);

    if (stateName === '|0⟩') {
      setTheta(90);
      setPhi(0);
      setStateName('|+⟩');
      setHistoryText(
        'Applied Hadamard (H) Gate: Rotated state vector from |0⟩ to balanced superposition |+⟩ = (|0⟩ + |1⟩)/√2 on the +X equator.'
      );
    } else if (stateName === '|1⟩') {
      setTheta(90);
      setPhi(180);
      setStateName('|-⟩');
      setHistoryText(
        'Applied Hadamard (H) Gate: Rotated state vector from |1⟩ to superposition |-⟩ = (|0⟩ - |1⟩)/√2 on the -X equator with relative phase π.'
      );
    } else if (stateName === '|+⟩') {
      setTheta(0);
      setPhi(0);
      setStateName('|0⟩');
      setHistoryText(
        'Applied Hadamard (H) Gate: Superposition state |+⟩ constructively interfered back into ground state |0⟩ (H² = I).'
      );
    } else {
      setTheta(180);
      setPhi(0);
      setStateName('|1⟩');
      setHistoryText(
        'Applied Hadamard (H) Gate: Superposition state |-⟩ interfered into excited state |1⟩.'
      );
    }
  };

  // Apply Pauli-X Gate (Bit-flip)
  const handleApplyPauliX = () => {
    setIsMeasured(false);
    setMeasuredValue(null);

    if (stateName === '|0⟩') {
      setTheta(180);
      setPhi(0);
      setStateName('|1⟩');
      setHistoryText('Applied Pauli-X Gate: Flipped ground state |0⟩ to excited state |1⟩ (South pole).');
    } else if (stateName === '|1⟩') {
      setTheta(0);
      setPhi(0);
      setStateName('|0⟩');
      setHistoryText('Applied Pauli-X Gate: Flipped excited state |1⟩ back to ground state |0⟩ (North pole).');
    } else if (stateName === '|+⟩') {
      setHistoryText('Applied Pauli-X Gate: |+⟩ is an eigenstate of X, state remains |+⟩ (X|+⟩ = |+⟩).');
    } else {
      setHistoryText('Applied Pauli-X Gate: X|-⟩ = -|-⟩, state eigenvalue phase flipped by -1.');
    }
  };

  // Quantum Measurement Simulation
  const handleMeasure = () => {
    const prob0 = Math.cos((theta * Math.PI) / 360) ** 2;
    const randomVal = Math.random();
    const result = randomVal < prob0 ? '0' : '1';

    setIsMeasured(true);
    setMeasuredValue(result);

    if (result === '0') {
      setTheta(0);
      setPhi(0);
      setStateName('|0⟩');
      setHistoryText(
        `Measured qubit: Wavefunction collapsed instantaneously into classical outcome |0⟩ (Found with ${Math.round(prob0 * 100)}% probability).`
      );
    } else {
      setTheta(180);
      setPhi(0);
      setStateName('|1⟩');
      setHistoryText(
        `Measured qubit: Wavefunction collapsed instantaneously into classical outcome |1⟩ (Found with ${Math.round((1 - prob0) * 100)}% probability).`
      );
    }
  };

  // Reset to ground state
  const handleReset = () => {
    setTheta(0);
    setPhi(0);
    setStateName('|0⟩');
    setIsMeasured(false);
    setMeasuredValue(null);
    setHistoryText('Reset state register back to ground state |0⟩.');
  };

  // Calculate amplitudes and probabilities
  const alpha = Math.cos((theta * Math.PI) / 360).toFixed(2);
  const beta = Math.sin((theta * Math.PI) / 360).toFixed(2);
  const prob0 = Math.round(Math.cos((theta * Math.PI) / 360) ** 2 * 100);
  const prob1 = Math.round(Math.sin((theta * Math.PI) / 360) ** 2 * 100);

  return (
    <div className="p-6 rounded-3xl glass-panel-glow border border-purple-500/30 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-white/5">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-cyan-950/80 border border-cyan-500/30 text-cyan-400">
            <Sparkles className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h4 className="text-base font-bold text-white">Interactive Superposition Visualizer</h4>
            <p className="text-xs text-slate-400">Interact with single-qubit gates and observe real-time state vector rotations.</p>
          </div>
        </div>
        <Badge variant={stateName === '|+⟩' || stateName === '|-⟩' ? 'purple' : 'cyan'} size="sm">
          State: {stateName}
        </Badge>
      </div>

      {/* Visual Canvas & Bloch Sphere */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
        {/* Bloch Sphere SVG Graphic */}
        <div className="md:col-span-6 flex flex-col items-center justify-center">
          <div className="relative w-60 h-60 sm:w-64 sm:h-64 flex items-center justify-center">
            <svg viewBox="0 0 300 300" className="w-full h-full">
              {/* Sphere Wireframe */}
              <circle cx="150" cy="150" r="110" fill="none" stroke="#334155" strokeWidth="1.5" strokeDasharray="4 4" />
              <ellipse cx="150" cy="150" rx="110" ry="36" fill="none" stroke="#475569" strokeWidth="1.5" />
              <ellipse cx="150" cy="150" rx="36" ry="110" fill="none" stroke="#334155" strokeWidth="1" strokeDasharray="3 3" />

              {/* Z-Axis */}
              <line x1="150" y1="20" x2="150" y2="280" stroke="#00f0ff" strokeWidth="1.5" strokeOpacity="0.7" />
              <text x="150" y="16" fill="#00f0ff" fontSize="13" fontWeight="bold" textAnchor="middle">|0⟩ (North)</text>
              <text x="150" y="296" fill="#00f0ff" fontSize="13" fontWeight="bold" textAnchor="middle">|1⟩ (South)</text>

              {/* X-Axis */}
              <line x1="60" y1="210" x2="240" y2="90" stroke="#8b5cf6" strokeWidth="1.5" strokeOpacity="0.6" />
              <text x="48" y="222" fill="#8b5cf6" fontSize="12" fontWeight="bold" textAnchor="middle">|+⟩ (+X)</text>

              {/* Y-Axis */}
              <line x1="40" y1="150" x2="260" y2="150" stroke="#3b82f6" strokeWidth="1" strokeOpacity="0.5" />
              <text x="278" y="154" fill="#3b82f6" fontSize="12" fontWeight="bold" textAnchor="middle">|+Y⟩</text>

              {/* Origin Center */}
              <circle cx="150" cy="150" r="3" fill="#94a3b8" />

              {/* Dynamic State Vector |ψ> with transition animation */}
              {(() => {
                const radTheta = (theta * Math.PI) / 180;
                const radPhi = (phi * Math.PI) / 180;
                const r = 110;
                const x = 150 + r * Math.sin(radTheta) * Math.cos(radPhi);
                const y = 150 - r * Math.cos(radTheta) * 0.95;

                return (
                  <g className="transition-all duration-700 ease-out">
                    <line
                      x1="150"
                      y1="150"
                      x2={x}
                      y2={y}
                      stroke={stateName === '|+⟩' || stateName === '|-⟩' ? '#a855f7' : '#00f0ff'}
                      strokeWidth="3.5"
                      strokeLinecap="round"
                    />
                    <circle
                      cx={x}
                      cy={y}
                      r="8"
                      fill={stateName === '|+⟩' || stateName === '|-⟩' ? '#a855f7' : '#00f0ff'}
                      className="animate-pulse"
                      filter="drop-shadow(0 0 10px #a855f7)"
                    />
                    <circle cx={x} cy={y} r="3" fill="#ffffff" />
                    <text
                      x={x + 14}
                      y={y - 6}
                      fill="#ffffff"
                      fontSize="13"
                      fontFamily="monospace"
                      fontWeight="bold"
                    >
                      |ψ⟩
                    </text>
                  </g>
                );
              })()}
            </svg>
          </div>
          <span className="text-[11px] font-mono text-slate-400 mt-2">
            Bloch Coordinates: θ = {theta}°, φ = {phi}°
          </span>
        </div>

        {/* State Equation & Probability Bars */}
        <div className="md:col-span-6 space-y-4 font-mono">
          {/* Dirac Equation Display */}
          <div className="p-4 rounded-2xl bg-slate-900/90 border border-white/10 space-y-2">
            <div className="text-xs text-slate-400">Quantum State Equation:</div>
            <div className="text-sm sm:text-base font-bold text-cyan-300">
              |ψ⟩ = {alpha}|0⟩ + {beta}{phi === 180 ? 'e^{iπ}' : ''}|1⟩
            </div>
            {stateName === '|+⟩' && (
              <div className="text-xs text-purple-300 font-semibold pt-1">
                = (|0⟩ + |1⟩) / √2 &nbsp;(Equal Superposition)
              </div>
            )}
            {stateName === '|-⟩' && (
              <div className="text-xs text-purple-300 font-semibold pt-1">
                = (|0⟩ - |1⟩) / √2 &nbsp;(Phase Superposition)
              </div>
            )}
          </div>

          {/* Probability Distribution */}
          <div className="p-4 rounded-2xl bg-slate-900/90 border border-white/10 space-y-3">
            <div className="text-xs text-slate-400 font-sans font-medium">Measurement Probabilities:</div>

            {/* P(|0>) */}
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-cyan-400 font-bold">P(|0⟩) = |α|²</span>
                <span className="text-cyan-300">{prob0}%</span>
              </div>
              <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-cyan-500 transition-all duration-500 rounded-full shadow-sm shadow-cyan-500/50"
                  style={{ width: `${prob0}%` }}
                />
              </div>
            </div>

            {/* P(|1>) */}
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-purple-400 font-bold">P(|1⟩) = |β|²</span>
                <span className="text-purple-300">{prob1}%</span>
              </div>
              <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-purple-600 transition-all duration-500 rounded-full shadow-sm shadow-purple-600/50"
                  style={{ width: `${prob1}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Control Actions Bar */}
      <div className="pt-2 border-t border-white/5 space-y-3">
        <div className="flex flex-wrap gap-2.5">
          <Button
            variant="glow"
            size="sm"
            onClick={handleApplyHadamard}
            leftIcon={<Sparkles className="w-4 h-4" />}
          >
            Apply H Gate (Superposition)
          </Button>

          <Button
            variant="secondary"
            size="sm"
            onClick={handleApplyPauliX}
            leftIcon={<Zap className="w-4 h-4 text-cyan-400" />}
          >
            Apply X Gate (Bit-Flip)
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handleMeasure}
            leftIcon={<Eye className="w-4 h-4 text-purple-400" />}
          >
            Measure Qubit
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={handleReset}
            leftIcon={<RotateCcw className="w-4 h-4 text-slate-400" />}
          >
            Reset |0⟩
          </Button>
        </div>

        {/* State Explanation Banner */}
        <div className="p-3.5 rounded-xl bg-slate-900/90 border border-cyan-500/20 text-xs text-slate-300 flex items-start gap-2.5">
          <span className="text-cyan-400 font-bold font-mono shrink-0">EXPLANATION:</span>
          <p className="leading-relaxed font-sans">{historyText}</p>
        </div>
      </div>
    </div>
  );
};

export default SuperpositionVisualizer;
