from typing import List, Dict, Optional, Any
from pydantic import BaseModel, Field


class QuantumGateInput(BaseModel):
    type: str
    qubit: Optional[int] = None
    step: Optional[int] = None
    control: Optional[int] = None
    target: Optional[int] = None
    classical_bit: Optional[int] = None
    params: Optional[Dict[str, float]] = None

    class Config:
        extra = "allow"


class QuantumCircuitInput(BaseModel):
    qubits: int = Field(default=2, ge=1, le=12, description="Number of quantum bits (1 to 12)")
    classical_bits: int = Field(default=2, ge=0, le=12, description="Number of classical register bits (0 to 12)")
    steps: Optional[int] = Field(default=6, ge=1, le=30, description="Circuit time-step depth")
    gates: List[QuantumGateInput] = Field(default=[], description="List of placed quantum gates")
    shots: int = Field(default=1024, ge=128, le=8192, description="Number of simulation shots")
    execution_mode: Optional[str] = Field(default="simulator", description="Execution backend engine")

    class Config:
        extra = "allow"


class QuantumStatevectorEntry(BaseModel):
    state_binary: str
    state_decimal: int
    real: float
    imag: float
    magnitude: float
    probability: float
    phase_degrees: int


class QubitBlochResponse(BaseModel):
    qubit_index: int
    theta: int
    phi: int
    prob0: float
    prob1: float
    state_label: str


class QuantumRunResponse(BaseModel):
    success: bool
    backend: str
    shots: int
    counts: Dict[str, int]
    probabilities: Dict[str, float]
    statevector: List[QuantumStatevectorEntry] = []
    bloch_spheres: List[QubitBlochResponse] = []
    circuit_text: Optional[str] = None
    execution_time_ms: float
    validation_warnings: List[str] = []


class QuantumHealthResponse(BaseModel):
    status: str
    qiskit: bool
    aer: bool
    qiskit_version: Optional[str] = None
    aer_version: Optional[str] = None
