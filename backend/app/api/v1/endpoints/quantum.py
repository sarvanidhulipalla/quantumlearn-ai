import logging
import qiskit
import qiskit_aer
from fastapi import APIRouter, HTTPException, status
from typing import Dict, Any

from app.schemas.quantum import (
    QuantumCircuitInput,
    QuantumRunResponse,
    QuantumHealthResponse,
)
from app.services.quantum.validator import validate_circuit_data
from app.services.quantum.simulator import run_qiskit_simulation, get_statevector_data
from app.services.quantum.formatter import format_simulation_results

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/quantum", tags=["Quantum Sandbox"])


@router.post("/run", response_model=QuantumRunResponse)
def execute_quantum_circuit(payload: QuantumCircuitInput):
    """
    Validates a quantum circuit and executes it using the Qiskit Aer simulation sandbox.
    Returns real shot measurement histograms, statevector amplitudes, and Bloch coordinates.
    """
    circuit_dict = payload.model_dump()

    # 1. Strict Circuit Validation
    is_valid, validation_errors = validate_circuit_data(circuit_dict)
    if not is_valid:
        error_message = "; ".join(validation_errors)
        logger.warning(f"Quantum circuit validation failed: {error_message}")
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=f"Circuit validation error: {error_message}"
        )

    # 2. Execute on Qiskit Aer Simulator
    try:
        raw_result = run_qiskit_simulation(circuit_dict)
        formatted_result = format_simulation_results(raw_result)
        return QuantumRunResponse(**formatted_result)
    except Exception as exc:
        logger.exception("Error during Qiskit simulation execution:")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Quantum execution failed: {str(exc)}"
        )


@router.post("/statevector", response_model=QuantumRunResponse)
def compute_statevector_only(payload: QuantumCircuitInput):
    """
    Computes exact pure statevector and Bloch coordinates without measurement projection.
    """
    circuit_dict = payload.model_dump()

    is_valid, validation_errors = validate_circuit_data(circuit_dict)
    if not is_valid:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="; ".join(validation_errors)
        )

    try:
        statevector_entries, bloch_spheres = get_statevector_data(circuit_dict)
        return QuantumRunResponse(
            success=True,
            backend="qiskit_statevector",
            shots=payload.shots,
            counts={},
            probabilities={s["state_binary"]: s["probability"] for s in statevector_entries},
            statevector=statevector_entries,
            bloch_spheres=bloch_spheres,
            execution_time_ms=5.0,
            validation_warnings=[]
        )
    except Exception as exc:
        logger.exception("Error during Statevector calculation:")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Statevector calculation failed: {str(exc)}"
        )


@router.get("/health", response_model=QuantumHealthResponse)
def quantum_engine_health():
    """
    Reports the operational health and version specifications of Qiskit and Qiskit Aer.
    """
    return QuantumHealthResponse(
        status="healthy",
        qiskit=True,
        aer=True,
        qiskit_version=getattr(qiskit, "__version__", "unknown"),
        aer_version=getattr(qiskit_aer, "__version__", "unknown")
    )
