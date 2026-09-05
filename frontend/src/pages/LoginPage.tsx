import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Atom, Mail, Lock, LogIn, ArrowRight, UserCheck, Shield } from 'lucide-react';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import Card from '../components/common/Card';
import ErrorState from '../components/common/ErrorState';
import Badge from '../components/common/Badge';
import { useAuth } from '../contexts/AuthContext';

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = (location.state as { from?: { pathname: string } })?.from?.pathname;

  const handleLogin = async (loginEmail: string, loginPass: string) => {
    if (!loginEmail || !loginPass) {
      setErrorMsg('Please enter both email and password.');
      return;
    }
    setErrorMsg(null);
    setIsLoading(true);

    try {
      await login({ email: loginEmail, password: loginPass });
      const userCached = JSON.parse(localStorage.getItem('ql_user') || '{}');
      if (from) {
        navigate(from, { replace: true });
      } else if (userCached.role === 'Instructor') {
        navigate('/instructor/dashboard', { replace: true });
      } else {
        navigate('/student/dashboard', { replace: true });
      }
    } catch (err: unknown) {
      const error = err as { response?: { data?: { detail?: string }; status?: number }; message?: string };
      if (error.response?.data?.detail) {
        setErrorMsg(error.response.data.detail);
      } else if (!error.response) {
        setErrorMsg('Unable to reach QuantumLearn AI backend server (http://localhost:8000). Please check backend connection.');
      } else if (error.response.status === 401) {
        setErrorMsg('Invalid email or password. Please verify your credentials.');
      } else {
        setErrorMsg(error.message || 'An unexpected error occurred during sign in.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleLogin(email, password);
  };

  // Quick 1-click demo login helper
  const handleInstantDemoLogin = (role: 'Student' | 'Instructor') => {
    const demoEmail = role === 'Student' ? 'student@quantumlearn.ai' : 'instructor@quantumlearn.ai';
    const demoPass = 'QuantumLearn2026!';
    setEmail(demoEmail);
    setPassword(demoPass);
    handleLogin(demoEmail, demoPass);
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 sm:px-6 lg:px-8 py-12">
      <div className="w-full max-w-md space-y-6">
        {/* Header Branding */}
        <div className="text-center space-y-2">
          <Link to="/" className="inline-flex items-center gap-2 mb-2 group">
            <div className="p-2.5 rounded-2xl bg-[#2b2b2b] border border-[#2b2b2b] group-hover:bg-[#1a1a1a] transition-all shadow-sm">
              <Atom className="w-7 h-7 text-[#ffffff]" />
            </div>
          </Link>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#2b2b2b] tracking-tight">
            Welcome back to Quantum<span className="quantum-gradient-text">Learn</span>
          </h2>
          <p className="text-xs sm:text-sm text-[#2b2b2b]/70 font-normal">
            Sign in to access your quantum circuits, lessons, and simulations.
          </p>
        </div>

        {/* Login Card */}
        <Card variant="glow" padding="lg" className="border-[#d4d4d4] shadow-xl bg-[#ffffff]">
          {errorMsg && (
            <div className="mb-5">
              <ErrorState type="error" message={errorMsg} />
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Email Address"
              type="email"
              placeholder="you@university.edu"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              leftIcon={<Mail className="w-4 h-4" />}
              required
            />

            <Input
              label="Password"
              type="password"
              placeholder="••••••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              leftIcon={<Lock className="w-4 h-4" />}
              required
            />

            <div className="flex items-center justify-between text-xs pt-1">
              <label className="flex items-center gap-2 text-[#2b2b2b]/70 cursor-pointer select-none font-medium">
                <input
                  type="checkbox"
                  defaultChecked
                  className="rounded border-[#d4d4d4] bg-white text-[#2b2b2b] focus:ring-[#2b2b2b]"
                />
                <span>Remember me</span>
              </label>
              <a href="#" className="text-[#2b2b2b] hover:underline font-semibold">
                Forgot password?
              </a>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full mt-2 font-semibold"
              isLoading={isLoading}
              rightIcon={<LogIn className="w-4 h-4" />}
            >
              Sign In to Platform
            </Button>
          </form>

          {/* Quick Demo Autofill section */}
          <div className="mt-6 pt-5 border-t border-[#d4d4d4]">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] font-bold text-[#2b2b2b]/70 uppercase tracking-wider">
                Instant Demo Accounts
              </span>
              <Badge variant="purple" size="xs">1-Click Sign In</Badge>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleInstantDemoLogin('Student')}
                disabled={isLoading}
                className="p-2.5 rounded-xl bg-[#fbfbfb] border border-[#d4d4d4] hover:border-[#2b2b2b] hover:bg-[#f4f4f4] text-left transition-all text-xs cursor-pointer group disabled:opacity-50"
              >
                <div className="flex items-center gap-1.5 text-[#2b2b2b] font-bold mb-0.5">
                  <UserCheck className="w-3.5 h-3.5" />
                  <span>Student Demo</span>
                </div>
                <p className="text-[10px] text-[#2b2b2b]/60 font-medium">Aarav Sharma • Instant Sign In</p>
              </button>

              <button
                type="button"
                onClick={() => handleInstantDemoLogin('Instructor')}
                disabled={isLoading}
                className="p-2.5 rounded-xl bg-[#fbfbfb] border border-[#d4d4d4] hover:border-[#2b2b2b] hover:bg-[#f4f4f4] text-left transition-all text-xs cursor-pointer group disabled:opacity-50"
              >
                <div className="flex items-center gap-1.5 text-[#2b2b2b] font-bold mb-0.5">
                  <Shield className="w-3.5 h-3.5" />
                  <span>Instructor Demo</span>
                </div>
                <p className="text-[10px] text-[#2b2b2b]/60 font-medium">Dr. Priya Iyer • Instant Sign In</p>
              </button>
            </div>
          </div>
        </Card>

        {/* Footer Link */}
        <div className="text-center text-xs text-[#2b2b2b]/70">
          Don&apos;t have an account yet?{' '}
          <Link to="/register" className="text-[#2b2b2b] hover:underline font-bold inline-flex items-center gap-1">
            <span>Register for Free</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
