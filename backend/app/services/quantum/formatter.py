from typing import Dict, Any


def format_simulation_results(raw_result: Dict[str, Any]) -> Dict[str, Any]:
    """
    Standardizes simulation output dictionary for clean Pydantic model serialization.
    """
    return {
        "success": raw_result.get("success", True),
        "backend": raw_result.get("backend", "qiskit_aer"),
        "shots": raw_result.get("shots", 1024),
        "counts": raw_result.get("counts", {}),
        "probabilities": raw_result.get("probabilities", {}),
        "statevector": raw_result.get("statevector", []),
        "bloch_spheres": raw_result.get("bloch_spheres", []),
        "circuit_text": raw_result.get("circuit_text", ""),
        "execution_time_ms": raw_result.get("execution_time_ms", 0.0),
        "validation_warnings": raw_result.get("validation_warnings", []),
    }
