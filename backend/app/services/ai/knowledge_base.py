from typing import List, Dict, Any

# Static verified core quantum knowledge repository
VERIFIED_KNOWLEDGE_DOCUMENTS: List[Dict[str, Any]] = [
    {
        "id": "kb_intro_qc",
        "title": "Introduction to Quantum Computing",
        "module": "Quantum Computing Fundamentals",
        "category": "Fundamentals",
        "content": (
            "Quantum computing harnesses the laws of quantum mechanics—such as superposition and entanglement—"
            "to process complex information exponentially faster than classical supercomputers for specific problem classes. "
            "While classical computers manipulate binary bits that are deterministically 0 or 1, quantum computers manipulate qubits "
            "which exist in linear combinations of basis states until measured."
        ),
        "keywords": ["quantum computing", "introduction", "basics", "speedup", "exponential", "mechanics"]
    },
    {
        "id": "kb_bits_vs_qubits",
        "title": "Classical Bits vs Quantum Qubits",
        "module": "Quantum Computing Fundamentals",
        "category": "Fundamentals",
        "content": (
            "A classical bit has two distinct voltage states: 0 or 1. A quantum bit (qubit) is a two-level quantum system described "
            "by the state vector |ψ⟩ = α|0⟩ + β|1⟩, where α and β are complex probability amplitudes satisfying the normalization "
            "condition |α|² + |β|² = 1. The state space of n qubits has dimension 2^n, enabling massive parallel state representations."
        ),
        "keywords": ["bit", "qubit", "classical", "amplitudes", "normalization", "dimension"]
    },
    {
        "id": "kb_superposition",
        "title": "Understanding Quantum Superposition",
        "module": "Core Quantum Principles",
        "category": "Principles",
        "content": (
            "Superposition allows a quantum system to exist in a linear combination of its orthogonal basis states simultaneously. "
            "Applying a Hadamard gate (H) to the ground state |0⟩ creates the symmetric superposition state |+⟩ = (|0⟩ + |1⟩)/√2. "
            "In this state, measuring the qubit yields |0⟩ with 50% probability and |1⟩ with 50% probability."
        ),
        "keywords": ["superposition", "hadamard", "plus state", "linear combination", "50/50", "probabilities"]
    },
    {
        "id": "kb_measurement",
        "title": "Measurement and Wavefunction Collapse",
        "module": "Core Quantum Principles",
        "category": "Principles",
        "content": (
            "Quantum measurement is fundamentally probabilistic and non-unitary. By the Born Rule, measuring |ψ⟩ = α|0⟩ + β|1⟩ "
            "in the computational basis projects the wavefunction into state |0⟩ with probability P(0) = |α|² or state |1⟩ with "
            "probability P(1) = |β|². The act of measurement collapses the superposition permanently into a definite classical bit value."
        ),
        "keywords": ["measurement", "born rule", "collapse", "wavefunction", "projection", "probabilistic"]
    },
    {
        "id": "kb_bloch_sphere",
        "title": "The Bloch Sphere Geometric Representation",
        "module": "Quantum Visualization",
        "category": "Visualization",
        "content": (
            "The Bloch sphere represents the state of a single pure qubit as a 3D unit vector: "
            "|ψ⟩ = cos(θ/2)|0⟩ + e^(iφ)sin(θ/2)|1⟩, where 0 ≤ θ ≤ π is the polar angle and 0 ≤ φ < 2π is the azimuthal phase angle. "
            "The north pole corresponds to |0⟩ (θ=0), the south pole to |1⟩ (θ=π), the positive X-axis to |+⟩ (θ=π/2, φ=0), "
            "and the negative X-axis to |-⟩ (θ=π/2, φ=π). Quantum gates act as 3D rotations on this sphere."
        ),
        "keywords": ["bloch sphere", "theta", "phi", "polar", "azimuthal", "rotation", "geometry", "unit vector"]
    },
    {
        "id": "kb_gate_h",
        "title": "The Hadamard (H) Gate",
        "module": "Quantum Gates & Logic",
        "category": "Gates",
        "content": (
            "The Hadamard gate H is a single-qubit unitary transformation represented by the matrix H = 1/√2 [[1, 1], [1, -1]]. "
            "It maps computational basis states to superposition states: H|0⟩ = |+⟩ = (|0⟩ + |1⟩)/√2 and H|1⟩ = |-⟩ = (|0⟩ - |1⟩)/√2. "
            "Geometrically, H is a 180° rotation around the (X+Z)/√2 axis on the Bloch sphere, swapping the X and Z axes."
        ),
        "keywords": ["hadamard", "h gate", "matrix", "rotation", "plus", "minus", "superposition"]
    },
    {
        "id": "kb_gate_x",
        "title": "The Pauli-X (Quantum NOT) Gate",
        "module": "Quantum Gates & Logic",
        "category": "Gates",
        "content": (
            "The Pauli-X gate acts as the quantum equivalent of the classical NOT gate (bit-flip). "
            "Represented by matrix X = [[0, 1], [1, 0]], it flips |0⟩ to |1⟩ and |1⟩ to |0⟩. "
            "On the Bloch sphere, X is a 180° (π radians) rotation around the X-axis."
        ),
        "keywords": ["pauli-x", "x gate", "not", "bit-flip", "rotation"]
    },
    {
        "id": "kb_gate_yz",
        "title": "Pauli-Y and Pauli-Z Gates",
        "module": "Quantum Gates & Logic",
        "category": "Gates",
        "content": (
            "The Pauli-Z gate acts as a phase-flip: Z = [[1, 0], [0, -1]], leaving |0⟩ unchanged while mapping |1⟩ to -|1⟩. "
            "The Pauli-Y gate combines both bit and phase flips: Y = [[0, -i], [i, 0]] = iXZ, mapping |0⟩ to i|1⟩ and |1⟩ to -i|0⟩. "
            "Along with the Identity matrix and Pauli-X, the Pauli matrices form a complete basis for all 2x2 Hermitian operators."
        ),
        "keywords": ["pauli-z", "pauli-y", "phase-flip", "z gate", "y gate", "matrices"]
    },
    {
        "id": "kb_phase_gates",
        "title": "Phase Shift Gates: S and T Gates",
        "module": "Quantum Gates & Logic",
        "category": "Gates",
        "content": (
            "Phase gates introduce relative phase shifts between |0⟩ and |1⟩ without altering measurement probabilities. "
            "The S gate (Phase gate) applies a π/2 (90°) phase shift: S = [[1, 0], [0, i]] (note that S² = Z). "
            "The T gate (π/8 gate) applies a π/4 (45°) phase shift: T = [[1, 0], [0, e^(iπ/4)]] (note that T² = S). "
            "Together with H and CNOT, the T gate provides a universal set of quantum gates for fault-tolerant computation."
        ),
        "keywords": ["s gate", "t gate", "phase", "pi/2", "pi/4", "universal gates"]
    },
    {
        "id": "kb_gate_cx",
        "title": "Controlled-NOT (CNOT / CX) Gate",
        "module": "Multi-Qubit Gates & Entanglement",
        "category": "Gates",
        "content": (
            "The CNOT (CX) gate is a 2-qubit unitary gate with a control qubit and a target qubit. "
            "If the control qubit is in state |1⟩, it applies a Pauli-X (NOT) gate to the target qubit; if |0⟩, the target is unchanged. "
            "Matrix: CX = [[1,0,0,0], [0,1,0,0], [0,0,0,1], [0,0,1,0]]. "
            "When the control qubit is in a superposition state, CNOT generates quantum entanglement between the two qubits."
        ),
        "keywords": ["cnot", "cx", "controlled-not", "control", "target", "entanglement", "two-qubit"]
    },
    {
        "id": "kb_entanglement",
        "title": "Quantum Entanglement and Bell States",
        "module": "Multi-Qubit Gates & Entanglement",
        "category": "Entanglement",
        "content": (
            "Entanglement is a quantum phenomenon where two or more particles share a joint state that cannot be factored into "
            "individual qubit states: |ψ⟩ ≠ |ψ_A⟩ ⊗ |ψ_B⟩. "
            "The 4 maximally entangled Bell states (EPR pairs) are: "
            "|Φ⁺⟩ = (|00⟩ + |11⟩)/√2, |Φ⁻⟩ = (|00⟩ - |11⟩)/√2, "
            "|Ψ⁺⟩ = (|01⟩ + |10⟩)/√2, |Ψ⁻⟩ = (|01⟩ - |10⟩)/√2. "
            "To generate |Φ⁺⟩: Apply H to qubit 0, followed by CNOT with control 0 and target 1."
        ),
        "keywords": ["entanglement", "bell state", "epr", "phi+", "psi+", "non-local", "correlated"]
    },
    {
        "id": "kb_ghz_state",
        "title": "GHZ State (Greenberger-Horne-Zeilinger)",
        "module": "Multi-Qubit Gates & Entanglement",
        "category": "Entanglement",
        "content": (
            "The GHZ state is a 3-qubit maximally entangled state defined as |GHZ⟩ = (|000⟩ + |111⟩)/√2. "
            "It is prepared by applying a Hadamard gate to qubit 0, a CNOT from qubit 0 to qubit 1, and a CNOT from qubit 1 to qubit 2. "
            "Measuring any single qubit collapses all three qubits instantaneously to either all 0s or all 1s."
        ),
        "keywords": ["ghz", "3-qubit", "tripartite", "000+111", "multi-qubit entanglement"]
    },
    {
        "id": "kb_qiskit_basics",
        "title": "IBM Qiskit 1.x Programming Concepts",
        "module": "Quantum Software & Qiskit",
        "category": "Programming",
        "content": (
            "Qiskit is the open-source quantum SDK developed by IBM. In Qiskit 1.x+: "
            "1. Instantiate circuits using `qc = QuantumCircuit(num_qubits, num_clbits)`. "
            "2. Add gates: `qc.h(0)`, `qc.x(1)`, `qc.cx(0, 1)`. "
            "3. Add measurement: `qc.measure(qubits, clbits)`. "
            "4. Execute using Qiskit Aer: `sim = AerSimulator(); job = sim.run(qc, shots=1024); counts = job.result().get_counts()`. "
            "Note: Qiskit orders classical bit strings in little-endian format (rightmost character is c0)."
        ),
        "keywords": ["qiskit", "quantumcircuit", "aersimulator", "measure", "shots", "counts", "python"]
    },
    {
        "id": "kb_finite_shots_vs_prob",
        "title": "Theoretical Probabilities vs Finite Shot Sampling",
        "module": "Simulation & Statistics",
        "category": "Analysis",
        "content": (
            "Theoretical quantum statevectors describe exact continuous probability amplitudes |α|². "
            "However, physical quantum hardware and classical shot simulators (like Qiskit Aer) measure a finite number of shots N (e.g. 1024). "
            "Due to binomial statistical sampling noise (shot noise), a 50/50 state may produce counts like 512/512, 505/519, or 498/526. "
            "As N approaches infinity (N → ∞), empirical frequencies converge to the exact Born rule probabilities by the Law of Large Numbers."
        ),
        "keywords": ["finite shots", "shot noise", "statistics", "sampling", "counts", "variance", "binomial"]
    }
]


def get_all_knowledge_documents() -> List[Dict[str, Any]]:
    """
    Returns the complete list of verified educational documents.
    """
    return VERIFIED_KNOWLEDGE_DOCUMENTS
