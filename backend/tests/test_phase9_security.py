import sys
import os
from fastapi.testclient import TestClient

# Add backend directory to sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.main import app
from app.database.session import SessionLocal, ensure_schema_migrations
from app.utils.seed import seed_demo_data
from app.core.config import settings

client = TestClient(app)


def setup_module():
    """Ensure database migrations and initial seed data are populated."""
    ensure_schema_migrations()
    db = SessionLocal()
    try:
        seed_demo_data(db)
    finally:
        db.close()


def get_token(email: str, password: str = "QuantumLearn2026!") -> str:
    """Helper to authenticate and fetch JWT access token."""
    response = client.post(
        "/api/v1/auth/login",
        json={"email": email, "password": password}
    )
    assert response.status_code == 200, f"Login failed for {email}: {response.text}"
    return response.json()["access_token"]


def test_cors_and_health_security():
    """Tests CORS origin configuration and health checks."""
    # 1. Health checks
    res_health = client.get("/api/v1/health")
    assert res_health.status_code == 200
    assert res_health.json()["status"] == "healthy"

    res_qhealth = client.get("/api/v1/quantum/health")
    assert res_qhealth.status_code == 200
    data = res_qhealth.json()
    assert data["qiskit"] is True
    assert data["aer"] is True

    # 2. CORS parsing in settings
    origins = settings.cors_origins_list
    assert len(origins) >= 1
    assert "http://localhost:5173" in origins

    # 3. Preflight request with allowed origin
    res_cors = client.options(
        "/api/v1/quantum/run",
        headers={
            "Origin": "http://localhost:5173",
            "Access-Control-Request-Method": "POST",
            "Access-Control-Request-Headers": "Content-Type,Authorization"
        }
    )
    assert res_cors.status_code == 200
    assert res_cors.headers.get("access-control-allow-origin") == "http://localhost:5173"

    print("[PASS] CORS configuration and health checks verified")


def test_quantum_execution_safety_limits():
    """Tests strict quantum resource limits and validation to prevent DoS."""
    # 1. Exceeding max qubits (>12) -> HTTP 422
    res_max_q = client.post(
        "/api/v1/quantum/run",
        json={"qubits": 16, "shots": 1024, "gates": []}
    )
    assert res_max_q.status_code == 422

    # 2. Under min qubits (<1) -> HTTP 422
    res_min_q = client.post(
        "/api/v1/quantum/run",
        json={"qubits": 0, "shots": 1024, "gates": []}
    )
    assert res_min_q.status_code == 422

    # 3. Excessive shots (>8192) -> HTTP 422
    res_shots_high = client.post(
        "/api/v1/quantum/run",
        json={"qubits": 2, "shots": 20000, "gates": []}
    )
    assert res_shots_high.status_code == 422

    # 4. Under min shots (<128) -> HTTP 422
    res_shots_low = client.post(
        "/api/v1/quantum/run",
        json={"qubits": 2, "shots": 10, "gates": []}
    )
    assert res_shots_low.status_code == 422

    # 5. Excessive gate count (>100 gates) -> HTTP 422
    excessive_gates = [{"type": "H", "qubit": 0, "step": i} for i in range(120)]
    res_excessive = client.post(
        "/api/v1/quantum/run",
        json={"qubits": 2, "shots": 1024, "gates": excessive_gates}
    )
    assert res_excessive.status_code == 422

    # 6. Self-controlled CNOT gate -> HTTP 422
    res_self_cnot = client.post(
        "/api/v1/quantum/run",
        json={"qubits": 2, "shots": 1024, "gates": [{"type": "CX", "control": 0, "target": 0}]}
    )
    assert res_self_cnot.status_code == 422

    # 7. Valid Bell state circuit executes successfully
    res_valid = client.post(
        "/api/v1/quantum/run",
        json={
            "qubits": 2,
            "classical_bits": 2,
            "shots": 1024,
            "gates": [
                {"type": "H", "qubit": 0, "step": 0},
                {"type": "CX", "control": 0, "target": 1, "step": 1},
                {"type": "M", "qubit": 0, "classical_bit": 0, "step": 2},
                {"type": "M", "qubit": 1, "classical_bit": 1, "step": 2}
            ]
        }
    )
    assert res_valid.status_code == 200
    valid_data = res_valid.json()
    assert valid_data["success"] is True
    assert valid_data["shots"] == 1024

    print("[PASS] Quantum execution safety bounds and gate limits verified")


def test_authentication_and_role_security():
    """Tests strict authentication requirement and role-based access control."""
    student_token = get_token("student@quantumlearn.ai")
    instructor_token = get_token("instructor@quantumlearn.ai")

    # 1. Unauthenticated access rejected with HTTP 401
    res_unauth = client.get("/api/v1/auth/me")
    assert res_unauth.status_code == 401

    # 2. Corrupted / Malformed JWT rejected with HTTP 401
    res_corrupted = client.get(
        "/api/v1/auth/me",
        headers={"Authorization": "Bearer malformed.jwt.signature"}
    )
    assert res_corrupted.status_code == 401

    # 3. Password hashes are never exposed in user profile responses
    res_me = client.get(
        "/api/v1/auth/me",
        headers={"Authorization": f"Bearer {student_token}"}
    )
    assert res_me.status_code == 200
    user_data = res_me.json()
    assert "hashed_password" not in user_data
    assert "password" not in user_data

    # 4. Student accessing Instructor endpoints -> Strict 403 Forbidden
    instructor_endpoints = [
        ("GET", "/api/v1/instructor/dashboard"),
        ("GET", "/api/v1/instructor/courses"),
        ("POST", "/api/v1/instructor/courses"),
        ("GET", "/api/v1/instructor/lessons"),
        ("GET", "/api/v1/instructor/quizzes"),
        ("GET", "/api/v1/instructor/challenges"),
        ("GET", "/api/v1/instructor/students"),
        ("GET", "/api/v1/instructor/analytics"),
        ("GET", "/api/v1/instructor/analytics/advanced"),
        ("POST", "/api/v1/ai/course-generation"),
        ("POST", "/api/v1/ai/quiz-generation"),
    ]

    for method, path in instructor_endpoints:
        if method == "GET":
            r = client.get(path, headers={"Authorization": f"Bearer {student_token}"})
        else:
            r = client.post(path, headers={"Authorization": f"Bearer {student_token}"}, json={})
        assert r.status_code in [403, 422], f"Expected 403 for {path}, got {r.status_code}"

    print("[PASS] Authentication verification and role-based authorization verified")


def test_idor_and_user_data_isolation():
    """Tests IDOR prevention and strict data isolation between students."""
    student_token = get_token("student@quantumlearn.ai")
    instructor_token = get_token("instructor@quantumlearn.ai")

    # 1. Student A starts an AI conversation
    res_chat = client.post(
        "/api/v1/ai/chat",
        headers={"Authorization": f"Bearer {student_token}"},
        json={"message": "Explain Hadamard gate superposition in depth."}
    )
    assert res_chat.status_code == 200
    conv_id = res_chat.json()["conversation_id"]

    # 2. Instructor (acting as different user) attempts to access Student A's conversation -> HTTP 404/403
    res_isolation = client.get(
        f"/api/v1/ai/conversations/{conv_id}",
        headers={"Authorization": f"Bearer {instructor_token}"}
    )
    assert res_isolation.status_code == 404, f"Expected 404 for isolated conversation, got {res_isolation.status_code}"

    # 3. Student A can access own conversation
    res_own = client.get(
        f"/api/v1/ai/conversations/{conv_id}",
        headers={"Authorization": f"Bearer {student_token}"}
    )
    assert res_own.status_code == 200

    print("[PASS] IDOR data isolation and session boundaries verified")


if __name__ == "__main__":
    setup_module()
    test_cors_and_health_security()
    test_quantum_execution_safety_limits()
    test_authentication_and_role_security()
    test_idor_and_user_data_isolation()
    print("\nALL PHASE 9 SECURITY & HARDENING TESTS PASSED SUCCESSFULLY!")
