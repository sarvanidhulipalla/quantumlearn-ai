from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Text, Boolean, DateTime, ForeignKey, Enum, Float
from sqlalchemy.orm import relationship
from app.database.base import Base


class Course(Base):
    __tablename__ = "courses"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    slug = Column(String(255), unique=True, index=True, nullable=False)
    description = Column(Text, nullable=False)
    short_description = Column(String(500), nullable=True)
    level = Column(String(50), default="Beginner", nullable=False)  # Beginner, Intermediate, Advanced
    estimated_hours = Column(Float, default=10.0, nullable=False)
    thumbnail_url = Column(String(500), nullable=True)
    is_published = Column(Boolean, default=False, nullable=False)
    instructor_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc), nullable=False)

    # Relationships
    instructor = relationship("User", back_populates="authored_courses")
    modules = relationship("Module", back_populates="course", cascade="all, delete-orphan", order_by="Module.order")
    enrollments = relationship("Enrollment", back_populates="course", cascade="all, delete-orphan")


class Module(Base):
    __tablename__ = "modules"

    id = Column(Integer, primary_key=True, index=True)
    course_id = Column(Integer, ForeignKey("courses.id", ondelete="CASCADE"), nullable=False)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    order = Column(Integer, default=1, nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)

    # Relationships
    course = relationship("Course", back_populates="modules")
    lessons = relationship("Lesson", back_populates="module", cascade="all, delete-orphan", order_by="Lesson.order")


class Lesson(Base):
    __tablename__ = "lessons"

    id = Column(Integer, primary_key=True, index=True)
    module_id = Column(Integer, ForeignKey("modules.id", ondelete="CASCADE"), nullable=False)
    title = Column(String(255), nullable=False)
    slug = Column(String(255), nullable=False)
    content = Column(Text, nullable=False)  # Markdown or rich JSON content
    lesson_type = Column(String(50), default="interactive", nullable=False)  # theory, interactive, circuit_lab, qiskit_code
    order = Column(Integer, default=1, nullable=False)
    duration_minutes = Column(Integer, default=15, nullable=False)
    initial_circuit_json = Column(Text, nullable=True)  # Preset circuit definition
    initial_qiskit_code = Column(Text, nullable=True)   # Preset Qiskit code snippet
    is_ai_generated = Column(Boolean, default=False, nullable=False)
    is_published = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc), nullable=False)

    # Relationships
    module = relationship("Module", back_populates="lessons")
    resources = relationship("LessonResource", back_populates="lesson", cascade="all, delete-orphan")
    progress_records = relationship("LessonProgress", back_populates="lesson", cascade="all, delete-orphan")


class LessonResource(Base):
    __tablename__ = "lesson_resources"

    id = Column(Integer, primary_key=True, index=True)
    lesson_id = Column(Integer, ForeignKey("lessons.id", ondelete="CASCADE"), nullable=False)
    title = Column(String(255), nullable=False)
    resource_type = Column(String(50), default="link", nullable=False)  # link, pdf, paper, code
    url = Column(String(500), nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)

    # Relationships
    lesson = relationship("Lesson", back_populates="resources")
