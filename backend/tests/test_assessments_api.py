"""
Automated Integration Tests for QuantumLearn AI — Phase 6 Assessments
Tests Quizzes, Questions, Scoring Integrity, Automated Quantum Challenges, and Progressive Hints.
"""
import sys
import os
from fastapi.testclient import TestClient

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.main import app
from app.database.session import SessionLocal
from app.utils.seed import seed_demo_data

client = TestClient(app)

# Ensure database is seeded
db = SessionLocal()
seed_demo_data(db)
db.close()

# Authenticate demo student
login_res = client.post(
    "/api/v1/auth/login",
    json={"email": "student@quantumlearn.ai", "password": "QuantumLearn2026!"},
)
assert login_res.status_code == 200
STUDENT_TOKEN = login_res.json()["access_token"]
AUTH_HEADERS = {"Authorization": f"Bearer {STUDENT_TOKEN}"}


def test_quiz_auth_required():
    """Test 1: Quiz list requires valid authentication."""
    res = client.get("/api/v1/quizzes")
    assert res.status_code == 401
    print("[PASS] Quiz authentication requirement verified")


def test_quiz_list():
    """Test 2: Authenticated student can list quizzes with attempt metadata."""
    res = client.get("/api/v1/quizzes", headers=AUTH_HEADERS)
    assert res.status_code == 200
    data = res.json()
    assert len(data) >= 1
    assert "question_count" in data[0]
    assert "passing_score_percentage" in data[0]
    print(f"[PASS] Quiz list retrieved {len(data)} quizzes with metadata")


def test_quiz_detail_answers_hidden():
    """Test 3: Quiz detail returns questions WITHOUT revealing correct answers or explanations."""
    res = client.get("/api/v1/quizzes/1", headers=AUTH_HEADERS)
    assert res.status_code == 200
    data = res.json()
    assert len(data["questions"]) >= 5
    for q in data["questions"]:
        assert "correct_answer" not in q
        assert "explanation" not in q
        assert "prompt" in q
        assert len(q["options"]) > 0
    print("[PASS] Academic integrity verified: correct answers are hidden before submission")


def test_quiz_submit_scoring():
    """Test 4: Authoritative backend grading calculates correct score, percentage, and returns explanations."""
    payload = {
        "answers": {
            "1": "B",       # Correct
            "2": "False",   # Correct
            "3": "C",       # Correct
            "4": "B",       # Correct
            "5": "A"        # Correct (North Pole)
        }
    }
    res = client.post("/api/v1/quizzes/1/submit", json=payload, headers=AUTH_HEADERS)
    assert res.status_code == 200
    data = res.json()
    assert data["score_percentage"] == 100.0
    assert data["passed"] is True
    assert data["correct_count"] == 5
    assert len(data["breakdown"]) == 5
    assert data["breakdown"][0]["is_correct"] is True
    assert "explanation" in data["breakdown"][0]
    print("[PASS] Quiz scoring verified: 100% score computed authoritatively on backend")


def test_quiz_attempt_history():
    """Test 5: Student can retrieve previous attempt history."""
    res = client.get("/api/v1/quizzes/1/attempts", headers=AUTH_HEADERS)
    assert res.status_code == 200
    data = res.json()
    assert len(data) >= 1
    assert data[0]["score_percentage"] == 100.0
    print("[PASS] Quiz attempt history verified")


def test_challenge_list():
    """Test 6: List quantum challenges with categories, difficulties, and points."""
    res = client.get("/api/v1/challenges", headers=AUTH_HEADERS)
    assert res.status_code == 200
    data = res.json()
    assert len(data) >= 5
    slugs = [c["slug"] for c in data]
    assert "create-superposition" in slugs
    assert "create-bell-state" in slugs
    assert "create-ghz-state" in slugs
    print(f"[PASS] Challenge list verified: {len(data)} challenges available")


def test_challenge_detail():
    """Test 7: Retrieve challenge details, starter circuit, and target specifications."""
    res = client.get("/api/v1/challenges/create-superposition", headers=AUTH_HEADERS)
    assert res.status_code == 200
    data = res.json()
    assert data["slug"] == "create-superposition"
    assert "starter_circuit" in data
    print("[PASS] Challenge detail verified")


def test_superposition_challenge_eval():
    """Test 8: Deterministic evaluation of Superposition challenge."""
    # 1. Valid circuit: H on q0, measurement on q0
    valid_circuit = {
        "numQubits": 1,
        "numClassicalBits": 1,
        "gates": [
            {"type": "H", "qubitIndex": 0, "colIndex": 0},
            {"type": "M", "qubitIndex": 0, "colIndex": 1, "classicalBitIndex": 0}
        ]
    }
    res_valid = client.post("/api/v1/challenges/1/submit", json={"circuit": valid_circuit}, headers=AUTH_HEADERS)
    assert res_valid.status_code == 200
    data_valid = res_valid.json()
    assert data_valid["solved"] is True
    assert data_valid["fidelity_score"] > 0.85

    # 2. Invalid circuit: Empty or wrong gate
    invalid_circuit = {
        "numQubits": 1,
        "numClassicalBits": 1,
        "gates": [
            {"type": "X", "qubitIndex": 0, "colIndex": 0},
            {"type": "M", "qubitIndex": 0, "colIndex": 1, "classicalBitIndex": 0}
        ]
    }
    res_invalid = client.post("/api/v1/challenges/1/submit", json={"circuit": invalid_circuit}, headers=AUTH_HEADERS)
    assert res_invalid.status_code == 200
    data_invalid = res_invalid.json()
    assert data_invalid["solved"] is False
    print("[PASS] Superposition challenge evaluation verified (Valid passed, Invalid failed)")


def test_bell_state_challenge_eval():
    """Test 9: Deterministic evaluation of 2-Qubit Bell State challenge."""
    # Find Bell State challenge ID
    ch_list = client.get("/api/v1/challenges", headers=AUTH_HEADERS).json()
    bell_ch = next(c for c in ch_list if c["slug"] == "create-bell-state")

    # Valid Bell State: H on q0, CX control=0 target=1, M on q0, q1
    valid_bell = {
        "numQubits": 2,
        "numClassicalBits": 2,
        "gates": [
            {"type": "H", "qubitIndex": 0, "colIndex": 0},
            {"type": "CX", "qubitIndex": 0, "colIndex": 1, "targetQubitIndex": 1},
            {"type": "M", "qubitIndex": 0, "colIndex": 2, "classicalBitIndex": 0},
            {"type": "M", "qubitIndex": 1, "colIndex": 2, "classicalBitIndex": 1}
        ]
    }
    res = client.post(f"/api/v1/challenges/{bell_ch['id']}/submit", json={"circuit": valid_bell}, headers=AUTH_HEADERS)
    assert res.status_code == 200
    data = res.json()
    assert data["solved"] is True
    assert data["fidelity_score"] > 0.85

    # Incorrect circuit: Only H gate without CNOT
    bad_bell = {
        "numQubits": 2,
        "numClassicalBits": 2,
        "gates": [
            {"type": "H", "qubitIndex": 0, "colIndex": 0},
            {"type": "M", "qubitIndex": 0, "colIndex": 1, "classicalBitIndex": 0},
            {"type": "M", "qubitIndex": 1, "colIndex": 1, "classicalBitIndex": 1}
        ]
    }
    res_bad = client.post(f"/api/v1/challenges/{bell_ch['id']}/submit", json={"circuit": bad_bell}, headers=AUTH_HEADERS)
    assert res_bad.status_code == 200
    assert res_bad.json()["solved"] is False
    print("[PASS] Bell State challenge evaluation verified (Entangled passed, Unentangled failed)")


def test_ghz_state_challenge_eval():
    """Test 10: Deterministic evaluation of 3-Qubit GHZ State challenge."""
    ch_list = client.get("/api/v1/challenges", headers=AUTH_HEADERS).json()
    ghz_ch = next(c for c in ch_list if c["slug"] == "create-ghz-state")

    # Valid GHZ: H on q0, CX(0->1), CX(1->2), measurements
    valid_ghz = {
        "numQubits": 3,
        "numClassicalBits": 3,
        "gates": [
            {"type": "H", "qubitIndex": 0, "colIndex": 0},
            {"type": "CX", "qubitIndex": 0, "colIndex": 1, "targetQubitIndex": 1},
            {"type": "CX", "qubitIndex": 1, "colIndex": 2, "targetQubitIndex": 2},
            {"type": "M", "qubitIndex": 0, "colIndex": 3, "classicalBitIndex": 0},
            {"type": "M", "qubitIndex": 1, "colIndex": 3, "classicalBitIndex": 1},
            {"type": "M", "qubitIndex": 2, "colIndex": 3, "classicalBitIndex": 2}
        ]
    }
    res = client.post(f"/api/v1/challenges/{ghz_ch['id']}/submit", json={"circuit": valid_ghz}, headers=AUTH_HEADERS)
    assert res.status_code == 200
    data = res.json()
    assert data["solved"] is True
    print("[PASS] 3-Qubit GHZ State challenge evaluation verified")


def test_challenge_hints():
    """Test 11: Progressive Socratic hint retrieval."""
    res_h1 = client.post("/api/v1/challenges/1/hint?hint_level=1", headers=AUTH_HEADERS)
    assert res_h1.status_code == 200
    assert "hint" in res_h1.json()
    assert res_h1.json()["hint_level"] == 1

    res_h2 = client.post("/api/v1/challenges/1/hint?hint_level=2", headers=AUTH_HEADERS)
    assert res_h2.status_code == 200
    assert res_h2.json()["hint_level"] == 2
    print("[PASS] Progressive challenge hints verified")


def test_challenge_attempts_history():
    """Test 12: Challenge attempt history recording."""
    res = client.get("/api/v1/challenges/1/attempts", headers=AUTH_HEADERS)
    assert res.status_code == 200
    data = res.json()
    assert len(data) >= 2
    assert "fidelity_score" in data[0]
    print("[PASS] Challenge attempt history verified")


if __name__ == "__main__":
    test_quiz_auth_required()
    test_quiz_list()
    test_quiz_detail_answers_hidden()
    test_quiz_submit_scoring()
    test_quiz_attempt_history()
    test_challenge_list()
    test_challenge_detail()
    test_superposition_challenge_eval()
    test_bell_state_challenge_eval()
    test_ghz_state_challenge_eval()
    test_challenge_hints()
    test_challenge_attempts_history()
    print("\nALL PHASE 6 ASSESSMENT & CHALLENGE TESTS PASSED SUCCESSFULLY!")
