import enum
from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Boolean, DateTime, Enum, Text
from sqlalchemy.orm import relationship
from app.database.base import Base


class UserRole(str, enum.Enum):
    STUDENT = "Student"
    INSTRUCTOR = "Instructor"
    ADMIN = "Admin"


class EducationLevel(str, enum.Enum):
    HIGH_SCHOOL = "High School"
    UNDERGRADUATE = "Undergraduate"
    POSTGRADUATE = "Postgraduate"
    RESEARCHER = "Researcher"
    PROFESSIONAL = "Industry Professional"
    SELF_TAUGHT = "Self-Taught / Enthusiast"


class QuantumExperience(str, enum.Enum):
    BEGINNER = "Beginner (No background)"
    INTERMEDIATE = "Intermediate (Basic linear algebra & python)"
    ADVANCED = "Advanced (Experienced with quantum gates & Qiskit)"


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    full_name = Column(String(255), nullable=False)
    role = Column(String(50), default=UserRole.STUDENT.value, nullable=False)
    education_level = Column(String(100), default=EducationLevel.UNDERGRADUATE.value, nullable=True)
    quantum_experience = Column(String(100), default=QuantumExperience.BEGINNER.value, nullable=True)
    bio = Column(Text, nullable=True)
    avatar_url = Column(String(500), nullable=True)
    is_active = Column(Boolean, default=True, nullable=False)
    is_superuser = Column(Boolean, default=False, nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc), nullable=False)

    # Relationships
    enrollments = relationship("Enrollment", back_populates="user", cascade="all, delete-orphan")
    lesson_progress = relationship("LessonProgress", back_populates="user", cascade="all, delete-orphan")
    quiz_attempts = relationship("QuizAttempt", back_populates="user", cascade="all, delete-orphan")
    challenge_attempts = relationship("ChallengeAttempt", back_populates="user", cascade="all, delete-orphan")
    circuits = relationship("Circuit", back_populates="user", cascade="all, delete-orphan")
    code_submissions = relationship("CodeSubmission", back_populates="user", cascade="all, delete-orphan")
    user_achievements = relationship("UserAchievement", back_populates="user", cascade="all, delete-orphan")
    ai_conversations = relationship("AIConversation", back_populates="user", cascade="all, delete-orphan")
    recommendations = relationship("Recommendation", back_populates="user", cascade="all, delete-orphan")
    streak = relationship("UserStreak", back_populates="user", uselist=False, cascade="all, delete-orphan")
    authored_courses = relationship("Course", back_populates="instructor")
