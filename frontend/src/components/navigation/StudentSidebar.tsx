import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import {
  LayoutDashboard,
  BookOpen,
  Cpu,
  Terminal,
  Bot,
  FileQuestion,
  Trophy,
  TrendingUp,
  Award,
  UserCircle,
  Atom,
  ChevronLeft,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import Badge from '../common/Badge';

export interface StudentSidebarProps {
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
  isMobileOpen: boolean;
  setIsMobileOpen: (open: boolean) => void;
}

interface SidebarNavItem {
  label: string;
  path: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
}

const navItems: SidebarNavItem[] = [
  { label: 'Dashboard', path: '/student/dashboard', icon: LayoutDashboard },
  { label: 'Courses & Lessons', path: '/student/courses', icon: BookOpen },
  { label: 'Quantum Playground', path: '/student/playground', icon: Cpu },
  { label: 'Qiskit Lab', path: '/student/qiskit-lab', icon: Terminal },
  { label: 'AI Quantum Tutor', path: '/student/ai-tutor', icon: Bot },
  { label: 'Quizzes', path: '/student/quizzes', icon: FileQuestion },
  { label: 'Challenges', path: '/student/challenges', icon: Trophy },
  { label: 'My Progress', path: '/student/progress', icon: TrendingUp },
  { label: 'Achievements', path: '/student/achievements', icon: Award },
  { label: 'Student Profile', path: '/student/profile', icon: UserCircle },
];

export const StudentSidebar: React.FC<StudentSidebarProps> = ({
  isCollapsed,
  setIsCollapsed,
  isMobileOpen,
  setIsMobileOpen,
}) => {
  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/80 backdrop-blur-sm md:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed md:sticky top-0 z-50 h-screen flex flex-col border-r border-[#d4d4d4] bg-[#ffffff] transition-all duration-300 ${
          isCollapsed ? 'w-20' : 'w-64'
        } ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        {/* Sidebar Brand Header */}
        <div className="h-16 sm:h-20 flex items-center justify-between px-4 border-b border-[#d4d4d4]">
          <Link
            to="/student/dashboard"
            onClick={() => setIsMobileOpen(false)}
            className="flex items-center gap-3 overflow-hidden"
          >
            <div className="p-2 rounded-xl bg-[#2b2b2b] border border-[#2b2b2b] shrink-0 shadow-xs">
              <Atom className="w-5 h-5 text-[#ffffff]" />
            </div>
            {!isCollapsed && (
              <div className="truncate">
                <span className="font-bold text-sm tracking-tight text-[#2b2b2b] block truncate">
                  Quantum<span className="quantum-gradient-text">Learn</span>
                </span>
                <span className="text-[10px] text-[#2b2b2b]/80 font-bold font-mono block -mt-0.5">
                  STUDENT PORTAL
                </span>
              </div>
            )}
          </Link>

          {/* Desktop Collapse Toggle */}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="hidden md:flex p-1.5 rounded-lg text-[#2b2b2b]/60 hover:text-[#2b2b2b] hover:bg-[#d4d4d4]/30 transition-colors cursor-pointer"
            title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
          >
            {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Navigation List */}
        <div className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => setIsMobileOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3.5 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all group relative ${
                    isActive
                      ? 'bg-[#f4f4f4] text-[#2b2b2b] border-l-4 border-l-[#2b2b2b] shadow-xs'
                      : 'text-[#2b2b2b]/70 hover:text-[#2b2b2b] hover:bg-[#f4f4f4] border border-transparent'
                  }`
                }
                title={isCollapsed ? item.label : undefined}
              >
                <Icon className="w-5 h-5 shrink-0 transition-colors group-hover:text-[#2b2b2b]" />
                {!isCollapsed && (
                  <div className="flex-1 flex items-center justify-between truncate">
                    <span className="truncate">{item.label}</span>
                    {item.badge && (
                      <Badge variant="purple" size="xs" className="shrink-0 text-[9px] py-0 px-1.5">
                        {item.badge}
                      </Badge>
                    )}
                  </div>
                )}
              </NavLink>
            );
          })}
        </div>

        {/* Bottom Quantum Badge */}
        {!isCollapsed && (
          <div className="p-4 border-t border-[#d4d4d4]">
            <div className="p-3 rounded-xl bg-[#ffffff] border border-[#d4d4d4] shadow-xs">
              <div className="flex items-center gap-2 mb-1">
                <Sparkles className="w-3.5 h-3.5 text-[#2b2b2b]" />
                <span className="text-xs font-bold text-[#2b2b2b]">Quantum Engine</span>
              </div>
              <p className="text-[11px] text-[#2b2b2b]/65 leading-tight">
                Aer Simulator & Qiskit ready for algorithms.
              </p>
            </div>
          </div>
        )}
      </aside>
    </>
  );
};

export default StudentSidebar;
