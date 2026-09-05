import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import {
  LayoutDashboard,
  BookOpen,
  PlusCircle,
  FileText,
  FileQuestion,
  Trophy,
  Users,
  BarChart3,
  Atom,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
} from 'lucide-react';
import Badge from '../common/Badge';

export interface InstructorSidebarProps {
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
  isMobileOpen: boolean;
  setIsMobileOpen: (open: boolean) => void;
}

const instructorNavItems = [
  { label: 'Dashboard', path: '/instructor/dashboard', icon: LayoutDashboard },
  { label: 'Courses Management', path: '/instructor/courses', icon: BookOpen },
  { label: 'Create Course', path: '/instructor/courses/create', icon: PlusCircle },
  { label: 'Lessons & Content', path: '/instructor/lessons', icon: FileText },
  { label: 'Quiz Builder', path: '/instructor/quizzes', icon: FileQuestion },
  { label: 'Challenge Lab', path: '/instructor/challenges', icon: Trophy },
  { label: 'Student Cohorts', path: '/instructor/students', icon: Users },
  { label: 'Learning Analytics', path: '/instructor/analytics', icon: BarChart3 },
];

export const InstructorSidebar: React.FC<InstructorSidebarProps> = ({
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
            to="/instructor/dashboard"
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
                <span className="text-[10px] text-[#2b2b2b]/80 font-mono block -mt-0.5 font-bold">
                  INSTRUCTOR HUB
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
          {instructorNavItems.map((item) => {
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
                  </div>
                )}
              </NavLink>
            );
          })}
        </div>

        {/* Instructor Verified Badge */}
        {!isCollapsed && (
          <div className="p-4 border-t border-[#d4d4d4]">
            <div className="p-3 rounded-xl bg-[#ffffff] border border-[#d4d4d4] shadow-xs flex items-center gap-3">
              <ShieldCheck className="w-5 h-5 text-[#2b2b2b] shrink-0" />
              <div className="truncate">
                <p className="text-xs font-bold text-[#2b2b2b]">Course Faculty</p>
                <p className="text-[10px] text-[#2b2b2b]/65 truncate">Verified Educator</p>
              </div>
            </div>
          </div>
        )}
      </aside>
    </>
  );
};

export default InstructorSidebar;
