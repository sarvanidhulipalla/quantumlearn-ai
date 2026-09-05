from typing import Dict, Any, Optional


def build_tutor_context(
    user_experience: str = "Beginner",
    lesson_title: Optional[str] = None,
    lesson_content: Optional[str] = None,
    circuit_data: Optional[Dict[str, Any]] = None,
    simulation_results: Optional[Dict[str, Any]] = None,
    code_snippet: Optional[str] = None,
    error_message: Optional[str] = None,
) -> Dict[str, Any]:
    """
    Constructs a clean, normalized context object for the AI tutor prompt synthesizer.
    """
    context: Dict[str, Any] = {
        "user_level": user_experience or "Beginner",
    }

    if lesson_title:
        context["lesson"] = {
            "title": lesson_title,
            "snippet": (lesson_content[:400] + "...") if lesson_content and len(lesson_content) > 400 else lesson_content,
        }

    if circuit_data:
        context["circuit"] = {
            "qubits": circuit_data.get("qubits", 2),
            "classical_bits": circuit_data.get("classical_bits", 2),
            "gates": circuit_data.get("gates", []),
        }

    if simulation_results:
        context["results"] = {
            "backend": simulation_results.get("backend", "qiskit_aer"),
            "shots": simulation_results.get("shots", 1024),
            "counts": simulation_results.get("counts", {}),
            "probabilities": simulation_results.get("probabilities", {}),
        }

    if code_snippet:
        context["code"] = code_snippet

    if error_message:
        context["error"] = error_message

    return context
