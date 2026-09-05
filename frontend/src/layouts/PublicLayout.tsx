import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../components/navigation/Navbar';
import CircuitWave from '../components/visual/CircuitWave';

export const PublicLayout: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#ffffff] text-[#2b2b2b] flex flex-col relative overflow-hidden">
      {/* Dynamic Quantum Background Canvas */}
      <CircuitWave />

      {/* Top Navbar */}
      <Navbar />

      {/* Main Public Outlet */}
      <main className="flex-1 relative z-10">
        <Outlet />
      </main>

      {/* Footer in Clean Monochrome */}
      <footer className="relative z-10 border-t border-[#d4d4d4] bg-[#fafafa] py-12 px-4 sm:px-6 lg:px-8 text-xs text-[#2b2b2b]/75">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-3 md:col-span-2">
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-base text-[#2b2b2b]">Quantum<span className="quantum-gradient-text">Learn</span> AI</span>
              <span className="bg-[#d4d4d4]/40 text-[#2b2b2b] border border-[#d4d4d4] text-[10px] px-2 py-0.5 rounded-full font-semibold">
                Interactive Learning
              </span>
            </div>
            <p className="max-w-sm text-[#2b2b2b]/75 leading-relaxed text-xs">
              AI-Based Interactive Quantum Algorithm Learning Platform. Empowering students, researchers, and developers to master quantum computing intuitively.
            </p>
            <p className="text-[11px] text-[#2b2b2b]/75">
              Tagline: <span className="text-[#2b2b2b] font-bold">Learn. Build. Run. Understand.</span>
            </p>
          </div>

          <div>
            <h4 className="font-bold text-[#2b2b2b] uppercase tracking-wider mb-3 text-xs">Learning Cycle</h4>
            <ul className="space-y-2 text-[#2b2b2b]/75">
              <li>Learn & Visualize</li>
              <li>Build Quantum Circuits</li>
              <li>Run Qiskit Simulations</li>
              <li>Understand & Practice</li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-[#2b2b2b] uppercase tracking-wider mb-3 text-xs">Platform Links</h4>
            <ul className="space-y-2 text-[#2b2b2b]/75">
              <li><a href="/login" className="hover:text-[#2b2b2b] hover:underline transition-colors font-medium">Student Login</a></li>
              <li><a href="/register" className="hover:text-[#2b2b2b] hover:underline transition-colors font-medium">Create Account</a></li>
              <li><a href="/login" className="hover:text-[#2b2b2b] hover:underline transition-colors font-medium">Instructor Portal</a></li>
            </ul>
          </div>
        </div>

        <div className="max-w-7xl mx-auto mt-8 pt-6 border-t border-[#d4d4d4] flex flex-col sm:flex-row items-center justify-between gap-4 text-[#2b2b2b]/60">
          <p>© 2026 QuantumLearn AI. All rights reserved.</p>
          <p className="font-mono text-[11px]">Built with React, Vite, FastAPI, Qiskit & Tailwind CSS</p>
        </div>
      </footer>
    </div>
  );
};

export default PublicLayout;
