import { CircuitGridState } from '../types/circuit';

/**
 * Converts a CircuitGridState into clean, runnable IBM Qiskit Python code.
 */
export function generateQiskitCode(circuit: CircuitGridState): string {
  const numQubits = circuit.numQubits;
  const numClassical = circuit.numClassicalBits;

  // Header & Imports
  let code = `from qiskit import QuantumCircuit
from qiskit_aer import AerSimulator
from qiskit.visualization import plot_histogram
import matplotlib.pyplot as plt

# 1. Initialize Quantum Circuit with ${numQubits} Qubit(s) and ${numClassical} Classical Bit(s)
qc = QuantumCircuit(${numQubits}, ${numClassical})

`;

  // Sort gates by time-step column
  const sortedGates = [...circuit.gates].sort((a, b) => a.colIndex - b.colIndex);

  if (sortedGates.length === 0) {
    code += `# Circuit is currently empty (ground state |${'0'.repeat(numQubits)}⟩)\npass\n\n`;
  } else {
    code += `# 2. Apply Quantum Gate Operations\n`;
    for (const gate of sortedGates) {
      const q = gate.qubitIndex;
      switch (gate.type) {
        case 'H':
          code += `qc.h(${q})          # Hadamard on qubit ${q}\n`;
          break;
        case 'X':
          code += `qc.x(${q})          # Pauli-X (NOT) on qubit ${q}\n`;
          break;
        case 'Y':
          code += `qc.y(${q})          # Pauli-Y on qubit ${q}\n`;
          break;
        case 'Z':
          code += `qc.z(${q})          # Pauli-Z (Phase Flip) on qubit ${q}\n`;
          break;
        case 'S':
          code += `qc.s(${q})          # S Gate (Phase pi/2) on qubit ${q}\n`;
          break;
        case 'T':
          code += `qc.t(${q})          # T Gate (Phase pi/4) on qubit ${q}\n`;
          break;
        case 'CX':
          if (gate.targetQubitIndex !== undefined) {
            code += `qc.cx(${q}, ${gate.targetQubitIndex})       # CNOT: control=q${q}, target=q${gate.targetQubitIndex}\n`;
          }
          break;
        case 'M':
          const cBit = gate.classicalBitIndex !== undefined ? gate.classicalBitIndex : q;
          code += `qc.measure(${q}, ${cBit})    # Measure qubit ${q} -> classical bit ${cBit}\n`;
          break;
      }
    }
    code += '\n';
  }

  // Simulation execution snippet
  code += `# 3. Simulate with Qiskit Aer
simulator = AerSimulator()
result = simulator.run(qc, shots=1024).result()
counts = result.get_counts(qc)

print("Measurement Counts (1024 shots):", counts)
print("Circuit Representation:")
print(qc.draw(output='text'))
`;

  return code;
}
