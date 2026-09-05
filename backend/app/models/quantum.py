from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Text, Boolean, DateTime, ForeignKey, Float
from sqlalchemy.orm import relationship
from app.database.base import Base


class Circuit(Base):
    __tablename__ = "circuits"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    num_qubits = Column(Integer, default=2, nullable=False)
    num_clbits = Column(Integer, default=2, nullable=False)
    circuit_json = Column(Text, nullable=False)  # Gates, positions, wires
    generated_qiskit_code = Column(Text, nullable=True)
    latest_state_vector = Column(Text, nullable=True)
    latest_probabilities = Column(Text, nullable=True)
    is_public = Column(Boolean, default=False, nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc), nullable=False)

    # Relationships
    user = relationship("User", back_populates="circuits")


class CodeSubmission(Base):
    __tablename__ = "code_submissions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    title = Column(String(255), nullable=False)
    code = Column(Text, nullable=False)  # Qiskit Python code
    execution_output = Column(Text, nullable=True)  # Stdout or simulation output
    measurement_counts_json = Column(Text, nullable=True)
    execution_time_ms = Column(Float, nullable=True)
    shots = Column(Integer, default=1024, nullable=False)
    status = Column(String(50), default="success", nullable=False)  # success, error, pending
    error_message = Column(Text, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)

    # Relationships
    user = relationship("User", back_populates="code_submissions")
