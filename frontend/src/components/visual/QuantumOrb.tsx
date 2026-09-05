import React, { useState, useEffect } from 'react';
import { Sparkles, RefreshCw } from 'lucide-react';

export const QuantumOrb: React.FC = () => {
  const [theta, setTheta] = useState(0);
  const [phi, setPhi] = useState(0);
  const [selectedState, setSelectedState] = useState<'0' | '1' | '+' | '-'>('0');
  const [isAutoRotating, setIsAutoRotating] = useState(false);

  // Set predefined deterministic quantum states
  const handleSelectState = (state: '0' | '1' | '+' | '-') => {
    setIsAutoRotating(false);
    setSelectedState(state);
    if (state === '0') {
      setTheta(0);
      setPhi(0);
    } else if (state === '1') {
      setTheta(180);
      setPhi(0);
    } else if (state === '+') {
      setTheta(90);
      setPhi(0);
    } else if (state === '-') {
      setTheta(90);
      setPhi(180);
    }
  };

  // Precession animation when auto-rotation is enabled
  useEffect(() => {
    if (!isAutoRotating) return;
    const interval = setInterval(() => {
      setTheta((prev) => (prev + 1) % 360);
      setPhi((prev) => (prev + 1.5) % 360);
    }, 50);
    return () => clearInterval(interval);
  }, [isAutoRotating]);

  const radThetaHalf = (theta * Math.PI) / 360;
  const alphaVal = Math.cos(radThetaHalf);
  const betaVal = Math.sin(radThetaHalf);
  const alpha = alphaVal.toFixed(2);
  const beta = betaVal.toFixed(2);
  const prob0 = Math.round(alphaVal ** 2 * 100);
  const prob1 = 100 - prob0;

  return (
    <div className="relative flex flex-col items-center justify-center p-6 sm:p-8 rounded-3xl bg-[#ffffff] border border-[#d4d4d4] shadow-md select-none">
      {/* Background glow effects */}
      <div className="absolute -inset-1 bg-gradient-to-r from-[#d4d4d4]/30 via-[#b3b3b3]/20 to-[#2b2b2b]/10 rounded-3xl blur-xl opacity-70 -z-10" />

      {/* Header state label */}
      <div className="flex items-center justify-between w-full mb-4 px-2">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-[#2b2b2b] animate-pulse" />
          <span className="text-xs font-mono font-bold tracking-wider text-[#2b2b2b] uppercase">
            Bloch Sphere Visualizer
          </span>
        </div>
        <button
          onClick={() => setIsAutoRotating(!isAutoRotating)}
          className={`flex items-center gap-1 text-[11px] font-mono px-2.5 py-0.5 rounded-full border transition-colors cursor-pointer ${
            isAutoRotating
              ? 'bg-[#2b2b2b] text-[#ffffff] border-[#2b2b2b] font-bold'
              : 'bg-[#ffffff] text-[#2b2b2b] border-[#d4d4d4] hover:border-[#b3b3b3] font-medium'
          }`}
          title="Toggle autonomous precession"
        >
          <RefreshCw className={`w-3 h-3 ${isAutoRotating ? 'animate-spin' : ''}`} />
          {isAutoRotating ? 'Auto' : 'Paused'}
        </button>
      </div>

      {/* Bloch Sphere SVG Graphics */}
      <div className="relative w-64 h-64 sm:w-72 sm:h-72 flex items-center justify-center">
        <svg viewBox="0 0 300 300" className="w-full h-full">
          {/* Main sphere wireframe */}
          <circle cx="150" cy="150" r="110" fill="none" stroke="#d4d4d4" strokeWidth="1.5" strokeDasharray="4 4" />
          <ellipse cx="150" cy="150" rx="110" ry="36" fill="none" stroke="#b3b3b3" strokeWidth="1.5" />
          <ellipse cx="150" cy="150" rx="36" ry="110" fill="none" stroke="#d4d4d4" strokeWidth="1" strokeDasharray="3 3" />

          {/* Coordinate Axes */}
          {/* Z Axis (|0> to |1>) */}
          <line x1="150" y1="20" x2="150" y2="280" stroke="#2b2b2b" strokeWidth="1.5" strokeOpacity="0.85" />
          <text x="150" y="15" fill="#2b2b2b" fontSize="13" fontWeight="bold" textAnchor="middle">|0⟩ (|Z+⟩)</text>
          <text x="150" y="296" fill="#2b2b2b" fontSize="13" fontWeight="bold" textAnchor="middle">|1⟩ (|Z-⟩)</text>

          {/* X Axis */}
          <line x1="60" y1="210" x2="240" y2="90" stroke="#b3b3b3" strokeWidth="1.5" strokeOpacity="0.8" />
          <text x="50" y="222" fill="#2b2b2b" fontSize="12" fontWeight="bold" textAnchor="middle">|+X⟩</text>

          {/* Y Axis */}
          <line x1="40" y1="150" x2="260" y2="150" stroke="#d4d4d4" strokeWidth="1" strokeOpacity="0.9" />
          <text x="275" y="154" fill="#707070" fontSize="12" fontWeight="bold" textAnchor="middle">|+Y⟩</text>

          {/* Center Origin point */}
          <circle cx="150" cy="150" r="3" fill="#2b2b2b" />

          {/* Dynamic Quantum State Vector |ψ> */}
          {(() => {
            const radTheta = (theta * Math.PI) / 180;
            const radPhi = (phi * Math.PI) / 180;
            const r = 110;
            const x = 150 + r * Math.sin(radTheta) * Math.cos(radPhi);
            const y = 150 - r * Math.cos(radTheta) * 0.95;

            return (
              <g>
                {/* Vector trajectory line */}
                <line
                  x1="150"
                  y1="150"
                  x2={x}
                  y2={y}
                  stroke="#2b2b2b"
                  strokeWidth="3"
                  strokeLinecap="round"
                />
                {/* Glowing state point */}
                <circle cx={x} cy={y} r="8" fill="#2b2b2b" className="animate-pulse" filter="drop-shadow(0 0 6px rgba(43,43,43,0.3))" />
                <circle cx={x} cy={y} r="3" fill="#ffffff" />
                
                {/* State vector notation */}
                <text
                  x={x + 12}
                  y={y - 8}
                  fill="#2b2b2b"
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

      {/* Preset State Buttons */}
      <div className="flex items-center gap-2 my-2">
        <span className="text-[10px] text-[#2b2b2b]/70 font-mono uppercase font-bold mr-1">Basis:</span>
        {(['0', '1', '+', '-'] as const).map((st) => (
          <button
            key={st}
            onClick={() => handleSelectState(st)}
            className={`px-3 py-1 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
              selectedState === st && !isAutoRotating
                ? 'bg-[#2b2b2b] text-[#ffffff] shadow-sm'
                : 'bg-[#ffffff] text-[#2b2b2b] border border-[#d4d4d4] hover:border-[#2b2b2b]'
            }`}
          >
            |{st}⟩
          </button>
        ))}
      </div>

      {/* State Mathematical Equation & Probabilities */}
      <div className="w-full mt-2 p-3.5 rounded-2xl bg-[#fcfcfc] border border-[#d4d4d4] font-mono text-xs">
        <div className="flex justify-between items-center text-[#2b2b2b] pb-2 border-b border-[#d4d4d4]">
          <span className="font-semibold">State Vector:</span>
          <span className="text-[#2b2b2b] font-bold">
            |ψ⟩ = {alpha}|0⟩ + {beta}{phi !== 0 ? `e^(i${Math.round(phi)}°)` : ''}|1⟩
          </span>
        </div>
        <div className="grid grid-cols-2 gap-3 mt-2 pt-1 text-[11px]">
          <div className="flex items-center justify-between bg-[#ffffff] px-2.5 py-1.5 rounded-lg border border-[#d4d4d4] shadow-xs">
            <span className="text-[#2b2b2b]/70 font-medium">P(|0⟩):</span>
            <span className="text-[#2b2b2b] font-bold">{prob0}%</span>
          </div>
          <div className="flex items-center justify-between bg-[#ffffff] px-2.5 py-1.5 rounded-lg border border-[#d4d4d4] shadow-xs">
            <span className="text-[#2b2b2b]/70 font-medium">P(|1⟩):</span>
            <span className="text-[#2b2b2b] font-bold">{prob1}%</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuantumOrb;
