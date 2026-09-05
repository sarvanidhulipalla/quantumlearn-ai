import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Menu,
  Search,
  Bell,
  User,
  LogOut,
  ChevronDown,
  Sparkles,
  BookOpen,
  Trophy,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import Badge from '../common/Badge';

export interface TopbarProps {
  onMobileMenuToggle: () => void;
}

export const Topbar: React.FC<TopbarProps> = ({ onMobileMenuToggle }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const profileRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setShowProfileMenu(false);
      }
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      if (user?.role === 'Instructor') {
        navigate(`/instructor/courses?q=${encodeURIComponent(searchQuery)}`);
      } else {
        navigate(`/student/courses?q=${encodeURIComponent(searchQuery)}`);
      }
    }
  };

  const isInstructor = user?.role === 'Instructor';

  return (
    <header className="sticky top-0 z-30 h-16 sm:h-20 w-full border-b border-[#d4d4d4] bg-[#ffffff]/95 backdrop-blur-xl px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4">
      {/* Left: Mobile Sidebar Trigger & Global Search */}
      <div className="flex items-center gap-3 sm:gap-4 flex-1 max-w-lg">
        <button
          onClick={onMobileMenuToggle}
          className="md:hidden p-2 rounded-xl text-[#2b2b2b] hover:bg-[#d4d4d4]/20 focus:outline-none cursor-pointer"
          aria-label="Open Sidebar Menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Global Search Bar */}
        <form onSubmit={handleSearchSubmit} className="relative w-full">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#b3b3b3]">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            placeholder={isInstructor ? 'Search courses, modules, students...' : 'Search quantum algorithms, lessons, circuits...'}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#ffffff] text-xs sm:text-sm text-[#2b2b2b] placeholder-[#b3b3b3] rounded-xl border border-[#d4d4d4] pl-9 pr-4 py-2 sm:py-2.5 transition-all duration-200 focus:outline-none focus:border-[#2b2b2b] focus:ring-2 focus:ring-[#2b2b2b]/15 shadow-xs"
          />
        </form>
      </div>

      {/* Right: Notifications & Profile Menu */}
      <div className="flex items-center gap-3 shrink-0">
        {/* Role Badge Indicator */}
        <div className="hidden sm:block">
          <Badge variant={isInstructor ? 'purple' : 'cyan'} size="sm">
            {user?.role || 'Guest'}
          </Badge>
        </div>

        {/* Notification Bell Dropdown */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 rounded-xl text-[#2b2b2b] hover:bg-[#d4d4d4]/20 transition-colors cursor-pointer focus:outline-none"
            aria-label="View Notifications"
          >
            <Bell className="w-5 h-5" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#2b2b2b] animate-pulse" />
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 rounded-2xl bg-[#ffffff] border border-[#d4d4d4] shadow-xl p-4 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
              <div className="flex items-center justify-between pb-3 border-b border-[#d4d4d4] mb-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#2b2b2b]">
                  Notifications
                </h4>
                <span className="text-[10px] text-[#2b2b2b] font-bold font-mono">2 NEW</span>
              </div>
              <div className="space-y-2.5 text-xs">
                <div className="p-2.5 rounded-xl bg-[#fafafa] border border-[#d4d4d4]">
                  <div className="flex items-center gap-2 text-[#2b2b2b] font-bold mb-1">
                    <Sparkles className="w-3.5 h-3.5 text-[#2b2b2b]" />
                    <span>Welcome to QuantumLearn AI!</span>
                  </div>
                  <p className="text-[#2b2b2b]/70 text-[11px] leading-relaxed">
                    Interactive platform online. Explore quantum superposition and the Bloch sphere visualizer.
                  </p>
                </div>
                <div className="p-2.5 rounded-xl bg-[#fafafa] border border-[#d4d4d4]">
                  <div className="flex items-center gap-2 text-[#2b2b2b] font-bold mb-1">
                    <Trophy className="w-3.5 h-3.5 text-[#2b2b2b]" />
                    <span>Achievement Unlocked</span>
                  </div>
                  <p className="text-[#2b2b2b]/70 text-[11px] leading-relaxed">
                    Account created. You earned the starter &quot;First Qubit&quot; explorer badge!
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* User Profile Dropdown Menu */}
        <div className="relative" ref={profileRef}>
          <button
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="flex items-center gap-2.5 p-1 sm:p-1.5 rounded-xl hover:bg-[#d4d4d4]/20 transition-colors cursor-pointer focus:outline-none"
            aria-label="User profile menu"
          >
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-[#2b2b2b] flex items-center justify-center text-[#ffffff] font-bold text-xs sm:text-sm shadow-sm">
              {user?.full_name ? user.full_name.charAt(0).toUpperCase() : 'U'}
            </div>
            <div className="hidden lg:block text-left">
              <p className="text-xs font-bold text-[#2b2b2b] leading-tight truncate max-w-[130px]">
                {user?.full_name || 'Quantum Learner'}
              </p>
              <p className="text-[10px] text-[#2b2b2b]/60 leading-none mt-0.5 truncate max-w-[130px]">
                {user?.email}
              </p>
            </div>
            <ChevronDown className="w-4 h-4 text-[#2b2b2b]/60 hidden sm:block" />
          </button>

          {showProfileMenu && (
            <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-[#ffffff] border border-[#d4d4d4] shadow-xl p-2 z-50">
              <div className="px-3 py-2 border-b border-[#d4d4d4] mb-1">
                <p className="text-xs font-bold text-[#2b2b2b] truncate">{user?.full_name}</p>
                <p className="text-[11px] text-[#2b2b2b]/60 truncate">{user?.email}</p>
                <div className="mt-1.5">
                  <Badge variant={isInstructor ? 'purple' : 'cyan'} size="xs">
                    {user?.role}
                  </Badge>
                </div>
              </div>

              <Link
                to={isInstructor ? '/instructor/dashboard' : '/student/profile'}
                onClick={() => setShowProfileMenu(false)}
                className="flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-[#2b2b2b] hover:bg-[#d4d4d4]/20 rounded-xl transition-colors"
              >
                <User className="w-4 h-4 text-[#2b2b2b]" />
                <span>My Profile</span>
              </Link>

              <Link
                to="/"
                onClick={() => setShowProfileMenu(false)}
                className="flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-[#2b2b2b] hover:bg-[#d4d4d4]/20 rounded-xl transition-colors"
              >
                <BookOpen className="w-4 h-4 text-[#2b2b2b]" />
                <span>Platform Landing</span>
              </Link>

              <div className="my-1 border-t border-[#d4d4d4]" />

              <button
                onClick={() => {
                  setShowProfileMenu(false);
                  logout();
                  navigate('/login');
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer text-left"
              >
                <LogOut className="w-4 h-4" />
                <span>Log Out</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Topbar;
