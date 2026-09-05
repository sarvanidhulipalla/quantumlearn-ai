export type SingleQubitGate = 'H' | 'X' | 'Y' | 'Z' | 'S' | 'T';
export type MultiQubitGate = 'CX';
export type MeasurementGate = 'M';
export type GateType = SingleQubitGate | MultiQubitGate | MeasurementGate;

export interface PlacedGate {
  id: string;
  type: GateType;
  qubitIndex: number;          // Row index (0 to numQubits - 1)
  colIndex: number;            // Column / Time-step index (0 to numCols - 1)
  targetQubitIndex?: number;   // For CX gate: target qubit row index
  classicalBitIndex?: number;  // For M gate: classical bit wire index
  params?: Record<string, number>;
}

export interface CircuitGridState {
  numQubits: number;
  numClassicalBits: number;
  numCols: number;
  gates: PlacedGate[];
}

export interface StatevectorEntry {
  stateBinary: string;        // e.g. "00", "01", "10", "11"
  stateDecimal: number;
  real: number;
  imag: number;
  magnitude: number;
  probability: number;
  phaseDegrees: number;
}

export interface QubitBlochCoordinates {
  qubitIndex: number;
  theta: number;              // 0 to 180 degrees
  phi: number;                // 0 to 360 degrees
  prob0: number;              // 0 to 1
  prob1: number;              // 0 to 1
  stateLabel: string;         // e.g. "|0⟩", "|+⟩", "Mixed"
}

export interface QuantumSimulationResult {
  statevector: StatevectorEntry[];
  probabilities: Record<string, number>;
  counts: Record<string, number>;      // Simulated measurement shots (e.g. 1024 shots)
  totalShots: number;
  blochSpheres: QubitBlochCoordinates[];
  isValid: boolean;
  validationWarnings: string[];
  executionTimeMs: number;
}

export interface CircuitTemplate {
  id: string;
  name: string;
  description: string;
  numQubits: number;
  numClassicalBits: number;
  gates: Omit<PlacedGate, 'id'>[];
}

export interface SavedCircuit {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
  circuitState: CircuitGridState;
}
