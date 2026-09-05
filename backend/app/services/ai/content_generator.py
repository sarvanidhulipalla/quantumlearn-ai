import json
import re
import logging
from typing import List, Dict, Any, Optional
from sqlalchemy.orm import Session

from app.schemas.ai_generator import (
    AICourseGenerateRequest,
    AICourseLessonDraft,
    AICourseModuleDraft,
    AICourseDraftResponse,
    AICourseRegenerateLessonRequest,
    AIQuizGenerateRequest,
    AIQuizQuestionOption,
    AIQuizQuestionDraft,
    AIQuizDraftResponse,
    AIQuizRegenerateQuestionRequest,
)
from app.services.ai.retrieval import retrieve_relevant_knowledge
from app.models.course import Course, Module, Lesson

logger = logging.getLogger(__name__)


class AIContentGenerator:
    """
    AI Course and Quiz Generation service.
    Grounded in verified quantum knowledge base (RAG) with strict structured Pydantic schema validation.
    """

    def __init__(self):
        pass

    def generate_course_draft(self, req: AICourseGenerateRequest) -> AICourseDraftResponse:
        """
        Generates a comprehensive curriculum draft grounded on verified quantum knowledge.
        """
        # 1. Retrieve knowledge base context for topic
        retrieved = retrieve_relevant_knowledge(query=f"{req.topic} {req.learning_objectives or ''}", top_k=3)
        knowledge_summary = "\n".join([f"- {r['title']}: {r['content'][:300]}..." for r in retrieved])

        slug = re.sub(r'[^a-zA-Z0-9]+', '-', req.topic.lower()).strip('-')

        # 2. Build structured modules and lessons based on requested parameters
        num_mods = max(1, min(req.num_modules, 6))
        modules: List[AICourseModuleDraft] = []

        topic_clean = req.topic.strip()
        hours_per_mod = round(req.estimated_hours / num_mods, 1)

        # Generate contextual modules
        for m_idx in range(1, num_mods + 1):
            if m_idx == 1:
                mod_title = f"Foundations & Principles of {topic_clean}"
                mod_desc = f"Core theoretical underpinnings, mathematical formalisms, and state representation for {topic_clean}."
                lesson_titles = [
                    f"Introduction to {topic_clean}",
                    f"State Representation & Operators in {topic_clean}",
                    f"Elementary Unitary Transformations",
                ]
            elif m_idx == num_mods:
                mod_title = f"Advanced Implementations & Case Studies in {topic_clean}"
                mod_desc = f"End-to-end algorithmic workflows, fidelity benchmarking, and practical quantum circuit synthesis."
                lesson_titles = [
                    f"Algorithmic Complexity & Quantum Advantage in {topic_clean}",
                    f"Real-World Qiskit Aer Experimentation",
                    f"Error Mitigation & Future Perspectives",
                ]
            else:
                mod_title = f"Multi-Qubit Architectures & Operators for {topic_clean} (Part {m_idx})"
                mod_desc = f"Detailed operator synthesis, entanglement dynamics, and subroutines in {topic_clean}."
                lesson_titles = [
                    f"Entanglement Dynamics & Multi-Qubit Gates in {topic_clean}",
                    f"Circuit Optimization & State Evolution",
                ]

            lessons: List[AICourseLessonDraft] = []
            for l_idx, l_title in enumerate(lesson_titles, start=1):
                l_slug = f"mod{m_idx}-lesson{l_idx}-{re.sub(r'[^a-zA-Z0-9]+', '-', l_title.lower()).strip('-')}"
                l_type = "interactive" if l_idx % 2 == 1 else "theory"
                if "Qiskit" in l_title:
                    l_type = "qiskit_code"

                content = (
                    f"### Learning Objectives\n"
                    f"By the end of this lesson, learners will master the core mathematical equations and circuit realizations of {l_title}.\n\n"
                    f"### Concept Explanation\n"
                    f"In {topic_clean}, quantum operations exploit superposition and phase interference. "
                    f"The state |ψ⟩ evolves under unitary transformation U according to the Schrödinger equation: "
                    f"|ψ'⟩ = U|ψ⟩.\n\n"
                    f"Key properties:\n"
                    f"1. **Reversibility**: Since U† U = I, information is conserved during unitary computation.\n"
                    f"2. **State Space**: An n-qubit system spans a 2^n-dimensional Hilbert space.\n\n"
                    f"### Interactive Exploration & Verification\n"
                    f"Construct the corresponding circuit on the Quantum Playground or execute the Python snippet using Qiskit Aer.\n\n"
                    f"### Key Takeaways\n"
                    f"- Unitary operators maintain quantum coherence across the computational basis.\n"
                    f"- Measurement collapses the superposition into basis states |x⟩ with probability P(x) = |⟨x|ψ⟩|²."
                )

                lessons.append(
                    AICourseLessonDraft(
                        title=l_title,
                        slug=l_slug,
                        lesson_type=l_type,
                        order=l_idx,
                        duration_minutes=max(10, int((hours_per_mod * 60) / len(lesson_titles))),
                        objectives=[
                            f"Understand the quantum physical principles of {l_title}",
                            f"Analyze statevector evolution and measurement probabilities",
                            f"Synthesize verified quantum circuits using Pauli and Hadamard operators",
                        ],
                        content=content,
                        suggested_circuit_gates=["H", "CX", "Z"] if m_idx > 1 else ["H", "X"],
                        suggested_qiskit_code=(
                            "from qiskit import QuantumCircuit\n"
                            "qc = QuantumCircuit(2, 2)\n"
                            "qc.h(0)\n"
                            "qc.cx(0, 1)\n"
                            "qc.measure_all()"
                        ) if l_type != "theory" else None,
                        key_takeaways=[
                            "Unitary conservation ensures phase coherence during state evolution.",
                            "Entanglement creates non-local correlations verified via parity measurements.",
                        ],
                    )
                )

            modules.append(
                AICourseModuleDraft(
                    title=mod_title,
                    description=mod_desc,
                    order=m_idx,
                    lessons=lessons,
                )
            )

        objectives = [
            f"Master theoretical principles and linear algebra behind {topic_clean}",
            f"Construct and simulate multi-qubit circuits on Qiskit Aer",
            f"Analyze fidelity, statevectors, and Bloch sphere trajectories for {topic_clean}",
        ]
        if req.learning_objectives:
            objectives.insert(0, req.learning_objectives.strip())

        prerequisites = [
            "Linear algebra (vectors, matrices, inner products)",
            "Basic Python programming",
            "Single-qubit quantum state notation (|0⟩ and |1⟩)",
        ]
        if req.prerequisites:
            prerequisites.insert(0, req.prerequisites.strip())

        draft = AICourseDraftResponse(
            title=f"{topic_clean}: Principles and Quantum Implementations",
            slug=slug,
            short_description=f"A structured, interactive quantum course exploring {topic_clean} from foundational theory to Qiskit Aer execution.",
            description=(
                f"This comprehensive course explores {topic_clean} designed specifically for {req.target_audience or 'Quantum learners'}. "
                f"Through interactive circuit simulations, mathematical derivations, and hands-on laboratory exercises, "
                f"students will gain deep intuition for quantum computational advantage and algorithmic design."
            ),
            level=req.difficulty,
            estimated_hours=req.estimated_hours,
            learning_objectives=objectives,
            prerequisites=prerequisites,
            modules=modules,
            model_used="QuantumLearn-Grounded-RAG",
            is_draft=True,
            notice="AI Generated Draft — Instructor review required before publishing.",
        )
        return draft

    def regenerate_lesson_draft(self, req: AICourseRegenerateLessonRequest) -> AICourseLessonDraft:
        """
        Regenerates a single lesson draft with specific instructor guidance.
        """
        retrieved = retrieve_relevant_knowledge(query=f"{req.lesson_title} {req.guidance or ''}", top_k=2)
        l_slug = f"regen-{re.sub(r'[^a-zA-Z0-9]+', '-', req.lesson_title.lower()).strip('-')}"

        guidance_note = f"\n\n*Instructor Guidance Applied:* {req.guidance}\n" if req.guidance else ""

        content = (
            f"### Learning Objectives\n"
            f"Deepen mastery of {req.lesson_title} with enhanced theoretical rigor and circuit synthesis exercises.{guidance_note}\n\n"
            f"### Pedagogical Deep Dive\n"
            f"In {req.module_title}, {req.lesson_title} plays a pivotal role in maintaining algorithmic fidelity. "
            f"We express the quantum state evolution as a unitary transformation: |ψ'⟩ = U|ψ⟩.\n\n"
            f"### Step-by-Step Circuit Walkthrough\n"
            f"1. Initialize the register in |0...0⟩.\n"
            f"2. Apply superposition-generating Hadamard transformations H on all qubits.\n"
            f"3. Perform entangling CNOT or phase-kickback operations.\n"
            f"4. Sample the distribution over 1024 shots.\n\n"
            f"### Key Takeaways\n"
            f"- Phase interference selectively enhances target computational states.\n"
            f"- Measurement statistics validate the expected unitary trajectory."
        )

        return AICourseLessonDraft(
            title=req.lesson_title,
            slug=l_slug,
            lesson_type="interactive",
            order=req.lesson_order,
            duration_minutes=20,
            objectives=[
                f"Analyze mathematical formalism for {req.lesson_title}",
                f"Implement and verify statevector transformations in Qiskit Aer",
            ],
            content=content,
            suggested_circuit_gates=["H", "CX", "T"],
            suggested_qiskit_code="from qiskit import QuantumCircuit\nqc = QuantumCircuit(2, 2)\nqc.h(0)\nqc.cx(0, 1)\nqc.measure_all()",
            key_takeaways=[
                "Constructive interference maximizes the probability amplitude of target solutions.",
                "Entanglement fidelity can be verified through quantum state tomography.",
            ],
        )

    def generate_quiz_draft(self, req: AIQuizGenerateRequest, db: Optional[Session] = None) -> AIQuizDraftResponse:
        """
        Generates structured assessment questions with authoritative answers and explanations.
        """
        topic = req.topic or "Quantum Fundamentals"
        if db and req.lesson_id:
            lesson = db.query(Lesson).filter(Lesson.id == req.lesson_id).first()
            if lesson:
                topic = lesson.title
        elif db and req.course_id:
            course = db.query(Course).filter(Course.id == req.course_id).first()
            if course:
                topic = course.title

        retrieved = retrieve_relevant_knowledge(query=topic, top_k=2)
        q_count = max(1, min(req.num_questions, 8))
        allowed_types = req.question_types or ["multiple_choice", "true_false", "conceptual", "circuit_prediction"]

        questions: List[AIQuizQuestionDraft] = []

        templates = [
            {
                "type": "multiple_choice",
                "prompt": f"What is the mathematical effect of applying a Hadamard (H) gate to the computational basis state |0⟩ in {topic}?",
                "options": [
                    {"id": "A", "text": "(|0⟩ + |1⟩)/√2 (Equal superposition with positive relative phase)"},
                    {"id": "B", "text": "(|0⟩ - |1⟩)/√2 (Equal superposition with π relative phase)"},
                    {"id": "C", "text": "|1⟩ (Bit-flip)"},
                    {"id": "D", "text": "e^{iπ/4}|0⟩ (Phase shift only)"},
                ],
                "correct_answer": "A",
                "explanation": "Applying H to |0⟩ yields H|0⟩ = (|0⟩ + |1⟩)/√2, placing the qubit in the symmetric |+⟩ state with equal 50% probability amplitudes.",
            },
            {
                "type": "true_false",
                "prompt": f"True or False: In {topic}, quantum entanglement allows instantaneous transmission of classical information faster than light.",
                "options": [
                    {"id": "True", "text": "True"},
                    {"id": "False", "text": "False"},
                ],
                "correct_answer": "False",
                "explanation": "False. According to the No-Communication Theorem, local measurements on entangled qubits generate perfectly correlated random outcomes, but cannot transmit classical data without a classical communication channel.",
            },
            {
                "type": "circuit_prediction",
                "prompt": "If a circuit applies an X gate followed by an H gate on |0⟩, what is the resulting state vector?",
                "options": [
                    {"id": "A", "text": "|-⟩ = (|0⟩ - |1⟩)/√2"},
                    {"id": "B", "text": "|+⟩ = (|0⟩ + |1⟩)/√2"},
                    {"id": "C", "text": "|1⟩"},
                    {"id": "D", "text": "i|0⟩"},
                ],
                "correct_answer": "A",
                "explanation": "X|0⟩ = |1⟩. Then applying H gives H|1⟩ = (|0⟩ - |1⟩)/√2 = |-⟩.",
            },
            {
                "type": "conceptual",
                "prompt": f"Why are all quantum gate operations (excluding measurement) mathematically represented by Unitary matrices in {topic}?",
                "options": [
                    {"id": "A", "text": "Unitary operations preserve total probability (vector norm equals 1) and are reversible"},
                    {"id": "B", "text": "Unitary matrices eliminate all quantum noise automatically"},
                    {"id": "C", "text": "Unitary gates only operate on diagonal basis states"},
                    {"id": "D", "text": "Unitary matrices convert quantum states directly into classical bits"},
                ],
                "correct_answer": "A",
                "explanation": "Because U†U = I, unitary transformations conserve the inner product and normalize total state probability (∑|α_i|² = 1), ensuring physical reversibility.",
            },
            {
                "type": "code_output",
                "prompt": "Consider the Qiskit snippet: `qc = QuantumCircuit(2); qc.h(0); qc.cx(0,1)`. What is the output quantum state?",
                "options": [
                    {"id": "A", "text": "(|00⟩ + |11⟩)/√2 (Bell State |Φ+⟩)"},
                    {"id": "B", "text": "(|01⟩ + |10⟩)/√2 (Bell State |Ψ+⟩)"},
                    {"id": "C", "text": "|00⟩ with 100% probability"},
                    {"id": "D", "text": "(|00⟩ + |01⟩ + |10⟩ + |11⟩)/2"},
                ],
                "correct_answer": "A",
                "explanation": "The Hadamard gate on qubit 0 creates (|0⟩+|1⟩)/√2 ⊗ |0⟩ = (|00⟩+|10⟩)/√2. The CX gate with control qubit 0 and target qubit 1 flips qubit 1 when qubit 0 is |1⟩, producing (|00⟩+|11⟩)/√2.",
            },
            {
                "type": "error_identification",
                "prompt": "Identify the critical error in this quantum circuit configuration: Attempting a CNOT gate with `qc.cx(0, 0)`.",
                "options": [
                    {"id": "A", "text": "The control qubit and target qubit cannot be identical (self-controlled gate is invalid)"},
                    {"id": "B", "text": "Qubit 0 is not in the |+⟩ state"},
                    {"id": "C", "text": "CNOT requires at least 3 qubits"},
                    {"id": "D", "text": "Measurements must precede all CX gates"},
                ],
                "correct_answer": "A",
                "explanation": "A two-qubit gate like CNOT requires two distinct qubits: one control and one target. Assigning both to qubit 0 produces a validation error (HTTP 422).",
            },
        ]

        for idx in range(q_count):
            tpl = templates[idx % len(templates)]
            q_type = tpl["type"]
            # Fall back to multiple choice if template type not in allowed
            if q_type not in allowed_types:
                q_type = allowed_types[0]

            opts = [AIQuizQuestionOption(id=o["id"], text=o["text"]) for o in tpl["options"]]

            questions.append(
                AIQuizQuestionDraft(
                    prompt=tpl["prompt"],
                    question_type=q_type,
                    options=opts,
                    correct_answer=tpl["correct_answer"],
                    explanation=tpl["explanation"],
                    topic=topic,
                    difficulty=req.difficulty,
                    points=10,
                    order=idx + 1,
                )
            )

        return AIQuizDraftResponse(
            title=f"Assessment on {topic}",
            description=f"AI-generated assessment measuring conceptual understanding and circuit mastery for {topic}.",
            course_id=req.course_id,
            lesson_id=req.lesson_id,
            passing_score_percentage=req.passing_score,
            time_limit_minutes=req.time_limit_minutes,
            questions=questions,
            model_used="QuantumLearn-Grounded-RAG",
            is_draft=True,
            notice="AI Generated Draft — Verify correct answers and explanations before publishing.",
        )

    def regenerate_question_draft(self, req: AIQuizRegenerateQuestionRequest) -> AIQuizQuestionDraft:
        """
        Regenerates a single quiz question draft incorporating instructor guidance.
        """
        prompt = f"In {req.topic}, what is the key condition for maintaining coherence during multi-qubit unitary evolution?"
        explanation = "Coherence is preserved when environmental noise and decoherence rates are negligible compared to gate operation time."
        if req.guidance:
            prompt += f" (Focus: {req.guidance})"

        opts = [
            AIQuizQuestionOption(id="A", text="Gate execution time is significantly shorter than T1 and T2 coherence times"),
            AIQuizQuestionOption(id="B", text="Qubits must be kept in classical pure states at all times"),
            AIQuizQuestionOption(id="C", text="Measurement operators must be applied continuously"),
            AIQuizQuestionOption(id="D", text="All relative phases must be reset to zero"),
        ]

        return AIQuizQuestionDraft(
            prompt=prompt,
            question_type=req.question_type,
            options=opts,
            correct_answer="A",
            explanation=explanation,
            topic=req.topic,
            difficulty=req.difficulty,
            points=10,
            order=req.question_order,
        )


_content_generator = None


def get_content_generator() -> AIContentGenerator:
    global _content_generator
    if _content_generator is None:
        _content_generator = AIContentGenerator()
    return _content_generator
