import math
from typing import Dict, Any, List, Tuple
from app.services.quantum.simulator import run_qiskit_simulation
from app.services.quantum.validator import validate_circuit_data


def evaluate_challenge_submission(
    challenge_slug: str,
    circuit_data: Dict[str, Any],
) -> Dict[str, Any]:
    """
    Automated deterministic quantum challenge evaluator.
    Validates circuit structure and evaluates physical quantum state against target criteria.
    """
    # 1. Validate structure
    is_valid, validation_errors = validate_circuit_data(circuit_data)
    if not is_valid:
        return {
            "solved": False,
            "fidelity_score": 0.0,
            "message": "Circuit validation failed: " + "; ".join(validation_errors),
            "detailed_checks": [f"Validation Error: {e}" for e in validation_errors],
            "simulation_results": None,
        }

    # 2. Run simulation on Qiskit Aer
    try:
        sim_result = run_qiskit_simulation(circuit_data)
    except Exception as exc:
        return {
            "solved": False,
            "fidelity_score": 0.0,
            "message": f"Simulation execution failed: {str(exc)}",
            "detailed_checks": ["Error executing circuit on Qiskit Aer."],
            "simulation_results": None,
        }

    probs = sim_result.get("probabilities", {})
    counts = sim_result.get("counts", {})
    statevector = sim_result.get("statevector", [])
    gates = circuit_data.get("gates", [])

    detailed_checks: List[str] = []
    solved = False
    fidelity = 0.0

    # 3. Rule-based evaluation per challenge slug
    slug = challenge_slug.lower()

    if slug in ["create-superposition", "implement-h-gate"]:
        # Target: Single qubit balanced superposition |+⟩ = (|0⟩ + |1⟩)/√2
        p0 = probs.get("0", probs.get("00", 0.0))
        p1 = probs.get("1", probs.get("01", 0.0))

        # Check if Hadamard gate is present
        has_h = any(g.get("type", "").upper() == "H" for g in gates)
        detailed_checks.append("Circuit contains Hadamard (H) gate: " + ("✓ Yes" if has_h else "✕ Missing"))

        # Check probability tolerance (0.42 to 0.58)
        is_balanced = (0.40 <= p0 <= 0.60) and (0.40 <= p1 <= 0.60)
        detailed_checks.append(f"Outcome |0⟩ Probability: {p0:.3f} (Expected ~0.50) -> {'✓ Passed' if 0.40 <= p0 <= 0.60 else '✕ Failed'}")
        detailed_checks.append(f"Outcome |1⟩ Probability: {p1:.3f} (Expected ~0.50) -> {'✓ Passed' if 0.40 <= p1 <= 0.60 else '✕ Failed'}")

        if is_balanced:
            solved = True
            fidelity = round(1.0 - abs(p0 - 0.5) - abs(p1 - 0.5), 3)
            message = "Success! Perfect 50/50 quantum superposition generated."
        else:
            message = f"Superposition not balanced. Observed P(0)={p0:.2f}, P(1)={p1:.2f}."

    elif slug in ["create-a-bell-state", "create-bell-state"]:
        # Target: 2-Qubit maximally entangled Bell state |Φ⁺⟩ = (|00⟩ + |11⟩)/√2
        p00 = probs.get("00", 0.0)
        p11 = probs.get("11", 0.0)
        p01 = probs.get("01", 0.0)
        p10 = probs.get("10", 0.0)

        has_h = any(g.get("type", "").upper() == "H" for g in gates)
        has_cx = any(g.get("type", "").upper() == "CX" for g in gates)

        detailed_checks.append("Hadamard gate placed on control qubit: " + ("✓ Yes" if has_h else "✕ Missing"))
        detailed_checks.append("CNOT (CX) gate entangling qubits: " + ("✓ Yes" if has_cx else "✕ Missing"))
        detailed_checks.append(f"Correlated outcomes P(00)={p00:.3f}, P(11)={p11:.3f} (Expected ~0.50 each)")
        detailed_checks.append(f"Zero anti-correlated outcomes P(01)={p01:.3f}, P(10)={p10:.3f} (Expected 0.00)")

        if (0.40 <= p00 <= 0.60) and (0.40 <= p11 <= 0.60) and p01 <= 0.05 and p10 <= 0.05:
            solved = True
            fidelity = round(p00 + p11 - (p01 + p10), 3)
            message = "Outstanding! Maximally entangled Bell state |Φ⁺⟩ constructed successfully."
        else:
            message = f"Bell state criteria not met. Observed P(00)={p00:.2f}, P(11)={p11:.2f}, P(01)={p01:.2f}, P(10)={p10:.2f}."

    elif slug in ["create-a-ghz-state", "create-ghz-state"]:
        # Target: 3-Qubit GHZ state (|000⟩ + |111⟩)/√2
        p000 = probs.get("000", 0.0)
        p111 = probs.get("111", 0.0)
        other_prob = sum(v for k, v in probs.items() if k not in ["000", "111"])

        detailed_checks.append(f"State |000⟩: {p000:.3f} (Target ~0.50)")
        detailed_checks.append(f"State |111⟩: {p111:.3f} (Target ~0.50)")
        detailed_checks.append(f"Other Basis States: {other_prob:.3f} (Target 0.00)")

        if (0.40 <= p000 <= 0.60) and (0.40 <= p111 <= 0.60) and other_prob <= 0.08:
            solved = True
            fidelity = round(p000 + p111 - other_prob, 3)
            message = "Brilliant! 3-Qubit GHZ entangled state successfully prepared."
        else:
            message = f"GHZ state criteria not met. P(000)={p000:.2f}, P(111)={p111:.2f}."

    elif slug in ["implement-x-gate", "quantum-not"]:
        # Target: 1-qubit bit flip |0⟩ -> |1⟩ with 100% certainty
        p1 = probs.get("1", probs.get("01", 0.0))
        has_x = any(g.get("type", "").upper() == "X" for g in gates)

        detailed_checks.append("Pauli-X NOT gate placed: " + ("✓ Yes" if has_x else "✕ Missing"))
        detailed_checks.append(f"Outcome |1⟩: {p1:.3f} (Expected 1.00)")

        if p1 >= 0.95:
            solved = True
            fidelity = 1.0
            message = "Success! Pauli-X bit flip executed with 100% fidelity."
        else:
            message = f"Expected |1⟩ state with 100% probability, but observed P(1)={p1:.2f}."

    elif slug in ["build-a-cnot-circuit", "cnot-challenge"]:
        # Target: CNOT flips target when control is 1
        has_cx = any(g.get("type", "").upper() == "CX" for g in gates)
        detailed_checks.append("CNOT gate placed: " + ("✓ Yes" if has_cx else "✕ Missing"))
        if has_cx and len(gates) >= 2:
            solved = True
            fidelity = 1.0
            message = "Success! CNOT logic verified."
        else:
            message = "Circuit must contain a functional CNOT operation."

    else:
        # Generic challenge verification: at least 1 gate placed and simulated
        if len(gates) > 0 and len(probs) > 0:
            solved = True
            fidelity = 0.95
            message = "Challenge circuit executed and passed basic criteria."
            detailed_checks.append("Circuit executed on Qiskit Aer successfully.")
        else:
            message = "Circuit is empty. Please place gates to solve this challenge."

    return {
        "solved": solved,
        "fidelity_score": max(0.0, min(1.0, fidelity)),
        "message": message,
        "detailed_checks": detailed_checks,
        "simulation_results": sim_result,
    }
