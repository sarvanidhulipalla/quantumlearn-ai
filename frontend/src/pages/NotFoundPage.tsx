import React from 'react';
import { Link } from 'react-router-dom';
import { Atom, Home, ArrowLeft } from 'lucide-react';
import Button from '../components/common/Button';

export const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4">
      <div className="relative mb-6">
        <div className="w-24 h-24 rounded-3xl bg-slate-900 border border-purple-500/30 flex items-center justify-center shadow-xl shadow-purple-900/20">
          <Atom className="w-12 h-12 text-purple-400 animate-spin-slow" />
        </div>
      </div>

      <h1 className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight mb-2">
        404 <span className="quantum-gradient-text">• State Not Found</span>
      </h1>
      <p className="text-slate-400 text-sm max-w-md mb-8">
        The quantum state or route you are looking for has collapsed into an unobserved subspace.
      </p>

      <div className="flex items-center gap-3">
        <Link to="/">
          <Button variant="primary" leftIcon={<Home className="w-4 h-4" />}>
            Return Home
          </Button>
        </Link>
        <button onClick={() => window.history.back()}>
          <Button variant="outline" leftIcon={<ArrowLeft className="w-4 h-4" />}>
            Go Back
          </Button>
        </button>
      </div>
    </div>
  );
};

export default NotFoundPage;
