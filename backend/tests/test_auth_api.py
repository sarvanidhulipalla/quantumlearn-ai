import sys
import os
from fastapi.testclient import TestClient

# Ensure app is in pythonpath
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.main import app
from app.database.session import SessionLocal, engine
from app.models import Base
from app.utils.seed import seed_demo_data

client = TestClient(app)


def test_root_and_health():
    """Verify root and health endpoints."""
    # 1. Test Root
    res_root = client.get("/")
    assert res_root.status_code == 200
    data_root = res_root.json()
    assert data_root["platform"] == "QuantumLearn AI"
    assert "tagline" in data_root
    print("[PASS] Root endpoint test passed!")

    # 2. Test Health
    res_health = client.get("/api/v1/health")
    assert res_health.status_code == 200
    data_health = res_health.json()
    assert data_health["status"] in ["online", "healthy"]
    assert data_health["database"] == "healthy"
    print("[PASS] Health check test passed!")


def test_authentication_flow():
    """Verify registration, login, profile fetch, and validation."""
    # 1. Register a new student
    student_payload = {
        "email": "tester.student@quantumlearn.ai",
        "password": "TestPassword123!",
        "full_name": "Test Student Learner",
        "role": "Student",
        "education_level": "Undergraduate",
        "quantum_experience": "Beginner (No background)"
    }
    res_reg = client.post("/api/v1/auth/register", json=student_payload)
    # Could be 201 or 400 if rerun
    if res_reg.status_code == 201:
        reg_data = res_reg.json()
        assert "access_token" in reg_data
        assert reg_data["user"]["email"] == student_payload["email"]
        assert reg_data["user"]["role"] == "Student"
        print("[PASS] Student registration test passed!")

    # 2. Login with registered student
    login_payload = {
        "email": "tester.student@quantumlearn.ai",
        "password": "TestPassword123!"
    }
    res_login = client.post("/api/v1/auth/login", json=login_payload)
    assert res_login.status_code == 200
    login_data = res_login.json()
    token = login_data["access_token"]
    assert token is not None
    print("[PASS] Student login test passed!")

    # 3. Test /auth/me with JWT Bearer token
    res_me = client.get("/api/v1/auth/me", headers={"Authorization": f"Bearer {token}"})
    assert res_me.status_code == 200
    me_data = res_me.json()
    assert me_data["email"] == student_payload["email"]
    assert me_data["full_name"] == student_payload["full_name"]
    print("[PASS] Authenticated /auth/me profile test passed!")

    # 4. Test Demo Seed Student Login
    res_demo = client.post("/api/v1/auth/login", json={
        "email": "student@quantumlearn.ai",
        "password": "QuantumLearn2026!"
    })
    assert res_demo.status_code == 200
    assert res_demo.json()["user"]["role"] == "Student"
    print("[PASS] Demo student seed login test passed!")

    # 5. Test Demo Seed Instructor Login
    res_inst = client.post("/api/v1/auth/login", json={
        "email": "instructor@quantumlearn.ai",
        "password": "QuantumLearn2026!"
    })
    assert res_inst.status_code == 200
    assert res_inst.json()["user"]["role"] == "Instructor"
    print("[PASS] Demo instructor seed login test passed!")

    # 6. Test Invalid Password
    res_bad = client.post("/api/v1/auth/login", json={
        "email": "student@quantumlearn.ai",
        "password": "WrongPassword999"
    })
    assert res_bad.status_code == 401
    print("[PASS] Unauthorized rejected test passed!")


if __name__ == "__main__":
    test_root_and_health()
    test_authentication_flow()
    print("\nALL BACKEND AUTH & HEALTH TESTS PASSED SUCCESSFULLY!")
