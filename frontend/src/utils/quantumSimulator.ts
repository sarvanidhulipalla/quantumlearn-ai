import {
  CircuitGridState,
  PlacedGate,
  QuantumSimulationResult,
  StatevectorEntry,
  QubitBlochCoordinates,
} from '../types/circuit';

interface Complex {
  r: number; // Real
  i: number; // Imaginary
}

const complex = (r: number, i: number = 0): Complex => ({ r, i });
const add = (a: Complex, b: Complex): Complex => ({ r: a.r + b.r, i: a.i + b.i });
const mul = (a: Complex, b: Complex): Complex => ({
  r: a.r * b.r - a.i * b.i,
  i: a.r * b.i + a.i * b.r,
});
const magSq = (a: Complex): number => a.r * a.r + a.i * a.i;

const SQRT1_2 = Math.SQRT1_2; // 1 / sqrt(2)

// Standard 2x2 Single Qubit Unitary Matrices
const GATE_MATRICES: Record<string, Complex[][]> = {
  H: [
    [complex(SQRT1_2), complex(SQRT1_2)],
    [complex(SQRT1_2), complex(-SQRT1_2)],
  ],
  X: [
    [complex(0), complex(1)],
    [complex(1), complex(0)],
  ],
  Y: [
    [complex(0), complex(0, -1)],
    [complex(0, 1), complex(0)],
  ],
  Z: [
    [complex(1), complex(0)],
    [complex(0), complex(-1)],
  ],
  S: [
    [complex(1), complex(0)],
    [complex(0), complex(0, 1)],
  ],
  T: [
    [complex(1), complex(0)],
    [complex(0), complex(SQRT1_2, SQRT1_2)],
  ],
};

/**
 * Validates circuit configuration and returns warnings if any.
 */
export function validateCircuit(circuit: CircuitGridState): { isValid: boolean; warnings: string[] } {
  const warnings: string[] = [];

  for (const gate of circuit.gates) {
    if (gate.qubitIndex >= circuit.numQubits) {
      warnings.push(`Gate ${gate.type} on non-existent qubit q${gate.qubitIndex}`);
    }

    if (gate.type === 'CX') {
      if (gate.targetQubitIndex === undefined) {
        warnings.push(`CNOT at column ${gate.colIndex + 1} has no target qubit assigned.`);
      } else if (gate.targetQubitIndex === gate.qubitIndex) {
        warnings.push(`CNOT at column ${gate.colIndex + 1} cannot have same control and target (q${gate.qubitIndex}).`);
      } else if (gate.targetQubitIndex >= circuit.numQubits) {
        warnings.push(`CNOT at column ${gate.colIndex + 1} target q${gate.targetQubitIndex} exceeds qubit count.`);
      }
    }
  }

  return {
    isValid: warnings.length === 0,
    warnings,
  };
}

/**
 * Simulates the statevector evolution of the quantum circuit.
 */
export function simulateCircuit(
  circuit: CircuitGridState,
  shots: number = 1024
): QuantumSimulationResult {
  const startTime = performance.now();
  const { isValid, warnings } = validateCircuit(circuit);

  const numQubits = Math.max(1, Math.min(6, circuit.numQubits));
  const dim = 1 << numQubits; // 2^n

  // Initial State: |00...0> = [1, 0, 0, ...]
  let state: Complex[] = Array.from({ length: dim }, (_, idx) =>
    idx === 0 ? complex(1, 0) : complex(0, 0)
  );

  // Group gates by column (time step)
  const sortedGates = [...circuit.gates].sort((a, b) => a.colIndex - b.colIndex);

  // Execute gates in sequential column order
  for (const gate of sortedGates) {
    if (gate.qubitIndex >= numQubits) continue;

    if (gate.type in GATE_MATRICES) {
      // Apply single-qubit gate to statevector
      const matrix = GATE_MATRICES[gate.type];
      const q = gate.qubitIndex;
      const targetBit = numQubits - 1 - q; // Qiskit big-endian convention: q0 is LSB or MSB
      const newState: Complex[] = Array.from({ length: dim }, () => complex(0, 0));

      for (let i = 0; i < dim; i++) {
        const bitVal = (i >> targetBit) & 1;
        const i0 = i & ~(1 << targetBit); // with bit 0
        const i1 = i | (1 << targetBit);  // with bit 1

        if (bitVal === 0) {
          newState[i] = add(
            mul(matrix[0][0], state[i0]),
            mul(matrix[0][1], state[i1])
          );
        } else {
          newState[i] = add(
            mul(matrix[1][0], state[i0]),
            mul(matrix[1][1], state[i1])
          );
        }
      }

      state = newState;
    } else if (gate.type === 'CX' && gate.targetQubitIndex !== undefined) {
      const c = gate.qubitIndex;
      const t = gate.targetQubitIndex;
      if (c === t || t >= numQubits) continue;

      const cBit = numQubits - 1 - c;
      const tBit = numQubits - 1 - t;
      const newState: Complex[] = Array.from({ length: dim }, () => complex(0, 0));

      for (let i = 0; i < dim; i++) {
        const cVal = (i >> cBit) & 1;
        if (cVal === 1) {
          // Flip target bit
          const flippedIdx = i ^ (1 << tBit);
          newState[i] = state[flippedIdx];
        } else {
          newState[i] = state[i];
        }
      }

      state = newState;
    }
  }

  // 1. Compute statevector details & probabilities
  const statevector: StatevectorEntry[] = [];
  const probabilities: Record<string, number> = {};

  for (let i = 0; i < dim; i++) {
    const binStr = i.toString(2).padStart(numQubits, '0');
    const p = magSq(state[i]);
    const mag = Math.sqrt(p);
    const phaseRad = Math.atan2(state[i].i, state[i].r);
    const phaseDeg = Math.round(((phaseRad * 180) / Math.PI + 360) % 360);

    const roundedProb = Math.round(p * 10000) / 10000;
    probabilities[binStr] = roundedProb;

    statevector.push({
      stateBinary: binStr,
      stateDecimal: i,
      real: Math.round(state[i].r * 10000) / 10000,
      imag: Math.round(state[i].i * 10000) / 10000,
      magnitude: Math.round(mag * 10000) / 10000,
      probability: roundedProb,
      phaseDegrees: phaseDeg,
    });
  }

  // 2. Simulate shots measurement counts
  const counts: Record<string, number> = {};
  for (let s = 0; s < shots; s++) {
    const rand = Math.random();
    let cumulative = 0;
    let selectedState = statevector[0].stateBinary;

    for (const entry of statevector) {
      cumulative += entry.probability;
      if (rand <= cumulative) {
        selectedState = entry.stateBinary;
        break;
      }
    }

    counts[selectedState] = (counts[selectedState] || 0) + 1;
  }

  // 3. Compute reduced single-qubit Bloch Sphere coordinates for each wire
  const blochSpheres: QubitBlochCoordinates[] = [];

  for (let q = 0; q < numQubits; q++) {
    const targetBit = numQubits - 1 - q;

    // Reduced density matrix elements: rho00, rho11, rho01
    let rho00 = 0;
    let rho11 = 0;
    let rho01 = complex(0, 0);

    for (let i = 0; i < dim; i++) {
      const bitVal = (i >> targetBit) & 1;
      const prob = magSq(state[i]);

      if (bitVal === 0) {
        rho00 += prob;
        const i1 = i | (1 << targetBit);
        // rho01 += psi(i0) * psi*(i1)
        const conjI1 = complex(state[i1].r, -state[i1].i);
        rho01 = add(rho01, mul(state[i], conjI1));
      } else {
        rho11 += prob;
      }
    }

    // Bloch vector coordinates:
    const rx = 2 * rho01.r;
    const ry = 2 * rho01.i;
    const rz = rho00 - rho11;

    let theta = Math.round((Math.acos(Math.max(-1, Math.min(1, rz))) * 180) / Math.PI);
    let phi = Math.round(((Math.atan2(ry, rx) * 180) / Math.PI + 360) % 360);

    // Label determination
    let stateLabel = '|ψ⟩';
    if (rho00 > 0.99) stateLabel = '|0⟩';
    else if (rho11 > 0.99) stateLabel = '|1⟩';
    else if (Math.abs(rho00 - 0.5) < 0.05 && Math.abs(rx - 1) < 0.1) stateLabel = '|+⟩';
    else if (Math.abs(rho00 - 0.5) < 0.05 && Math.abs(rx + 1) < 0.1) stateLabel = '|-⟩';
    else if (Math.abs(rho00 - 0.5) < 0.05) stateLabel = 'Superposition';

    blochSpheres.push({
      qubitIndex: q,
      theta,
      phi,
      prob0: Math.round(rho00 * 100) / 100,
      prob1: Math.round(rho11 * 100) / 100,
      stateLabel,
    });
  }

  const executionTimeMs = Math.round((performance.now() - startTime) * 100) / 100;

  return {
    statevector,
    probabilities,
    counts,
    totalShots: shots,
    blochSpheres,
    isValid,
    validationWarnings: warnings,
    executionTimeMs,
  };
}
