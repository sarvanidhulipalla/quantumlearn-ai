import React from 'react';
import { Link } from 'react-router-dom';
import {
  Sparkles,
  ChevronRight,
  Cpu,
  Terminal,
  Bot,
  GraduationCap,
  BookOpen,
  Trophy,
  Compass,
  Layers,
  Zap,
  Activity,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';
import Button from '../components/common/Button';
import Card from '../components/common/Card';
import Badge from '../components/common/Badge';
import QuantumOrb from '../components/visual/QuantumOrb';

export const LandingPage: React.FC = () => {
  const features = [
    {
      icon: BookOpen,
      title: 'Visual Interactive Lessons',
      color: 'text-[#2b2b2b]',
      border: 'border-[#d4d4d4]',
      description: 'Step-by-step modular quantum lessons with embedded interactive circuit previews and state animations.',
      tag: 'Curriculum',
    },
    {
      icon: Cpu,
      title: 'Quantum Playground',
      color: 'text-[#2b2b2b]',
      border: 'border-[#d4d4d4]',
      description: 'Drag-and-drop circuit canvas with live state vector calculation, probabilities, and gate matrix updates.',
      tag: 'Visual Lab',
    },
    {
      icon: Bot,
      title: 'AI Quantum Tutor',
      color: 'text-[#2b2b2b]',
      border: 'border-[#d4d4d4]',
      description: 'Context-aware AI tutor with RAG verification to explain quantum concepts, debug circuits, and guide intuition.',
      tag: 'AI Mentor',
    },
    {
      icon: Terminal,
      title: 'Qiskit Coding Lab',
      color: 'text-[#2b2b2b]',
      border: 'border-[#d4d4d4]',
      description: 'Real Python code execution powered by Qiskit Aer backend simulation directly in the browser.',
      tag: 'Python SDK',
    },
    {
      icon: Trophy,
      title: 'Smart Assessments',
      color: 'text-[#2b2b2b]',
      border: 'border-[#d4d4d4]',
      description: 'Fidelity-scored circuit challenges, gate prediction puzzles, and AI-generated adaptive quizzes.',
      tag: 'Challenges',
    },
    {
      icon: Compass,
      title: 'Personalized Learning',
      color: 'text-[#2b2b2b]',
      border: 'border-[#d4d4d4]',
      description: 'Knowledge gap detection with customized lesson recommendations and gamified achievement mastery.',
      tag: 'Adaptive',
    },
  ];

  const workflowSteps = [
    { step: '01', title: 'Learn', desc: 'Grasp foundational quantum mechanics and linear algebra principles intuitively.' },
    { step: '02', title: 'Visualize', desc: 'Inspect superposition and phase rotations live on the 3D Bloch sphere.' },
    { step: '03', title: 'Build', desc: 'Construct quantum circuits with Hadamard, Pauli, CNOT, and Phase gates.' },
    { step: '04', title: 'Run', desc: 'Simulate shots with Qiskit Aer to generate state vectors and measurement histograms.' },
    { step: '05', title: 'Understand', desc: 'Ask the AI tutor to demystify entanglement and quantum algorithm mechanics.' },
    { step: '06', title: 'Practice', desc: 'Solve real algorithmic challenges like Deutsch-Jozsa, Grover, and QFT.' },
  ];

  const topics = [
    { name: 'Qubits & Quantum States', level: 'Fundamental', desc: 'Dirac bra-ket notation, state vectors, and basis representation.' },
    { name: 'Superposition', level: 'Fundamental', desc: 'Linear combinations of states with constructive and destructive interference.' },
    { name: 'Quantum Gates & Unitaries', level: 'Core', desc: 'Single-qubit (H, X, Y, Z, S, T) and multi-qubit (CNOT, CZ, SWAP) matrices.' },
    { name: 'Entanglement & Bell States', level: 'Core', desc: 'EPR pairs, non-local quantum correlations, and teleportation protocols.' },
    { name: 'Quantum Circuits', level: 'Applied', desc: 'Multi-register circuit topologies, quantum barriers, and measurements.' },
    { name: 'Quantum Algorithms', level: 'Advanced', desc: "Deutsch-Jozsa, Grover's search, Simon's, and Quantum Fourier Transform." },
    { name: 'Qiskit Python SDK', level: 'Developer', desc: 'Translating visual circuits to production IBM Quantum & Aer Python code.' },
  ];

  return (
    <div className="space-y-24 sm:space-y-32 pb-16">
      {/* 1. HERO SECTION */}
      <section className="relative pt-12 sm:pt-20 lg:pt-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            {/* Left Hero Copy */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#f4f4f4] border border-[#d4d4d4] text-[#2b2b2b] text-xs font-bold shadow-xs">
                <Sparkles className="w-3.5 h-3.5 text-[#2b2b2b] animate-pulse" />
                <span>Next-Gen Quantum Education Platform</span>
              </div>

              {/* Master Headline */}
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-[#2b2b2b] leading-[1.15]">
                Learn Quantum Computing.{' '}
                <span className="block quantum-gradient-text mt-1">
                  Build. Run. Understand.
                </span>
              </h1>

              {/* Subtitle */}
              <p className="text-base sm:text-lg text-[#2b2b2b]/70 max-w-2xl mx-auto lg:mx-0 leading-relaxed font-normal">
                An AI-powered interactive platform for learning quantum computing through visual lessons, quantum circuits, Qiskit simulations, and personalized guidance.
              </p>

              {/* CTA Buttons */}
              <div className="pt-2 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
                <Link to="/register" className="w-full sm:w-auto">
                  <Button
                    variant="primary"
                    size="lg"
                    className="w-full sm:w-auto text-base font-semibold"
                    rightIcon={<ChevronRight className="w-5 h-5" />}
                  >
                    Start Learning Free
                  </Button>
                </Link>
                <Link to="/student/playground" className="w-full sm:w-auto">
                  <Button
                    variant="outline"
                    size="lg"
                    className="w-full sm:w-auto text-base font-semibold"
                    leftIcon={<Cpu className="w-5 h-5 text-[#2b2b2b]" />}
                  >
                    Explore Quantum Lab
                  </Button>
                </Link>
              </div>

              {/* Micro Proof Points */}
              <div className="pt-6 border-t border-[#d4d4d4] grid grid-cols-3 gap-4 text-left max-w-md mx-auto lg:mx-0">
                <div>
                  <div className="text-xl sm:text-2xl font-black text-[#2b2b2b]">100%</div>
                  <div className="text-[11px] text-[#2b2b2b]/60 font-medium">Interactive Visuals</div>
                </div>
                <div>
                  <div className="text-xl sm:text-2xl font-black text-[#2b2b2b]">Qiskit</div>
                  <div className="text-[11px] text-[#2b2b2b]/60 font-medium">Aer Backend Sim</div>
                </div>
                <div>
                  <div className="text-xl sm:text-2xl font-black text-[#2b2b2b]">AI Tutor</div>
                  <div className="text-[11px] text-[#2b2b2b]/60 font-medium">RAG-Verified</div>
                </div>
              </div>
            </div>

            {/* Right Hero Visual (Bloch Sphere Orb) */}
            <div className="lg:col-span-5 flex justify-center">
              <div className="w-full max-w-md">
                <QuantumOrb />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. HOW IT WORKS (THE LEARNING CYCLE) */}
      <section id="how-it-works" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-14">
          <Badge variant="purple" size="sm" className="mb-3">
            Core Learning Cycle
          </Badge>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#2b2b2b] tracking-tight">
            How QuantumLearn AI Works
          </h2>
          <p className="mt-3 text-[#2b2b2b]/70 text-sm sm:text-base">
            Moving beyond passive videos to active experiential quantum intuition through a 6-stage continuous mastery loop.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">
          {workflowSteps.map((item, idx) => (
            <div
              key={item.step}
              className="p-5 rounded-2xl bg-[#ffffff] border border-[#d4d4d4] relative group hover:border-[#2b2b2b] hover:shadow-md transition-all duration-300"
            >
              <span className="text-xs font-mono text-[#ffffff] font-bold bg-[#2b2b2b] px-2 py-0.5 rounded border border-[#2b2b2b]">
                {item.step}
              </span>
              <h3 className="text-lg font-bold text-[#2b2b2b] mt-3 mb-1.5 group-hover:text-black transition-colors">
                {item.title}
              </h3>
              <p className="text-xs text-[#2b2b2b]/70 leading-relaxed">
                {item.desc}
              </p>
              {idx < workflowSteps.length - 1 && (
                <ArrowRight className="hidden lg:block absolute -right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#b3b3b3] z-10 pointer-events-none" />
              )}
            </div>
          ))}
        </div>
      </section>

      {/* 3. CORE FEATURES GRID */}
      <section id="features" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-14">
          <Badge variant="cyan" size="sm" className="mb-3">
            Platform Capabilities
          </Badge>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#2b2b2b] tracking-tight">
            Engineered for Deep Quantum Understanding
          </h2>
          <p className="mt-3 text-[#2b2b2b]/70 text-sm sm:text-base">
            Every feature is architected specifically for quantum information education — combining visual intuition, rigorous mathematics, and real SDK code.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <Card
                key={feature.title}
                variant="interactive"
                className={`p-6 border ${feature.border}`}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 rounded-xl bg-[#f5f5f5] border border-[#d4d4d4]">
                    <Icon className={`w-6 h-6 ${feature.color}`} />
                  </div>
                  <Badge variant="slate" size="xs">
                    {feature.tag}
                  </Badge>
                </div>
                <h3 className="text-lg font-bold text-[#2b2b2b] mb-2">{feature.title}</h3>
                <p className="text-sm text-[#2b2b2b]/75 leading-relaxed">
                  {feature.description}
                </p>
              </Card>
            );
          })}
        </div>
      </section>

      {/* 4. QUANTUM TOPICS & CURRICULUM */}
      <section id="topics" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="p-8 sm:p-12 rounded-3xl bg-[#ffffff] border border-[#d4d4d4] shadow-sm relative overflow-hidden">
          <div className="max-w-3xl mb-10">
            <Badge variant="purple" size="sm" className="mb-3">
              Comprehensive Syllabus
            </Badge>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#2b2b2b] tracking-tight">
              Master the Full Quantum Computing Stack
            </h2>
            <p className="mt-2 text-[#2b2b2b]/70 text-sm">
              Structured from fundamental single-qubit mechanics to advanced multi-qubit fault-tolerant algorithms and Qiskit workflows.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {topics.map((t) => (
              <div
                key={t.name}
                className="p-4 rounded-xl bg-[#fbfbfb] border border-[#d4d4d4] hover:border-[#2b2b2b] hover:shadow-xs transition-all"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-[#2b2b2b] font-mono">
                    {t.level}
                  </span>
                  <Zap className="w-3.5 h-3.5 text-[#2b2b2b]" />
                </div>
                <h4 className="text-sm font-bold text-[#2b2b2b] mb-1">{t.name}</h4>
                <p className="text-xs text-[#2b2b2b]/70 leading-relaxed">{t.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. CALL TO ACTION (CTA) */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="p-8 sm:p-14 rounded-3xl bg-[#fafafa] border border-[#d4d4d4] shadow-md relative overflow-hidden">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#2b2b2b] tracking-tight leading-tight">
            Start Your Quantum Journey Today
          </h2>
          <p className="mt-4 text-base text-[#2b2b2b]/70 max-w-xl mx-auto leading-relaxed">
            Join students, educators, and developers already learning quantum algorithms intuitively with QuantumLearn AI.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/register" className="w-full sm:w-auto">
              <Button variant="primary" size="lg" className="w-full sm:w-auto font-semibold">
                Create Free Account
              </Button>
            </Link>
            <Link to="/login" className="w-full sm:w-auto">
              <Button variant="outline" size="lg" className="w-full sm:w-auto font-semibold">
                Sign In to Portal
              </Button>
            </Link>
          </div>

          <div className="mt-8 flex items-center justify-center gap-6 text-xs text-[#2b2b2b]/70">
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-[#2b2b2b]" />
              <span className="font-medium">Free Student Access</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-[#2b2b2b]" />
              <span className="font-medium">Full Qiskit Lab</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-[#2b2b2b]" />
              <span className="font-medium">AI Guidance Included</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
