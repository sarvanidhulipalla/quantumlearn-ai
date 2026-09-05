import sys
import os
from datetime import date, timedelta
from fastapi.testclient import TestClient

# Add backend directory to sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.main import app
from app.database.session import SessionLocal, ensure_schema_migrations
from app.models.user import User
from app.models.streak import UserStreak
from app.models.achievement import Achievement, UserAchievement
from app.services.gamification.streak import StreakService
from app.services.gamification.evaluator import AchievementEvaluator
from app.utils.seed import seed_demo_data

client = TestClient(app)


def setup_module():
    """Ensure database migrations and initial seed data are populated."""
    ensure_schema_migrations()
    db = SessionLocal()
    try:
        seed_demo_data(db)
    finally:
        db.close()


def get_auth_token(email: str, password: str = "QuantumLearn2026!") -> str:
    """Helper to authenticate and fetch JWT access token."""
    response = client.post(
        "/api/v1/auth/login",
        json={"email": email, "password": password}
    )
    assert response.status_code == 200, f"Login failed for {email}: {response.text}"
    return response.json()["access_token"]


def test_ai_course_generation_flow():
    """1-6: Tests for AI Course Generator & single lesson regeneration."""
    instructor_token = get_auth_token("instructor@quantumlearn.ai")
    student_token = get_auth_token("student@quantumlearn.ai")

    # 1. Student cannot request AI course generation (HTTP 403)
    res_student = client.post(
        "/api/v1/ai/course-generation",
        headers={"Authorization": f"Bearer {student_token}"},
        json={
            "topic": "Quantum Teleportation Protocols",
            "difficulty": "Intermediate",
            "num_modules": 3,
            "estimated_hours": 6.0
        }
    )
    assert res_student.status_code == 403, f"Expected 403 for student, got {res_student.status_code}"

    # 2. Instructor can request AI course generation
    res_inst = client.post(
        "/api/v1/ai/course-generation",
        headers={"Authorization": f"Bearer {instructor_token}"},
        json={
            "topic": "Quantum Error Correction",
            "target_audience": "Undergraduates",
            "difficulty": "Advanced",
            "num_modules": 3,
            "estimated_hours": 9.0,
            "learning_objectives": "Understand Shor and Steane codes",
            "prerequisites": "Single and two qubit gates"
        }
    )
    assert res_inst.status_code == 200, f"Course generation failed: {res_inst.text}"
    course_draft = res_inst.json()

    # 3. Schema validation checks
    assert course_draft["title"]
    assert "Quantum Error Correction" in course_draft["title"]
    assert course_draft["is_draft"] is True
    assert len(course_draft["modules"]) == 3
    assert len(course_draft["learning_objectives"]) >= 2
    assert len(course_draft["modules"][0]["lessons"]) >= 1

    first_lesson = course_draft["modules"][0]["lessons"][0]
    assert first_lesson["title"]
    assert len(first_lesson["content"]) > 50
    assert first_lesson["duration_minutes"] > 0

    # 4. Invalid input rejection (HTTP 422)
    res_invalid = client.post(
        "/api/v1/ai/course-generation",
        headers={"Authorization": f"Bearer {instructor_token}"},
        json={"topic": "Q", "num_modules": 20}  # Topic too short, modules too high
    )
    assert res_invalid.status_code == 422

    # 5. Granular Single Lesson Regeneration
    res_regen = client.post(
        "/api/v1/ai/course-generation/regenerate-lesson",
        headers={"Authorization": f"Bearer {instructor_token}"},
        json={
            "course_title": course_draft["title"],
            "module_title": course_draft["modules"][0]["title"],
            "lesson_title": first_lesson["title"],
            "lesson_order": 1,
            "difficulty": "Advanced",
            "guidance": "Include explicit mathematical proof of the 3-qubit bit-flip code"
        }
    )
    assert res_regen.status_code == 200
    regen_lesson = res_regen.json()
    assert regen_lesson["title"] == first_lesson["title"]
    assert "Instructor Guidance Applied" in regen_lesson["content"]

    print("[PASS] AI Course Generation and granular lesson regeneration verified")


def test_ai_quiz_generation_flow():
    """7-10: Tests for AI Quiz Generator & single question regeneration."""
    instructor_token = get_auth_token("instructor@quantumlearn.ai")
    student_token = get_auth_token("student@quantumlearn.ai")

    # 1. Student blocked with HTTP 403
    res_student = client.post(
        "/api/v1/ai/quiz-generation",
        headers={"Authorization": f"Bearer {student_token}"},
        json={"topic": "Hadamard Transformation", "num_questions": 3}
    )
    assert res_student.status_code == 403

    # 2. Instructor generates structured quiz
    res_inst = client.post(
        "/api/v1/ai/quiz-generation",
        headers={"Authorization": f"Bearer {instructor_token}"},
        json={
            "topic": "Superposition and Bloch Sphere",
            "difficulty": "Intermediate",
            "num_questions": 4,
            "passing_score": 75,
            "time_limit_minutes": 20
        }
    )
    assert res_inst.status_code == 200, f"Quiz generation failed: {res_inst.text}"
    quiz_draft = res_inst.json()

    assert quiz_draft["is_draft"] is True
    assert len(quiz_draft["questions"]) == 4
    for q in quiz_draft["questions"]:
        assert q["prompt"]
        assert len(q["options"]) >= 2
        assert q["correct_answer"]
        assert q["explanation"]
        assert q["points"] > 0

    # 3. Single Question Regeneration
    res_regen_q = client.post(
        "/api/v1/ai/quiz-generation/regenerate-question",
        headers={"Authorization": f"Bearer {instructor_token}"},
        json={
            "topic": "Superposition and Bloch Sphere",
            "difficulty": "Intermediate",
            "question_type": "multiple_choice",
            "guidance": "Focus on T1 and T2 coherence lifetimes",
            "question_order": 2
        }
    )
    assert res_regen_q.status_code == 200
    regen_q = res_regen_q.json()
    assert "coherence" in regen_q["prompt"].lower()
    assert regen_q["correct_answer"]

    print("[PASS] AI Quiz Generation and single-question regeneration verified")


def test_personalization_and_mastery():
    """11-15: Tests for Topic Mastery, Recommendations, and AI Learning Summary."""
    student_token = get_auth_token("student@quantumlearn.ai")

    # 1. Topic Mastery
    res_mastery = client.get(
        "/api/v1/personalization/mastery",
        headers={"Authorization": f"Bearer {student_token}"}
    )
    assert res_mastery.status_code == 200, f"Mastery failed: {res_mastery.text}"
    mastery_data = res_mastery.json()

    assert "overall_mastery_percentage" in mastery_data
    assert len(mastery_data["topics"]) == 9
    for t in mastery_data["topics"]:
        assert t["topic"] in [
            "Qubits", "Superposition", "Measurement", "Quantum Gates",
            "Entanglement", "Bell States", "Quantum Circuits", "Qiskit", "Quantum Algorithms"
        ]
        assert t["level"] in ["Novice", "Developing", "Proficient", "Mastered"]
        assert 0 <= t["mastery_score"] <= 100

    # 2. Personalized Recommendations
    res_rec = client.get(
        "/api/v1/personalization/recommendations",
        headers={"Authorization": f"Bearer {student_token}"}
    )
    assert res_rec.status_code == 200, f"Recommendations failed: {res_rec.text}"
    rec_data = res_rec.json()

    assert rec_data["focus_area"]
    assert len(rec_data["recommendations"]) >= 1
    for r in rec_data["recommendations"]:
        assert r["title"]
        assert r["reason"]
        assert r["route"]
        assert r["action_label"]

    # 3. AI Learning Summary
    res_summary = client.get(
        "/api/v1/personalization/learning-summary",
        headers={"Authorization": f"Bearer {student_token}"}
    )
    assert res_summary.status_code == 200, f"Learning summary failed: {res_summary.text}"
    summary = res_summary.json()

    assert summary["student_name"] == "Aarav Sharma"
    assert summary["improvements_summary"]
    assert summary["pedagogical_advice"]
    assert len(summary["next_study_targets"]) >= 1

    print("[PASS] Topic Mastery, Recommendations, and AI Learning Summary verified")


def test_achievements_and_streak_system():
    """16-20: Tests for Achievement Evaluator, locked progress bars, and streak idempotency."""
    student_token = get_auth_token("student@quantumlearn.ai")
    db = SessionLocal()
    try:
        student = db.query(User).filter(User.email == "student@quantumlearn.ai").first()

        # 1. Streak Idempotency test (same-day does not double count)
        streak1 = StreakService.record_daily_activity(db, student.id)
        current_val = streak1.current_streak

        streak2 = StreakService.record_daily_activity(db, student.id)
        assert streak2.current_streak == current_val, "Same-day activity must not increment streak"

        # Simulate yesterday's activity to test consecutive day increment
        yesterday_str = (date.today() - timedelta(days=1)).isoformat()
        streak1.last_activity_date = yesterday_str
        db.commit()

        streak3 = StreakService.record_daily_activity(db, student.id)
        assert streak3.current_streak == current_val + 1, "Consecutive day must increment streak"

        # 2. Achievement unlock and progress endpoint
        res_ach = client.get(
            "/api/v1/achievements/progress",
            headers={"Authorization": f"Bearer {student_token}"}
        )
        assert res_ach.status_code == 200, f"Achievements failed: {res_ach.text}"
        ach_data = res_ach.json()

        assert ach_data["total_achievements"] >= 10
        assert ach_data["total_unlocked"] >= 1
        for a in ach_data["achievements"]:
            assert a["title"]
            assert a["icon"]
            assert a["points"] > 0
            assert 0 <= a["progress_percentage"] <= 100

        # Verify idempotency (evaluating twice does not duplicate user_achievements)
        count_before = db.query(UserAchievement).filter(UserAchievement.user_id == student.id).count()
        AchievementEvaluator.evaluate_and_award(db, student.id)
        count_after = db.query(UserAchievement).filter(UserAchievement.user_id == student.id).count()
        assert count_before == count_after, "Duplicate achievement award must be prevented"

    finally:
        db.close()

    print("[PASS] Achievement evaluator, progress tracking, and streak mechanism verified")


def test_advanced_instructor_analytics_and_insights():
    """21-23: Tests for Advanced Instructor Analytics & Course Insights."""
    instructor_token = get_auth_token("instructor@quantumlearn.ai")

    # 1. Advanced Cohort Analytics
    res_adv = client.get(
        "/api/v1/instructor/analytics/advanced",
        headers={"Authorization": f"Bearer {instructor_token}"}
    )
    assert res_adv.status_code == 200, f"Advanced analytics failed: {res_adv.text}"
    adv_data = res_adv.json()

    assert len(adv_data["topic_mastery_distribution"]) == 9
    for td in adv_data["topic_mastery_distribution"]:
        assert td["topic"]
        assert td["novice_count"] >= 0

    assert len(adv_data["completion_funnel"]) >= 5
    assert adv_data["completion_funnel"][0]["step_name"] == "Course Enrolled"
    assert len(adv_data["drop_off_insights"]) >= 1

    # 2. Course Insights with AI Pedagogical Advice
    res_insights = client.get(
        "/api/v1/instructor/courses/1/insights",
        headers={"Authorization": f"Bearer {instructor_token}"}
    )
    assert res_insights.status_code == 200, f"Course insights failed: {res_insights.text}"
    insights = res_insights.json()

    assert insights["course_title"]
    assert "completion_rate" in insights
    assert len(insights["ai_insights"]) >= 2
    assert "AI Insights are pedagogical recommendations" in insights["notice"]

    print("[PASS] Advanced Instructor Analytics and Course Insights verified")


if __name__ == "__main__":
    setup_module()
    test_ai_course_generation_flow()
    test_ai_quiz_generation_flow()
    test_personalization_and_mastery()
    test_achievements_and_streak_system()
    test_advanced_instructor_analytics_and_insights()
    print("\nALL PHASE 8 BACKEND TESTS PASSED SUCCESSFULLY!")
