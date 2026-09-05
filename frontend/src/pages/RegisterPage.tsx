import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Atom, Mail, Lock, User, GraduationCap, Sparkles, ArrowRight, Check } from 'lucide-react';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import Card from '../components/common/Card';
import ErrorState from '../components/common/ErrorState';
import { useAuth } from '../contexts/AuthContext';
import { UserRole, EducationLevel, QuantumExperience } from '../types/auth';

export const RegisterPage: React.FC = () => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>('Student');
  const [educationLevel, setEducationLevel] = useState<EducationLevel>('Undergraduate');
  const [quantumExperience, setQuantumExperience] = useState<QuantumExperience>('Beginner (No background)');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !email || !password) {
      setErrorMsg('Please fill in all required fields.');
      return;
    }
    if (password.length < 6) {
      setErrorMsg('Password must be at least 6 characters.');
      return;
    }

    setErrorMsg(null);
    setIsLoading(true);

    try {
      await register({
        full_name: fullName,
        email,
        password,
        role,
        education_level: educationLevel,
        quantum_experience: quantumExperience,
      });

      if (role === 'Instructor') {
        navigate('/instructor/dashboard', { replace: true });
      } else {
        navigate('/student/dashboard', { replace: true });
      }
    } catch (err: unknown) {
      const error = err as { response?: { data?: { detail?: string } } };
      setErrorMsg(
        error.response?.data?.detail || 'Registration failed. Please check your credentials and try again.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 sm:px-6 lg:px-8 py-12">
      <div className="w-full max-w-lg space-y-6">
        {/* Branding */}
        <div className="text-center space-y-2">
          <Link to="/" className="inline-flex items-center gap-2 mb-2 group">
            <div className="p-2.5 rounded-2xl bg-[#2b2b2b] border border-[#2b2b2b] group-hover:bg-[#1a1a1a] transition-all shadow-sm">
              <Atom className="w-7 h-7 text-[#ffffff]" />
            </div>
          </Link>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#2b2b2b] tracking-tight">
            Join Quantum<span className="quantum-gradient-text">Learn</span> AI
          </h2>
          <p className="text-xs sm:text-sm text-[#2b2b2b]/70 max-w-md mx-auto font-normal">
            Create your account to start building circuits, writing Qiskit code, and learning quantum algorithms.
          </p>
        </div>

        {/* Register Card */}
        <Card variant="glow" padding="lg" className="border-[#d4d4d4] shadow-xl bg-[#ffffff]">
          {errorMsg && (
            <div className="mb-5">
              <ErrorState type="error" message={errorMsg} />
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Role Selection Tabs */}
            <div>
              <label className="block text-xs font-bold text-[#2b2b2b]/80 uppercase tracking-wider mb-1.5">
                I am joining as a
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setRole('Student')}
                  className={`p-3 rounded-xl border text-center transition-all cursor-pointer select-none ${
                    role === 'Student'
                      ? 'bg-[#2b2b2b] border-[#2b2b2b] text-[#ffffff] shadow-xs'
                      : 'bg-[#fbfbfb] border-[#d4d4d4] text-[#2b2b2b]/70 hover:text-[#2b2b2b] hover:bg-[#f4f4f4]'
                  }`}
                >
                  <div className="text-xs font-bold flex items-center justify-center gap-1.5">
                    <GraduationCap className="w-4 h-4" />
                    <span>Student</span>
                  </div>
                  <span className="text-[10px] opacity-75 font-medium">Learn & Simulate</span>
                </button>

                <button
                  type="button"
                  onClick={() => setRole('Instructor')}
                  className={`p-3 rounded-xl border text-center transition-all cursor-pointer select-none ${
                    role === 'Instructor'
                      ? 'bg-[#2b2b2b] border-[#2b2b2b] text-[#ffffff] shadow-xs'
                      : 'bg-[#fbfbfb] border-[#d4d4d4] text-[#2b2b2b]/70 hover:text-[#2b2b2b] hover:bg-[#f4f4f4]'
                  }`}
                >
                  <div className="text-xs font-bold flex items-center justify-center gap-1.5">
                    <Sparkles className="w-4 h-4" />
                    <span>Instructor</span>
                  </div>
                  <span className="text-[10px] opacity-75 font-medium">Teach & Author</span>
                </button>
              </div>
            </div>

            {/* Full Name */}
            <Input
              label="Full Name"
              type="text"
              placeholder="e.g. Aarav Sharma"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              leftIcon={<User className="w-4 h-4" />}
              required
            />

            {/* Email Address */}
            <Input
              label="Email Address"
              type="email"
              placeholder="student@quantumlearn.ai"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              leftIcon={<Mail className="w-4 h-4" />}
              required
            />

            {/* Password */}
            <Input
              label="Password"
              type="password"
              placeholder="At least 6 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              leftIcon={<Lock className="w-4 h-4" />}
              hint="Must be at least 6 characters"
              required
            />

            {/* Education Level */}
            <div>
              <label className="block text-xs font-bold text-[#2b2b2b]/80 uppercase tracking-wider mb-1.5">
                Education Level
              </label>
              <select
                value={educationLevel}
                onChange={(e) => setEducationLevel(e.target.value as EducationLevel)}
                className="w-full bg-[#ffffff] text-[#2b2b2b] rounded-xl border border-[#d4d4d4] px-3.5 py-2.5 text-sm transition-all focus:outline-none focus:border-[#2b2b2b] focus:ring-2 focus:ring-[#2b2b2b]/15 cursor-pointer shadow-xs"
              >
                <option value="High School">High School (K-12)</option>
                <option value="Undergraduate">Undergraduate (B.Tech / B.Sc / BCA)</option>
                <option value="Postgraduate">Postgraduate (M.Tech / M.Sc / MS)</option>
                <option value="Researcher">Researcher / Ph.D.</option>
                <option value="Industry Professional">Industry Professional</option>
                <option value="Self-Taught / Enthusiast">Self-Taught / Enthusiast</option>
              </select>
            </div>

            {/* Quantum Experience */}
            <div>
              <label className="block text-xs font-bold text-[#2b2b2b]/80 uppercase tracking-wider mb-1.5">
                Quantum Experience Level
              </label>
              <select
                value={quantumExperience}
                onChange={(e) => setQuantumExperience(e.target.value as QuantumExperience)}
                className="w-full bg-[#ffffff] text-[#2b2b2b] rounded-xl border border-[#d4d4d4] px-3.5 py-2.5 text-sm transition-all focus:outline-none focus:border-[#2b2b2b] focus:ring-2 focus:ring-[#2b2b2b]/15 cursor-pointer shadow-xs"
              >
                <option value="Beginner (No background)">Beginner (No previous quantum background)</option>
                <option value="Intermediate (Basic linear algebra & python)">Intermediate (Basic linear algebra & Python)</option>
                <option value="Advanced (Experienced with quantum gates & Qiskit)">Advanced (Familiar with quantum gates & Qiskit)</option>
              </select>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full mt-3 font-semibold"
              isLoading={isLoading}
              rightIcon={<Check className="w-4 h-4" />}
            >
              Create Account & Get Started
            </Button>
          </form>
        </Card>

        {/* Footer Link */}
        <div className="text-center text-xs text-[#2b2b2b]/70">
          Already have an account?{' '}
          <Link to="/login" className="text-[#2b2b2b] hover:underline font-bold inline-flex items-center gap-1">
            <span>Sign In</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
