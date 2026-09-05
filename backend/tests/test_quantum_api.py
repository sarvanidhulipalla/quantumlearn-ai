import sys
import os
from fastapi.testclient import TestClient

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.main import app

client = TestClient(app)


def test_quantum_health():
    """Verify Quantum health check reports Qiskit and Qiskit Aer active."""
    res = client.get("/api/v1/quantum/health")
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "healthy"
    assert data["qiskit"] is True
    assert data["aer"] is True
    print(f"[PASS] Quantum health check verified: Qiskit {data['qiskit_version']}, Aer {data['aer_version']}")


def test_single_h_gate():
    """Test 1: Single H Gate (|0⟩ → H → M) produces ~50/50 distribution."""
    payload = {
        "qubits": 1,
        "classical_bits": 1,
        "steps": 2,
        "shots": 1024,
        "gates": [
            {"type": "H", "qubit": 0, "step": 0},
            {"type": "M", "qubit": 0, "step": 1, "classical_bit": 0}
        ]
    }
    res = client.post("/api/v1/quantum/run", json=payload)
    assert res.status_code == 200
    data = res.json()
    assert data["success"] is True
    assert data["backend"] == "qiskit_aer"

    counts = data["counts"]
    assert "0" in counts
    assert "1" in counts
    p0 = counts["0"] / 1024.0
    p1 = counts["1"] / 1024.0
    assert 0.35 <= p0 <= 0.65
    assert 0.35 <= p1 <= 0.65
    print(f"[PASS] Single H Gate Test Passed: P(0)={p0:.3f}, P(1)={p1:.3f}")


def test_single_x_gate():
    """Test 2: Single X Gate (|0> -> X -> M) produces 100% |1> outcome."""
    payload = {
        "qubits": 1,
        "classical_bits": 1,
        "steps": 2,
        "shots": 1024,
        "gates": [
            {"type": "X", "qubit": 0, "step": 0},
            {"type": "M", "qubit": 0, "step": 1, "classical_bit": 0}
        ]
    }
    res = client.post("/api/v1/quantum/run", json=payload)
    assert res.status_code == 200
    data = res.json()
    assert data["success"] is True
    counts = data["counts"]
    assert counts.get("1") == 1024
    assert counts.get("0", 0) == 0
    print("[PASS] Single X Gate Test Passed: Exactly 1024/1024 |1> outcomes")


def test_bell_state():
    """Test 3: 2-Qubit Bell State (|00⟩ + |11⟩)/√2."""
    payload = {
        "qubits": 2,
        "classical_bits": 2,
        "steps": 3,
        "shots": 1024,
        "gates": [
            {"type": "H", "qubit": 0, "step": 0},
            {"type": "CX", "qubit": 0, "step": 1, "control": 0, "target": 1},
            {"type": "M", "qubit": 0, "step": 2, "classical_bit": 0},
            {"type": "M", "qubit": 1, "step": 2, "classical_bit": 1}
        ]
    }
    res = client.post("/api/v1/quantum/run", json=payload)
    assert res.status_code == 200
    data = res.json()
    assert data["success"] is True
    counts = data["counts"]

    # 00 and 11 should be ~50% each, 01 and 10 should be 0
    c00 = counts.get("00", 0)
    c11 = counts.get("11", 0)
    c01 = counts.get("01", 0)
    c10 = counts.get("10", 0)

    assert c00 + c11 == 1024
    assert c01 == 0
    assert c10 == 0
    assert 400 <= c00 <= 624
    assert 400 <= c11 <= 624
    print(f"[PASS] Bell State Test Passed: '00': {c00}, '11': {c11}, '01': {c01}, '10': {c10}")


def test_invalid_cx_same_control_target():
    """Test 4: Reject CX where control == target."""
    payload = {
        "qubits": 2,
        "classical_bits": 2,
        "steps": 2,
        "shots": 1024,
        "gates": [
            {"type": "CX", "qubit": 0, "step": 0, "control": 0, "target": 0}
        ]
    }
    res = client.post("/api/v1/quantum/run", json=payload)
    assert res.status_code == 422
    print("[PASS] Invalid CX (same control and target) correctly rejected with HTTP 422")


def test_out_of_bounds_qubit():
    """Test 5: Reject gate placed on out-of-bounds qubit."""
    payload = {
        "qubits": 2,
        "classical_bits": 2,
        "steps": 2,
        "shots": 1024,
        "gates": [
            {"type": "H", "qubit": 7, "step": 0}
        ]
    }
    res = client.post("/api/v1/quantum/run", json=payload)
    assert res.status_code == 422
    print("[PASS] Out-of-bounds qubit index correctly rejected with HTTP 422")


def test_shot_sampling_count():
    """Test 6: Verify counts sum to requested shots (e.g. 2048)."""
    payload = {
        "qubits": 1,
        "classical_bits": 1,
        "steps": 2,
        "shots": 2048,
        "gates": [
            {"type": "H", "qubit": 0, "step": 0},
            {"type": "M", "qubit": 0, "step": 1, "classical_bit": 0}
        ]
    }
    res = client.post("/api/v1/quantum/run", json=payload)
    assert res.status_code == 200
    data = res.json()
    assert sum(data["counts"].values()) == 2048
    print(f"[PASS] Shot Count Test Passed: Exact sum = {sum(data['counts'].values())}")


def test_statevector_normalization():
    """Test 7: Statevector calculation and normalization."""
    payload = {
        "qubits": 2,
        "classical_bits": 2,
        "steps": 2,
        "shots": 1024,
        "gates": [
            {"type": "H", "qubit": 0, "step": 0},
            {"type": "CX", "qubit": 0, "step": 1, "control": 0, "target": 1}
        ]
    }
    res = client.post("/api/v1/quantum/statevector", json=payload)
    assert res.status_code == 200
    data = res.json()
    statevector = data["statevector"]
    total_prob = sum(s["probability"] for s in statevector)
    assert 0.99 <= total_prob <= 1.01
    print(f"[PASS] Statevector Normalization Passed: Sum of probabilities = {total_prob:.4f}")


if __name__ == "__main__":
    test_quantum_health()
    test_single_h_gate()
    test_single_x_gate()
    test_bell_state()
    test_invalid_cx_same_control_target()
    test_out_of_bounds_qubit()
    test_shot_sampling_count()
    test_statevector_normalization()
    print("\nALL PHASE 4 QISKIT AER BACKEND TESTS PASSED SUCCESSFULLY!")
