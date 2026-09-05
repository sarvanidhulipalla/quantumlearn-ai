import sys
import os
from fastapi.testclient import TestClient

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.main import app

client = TestClient(app)


def test_courses_and_lessons():
    # 1. Login as student
    login_res = client.post("/api/v1/auth/login", json={
        "email": "student@quantumlearn.ai",
        "password": "QuantumLearn2026!"
    })
    assert login_res.status_code == 200
    token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # 2. List Courses
    courses_res = client.get("/api/v1/courses", headers=headers)
    assert courses_res.status_code == 200
    courses = courses_res.json()
    assert len(courses) >= 5
    first_course = courses[0]
    print(f"[PASS] Courses list returned {len(courses)} courses!")

    # 3. Course Details
    course_detail_res = client.get(f"/api/v1/courses/{first_course['id']}", headers=headers)
    assert course_detail_res.status_code == 200
    course_detail = course_detail_res.json()
    assert len(course_detail["modules"]) >= 1
    first_lesson = course_detail["modules"][0]["lessons"][0]
    print(f"[PASS] Course detail retrieved for: {course_detail['title']}")

    # 4. Lesson Details
    lesson_res = client.get(f"/api/v1/lessons/{first_lesson['id']}", headers=headers)
    assert lesson_res.status_code == 200
    lesson_detail = lesson_res.json()
    assert lesson_detail["id"] == first_lesson["id"]
    assert "Learning Objective" in lesson_detail["content"]
    print(f"[PASS] Lesson content retrieved for: {lesson_detail['title']}")

    # 5. Complete Lesson
    complete_res = client.post(f"/api/v1/lessons/{first_lesson['id']}/complete", headers=headers)
    assert complete_res.status_code == 200
    complete_data = complete_res.json()
    assert complete_data["is_completed"] == True
    print(f"[PASS] Lesson completed successfully! Points: {complete_data['points_awarded']}")

    # 6. Student Progress Summary
    progress_res = client.get("/api/v1/student/progress", headers=headers)
    assert progress_res.status_code == 200
    progress_data = progress_res.json()
    assert progress_data["completed_lessons_count"] >= 1
    assert progress_data["total_points"] >= 25
    print(f"[PASS] Student progress summary retrieved: {progress_data['completed_lessons_count']} lessons done, {progress_data['total_points']} XP")

    # 7. Student My-Learning
    mylearning_res = client.get("/api/v1/student/my-learning", headers=headers)
    assert mylearning_res.status_code == 200
    mylearning_data = mylearning_res.json()
    assert len(mylearning_data) >= 1
    print(f"[PASS] Student my-learning retrieved: {len(mylearning_data)} active courses")


if __name__ == "__main__":
    test_courses_and_lessons()
    print("\nALL PHASE 2 BACKEND COURSE & LESSON TESTS PASSED SUCCESSFULLY!")
