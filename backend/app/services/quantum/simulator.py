import time
import math
import numpy as np
from typing import Dict, Any, List, Tuple
from qiskit import QuantumCircuit
from qiskit_aer import AerSimulator
from qiskit.quantum_info import Statevector, partial_trace

from app.services.quantum.builder import build_qiskit_circuit


def get_statevector_data(circuit_data: Dict[str, Any]) -> Tuple[List[Dict[str, Any]], List[Dict[str, Any]]]:
    """
    Computes exact statevector amplitudes and single-qubit reduced Bloch coordinates.
    """
    num_qubits = circuit_data.get("qubits", 1)

    # 1. Build circuit without measurements for pure statevector evolution
    qc_pure = build_qiskit_circuit(circuit_data, auto_measure_if_none=False)
    try:
        qc_pure.remove_final_measurements(inplace=True)
    except Exception:
        pass

    sv = Statevector.from_instruction(qc_pure)
    sv_array = sv.data
    dim = len(sv_array)

    statevector_entries: List[Dict[str, Any]] = []

    for i in range(dim):
        # Format binary state string with MSB-first convention
        bin_str = bin(i)[2:].zfill(num_qubits)
        val = sv_array[i]
        real_part = float(val.real)
        imag_part = float(val.imag)
        mag_sq = real_part**2 + imag_part**2
        mag = math.sqrt(mag_sq)
        phase_rad = math.atan2(imag_part, real_part)
        phase_deg = round(((phase_rad * 180.0) / math.pi + 360.0) % 360.0)

        statevector_entries.append({
            "state_binary": bin_str,
            "state_decimal": i,
            "real": round(real_part, 4),
            "imag": round(imag_part, 4),
            "magnitude": round(mag, 4),
            "probability": round(mag_sq, 4),
            "phase_degrees": phase_deg,
        })

    # 2. Calculate reduced Bloch Sphere coordinates for each individual wire
    bloch_spheres: List[Dict[str, Any]] = []

    for q in range(num_qubits):
        # Target bit in Qiskit big-endian convention (q0 is qubit 0)
        target_bit = num_qubits - 1 - q

        rho00 = 0.0
        rho11 = 0.0
        rho01_real = 0.0
        rho01_imag = 0.0

        for i in range(dim):
            bit_val = (i >> target_bit) & 1
            prob = abs(sv_array[i]) ** 2

            if bit_val == 0:
                rho00 += prob
                i1 = i | (1 << target_bit)
                # psi(i0) * conj(psi(i1))
                c0 = sv_array[i]
                c1_conj = np.conj(sv_array[i1])
                term = c0 * c1_conj
                rho01_real += float(term.real)
                rho01_imag += float(term.imag)
            else:
                rho11 += prob

        rx = 2.0 * rho01_real
        ry = 2.0 * rho01_imag
        rz = rho00 - rho11

        rz_clamped = max(-1.0, min(1.0, rz))
        theta = round((math.acos(rz_clamped) * 180.0) / math.pi)
        phi = round(((math.atan2(ry, rx) * 180.0) / math.pi + 360.0) % 360.0)

        # Determine label
        label = "|ψ⟩"
        if rho00 > 0.99:
            label = "|0⟩"
        elif rho11 > 0.99:
            label = "|1⟩"
        elif abs(rho00 - 0.5) < 0.05 and abs(rx - 1.0) < 0.1:
            label = "|+⟩"
        elif abs(rho00 - 0.5) < 0.05 and abs(rx + 1.0) < 0.1:
            label = "|-⟩"
        elif abs(rho00 - 0.5) < 0.05:
            label = "Superposition"

        bloch_spheres.append({
            "qubit_index": q,
            "theta": theta,
            "phi": phi,
            "prob0": round(rho00, 3),
            "prob1": round(rho11, 3),
            "state_label": label,
        })

    return statevector_entries, bloch_spheres


def run_qiskit_simulation(circuit_data: Dict[str, Any]) -> Dict[str, Any]:
    """
    Executes the circuit on the real Qiskit AerSimulator backend.
    """
    start_time = time.perf_counter()

    shots = circuit_data.get("shots", 1024)

    # 1. Build circuit with measurements
    qc_measure = build_qiskit_circuit(circuit_data, auto_measure_if_none=True)

    # 2. Run simulation with Qiskit Aer
    simulator = AerSimulator()
    job = simulator.run(qc_measure, shots=shots)
    result = job.result()
    raw_counts = result.get_counts()

    # Ensure binary keys match string format
    counts: Dict[str, int] = {}
    if isinstance(raw_counts, dict):
        for k, v in raw_counts.items():
            # Strip any spaces from classical register groupings
            cleaned_key = str(k).replace(" ", "")
            counts[cleaned_key] = int(v)
    elif isinstance(raw_counts, str):
        counts = {str(raw_counts): shots}

    # 3. Calculate probabilities from counts
    probabilities: Dict[str, float] = {}
    total_shots = sum(counts.values()) or shots
    for k, v in counts.items():
        probabilities[k] = round(v / float(total_shots), 4)

    # 4. Compute Statevector & Bloch coordinates
    statevector_entries, bloch_spheres = get_statevector_data(circuit_data)

    execution_time_ms = round((time.perf_counter() - start_time) * 1000.0, 2)

    # 5. Text-based circuit representation
    circuit_text = str(qc_measure.draw(output="text"))

    return {
        "success": True,
        "backend": "qiskit_aer",
        "shots": shots,
        "counts": counts,
        "probabilities": probabilities,
        "statevector": statevector_entries,
        "bloch_spheres": bloch_spheres,
        "circuit_text": circuit_text,
        "execution_time_ms": execution_time_ms,
        "validation_warnings": [],
    }
