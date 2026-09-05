from typing import List, Dict, Any, Tuple
from sqlalchemy.orm import Session

from app.models.enrollment import LessonProgress
from app.models.assessment import QuizAttempt, ChallengeAttempt, Quiz, Challenge
from app.models.course import Lesson, Course
from app.models.quantum import Circuit, CodeSubmission
from app.schemas.personalization import TopicMasteryItem, TopicMasteryResponse

# 9 Canonical Quantum Topics
QUANTUM_TOPICS = [
    "Qubits",
    "Superposition",
    "Measurement",
    "Quantum Gates",
    "Entanglement",
    "Bell States",
    "Quantum Circuits",
    "Qiskit",
    "Quantum Algorithms",
]

# Topic keyword mapping for matching lessons, quizzes, and challenges
TOPIC_KEYWORDS = {
    "Qubits": ["qubit", "basis state", "bloch sphere", "statevector", "ket", "bra"],
    "Superposition": ["superposition", "hadamard", "h gate", "amplitude", "interference"],
    "Measurement": ["measurement", "born rule", "collapse", "shots", "probability"],
    "Quantum Gates": ["pauli", "x gate", "y gate", "z gate", "s gate", "t gate", "phase"],
    "Entanglement": ["entanglement", "cnot", "cx gate", "non-local", "correlations"],
    "Bell States": ["bell state", "epr", "maximally entangled", "phi+", "psi+"],
    "Quantum Circuits": ["circuit", "playground", "multi-qubit", "reversible", "unitary"],
    "Qiskit": ["qiskit", "aer", "simulator", "python", "quantumcircuit"],
    "Quantum Algorithms": ["algorithm", "teleportation", "deutsch", "grover", "shor"],
}


class MasteryCalculator:
    """
    Deterministic Topic Mastery engine for QuantumLearn AI.
    Combines lesson completions, quiz mastery, and challenge evaluations.
    """

    @staticmethod
    def calculate_topic_mastery(db: Session, user_id: int) -> TopicMasteryResponse:
        # 1. Fetch user records
        completed_lessons = db.query(LessonProgress).filter(
            LessonProgress.user_id == user_id,
            LessonProgress.is_completed == True
        ).all()
        completed_lesson_ids = {lp.lesson_id for lp in completed_lessons}

        lessons = db.query(Lesson).all()
        quizzes = db.query(Quiz).all()
        quiz_attempts = db.query(QuizAttempt).filter(QuizAttempt.user_id == user_id).all()
        challenges = db.query(Challenge).all()
        challenge_attempts = db.query(ChallengeAttempt).filter(ChallengeAttempt.user_id == user_id).all()
        circuits_count = db.query(Circuit).filter(Circuit.user_id == user_id).count()
        qiskit_count = db.query(CodeSubmission).filter(CodeSubmission.user_id == user_id).count()

        topic_items: List[TopicMasteryItem] = []
        total_score_acc = 0

        for topic in QUANTUM_TOPICS:
            keywords = TOPIC_KEYWORDS.get(topic, [topic.lower()])

            # Find matching lessons
            matching_lessons = [
                l for l in lessons
                if any(kw in l.title.lower() or kw in l.content.lower() for kw in keywords)
            ]
            matching_lesson_ids = {l.id for l in matching_lessons}
            lessons_done = len(matching_lesson_ids.intersection(completed_lesson_ids))
            total_matching_lessons = max(1, len(matching_lessons))
            lesson_ratio = lessons_done / total_matching_lessons

            # Find matching quizzes
            matching_quizzes = [
                q for q in quizzes
                if any(kw in q.title.lower() for kw in keywords)
            ]
            matching_quiz_ids = {q.id for q in matching_quizzes}
            matching_attempts = [
                qa for qa in quiz_attempts
                if qa.quiz_id in matching_quiz_ids
            ]
            if matching_attempts:
                best_quiz_score = max([qa.score_percentage for qa in matching_attempts])
            else:
                best_quiz_score = 0

            # Find matching challenges
            matching_challenges = [
                c for c in challenges
                if any(kw in c.title.lower() or kw in c.category.lower() or kw in c.description.lower() for kw in keywords)
            ]
            matching_ch_ids = {c.id for c in matching_challenges}
            matching_ch_attempts = [
                ca for ca in challenge_attempts
                if ca.challenge_id in matching_ch_ids and ca.solved
            ]
            challenges_solved = len(matching_ch_attempts)
            total_matching_ch = max(1, len(matching_challenges))
            ch_ratio = min(1.0, challenges_solved / total_matching_ch)

            # Special bonus for Qiskit and Quantum Circuits practice
            extra_boost = 0
            if topic == "Quantum Circuits" and circuits_count > 0:
                extra_boost = min(20, circuits_count * 5)
            elif topic == "Qiskit" and qiskit_count > 0:
                extra_boost = min(20, qiskit_count * 7)

            # Deterministic weighted formula: 35% lesson + 35% quiz + 30% challenge + boost
            score = int((lesson_ratio * 35) + (best_quiz_score * 0.35) + (ch_ratio * 30) + extra_boost)
            score = max(0, min(100, score))
            total_score_acc += score

            # Assign categorical mastery levels
            if score >= 80:
                level = "Mastered"
                status = "Strong"
            elif score >= 60:
                level = "Proficient"
                status = "Strong"
            elif score >= 30:
                level = "Developing"
                status = "Developing"
            else:
                level = "Novice"
                status = "Needs Review"

            topic_items.append(
                TopicMasteryItem(
                    topic=topic,
                    mastery_score=score,
                    level=level,
                    lessons_completed=lessons_done,
                    quiz_avg_score=int(best_quiz_score),
                    challenges_solved=challenges_solved,
                    status=status,
                )
            )

        overall_pct = int(total_score_acc / len(QUANTUM_TOPICS))
        strong_topics = [t.topic for t in topic_items if t.mastery_score >= 60]
        weak_topics = [t.topic for t in topic_items if t.mastery_score < 40]

        return TopicMasteryResponse(
            user_id=user_id,
            overall_mastery_percentage=overall_pct,
            strong_topics=strong_topics,
            weak_topics=weak_topics,
            topics=topic_items,
        )
