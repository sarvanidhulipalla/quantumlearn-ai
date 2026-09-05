import api from './api';
import { CircuitGridState, QuantumSimulationResult } from '../types/circuit';

export interface QuantumRunBackendPayload {
  qubits: number;
  classical_bits: number;
  steps: number;
  shots: number;
  execution_mode?: string;
  gates: Array<{
    type: string;
    qubit: number;
    step: number;
    control?: number;
    target?: number;
    classical_bit?: number;
  }>;
}

export interface QuantumBackendResponse {
  success: boolean;
  backend: string;
  shots: number;
  counts: Record<string, number>;
  probabilities: Record<string, number>;
  statevector: Array<{
    state_binary: string;
    state_decimal: number;
    real: number;
    imag: number;
    magnitude: number;
    probability: number;
    phase_degrees: number;
  }>;
  bloch_spheres: Array<{
    qubit_index: number;
    theta: number;
    phi: number;
    prob0: number;
    prob1: number;
    state_label: string;
  }>;
  circuit_text?: string;
  execution_time_ms: number;
  validation_warnings: string[];
}

export const quantumService = {
  /**
   * Translates frontend circuit grid state into backend payload format and runs on Qiskit Aer.
   */
  async runCircuit(
    circuit: CircuitGridState,
    shots: number = 1024
  ): Promise<QuantumSimulationResult> {
    const payload: QuantumRunBackendPayload = {
      qubits: circuit.numQubits,
      classical_bits: circuit.numClassicalBits,
      steps: circuit.numCols,
      shots,
      execution_mode: 'qiskit_aer',
      gates: circuit.gates.map((g) => ({
        type: g.type,
        qubit: g.qubitIndex,
        step: g.colIndex,
        control: g.type === 'CX' ? g.qubitIndex : undefined,
        target: g.type === 'CX' ? g.targetQubitIndex : undefined,
        classical_bit: g.type === 'M' ? g.classicalBitIndex : undefined,
      })),
    };

    const response = await api.post<QuantumBackendResponse>('/quantum/run', payload);
    const data = response.data;

    return {
      statevector: data.statevector.map((s) => ({
        stateBinary: s.state_binary,
        stateDecimal: s.state_decimal,
        real: s.real,
        imag: s.imag,
        magnitude: s.magnitude,
        probability: s.probability,
        phaseDegrees: s.phase_degrees,
      })),
      probabilities: data.probabilities,
      counts: data.counts,
      totalShots: data.shots,
      blochSpheres: data.bloch_spheres.map((b) => ({
        qubitIndex: b.qubit_index,
        theta: b.theta,
        phi: b.phi,
        prob0: b.prob0,
        prob1: b.prob1,
        stateLabel: b.state_label,
      })),
      isValid: data.success,
      validationWarnings: data.validation_warnings || [],
      executionTimeMs: data.execution_time_ms,
    };
  },

  /**
   * Health check for Qiskit and Qiskit Aer backend.
   */
  async getHealth(): Promise<{ status: string; qiskit: boolean; aer: boolean }> {
    const response = await api.get<{ status: string; qiskit: boolean; aer: boolean }>('/quantum/health');
    return response.data;
  },
};

export default quantumService;
