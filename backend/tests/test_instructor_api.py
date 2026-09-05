"""
Automated Integration Tests for QuantumLearn AI — Phase 7 Instructor Management
Tests Instructor Authorization, Course CRUD, Module/Lesson Management,
Quiz & Question Integrity, Challenge Management, Student Cohorts, and Analytics.
"""
import sys
import os
import json
from fastapi.testclient import TestClient

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.main import app
from app.database.session import SessionLocal, ensure_schema_migrations
from app.utils.seed import seed_demo_data

client = TestClient(app)

# Ensure database is migrated & seeded
ensure_schema_migrations()
db = SessionLocal()
seed_demo_data(db)
db.close()


def get_token(email: str, password: str = "QuantumLearn2026!") -> str:
    resp = client.post("/api/v1/auth/login", json={"email": email, "password": password})
    assert resp.status_code == 200, f"Login failed for {email}: {resp.text}"
    return resp.json()["access_token"]


def test_instructor_auth_and_forbidden_student():
    student_token = get_token("student@quantumlearn.ai")
    instructor_token = get_token("instructor@quantumlearn.ai")

    # 1. Student accessing instructor endpoint -> 403 Forbidden
    resp = client.get(
        "/api/v1/instructor/dashboard",
        headers={"Authorization": f"Bearer {student_token}"}
    )
    assert resp.status_code == 403, f"Expected 403 for student, got {resp.status_code}"
    print("\n[PASS] Student properly blocked with HTTP 403 on instructor endpoints")

    # 2. Instructor accessing instructor endpoint -> 200 OK
    resp = client.get(
        "/api/v1/instructor/dashboard",
        headers={"Authorization": f"Bearer {instructor_token}"}
    )
    assert resp.status_code == 200
    data = resp.json()
    assert "metrics" in data
    assert "course_performance" in data
    print("[PASS] Instructor dashboard metrics retrieved successfully")


def test_instructor_course_lifecycle():
    instructor_token = get_token("instructor@quantumlearn.ai")
    headers = {"Authorization": f"Bearer {instructor_token}"}

    # 1. Create Course
    create_payload = {
        "title": "Quantum Error Correction & Fault Tolerance",
        "description": "Comprehensive study of Shor 9-qubit code, Steane code, and surface codes.",
        "short_description": "Master fault-tolerant quantum memory and stabilizer formalisms.",
        "level": "Advanced",
        "estimated_hours": 12.0,
        "is_published": False
    }
    resp = client.post("/api/v1/instructor/courses", json=create_payload, headers=headers)
    assert resp.status_code == 201
    course_id = resp.json()["id"]
    print(f"[PASS] Course created with ID: {course_id}")

    # 2. Get Course Detail
    resp = client.get(f"/api/v1/instructor/courses/{course_id}", headers=headers)
    assert resp.status_code == 200
    assert resp.json()["title"] == "Quantum Error Correction & Fault Tolerance"
    assert resp.json()["is_published"] is False
    assert len(resp.json()["modules"]) >= 1

    # 3. Update Course
    update_payload = {
        "title": "Quantum Error Correction and Stabilizer Codes",
        "estimated_hours": 14.0
    }
    resp = client.put(f"/api/v1/instructor/courses/{course_id}", json=update_payload, headers=headers)
    assert resp.status_code == 200
    assert resp.json()["title"] == "Quantum Error Correction and Stabilizer Codes"

    # 4. Verify draft course is NOT visible to public student course list
    student_resp = client.get("/api/v1/courses")
    assert student_resp.status_code == 200
    course_ids = [c["id"] for c in student_resp.json()]
    assert course_id not in course_ids, "Draft course leaked to student catalog!"
    print("[PASS] Draft course verified hidden from students")

    # 5. Publish Course
    resp = client.post(f"/api/v1/instructor/courses/{course_id}/publish", headers=headers)
    assert resp.status_code == 200
    assert resp.json()["is_published"] is True

    # 6. Verify now visible to students
    student_resp = client.get("/api/v1/courses")
    course_ids = [c["id"] for c in student_resp.json()]
    assert course_id in course_ids, "Published course not found in student catalog!"
    print("[PASS] Course publication state toggle verified")

    # 7. Unpublish
    resp = client.post(f"/api/v1/instructor/courses/{course_id}/unpublish", headers=headers)
    assert resp.status_code == 200
    assert resp.json()["is_published"] is False


def test_module_and_lesson_management():
    instructor_token = get_token("instructor@quantumlearn.ai")
    student_token = get_token("student@quantumlearn.ai")
    headers = {"Authorization": f"Bearer {instructor_token}"}

    # Fetch instructor courses
    courses_resp = client.get("/api/v1/instructor/courses", headers=headers)
    course_id = courses_resp.json()[0]["id"]

    # 1. Create Module
    mod_payload = {
        "course_id": course_id,
        "title": "Module 4: Advanced Quantum Algorithms",
        "description": "Grover search and Shor factoring algorithms",
        "order": 4
    }
    resp = client.post("/api/v1/instructor/modules", json=mod_payload, headers=headers)
    assert resp.status_code == 201
    module_id = resp.json()["id"]
    print(f"[PASS] Module created with ID: {module_id}")

    # 2. Create Draft Lesson in this Module
    lesson_payload = {
        "module_id": module_id,
        "title": "Shor's Algorithm & Phase Estimation",
        "content": "### Learning Objective\nUnderstand the quantum Fourier transform and polynomial-time period finding.",
        "lesson_type": "interactive",
        "order": 1,
        "duration_minutes": 25,
        "is_published": False
    }
    resp = client.post("/api/v1/instructor/lessons", json=lesson_payload, headers=headers)
    assert resp.status_code == 201
    lesson_id = resp.json()["id"]
    print(f"[PASS] Lesson created with ID: {lesson_id}")

    # 3. Verify student cannot access draft lesson
    resp = client.get(
        f"/api/v1/lessons/{lesson_id}",
        headers={"Authorization": f"Bearer {student_token}"}
    )
    assert resp.status_code == 404, f"Student should get 404 on draft lesson, got {resp.status_code}"
    print("[PASS] Draft lesson properly hidden from student API with 404")

    # 4. Instructor can fetch and preview the lesson
    resp = client.get(f"/api/v1/instructor/lessons/{lesson_id}", headers=headers)
    assert resp.status_code == 200
    assert resp.json()["title"] == "Shor's Algorithm & Phase Estimation"

    # 5. Publish lesson
    resp = client.post(f"/api/v1/instructor/lessons/{lesson_id}/publish", headers=headers)
    assert resp.status_code == 200

    # 6. Student can now access the published lesson
    resp = client.get(
        f"/api/v1/lessons/{lesson_id}",
        headers={"Authorization": f"Bearer {student_token}"}
    )
    assert resp.status_code == 200
    print("[PASS] Lesson publication workflow verified")


def test_instructor_quiz_and_question_integrity():
    instructor_token = get_token("instructor@quantumlearn.ai")
    student_token = get_token("student@quantumlearn.ai")
    headers = {"Authorization": f"Bearer {instructor_token}"}

    # 1. Create Quiz
    quiz_payload = {
        "title": "Quantum Teleportation Mastery Quiz",
        "description": "Evaluate comprehension of Bell-state measurements and classical transmission channels.",
        "passing_score_percentage": 75.0,
        "time_limit_minutes": 10,
        "is_published": True,
        "questions": [
            {
                "prompt": "How many classical bits must Alice send to Bob to complete standard teleportation?",
                "question_type": "multiple_choice",
                "options_json": json.dumps([
                    {"id": "A", "text": "1 classical bit"},
                    {"id": "B", "text": "2 classical bits"},
                    {"id": "C", "text": "3 classical bits"},
                    {"id": "D", "text": "None, communication is instantaneous"}
                ]),
                "correct_answer": "B",
                "explanation": "Alice performs a Bell-basis measurement on 2 qubits, producing 2 classical bits sent over a conventional channel.",
                "points": 20,
                "order": 1
            },
            {
                "prompt": "True or False: Quantum teleportation allows faster-than-light information transfer.",
                "question_type": "true_false",
                "options_json": json.dumps([
                    {"id": "True", "text": "True"},
                    {"id": "False", "text": "False"}
                ]),
                "correct_answer": "False",
                "explanation": "Bob cannot reconstruct the state without Alice's classical 2-bit message, preserving the no-signaling theorem.",
                "points": 10,
                "order": 2
            }
        ]
    }
    resp = client.post("/api/v1/instructor/quizzes", json=quiz_payload, headers=headers)
    assert resp.status_code == 201
    quiz_id = resp.json()["id"]
    print(f"[PASS] Instructor created quiz with ID: {quiz_id}")

    # 2. Verify instructor sees correct answers in quiz detail
    resp = client.get(f"/api/v1/instructor/quizzes/{quiz_id}", headers=headers)
    assert resp.status_code == 200
    q_data = resp.json()
    assert len(q_data["questions"]) == 2
    assert q_data["questions"][0]["correct_answer"] == "B"
    assert q_data["questions"][0]["explanation"] is not None
    print("[PASS] Instructor can review authoritative correct answers and explanations")

    # 3. Verify student taking the quiz CANNOT see correct answers or explanations
    student_resp = client.get(
        f"/api/v1/quizzes/{quiz_id}",
        headers={"Authorization": f"Bearer {student_token}"}
    )
    assert student_resp.status_code == 200
    st_data = student_resp.json()
    for item in st_data["questions"]:
        assert "correct_answer" not in item, "SECURITY BREACH: correct_answer leaked to student!"
        assert "explanation" not in item, "SECURITY BREACH: explanation leaked to student!"
    print("[PASS] Student API verified secure: zero correct answer leakage")


def test_instructor_challenge_management():
    instructor_token = get_token("instructor@quantumlearn.ai")
    headers = {"Authorization": f"Bearer {instructor_token}"}

    # 1. Create Challenge
    ch_payload = {
        "title": "Build Quantum W-State",
        "slug": "build-w-state",
        "difficulty": "Advanced",
        "category": "Entanglement",
        "description": "Construct the 3-qubit W-state (|001⟩ + |010⟩ + |100⟩)/√3.",
        "target_state_vector": "0.577|001⟩ + 0.577|010⟩ + 0.577|100⟩",
        "starter_circuit_json": json.dumps({"numQubits": 3, "numClassicalBits": 3, "numCols": 6, "gates": []}),
        "starter_qiskit_code": "from qiskit import QuantumCircuit\nqc = QuantumCircuit(3, 3)",
        "points_reward": 120,
        "is_published": True
    }
    resp = client.post("/api/v1/instructor/challenges", json=ch_payload, headers=headers)
    assert resp.status_code == 201
    challenge_id = resp.json()["id"]
    print(f"[PASS] Challenge created with ID: {challenge_id}")

    # 2. Get Challenge
    resp = client.get(f"/api/v1/instructor/challenges/{challenge_id}", headers=headers)
    assert resp.status_code == 200
    assert resp.json()["title"] == "Build Quantum W-State"

    # 3. Update Challenge
    update_payload = {"points_reward": 140}
    resp = client.put(f"/api/v1/instructor/challenges/{challenge_id}", json=update_payload, headers=headers)
    assert resp.status_code == 200

    # 4. Delete Challenge
    resp = client.delete(f"/api/v1/instructor/challenges/{challenge_id}", headers=headers)
    assert resp.status_code == 200
    print("[PASS] Challenge CRUD lifecycle verified")


def test_instructor_student_roster_and_analytics():
    instructor_token = get_token("instructor@quantumlearn.ai")
    headers = {"Authorization": f"Bearer {instructor_token}"}

    # 1. List Students
    resp = client.get("/api/v1/instructor/students", headers=headers)
    assert resp.status_code == 200
    students = resp.json()
    assert len(students) >= 1
    student_id = students[0]["id"]
    print(f"[PASS] Retrieved {len(students)} students in instructor cohort")

    # 2. Filter students
    resp_active = client.get("/api/v1/instructor/students?filter=active", headers=headers)
    assert resp_active.status_code == 200

    # 3. Search students
    resp_search = client.get("/api/v1/instructor/students?search=Aarav", headers=headers)
    assert resp_search.status_code == 200

    # 4. Get Student Detail
    resp_detail = client.get(f"/api/v1/instructor/students/{student_id}", headers=headers)
    assert resp_detail.status_code == 200
    s_data = resp_detail.json()
    assert "enrolled_courses" in s_data
    assert "completed_lessons" in s_data
    assert "quiz_attempts" in s_data
    print("[PASS] Student performance detail retrieved successfully")

    # 5. Instructor Analytics
    resp_analytics = client.get("/api/v1/instructor/analytics", headers=headers)
    assert resp_analytics.status_code == 200
    analytics_data = resp_analytics.json()
    assert "course_completion_trends" in analytics_data
    assert "quiz_score_distribution" in analytics_data
    assert "challenge_completion_stats" in analytics_data
    print("[PASS] Platform-wide instructor analytics verified")


if __name__ == "__main__":
    test_instructor_auth_and_forbidden_student()
    test_instructor_course_lifecycle()
    test_module_and_lesson_management()
    test_instructor_quiz_and_question_integrity()
    test_instructor_challenge_management()
    test_instructor_student_roster_and_analytics()
    print("\nALL PHASE 7 INSTRUCTOR BACKEND TESTS PASSED SUCCESSFULLY!")
