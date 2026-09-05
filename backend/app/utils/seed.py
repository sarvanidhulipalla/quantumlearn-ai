import json
from sqlalchemy.orm import Session
from datetime import datetime, timezone
from app.models.user import User, UserRole, EducationLevel, QuantumExperience
from app.models.course import Course, Module, Lesson, LessonResource
from app.models.enrollment import Enrollment, LessonProgress
from app.models.achievement import Achievement, UserAchievement
from app.models.assessment import Quiz, Question, Challenge, ChallengeAttempt
from app.core.security import get_password_hash


def seed_demo_data(db: Session):
    """Seeds initial demonstration accounts, courses, lessons, and achievements."""
    
    # 1. Seed Demo Student
    student = db.query(User).filter(User.email == "student@quantumlearn.ai").first()
    if not student:
        student = User(
            email="student@quantumlearn.ai",
            hashed_password=get_password_hash("QuantumLearn2026!"),
            full_name="Aarav Sharma",
            role=UserRole.STUDENT.value,
            education_level=EducationLevel.UNDERGRADUATE.value,
            quantum_experience=QuantumExperience.BEGINNER.value,
            bio="Undergraduate student passionate about quantum algorithms and quantum information science.",
            is_active=True,
        )
        db.add(student)
        db.commit()
        db.refresh(student)

    # 2. Seed Demo Instructor
    instructor = db.query(User).filter(User.email == "instructor@quantumlearn.ai").first()
    if not instructor:
        instructor = User(
            email="instructor@quantumlearn.ai",
            hashed_password=get_password_hash("QuantumLearn2026!"),
            full_name="Dr. Priya Iyer",
            role=UserRole.INSTRUCTOR.value,
            education_level=EducationLevel.RESEARCHER.value,
            quantum_experience=QuantumExperience.ADVANCED.value,
            bio="Quantum Computing Researcher & Professor. Exploring variational quantum eigensolvers and fault-tolerant algorithms.",
            is_active=True,
        )
        db.add(instructor)
        db.commit()
        db.refresh(instructor)

    # 3. Seed Starter Achievements
    default_achievements = [
        {
            "slug": "first-lesson",
            "title": "First Quantum Step",
            "description": "Completed your first interactive quantum lesson.",
            "icon": "BookOpen",
            "points": 25,
            "badge_category": "Learning",
            "criteria_type": "lessons_completed",
            "criteria_threshold": 1
        },
        {
            "slug": "complete-first-course",
            "title": "Curriculum Pioneer",
            "description": "Completed all lessons in a full quantum course.",
            "icon": "GraduationCap",
            "points": 100,
            "badge_category": "Learning",
            "criteria_type": "courses_completed",
            "criteria_threshold": 1
        },
        {
            "slug": "quantum-explorer",
            "title": "Quantum Explorer",
            "description": "Completed 5 interactive quantum lessons across curriculum paths.",
            "icon": "Compass",
            "points": 50,
            "badge_category": "Learning",
            "criteria_type": "lessons_completed",
            "criteria_threshold": 5
        },
        {
            "slug": "superposition-master",
            "title": "Superposition Master",
            "description": "Constructed and verified single-qubit equal superposition.",
            "icon": "Sparkles",
            "points": 50,
            "badge_category": "Circuits",
            "criteria_type": "challenges_solved_target",
            "criteria_target": "superposition-challenge",
            "criteria_threshold": 1
        },
        {
            "slug": "bell-state-builder",
            "title": "Bell State Builder",
            "description": "Constructed and verified a 2-qubit maximally entangled Bell state.",
            "icon": "Layers",
            "points": 75,
            "badge_category": "Circuits",
            "criteria_type": "challenges_solved_target",
            "criteria_target": "bell-state-challenge",
            "criteria_threshold": 1
        },
        {
            "slug": "circuit-architect",
            "title": "Circuit Architect",
            "description": "Built and simulated 3 custom quantum circuits in the Playground.",
            "icon": "Cpu",
            "points": 50,
            "badge_category": "Circuits",
            "criteria_type": "circuits_created",
            "criteria_threshold": 3
        },
        {
            "slug": "qiskit-beginner",
            "title": "Qiskit Hacker",
            "description": "Executed Python quantum simulations using the real Qiskit Aer backend.",
            "icon": "Code",
            "points": 50,
            "badge_category": "Qiskit",
            "criteria_type": "qiskit_runs",
            "criteria_threshold": 1
        },
        {
            "slug": "perfect-quiz",
            "title": "Quantum Prodigy",
            "description": "Achieved a perfect 100% score on any quantum quiz assessment.",
            "icon": "Award",
            "points": 50,
            "badge_category": "Quizzes",
            "criteria_type": "quiz_perfect",
            "criteria_threshold": 1
        },
        {
            "slug": "challenge-champion",
            "title": "Challenge Champion",
            "description": "Completed 3 automated quantum algorithm challenges.",
            "icon": "Trophy",
            "points": 100,
            "badge_category": "Mastery",
            "criteria_type": "challenges_solved",
            "criteria_threshold": 3
        },
        {
            "slug": "7-day-streak",
            "title": "Persistent Observer",
            "description": "Maintained a 7-day continuous quantum learning streak.",
            "icon": "Flame",
            "points": 150,
            "badge_category": "Mastery",
            "criteria_type": "streak_days",
            "criteria_threshold": 7
        },
        {
            "slug": "quantum-scholar",
            "title": "Quantum Scholar",
            "description": "Reached 300+ total XP across lessons, quizzes, and circuit labs.",
            "icon": "Zap",
            "points": 200,
            "badge_category": "Mastery",
            "criteria_type": "points_threshold",
            "criteria_threshold": 300
        }
    ]

    for ach in default_achievements:
        existing_ach = db.query(Achievement).filter(Achievement.slug == ach["slug"]).first()
        if not existing_ach:
            db_ach = Achievement(**ach)
            db.add(db_ach)
        else:
            # Update criteria on existing achievements
            for k, v in ach.items():
                setattr(existing_ach, k, v)
    db.commit()

    # Link initial achievement to student
    first_ach = db.query(Achievement).filter(Achievement.slug == "first-qubit").first()
    if first_ach and student:
        existing_user_ach = db.query(UserAchievement).filter(
            UserAchievement.user_id == student.id,
            UserAchievement.achievement_id == first_ach.id
        ).first()
        if not existing_user_ach:
            db.add(UserAchievement(user_id=student.id, achievement_id=first_ach.id))
            db.commit()

    # 4. Seed Quantum Courses & Lessons (Phase 2 Curriculum)
    courses_data = [
        {
            "title": "Introduction to Quantum Computing",
            "slug": "intro-to-quantum",
            "short_description": "Grasp the foundational transition from classical binary logic to quantum mechanics, qubits, and state vectors.",
            "description": "This course lays the absolute groundwork for quantum information theory. Learn how quantum bits differ fundamentally from classical bits, understand Dirac bra-ket notation, and explore quantum state representation.",
            "level": "Beginner",
            "estimated_hours": 6.0,
            "is_published": True,
            "instructor_id": instructor.id,
            "modules": [
                {
                    "title": "Module 1 — Quantum Computing Fundamentals",
                    "description": "Essential mathematical foundations and physics underlying quantum logic.",
                    "order": 1,
                    "lessons": [
                        {
                            "title": "What is Quantum Computing?",
                            "slug": "what-is-quantum-computing",
                            "lesson_type": "theory",
                            "order": 1,
                            "duration_minutes": 12,
                            "content": """### Learning Objective
Understand how quantum computing harnesses the laws of quantum physics (superposition and entanglement) to solve computational problems intractable for classical supercomputers.

### Concept Explanation
Classical computers encode information in **binary bits**, where every switch is deterministically either a `0` or a `1`. 

Quantum computers operate using **qubits** (quantum bits). A qubit's physical state can be in a linear combination (superposition) of basis states until it is measured.

$$\\text{Classical Bit} \\in \\{0, 1\\} \\quad \\Longleftrightarrow \\quad \\text{Qubit} \\ |\\psi\\rangle = \\alpha|0\\rangle + \\beta|1\\rangle$$

### Key Advantages
1. **Exponential State Space:** $n$ qubits can represent $2^n$ computational states simultaneously.
2. **Constructive Interference:** Quantum algorithms amplify correct answers while canceling incorrect pathways.

### Key Takeaways
- Qubits are two-level quantum mechanical systems.
- Measurement collapses quantum states into classical definite values.
"""
                        },
                        {
                            "title": "Classical Bits vs Qubits",
                            "slug": "bits-vs-qubits",
                            "lesson_type": "interactive",
                            "order": 2,
                            "duration_minutes": 15,
                            "content": """### Learning Objective
Compare the continuous geometric state space of a qubit against the discrete states of classical transistors.

### Concept Explanation
While a classical bit represents a single discrete coin lying flat on a table (Heads or Tails), a qubit behaves like a spinning coin in motion. 

Only when the spinning coin stops (measurement) does it collapse into a definite Heads ($|0\\rangle$) or Tails ($|1\\rangle$).

### Mathematical Representation
A qubit state $|\\psi\\rangle$ is normalized such that:
$$|\\alpha|^2 + |\\beta|^2 = 1$$
where $|\\alpha|^2$ is the probability of measuring $|0\\rangle$, and $|\\beta|^2$ is the probability of measuring $|1\\rangle$.

### Key Takeaways
- Qubit state probabilities must sum to 1.
- State vectors exist in a 2-dimensional complex Hilbert space $\\mathbb{C}^2$.
"""
                        },
                        {
                            "title": "Quantum States & Dirac Notation",
                            "slug": "quantum-states",
                            "lesson_type": "interactive",
                            "order": 3,
                            "duration_minutes": 20,
                            "content": """### Learning Objective
Master the standard Dirac bra-ket notation used by quantum physicists and quantum software engineers worldwide.

### Concept Explanation
- **Ket $|\\psi\\rangle$**: A column vector representing a quantum state.
- **Bra $\\langle\\psi|$**: The conjugate transpose (row vector) of $|\\psi\\rangle$.

$$|0\\rangle = \\begin{bmatrix} 1 \\\\ 0 \\end{bmatrix}, \\quad |1\\rangle = \\begin{bmatrix} 0 \\\\ 1 \\end{bmatrix}$$

Inner products $\\langle\\phi|\\psi\\rangle$ compute the probability amplitude overlap between two quantum states.
"""
                        }
                    ]
                }
            ]
        },
        {
            "title": "Quantum Bits and Superposition",
            "slug": "qubits-and-superposition",
            "short_description": "Master the core principle of superposition, the 3D Bloch sphere representation, and quantum probability amplitudes.",
            "description": "Dive deep into the phenomenon of quantum superposition. Visualize single-qubit states on the 3D Bloch sphere, apply unitary transformations, and understand how quantum measurement collapses continuous states.",
            "level": "Beginner",
            "estimated_hours": 8.0,
            "is_published": True,
            "instructor_id": instructor.id,
            "modules": [
                {
                    "title": "Module 1 — Superposition & The Bloch Sphere",
                    "description": "Geometric intuition and physical visualization of quantum superpositions.",
                    "order": 1,
                    "lessons": [
                        {
                            "title": "Understanding Superposition",
                            "slug": "understanding-superposition",
                            "lesson_type": "interactive",
                            "order": 1,
                            "duration_minutes": 20,
                            "content": """### Learning Objective
Understand how a single qubit can exist in a superposition of both $|0\\rangle$ and $|1\\rangle$ simultaneously, and interact with the state vector.

### Concept Explanation
Superposition is the fundamental quantum principle allowing a quantum system to be in multiple basis states at the same time.

When we prepare a qubit in the state:
$$|\\psi\\rangle = \\frac{1}{\\sqrt{2}}|0\\rangle + \\frac{1}{\\sqrt{2}}|1\\rangle = |+\\rangle$$

The probability of measuring $0$ is:
$$P(0) = |\\alpha|^2 = \\left(\\frac{1}{\\sqrt{2}}\\right)^2 = 0.5 = 50\\%$$

And the probability of measuring $1$ is:
$$P(1) = |\\beta|^2 = \\left(\\frac{1}{\\sqrt{2}}\\right)^2 = 0.5 = 50\\%$$

### Interactive Exploration
Use the interactive visualizer below to apply a Hadamard gate to $|0\\rangle$ and watch the state vector rotate into equal superposition!
"""
                        },
                        {
                            "title": "Visualizing Superposition with the Bloch Sphere",
                            "slug": "visualizing-superposition",
                            "lesson_type": "interactive",
                            "order": 2,
                            "duration_minutes": 25,
                            "content": """### Learning Objective
Visualize pure qubit states as points on the surface of a unit 3D sphere called the Bloch Sphere.

### Concept Explanation
Any pure single-qubit state can be written in spherical coordinates:
$$|\\psi\\rangle = \\cos\\left(\\frac{\\theta}{2}\\right)|0\\rangle + e^{i\\phi}\\sin\\left(\\frac{\\theta}{2}\\right)|1\\rangle$$

- $\\theta \\in [0, \\pi]$ governs the relative probability between $|0\\rangle$ (North Pole) and $|1\\rangle$ (South Pole).
- $\\phi \\in [0, 2\\pi)$ is the quantum phase angle along the equator.

### Key Points on the Sphere
- **North Pole ($\\theta=0$):** $|0\\rangle$
- **South Pole ($\\theta=\\pi$):** $|1\\rangle$
- **Equator (+X axis):** $|+\\rangle = (|0\\rangle + |1\\rangle)/\\sqrt{2}$
- **Equator (-X axis):** $|-\\rangle = (|0\\rangle - |1\\rangle)/\\sqrt{2}$
"""
                        },
                        {
                            "title": "Measurement & State Collapse",
                            "slug": "quantum-measurement",
                            "lesson_type": "theory",
                            "order": 3,
                            "duration_minutes": 15,
                            "content": """### Learning Objective
Learn Born's rule and why quantum measurement is inherently non-deterministic.

### Concept Explanation
When a quantum system in superposition is measured by an external classical apparatus, the superposition **collapses** instantaneously to one of the basis states $|0\\rangle$ or $|1\\rangle$.

Repeated measurements over multiple "shots" recreate the underlying statistical probability distribution.
"""
                        }
                    ]
                }
            ]
        },
        {
            "title": "Quantum Gates and Circuits",
            "slug": "quantum-gates-and-circuits",
            "short_description": "Explore unitary quantum gates including Pauli, Hadamard, Phase, and Controlled-NOT operators.",
            "description": "Learn how quantum logic gates transform state vectors through unitary linear algebra. Construct multi-gate circuits and calculate measurement probabilities.",
            "level": "Intermediate",
            "estimated_hours": 10.0,
            "is_published": True,
            "instructor_id": instructor.id,
            "modules": [
                {
                    "title": "Module 1 — Single-Qubit Quantum Gates",
                    "description": "Reversible single-qubit operations and rotation matrices.",
                    "order": 1,
                    "lessons": [
                        {
                            "title": "Introduction to Quantum Gates",
                            "slug": "intro-quantum-gates",
                            "lesson_type": "theory",
                            "order": 1,
                            "duration_minutes": 15,
                            "content": """### Learning Objective
Understand why all quantum logic gates must be represented by unitary matrices ($U^\\dagger U = I$).

### Concept Explanation
In quantum mechanics, all non-measurement operations must preserve total probability ($100\\%$). Hence, quantum gates are represented by square unitary matrices.
"""
                        },
                        {
                            "title": "The Hadamard Gate (H)",
                            "slug": "hadamard-gate",
                            "lesson_type": "interactive",
                            "order": 2,
                            "duration_minutes": 25,
                            "content": """### Learning Objective
Learn the matrix representation of the Hadamard gate and how it creates balanced superposition.

### Matrix Definition
$$H = \\frac{1}{\\sqrt{2}} \\begin{bmatrix} 1 & 1 \\\\ 1 & -1 \\end{bmatrix}$$

Applying $H$ twice returns the state back to its original identity ($H^2 = I$).
"""
                        },
                        {
                            "title": "Pauli-X, Pauli-Y, and Pauli-Z Gates",
                            "slug": "pauli-gates",
                            "lesson_type": "interactive",
                            "order": 3,
                            "duration_minutes": 20,
                            "content": """### Learning Objective
Master the three fundamental Pauli rotation matrices.

- **Pauli-X (Quantum NOT):** $X|0\\rangle = |1\\rangle, \\quad X|1\\rangle = |0\\rangle$
- **Pauli-Z (Phase Flip):** $Z|0\\rangle = |0\\rangle, \\quad Z|1\\rangle = -|1\\rangle$
"""
                        }
                    ]
                },
                {
                    "title": "Module 2 — Multi-Qubit Gates & Entanglement",
                    "description": "Two-qubit operations and quantum interaction.",
                    "order": 2,
                    "lessons": [
                        {
                            "title": "The Controlled-NOT (CNOT) Gate",
                            "slug": "cnot-gate",
                            "lesson_type": "circuit_lab",
                            "order": 4,
                            "duration_minutes": 25,
                            "content": """### Learning Objective
Understand how the CNOT gate flips a target qubit if and only if the control qubit is $|1\\rangle$.

### Truth Table
- $|00\\rangle \\rightarrow |00\\rangle$
- $|01\\rangle \\rightarrow |01\\rangle$
- $|10\\rangle \\rightarrow |11\\rangle$
- $|11\\rangle \\rightarrow |10\\rangle$
"""
                        }
                    ]
                }
            ]
        },
        {
            "title": "Quantum Entanglement",
            "slug": "quantum-entanglement",
            "short_description": "Explore EPR pairs, non-locality, Bell state construction, and quantum teleportation protocols.",
            "description": "Understand Einstein's 'spooky action at a distance'. Build maximally entangled 2-qubit states and analyze correlations across space.",
            "level": "Intermediate",
            "estimated_hours": 8.0,
            "is_published": True,
            "instructor_id": instructor.id,
            "modules": [
                {
                    "title": "Module 1 — Understanding Entanglement & Bell States",
                    "description": "Maximally entangled pairs and non-classical correlations.",
                    "order": 1,
                    "lessons": [
                        {
                            "title": "Understanding Entanglement",
                            "slug": "understanding-entanglement",
                            "lesson_type": "interactive",
                            "order": 1,
                            "duration_minutes": 20,
                            "content": """### Learning Objective
Define quantum entanglement as a state of multiple qubits that cannot be factored into product states of individual qubits.

### Concept Explanation
An entangled state like:
$$|\\Phi^+\\rangle = \\frac{|00\\rangle + |11\\rangle}{\\sqrt{2}}$$
cannot be written as $|\\psi_A\\rangle \\otimes |\\psi_B\\rangle$. Measuring qubit A immediately forces qubit B into the exact same value.
"""
                        },
                        {
                            "title": "Constructing the 4 Bell States",
                            "slug": "bell-states",
                            "lesson_type": "circuit_lab",
                            "order": 2,
                            "duration_minutes": 30,
                            "content": """### Learning Objective
Construct all 4 orthogonal maximally entangled Bell basis states using an $H$ gate followed by a $CNOT$ gate.
"""
                        }
                    ]
                }
            ]
        },
        {
            "title": "Introduction to Quantum Algorithms",
            "slug": "quantum-algorithms",
            "short_description": "Discover quantum speedup, phase kickback, oracles, Deutsch-Jozsa, and Grover's search algorithm.",
            "description": "Step through algorithmic speedups from Deutsch-Jozsa to Grover's amplitude amplification and the Quantum Fourier Transform.",
            "level": "Advanced",
            "estimated_hours": 14.0,
            "is_published": True,
            "instructor_id": instructor.id,
            "modules": [
                {
                    "title": "Module 1 — Quantum Computational Advantage",
                    "description": "Algorithmic primitives, oracles, and amplitude amplification.",
                    "order": 1,
                    "lessons": [
                        {
                            "title": "Why Quantum Algorithms?",
                            "slug": "why-quantum-algorithms",
                            "lesson_type": "theory",
                            "order": 1,
                            "duration_minutes": 20,
                            "content": """### Learning Objective
Understand how quantum parallelism and constructive wave interference provide exponential and polynomial speedups over classical algorithms.
"""
                        },
                        {
                            "title": "Phase Kickback Mechanism",
                            "slug": "phase-kickback",
                            "lesson_type": "interactive",
                            "order": 2,
                            "duration_minutes": 30,
                            "content": """### Learning Objective
Grasp the phase kickback primitive: how eigenvalue phases from a target qubit kick back onto control qubits in quantum oracles.
"""
                        },
                        {
                            "title": "Deutsch-Jozsa Algorithm Overview",
                            "slug": "deutsch-jozsa",
                            "lesson_type": "circuit_lab",
                            "order": 3,
                            "duration_minutes": 35,
                            "content": """### Learning Objective
Evaluate whether an unknown boolean function is constant or balanced in a single quantum query, whereas classical computing requires $2^{n-1} + 1$ queries.
"""
                        }
                    ]
                }
            ]
        }
    ]

    for c_data in courses_data:
        existing_course = db.query(Course).filter(Course.slug == c_data["slug"]).first()
        if not existing_course:
            new_course = Course(
                title=c_data["title"],
                slug=c_data["slug"],
                description=c_data["description"],
                short_description=c_data["short_description"],
                level=c_data["level"],
                estimated_hours=c_data["estimated_hours"],
                is_published=c_data["is_published"],
                instructor_id=c_data["instructor_id"]
            )
            db.add(new_course)
            db.commit()
            db.refresh(new_course)

            for m_data in c_data["modules"]:
                new_module = Module(
                    course_id=new_course.id,
                    title=m_data["title"],
                    description=m_data["description"],
                    order=m_data["order"]
                )
                db.add(new_module)
                db.commit()
                db.refresh(new_module)

                for l_data in m_data["lessons"]:
                    new_lesson = Lesson(
                        module_id=new_module.id,
                        title=l_data["title"],
                        slug=l_data["slug"],
                        content=l_data["content"],
                        lesson_type=l_data["lesson_type"],
                        order=l_data["order"],
                        duration_minutes=l_data["duration_minutes"],
                        is_published=True
                    )
                    db.add(new_lesson)
            db.commit()

    # 5. Initialize Student Course Enrollments & Starter Progress
    if student:
        # Enroll in Course 1 and Course 2
        course1 = db.query(Course).filter(Course.slug == "intro-to-quantum").first()
        course2 = db.query(Course).filter(Course.slug == "qubits-and-superposition").first()

        if course1:
            enrollment1 = db.query(Enrollment).filter(
                Enrollment.user_id == student.id,
                Enrollment.course_id == course1.id
            ).first()
            if not enrollment1:
                db.add(Enrollment(
                    user_id=student.id,
                    course_id=course1.id,
                    completed_percentage=100.0,
                    is_completed=True
                ))

            # Mark all lessons in Course 1 completed
            for mod in course1.modules:
                for les in mod.lessons:
                    prog = db.query(LessonProgress).filter(
                        LessonProgress.user_id == student.id,
                        LessonProgress.lesson_id == les.id
                    ).first()
                    if not prog:
                        db.add(LessonProgress(
                            user_id=student.id,
                            lesson_id=les.id,
                            is_completed=True,
                            time_spent_seconds=les.duration_minutes * 60,
                            completed_at=datetime.now(timezone.utc)
                        ))

        if course2:
            enrollment2 = db.query(Enrollment).filter(
                Enrollment.user_id == student.id,
                Enrollment.course_id == course2.id
            ).first()
            if not enrollment2:
                db.add(Enrollment(
                    user_id=student.id,
                    course_id=course2.id,
                    completed_percentage=66.7,
                    is_completed=False
                ))

            # Mark lesson 1 completed in Course 2
            lesson_super = db.query(Lesson).filter(Lesson.slug == "understanding-superposition").first()
            if lesson_super:
                prog = db.query(LessonProgress).filter(
                    LessonProgress.user_id == student.id,
                    LessonProgress.lesson_id == lesson_super.id
                ).first()
                if not prog:
                    db.add(LessonProgress(
                        user_id=student.id,
                        lesson_id=lesson_super.id,
                        is_completed=True,
                        time_spent_seconds=1200,
                        completed_at=datetime.now(timezone.utc)
                    ))

        # 6. Seed Initial Quizzes
        quiz1 = db.query(Quiz).filter(Quiz.title == "Superposition & Single-Qubit Gates").first()
        if not quiz1:
            quiz1 = Quiz(
                title="Superposition & Single-Qubit Gates",
                description="Test your understanding of quantum states, the Hadamard transformation, and single-qubit rotations.",
                passing_score_percentage=70.0,
                time_limit_minutes=15,
                is_published=True,
                creator_id=instructor.id,
            )
            db.add(quiz1)
            db.commit()
            db.refresh(quiz1)

            q1_data = [
                {
                    "prompt": "What is the primary effect of applying a Hadamard (H) gate to the ground state |0⟩?",
                    "question_type": "multiple_choice",
                    "options_json": json.dumps([
                        {"id": "A", "text": "Flips |0⟩ to |1⟩ with 100% certainty"},
                        {"id": "B", "text": "Creates the symmetric superposition state (|0⟩ + |1⟩)/√2"},
                        {"id": "C", "text": "Applies a π/2 phase shift without changing amplitudes"},
                        {"id": "D", "text": "Destroys the quantum state through decoherence"}
                    ]),
                    "correct_answer": "B",
                    "explanation": "The Hadamard gate H maps |0⟩ to the equal superposition state |+⟩ = (|0⟩ + |1⟩)/√2, yielding 50/50 measurement probabilities.",
                    "points": 10,
                    "order": 1
                },
                {
                    "prompt": "True or False: Quantum measurement in the computational basis is a reversible unitary operation.",
                    "question_type": "true_false",
                    "options_json": json.dumps([
                        {"id": "True", "text": "True"},
                        {"id": "False", "text": "False"}
                    ]),
                    "correct_answer": "False",
                    "explanation": "Quantum measurement causes wavefunction collapse, projecting continuous amplitudes into discrete classical values. It is non-unitary and irreversible.",
                    "points": 10,
                    "order": 2
                },
                {
                    "prompt": "Consider the circuit: |0⟩ → X → H → Measure. What are the expected measurement probabilities?",
                    "question_type": "circuit_prediction",
                    "options_json": json.dumps([
                        {"id": "A", "text": "100% probability of |0⟩"},
                        {"id": "B", "text": "100% probability of |1⟩"},
                        {"id": "C", "text": "50% probability of |0⟩ and 50% probability of |1⟩"},
                        {"id": "D", "text": "The state cannot be measured"}
                    ]),
                    "correct_answer": "C",
                    "explanation": "Applying X to |0⟩ produces |1⟩. Then applying H to |1⟩ produces |-⟩ = (|0⟩ - |1⟩)/√2. By the Born rule, probabilities are |-1/√2|² = 0.50 (50%) for both states.",
                    "points": 10,
                    "order": 3
                },
                {
                    "prompt": "Which quantum gate acts as the equivalent of a classical NOT gate?",
                    "question_type": "multiple_choice",
                    "options_json": json.dumps([
                        {"id": "A", "text": "Pauli-Z Gate"},
                        {"id": "B", "text": "Pauli-X Gate"},
                        {"id": "C", "text": "Hadamard Gate"},
                        {"id": "D", "text": "Phase (S) Gate"}
                    ]),
                    "correct_answer": "B",
                    "explanation": "The Pauli-X gate [[0, 1], [1, 0]] bit-flips |0⟩ to |1⟩ and |1⟩ to |0⟩.",
                    "points": 10,
                    "order": 4
                },
                {
                    "prompt": "On the Bloch sphere, which landmark point corresponds to the ground state |0⟩?",
                    "question_type": "conceptual",
                    "options_json": json.dumps([
                        {"id": "A", "text": "North Pole (+Z axis)"},
                        {"id": "B", "text": "South Pole (-Z axis)"},
                        {"id": "C", "text": "Positive X axis"},
                        {"id": "D", "text": "Center of the sphere"}
                    ]),
                    "correct_answer": "A",
                    "explanation": "The North Pole of the Bloch sphere (θ=0) represents the ground state |0⟩, while the South Pole (θ=π) represents |1⟩.",
                    "points": 10,
                    "order": 5
                }
            ]

            for item in q1_data:
                db.add(Question(quiz_id=quiz1.id, **item))
            db.commit()

        # 7. Seed Initial Challenges
        default_challenges = [
            {
                "title": "Create Quantum Superposition",
                "slug": "create-superposition",
                "difficulty": "Beginner",
                "category": "Single-Qubit Gates",
                "description": "Construct a single-qubit circuit that prepares the balanced superposition state |+⟩ = (|0⟩ + |1⟩)/√2 with 50% probability on |0⟩ and 50% probability on |1⟩.",
                "target_state_vector": "0.7071|0⟩ + 0.7071|1⟩",
                "starter_circuit_json": json.dumps({
                    "numQubits": 1,
                    "numClassicalBits": 1,
                    "numCols": 4,
                    "gates": []
                }),
                "starter_qiskit_code": "from qiskit import QuantumCircuit\nqc = QuantumCircuit(1, 1)\n# Place your gate here\nqc.measure(0, 0)",
                "points_reward": 50,
                "is_published": True,
                "creator_id": instructor.id
            },
            {
                "title": "Implement Pauli-X Bit Flip",
                "slug": "implement-x-gate",
                "difficulty": "Beginner",
                "category": "Single-Qubit Gates",
                "description": "Apply a quantum bit-flip operation to transform the ground state |0⟩ into the excited state |1⟩ with 100% measurement fidelity.",
                "target_state_vector": "1.0000|1⟩",
                "starter_circuit_json": json.dumps({
                    "numQubits": 1,
                    "numClassicalBits": 1,
                    "numCols": 4,
                    "gates": []
                }),
                "starter_qiskit_code": "from qiskit import QuantumCircuit\nqc = QuantumCircuit(1, 1)\n# Place your gate here\nqc.measure(0, 0)",
                "points_reward": 50,
                "is_published": True,
                "creator_id": instructor.id
            },
            {
                "title": "Create a 2-Qubit Bell State",
                "slug": "create-bell-state",
                "difficulty": "Intermediate",
                "category": "Quantum Entanglement",
                "description": "Construct the maximally entangled Bell state |Φ⁺⟩ = (|00⟩ + |11⟩)/√2. Verified outcomes must yield ~50% |00⟩, ~50% |11⟩, and 0% for anti-correlated states.",
                "target_state_vector": "0.7071|00⟩ + 0.7071|11⟩",
                "starter_circuit_json": json.dumps({
                    "numQubits": 2,
                    "numClassicalBits": 2,
                    "numCols": 5,
                    "gates": []
                }),
                "starter_qiskit_code": "from qiskit import QuantumCircuit\nqc = QuantumCircuit(2, 2)\n# Step 1: Superposition on q0\n# Step 2: Entangle q0 and q1\nqc.measure([0, 1], [0, 1])",
                "points_reward": 100,
                "is_published": True,
                "creator_id": instructor.id
            },
            {
                "title": "Create a 3-Qubit GHZ State",
                "slug": "create-ghz-state",
                "difficulty": "Advanced",
                "category": "Multi-Qubit Entanglement",
                "description": "Prepare the tripartite Greenberger-Horne-Zeilinger (GHZ) state (|000⟩ + |111⟩)/√2 across 3 qubits. Measuring any qubit will instantaneously collapse all three.",
                "target_state_vector": "0.7071|000⟩ + 0.7071|111⟩",
                "starter_circuit_json": json.dumps({
                    "numQubits": 3,
                    "numClassicalBits": 3,
                    "numCols": 6,
                    "gates": []
                }),
                "starter_qiskit_code": "from qiskit import QuantumCircuit\nqc = QuantumCircuit(3, 3)\n# Prepare 3-qubit GHZ state\nqc.measure([0, 1, 2], [0, 1, 2])",
                "points_reward": 150,
                "is_published": True,
                "creator_id": instructor.id
            },
            {
                "title": "Build a CNOT Entangling Circuit",
                "slug": "build-a-cnot-circuit",
                "difficulty": "Intermediate",
                "category": "Quantum Gates",
                "description": "Demonstrate the controlled-NOT gate logic by setting up a control qubit and observing conditional bit flips on the target register.",
                "target_state_vector": "Correlated output distribution",
                "starter_circuit_json": json.dumps({
                    "numQubits": 2,
                    "numClassicalBits": 2,
                    "numCols": 5,
                    "gates": []
                }),
                "points_reward": 75,
                "is_published": True,
                "creator_id": instructor.id
            }
        ]

        for ch in default_challenges:
            existing_ch = db.query(Challenge).filter(Challenge.slug == ch["slug"]).first()
            if not existing_ch:
                db.add(Challenge(**ch))
        db.commit()

        db.commit()
