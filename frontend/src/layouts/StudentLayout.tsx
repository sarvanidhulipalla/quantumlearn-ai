import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import StudentSidebar from '../components/navigation/StudentSidebar';
import Topbar from '../components/navigation/Topbar';

export const StudentLayout: React.FC = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#ffffff] text-[#2b2b2b] flex">
      {/* Sidebar Navigation */}
      <StudentSidebar
        isCollapsed={isCollapsed}
        setIsCollapsed={setIsCollapsed}
        isMobileOpen={isMobileOpen}
        setIsMobileOpen={setIsMobileOpen}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-x-hidden">
        {/* Topbar Header */}
        <Topbar onMobileMenuToggle={() => setIsMobileOpen(!isMobileOpen)} />

        {/* Dynamic Nested Route Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default StudentLayout;
