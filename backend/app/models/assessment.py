from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Text, Boolean, DateTime, ForeignKey, Float
from sqlalchemy.orm import relationship
from app.database.base import Base


class Quiz(Base):
    __tablename__ = "quizzes"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    course_id = Column(Integer, ForeignKey("courses.id", ondelete="SET NULL"), nullable=True)
    lesson_id = Column(Integer, ForeignKey("lessons.id", ondelete="SET NULL"), nullable=True)
    passing_score_percentage = Column(Float, default=70.0, nullable=False)
    time_limit_minutes = Column(Integer, default=15, nullable=False)
    is_ai_generated = Column(Boolean, default=False, nullable=False)
    is_published = Column(Boolean, default=True, nullable=False)
    creator_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)

    # Relationships
    questions = relationship("Question", back_populates="quiz", cascade="all, delete-orphan", order_by="Question.order")
    attempts = relationship("QuizAttempt", back_populates="quiz", cascade="all, delete-orphan")


class Question(Base):
    __tablename__ = "questions"

    id = Column(Integer, primary_key=True, index=True)
    quiz_id = Column(Integer, ForeignKey("quizzes.id", ondelete="CASCADE"), nullable=False)
    prompt = Column(Text, nullable=False)
    question_type = Column(String(50), default="multiple_choice", nullable=False)  # multiple_choice, true_false, circuit_prediction
    options_json = Column(Text, nullable=False)  # JSON array of choices
    correct_answer = Column(Text, nullable=False)
    explanation = Column(Text, nullable=True)
    points = Column(Integer, default=10, nullable=False)
    order = Column(Integer, default=1, nullable=False)

    # Relationships
    quiz = relationship("Quiz", back_populates="questions")


class QuizAttempt(Base):
    __tablename__ = "quiz_attempts"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    quiz_id = Column(Integer, ForeignKey("quizzes.id", ondelete="CASCADE"), nullable=False)
    score_percentage = Column(Float, nullable=False)
    passed = Column(Boolean, default=False, nullable=False)
    answers_json = Column(Text, nullable=True)
    completed_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)

    # Relationships
    user = relationship("User", back_populates="quiz_attempts")
    quiz = relationship("Quiz", back_populates="attempts")


class Challenge(Base):
    __tablename__ = "challenges"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    slug = Column(String(255), unique=True, index=True, nullable=False)
    difficulty = Column(String(50), default="Beginner", nullable=False)  # Beginner, Intermediate, Advanced
    category = Column(String(100), default="Quantum Gates", nullable=False)
    description = Column(Text, nullable=False)
    target_state_vector = Column(Text, nullable=True)  # JSON target state
    target_unitary = Column(Text, nullable=True)
    starter_qiskit_code = Column(Text, nullable=True)
    starter_circuit_json = Column(Text, nullable=True)
    test_cases_json = Column(Text, nullable=True)
    points_reward = Column(Integer, default=50, nullable=False)
    is_published = Column(Boolean, default=True, nullable=False)
    creator_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)

    # Relationships
    attempts = relationship("ChallengeAttempt", back_populates="challenge", cascade="all, delete-orphan")


class ChallengeAttempt(Base):
    __tablename__ = "challenge_attempts"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    challenge_id = Column(Integer, ForeignKey("challenges.id", ondelete="CASCADE"), nullable=False)
    solved = Column(Boolean, default=False, nullable=False)
    submitted_code = Column(Text, nullable=True)
    submitted_circuit_json = Column(Text, nullable=True)
    fidelity_score = Column(Float, default=0.0, nullable=False)
    attempted_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)

    # Relationships
    user = relationship("User", back_populates="challenge_attempts")
    challenge = relationship("Challenge", back_populates="attempts")
