# QuantumLearn AI

> **Tagline:** Learn. Build. Run. Understand.  
> **Interactive Quantum Algorithm Learning Platform**

---

## 🌌 1. Product Vision & Overview

**QuantumLearn AI** is a production-grade, interactive educational web platform designed to make quantum computing intuitive, hands-on, and accessible. It bridges theoretical quantum mechanics and practical quantum programming through a continuous experiential cycle:

$$\text{Learn} \longrightarrow \text{Visualize} \longrightarrow \text{Build} \longrightarrow \text{Run} \longrightarrow \text{Understand} \longrightarrow \text{Practice}$$

---

## ✨ 2. Core Features

### 🎓 Student Learning Hub
- **Interactive Course Curriculum:** Step-by-step modular lessons covering quantum foundations, superposition, quantum gates, entanglement, and algorithms.
- **Quantum Playground:** Visual drag-and-drop circuit builder supporting Pauli $X, Y, Z$, Hadamard $H$, Phase $S, T$, CNOT $CX$, and Measurement $M$ gates.
- **Real Qiskit Aer Execution:** Live Python Qiskit Aer backend simulation with measurement counts, probability distributions, statevector amplitudes, and 3D Bloch sphere projections.
- **AI Quantum Tutor & Debugger:** Grounded RAG-based AI assistant referencing verified quantum documents to provide explanations, circuit debugging, and hint modes.
- **Smart Quizzes & Challenges:** Automated deterministic quantum challenge evaluator with fidelity scoring and quiz attempt tracking.
- **Personalized Learning & Mastery:** Deterministic 9-domain topic mastery scoring, next-best lesson recommendations, and AI Learning Summaries.
- **Gamification & Achievements:** 11 quantum credentials, daily learning streaks with same-day deduplication, and XP tracking.

### 👩‍🏫 Instructor Studio & Analytics
- **Curriculum Management:** Create, edit, and publish courses, modules, and lessons.
- **AI Course Generator:** Grounded course syllabus and lesson synthesizer with granular single-lesson regeneration and draft safety.
- **AI Quiz Generator:** Grounded assessment builder supporting 6 question types, point values, hidden authoritative answers, and single-question regeneration.
- **Cohort Analytics & AI Course Insights:** 9-domain cohort mastery distributions, 6-step completion funnel with drop-off signals, and AI pedagogical course recommendations.

---

## 🛠️ 3. Technology Stack

### Frontend
- **Framework:** React 19 + TypeScript + Vite 8
- **Styling:** Tailwind CSS v4 (Glassmorphic dark quantum theme, responsive layout)
- **Routing:** React Router v7 with role-based route guards (`Student`, `Instructor`, `Admin`)
- **Icons & Visuals:** Lucide React, SVG Bloch Sphere Visualizer, Canvas Particle Wave
- **HTTP Client:** Axios with JWT request/response interceptors

### Backend
- **Framework:** FastAPI (Python 3.12 / 3.13 / 3.14 compatible)
- **Data Validation & Config:** Pydantic v2 & Pydantic Settings
- **ORM & Database:** SQLAlchemy 2.0 (PostgreSQL production-ready + SQLite for local development)
- **Quantum Simulator:** IBM Qiskit & Qiskit Aer
- **Authentication & Security:** JWT (PyJWT), Cryptographic Bcrypt Password Hashing, HTTPBearer security guards, IDOR isolation, and gate boundary limits
- **AI Engine:** Grounded RAG retrieval with vector similarity search over verified quantum documents

---

## 📁 4. Project Structure

```text
quantumlearn-ai/
├── README.md                     # Master documentation
├── DEPLOYMENT.md                 # Production deployment guide
├── .gitignore                    # Git ignore configuration
├── backend/
│   ├── requirements.txt          # Python dependencies
│   ├── .env.example              # Backend environment template
│   ├── .gitignore                # Backend ignore rules
│   ├── tests/                    # Automated regression & security test suites
│   │   ├── test_auth_api.py      # Authentication & JWT tests
│   │   ├── test_courses_api.py   # Courses & lesson progress tests
│   │   ├── test_quantum_api.py   # Qiskit simulation & circuit tests
│   │   ├── test_ai_tutor_api.py  # RAG retrieval & AI Tutor tests
│   │   ├── test_assessments_api.py # Quizzes & Challenge solver tests
│   │   ├── test_instructor_api.py  # Instructor CRUD & security tests
│   │   ├── test_phase8_api.py    # AI Generation, Mastery & Gamification tests
│   │   └── test_phase9_security.py # Security bounds, CORS & IDOR tests
│   └── app/
│       ├── main.py               # FastAPI application entrypoint with lifespan events
│       ├── core/                 # Settings, security, and auth dependencies
│       ├── database/             # SQLAlchemy engine & safe schema sync
│       ├── models/               # Relational data models (19 models)
│       ├── schemas/              # Pydantic validation schemas
│       ├── api/v1/               # Version 1 REST API routers & endpoints
│       ├── services/             # Domain logic (AI, Quantum, Gamification, Personalization)
│       └── utils/                # Database seeders & demo data
└── frontend/
    ├── package.json              # Frontend dependencies
    ├── vite.config.ts            # Vite configuration
    ├── .env.example              # Frontend environment template
    ├── .gitignore                # Frontend ignore rules
    └── src/
        ├── components/           # Reusable UI cards, buttons, badges, modals, charts
        ├── contexts/             # AuthContext session management
        ├── layouts/              # Public, Student, and Instructor shells
        ├── pages/                # Student & Instructor portal pages
        ├── routes/               # Role-protected routes & redirects
        ├── services/             # API client services
        └── types/                # TypeScript interfaces
```

---

## 🚀 5. Getting Started (Local Development)

### Prerequisites
- **Node.js:** v18+ (tested on v24)
- **Python:** v3.10+ (tested on Python 3.12 / 3.14)
- **Git**

---

### Step 1: Start Backend API

```bash
cd backend
python -m venv venv

# Activate virtual environment
# Windows:
.\venv\Scripts\activate
# Linux/macOS:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Start backend server
uvicorn app.main:app --reload --port 8000
```

- **Base API:** `http://127.0.0.1:8000`
- **Swagger Documentation:** `http://127.0.0.1:8000/docs`
- **Health Check:** `http://127.0.0.1:8000/api/v1/health`

---

### Step 2: Start Frontend Application

```bash
cd frontend
npm install
npm run dev
```

- **Frontend Application:** `http://localhost:5173`

---

## 🔑 6. Demo Accounts

The platform automatically seeds initial demonstration accounts for instant testing:

| Role | Email | Password | Access |
|---|---|---|---|
| **Student** | `student@quantumlearn.ai` | `QuantumLearn2026!` | Student Dashboard, Courses, Circuit Playground, Qiskit Lab, AI Tutor, Quizzes, Progress |
| **Instructor** | `instructor@quantumlearn.ai` | `QuantumLearn2026!` | Instructor Dashboard, Course Studio, Lesson Editor, Quiz Builder, Analytics, AI Generation |

---

## 🧪 7. Automated Testing & Verification

### Run Complete Backend Regression & Security Matrix:
```bash
cd backend
python tests/test_auth_api.py
python tests/test_courses_api.py
python tests/test_quantum_api.py
python tests/test_ai_tutor_api.py
python tests/test_assessments_api.py
python tests/test_instructor_api.py
python tests/test_phase8_api.py
python tests/test_phase9_security.py
```

### Run Frontend Production Build:
```bash
cd frontend
npm run build
```

---

## 🚢 8. Production Deployment

Refer to [`DEPLOYMENT.md`](./DEPLOYMENT.md) for full deployment instructions covering:
- PostgreSQL Configuration (`DATABASE_URL`)
- CORS Configuration (`CORS_ALLOWED_ORIGINS`)
- Vercel / Netlify / Render / Railway / Docker setup
- Security checklist
