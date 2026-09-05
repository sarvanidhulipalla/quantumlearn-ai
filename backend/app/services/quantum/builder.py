from typing import Dict, Any
import qiskit
from qiskit import QuantumCircuit


def build_qiskit_circuit(circuit_data: Dict[str, Any], auto_measure_if_none: bool = True) -> QuantumCircuit:
    """
    Constructs a real Qiskit QuantumCircuit instance from a validated circuit dictionary.
    """
    num_qubits = circuit_data.get("qubits", circuit_data.get("numQubits", 1))
    num_classical = circuit_data.get("classical_bits", circuit_data.get("numClassicalBits", 0))

    raw_gates = circuit_data.get("gates", [])
    
    # Sort gates by time-step to ensure chronological execution
    sorted_gates = sorted(raw_gates, key=lambda g: g.get("step", g.get("colIndex", 0)))

    # Check if there are explicit measurement gates
    has_measurements = any(g.get("type", "").upper() == "M" for g in sorted_gates)

    # If auto-measuring is enabled and no measurements exist, ensure enough classical bits
    if not has_measurements and auto_measure_if_none:
        num_classical = max(num_classical, num_qubits)

    # Initialize QuantumCircuit
    if num_classical > 0:
        qc = QuantumCircuit(num_qubits, num_classical)
    else:
        qc = QuantumCircuit(num_qubits)

    # Apply gates
    for gate in sorted_gates:
        gate_type = gate.get("type", "").upper()
        
        q = gate.get("qubit")
        if q is None:
            q = gate.get("qubitIndex")
        if q is None:
            q = gate.get("control", 0)

        if gate_type == "H":
            qc.h(q)
        elif gate_type == "X":
            qc.x(q)
        elif gate_type == "Y":
            qc.y(q)
        elif gate_type == "Z":
            qc.z(q)
        elif gate_type == "S":
            qc.s(q)
        elif gate_type == "T":
            qc.t(q)
        elif gate_type == "CX":
            control = gate.get("control")
            if control is None:
                control = gate.get("qubit")
            if control is None:
                control = gate.get("qubitIndex", 0)

            target = gate.get("target")
            if target is None:
                target = gate.get("targetQubitIndex", 1)
            qc.cx(control, target)
        elif gate_type == "M":
            c_bit = gate.get("classical_bit")
            if c_bit is None:
                c_bit = gate.get("classicalBitIndex")
            if c_bit is None:
                c_bit = q if q < num_classical else 0
            if num_classical > 0:
                qc.measure(q, c_bit)

    # If circuit had no measurement gates and auto-measure is on, add measurement on all wires
    if not has_measurements and auto_measure_if_none and num_classical >= num_qubits:
        qc.measure(range(num_qubits), range(num_qubits))

    return qc
