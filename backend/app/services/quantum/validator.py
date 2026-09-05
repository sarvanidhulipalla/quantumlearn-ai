from typing import Dict, Any, List, Tuple

ALLOWED_GATES = {"H", "X", "Y", "Z", "S", "T", "CX", "M"}
MIN_QUBITS = 1
MAX_QUBITS = 12
MIN_CLASSICAL = 0
MAX_CLASSICAL = 12
MIN_SHOTS = 128
MAX_SHOTS = 8192
MAX_GATES = 100


def validate_circuit_data(circuit_data: Dict[str, Any]) -> Tuple[bool, List[str]]:
    """
    Validates the structure, boundaries, and logic of a quantum circuit JSON payload.
    Returns (is_valid, list_of_errors).
    """
    errors: List[str] = []

    # 1. Validate top-level dimensions
    num_qubits = circuit_data.get("qubits", circuit_data.get("numQubits", 1))
    if not isinstance(num_qubits, int) or num_qubits < MIN_QUBITS or num_qubits > MAX_QUBITS:
        errors.append(f"Number of qubits must be an integer between {MIN_QUBITS} and {MAX_QUBITS}.")

    num_classical = circuit_data.get("classical_bits", circuit_data.get("numClassicalBits", 0))
    if not isinstance(num_classical, int) or num_classical < MIN_CLASSICAL or num_classical > MAX_CLASSICAL:
        errors.append(f"Number of classical bits must be an integer between {MIN_CLASSICAL} and {MAX_CLASSICAL}.")

    shots = circuit_data.get("shots", 1024)
    if not isinstance(shots, int) or shots < MIN_SHOTS or shots > MAX_SHOTS:
        errors.append(f"Shots must be an integer between {MIN_SHOTS} and {MAX_SHOTS}.")

    # 2. Validate gates
    gates = circuit_data.get("gates", [])
    if not isinstance(gates, list):
        errors.append("Gates must be provided as a list.")
        return False, errors

    if len(gates) > MAX_GATES:
        errors.append(f"Circuit exceeds maximum limit of {MAX_GATES} gates (received {len(gates)}).")
        return False, errors

    for idx, gate in enumerate(gates):
        if not isinstance(gate, dict):
            errors.append(f"Gate at index {idx} must be a JSON object.")
            continue

        gate_type = gate.get("type", "").upper()
        if gate_type not in ALLOWED_GATES:
            errors.append(f"Gate at index {idx} has unsupported type '{gate_type}'. Allowed: {sorted(ALLOWED_GATES)}.")
            continue

        # Extract primary qubit index
        q_idx = gate.get("qubit")
        if q_idx is None:
            q_idx = gate.get("qubitIndex")
        if q_idx is None:
            q_idx = gate.get("control")

        if q_idx is None or not isinstance(q_idx, int) or q_idx < 0 or q_idx >= num_qubits:
            errors.append(f"Gate '{gate_type}' at index {idx} operates on invalid qubit index {q_idx}. Must be 0 <= q < {num_qubits}.")

        # Multi-qubit gate checks
        if gate_type == "CX":
            control = gate.get("control")
            if control is None:
                control = gate.get("qubit")
            if control is None:
                control = gate.get("qubitIndex")

            target = gate.get("target")
            if target is None:
                target = gate.get("targetQubitIndex")

            if target is None or not isinstance(target, int) or target < 0 or target >= num_qubits:
                errors.append(f"CNOT (CX) gate at index {idx} has invalid target qubit index {target}. Must be 0 <= target < {num_qubits}.")
            elif control == target:
                errors.append(f"CNOT (CX) gate at index {idx} cannot have identical control and target qubit ({control}).")

        # Measurement gate checks
        if gate_type == "M":
            c_bit = gate.get("classical_bit", gate.get("classicalBitIndex"))
            if c_bit is not None:
                if not isinstance(c_bit, int) or c_bit < 0 or (num_classical > 0 and c_bit >= num_classical):
                    errors.append(f"Measurement gate at index {idx} targets invalid classical bit {c_bit}. Must be 0 <= c < {num_classical}.")

    return len(errors) == 0, errors
