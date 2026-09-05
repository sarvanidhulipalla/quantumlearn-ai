import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Atom, Menu, X, Sparkles, ChevronRight, User, LogOut } from 'lucide-react';
import Button from '../common/Button';
import Badge from '../common/Badge';
import { useAuth } from '../../contexts/AuthContext';

export const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handlePortalRedirect = () => {
    if (user?.role === 'Instructor') {
      navigate('/instructor/dashboard');
    } else {
      navigate('/student/dashboard');
    }
  };

  const handleHomeClick = (e: React.MouseEvent) => {
    if (location.pathname === '/') {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-[#d4d4d4] bg-[#ffffff]/95 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Logo & Brand */}
          <Link to="/" onClick={handleHomeClick} className="flex items-center gap-3 group">
            <div className="p-2 rounded-xl bg-[#2b2b2b] border border-[#2b2b2b] group-hover:bg-[#1a1a1a] transition-all duration-300 shadow-sm shadow-[#2b2b2b]/20">
              <Atom className="w-6 h-6 text-[#ffffff] group-hover:rotate-180 transition-transform duration-700" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-lg sm:text-xl tracking-tight text-[#2b2b2b]">
                  Quantum<span className="quantum-gradient-text">Learn</span>
                </span>
                <Badge variant="purple" size="xs">AI</Badge>
              </div>
              <span className="text-[10px] text-[#2b2b2b]/70 font-semibold tracking-wide uppercase block -mt-1 hidden sm:block">
                Interactive Learning
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-7 text-sm font-semibold text-[#2b2b2b]/80">
            <Link to="/" onClick={handleHomeClick} className="hover:text-[#2b2b2b] transition-colors">
              Home
            </Link>
            <a href="/#features" className="hover:text-[#2b2b2b] transition-colors">
              Features
            </a>
            <a href="/#how-it-works" className="hover:text-[#2b2b2b] transition-colors">
              How It Works
            </a>
            <a href="/#topics" className="hover:text-[#2b2b2b] transition-colors">
              Topics
            </a>
            <Link to="/student/playground" className="hover:text-[#2b2b2b] transition-colors flex items-center gap-1.5">
              <span>Playground</span>
              <span className="w-1.5 h-1.5 rounded-full bg-[#2b2b2b] animate-ping" />
            </Link>
            <Link to="/student/qiskit-lab" className="hover:text-[#2b2b2b] transition-colors">
              Qiskit Lab
            </Link>
          </nav>

          {/* Right Action Buttons */}
          <div className="hidden md:flex items-center gap-3">
            {isAuthenticated && user ? (
              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handlePortalRedirect}
                  leftIcon={<User className="w-4 h-4 text-[#2b2b2b]" />}
                >
                  {user.role} Portal
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={logout}
                  title="Logout"
                  className="text-[#2b2b2b]/70 hover:text-rose-600"
                >
                  <LogOut className="w-4 h-4" />
                </Button>
              </div>
            ) : (
              <>
                <Link to="/login">
                  <Button variant="ghost" size="sm">
                    Log In
                  </Button>
                </Link>
                <Link to="/register">
                  <Button
                    variant="primary"
                    size="sm"
                    rightIcon={<ChevronRight className="w-4 h-4" />}
                  >
                    Start Learning
                  </Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 rounded-xl text-[#2b2b2b] hover:bg-[#d4d4d4]/20 focus:outline-none"
              aria-label="Toggle Navigation Menu"
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {isOpen && (
        <div className="md:hidden border-b border-[#d4d4d4] bg-[#ffffff]/98 backdrop-blur-xl px-4 pt-3 pb-6 space-y-3">
          <Link
            to="/"
            onClick={(e) => {
              handleHomeClick(e);
              setIsOpen(false);
            }}
            className="block px-3 py-2 rounded-lg text-base font-semibold text-[#2b2b2b] hover:bg-[#d4d4d4]/20"
          >
            Home
          </Link>
          <a
            href="/#features"
            onClick={() => setIsOpen(false)}
            className="block px-3 py-2 rounded-lg text-base font-semibold text-[#2b2b2b] hover:bg-[#d4d4d4]/20"
          >
            Features
          </a>
          <a
            href="/#how-it-works"
            onClick={() => setIsOpen(false)}
            className="block px-3 py-2 rounded-lg text-base font-semibold text-[#2b2b2b] hover:bg-[#d4d4d4]/20"
          >
            How It Works
          </a>
          <a
            href="/#topics"
            onClick={() => setIsOpen(false)}
            className="block px-3 py-2 rounded-lg text-base font-semibold text-[#2b2b2b] hover:bg-[#d4d4d4]/20"
          >
            Topics
          </a>
          <Link
            to="/student/playground"
            onClick={() => setIsOpen(false)}
            className="block px-3 py-2 rounded-lg text-base font-semibold text-[#2b2b2b] hover:bg-[#d4d4d4]/20"
          >
            Quantum Playground
          </Link>
          <Link
            to="/student/qiskit-lab"
            onClick={() => setIsOpen(false)}
            className="block px-3 py-2 rounded-lg text-base font-semibold text-[#2b2b2b] hover:bg-[#d4d4d4]/20"
          >
            Qiskit Lab
          </Link>
          <div className="pt-4 border-t border-[#d4d4d4] flex flex-col gap-2">
            {isAuthenticated ? (
              <>
                <Button variant="primary" size="md" onClick={handlePortalRedirect}>
                  Enter {user?.role} Portal
                </Button>
                <Button variant="outline" size="md" onClick={logout}>
                  Log Out
                </Button>
              </>
            ) : (
              <>
                <Link to="/login" onClick={() => setIsOpen(false)}>
                  <Button variant="outline" size="md" className="w-full">
                    Log In
                  </Button>
                </Link>
                <Link to="/register" onClick={() => setIsOpen(false)}>
                  <Button variant="primary" size="md" className="w-full">
                    Start Learning
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
