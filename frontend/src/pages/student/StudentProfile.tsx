import React, { useState } from 'react';
import { User, Mail, GraduationCap, Sparkles, Shield, Save, Check } from 'lucide-react';
import PageContainer from '../../components/common/PageContainer';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import { useAuth } from '../../contexts/AuthContext';

export const StudentProfile: React.FC = () => {
  const { user, logout } = useAuth();
  const [saved, setSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <PageContainer
      title="Student Profile & Quantum Settings"
      subtitle="Manage your identity, academic background, and learning preferences."
      badge={<Badge variant="cyan" size="sm">Profile Settings</Badge>}
    >
      <div className="max-w-3xl space-y-6">
        <Card variant="glass" className="p-6 sm:p-8">
          <form onSubmit={handleSave} className="space-y-5">
            <div className="flex items-center gap-4 pb-6 border-b border-white/5">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-cyan-500 to-purple-600 flex items-center justify-center text-white font-bold text-2xl shadow-lg shadow-cyan-500/20">
                {user?.full_name?.charAt(0) || 'S'}
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">{user?.full_name}</h3>
                <p className="text-xs text-slate-400">{user?.email}</p>
                <div className="mt-1.5">
                  <Badge variant="cyan" size="xs">{user?.role || 'Student'}</Badge>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Full Name"
                defaultValue={user?.full_name || ''}
                leftIcon={<User className="w-4 h-4" />}
              />
              <Input
                label="Email Address"
                defaultValue={user?.email || ''}
                disabled
                leftIcon={<Mail className="w-4 h-4" />}
                hint="Managed by institution login"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Education Level
                </label>
                <select
                  defaultValue={user?.education_level || 'Undergraduate'}
                  className="w-full bg-[#0b0f19] text-slate-100 rounded-xl border border-slate-700/80 px-3.5 py-2.5 text-sm focus:outline-none focus:border-cyan-400"
                >
                  <option value="High School">High School (K-12)</option>
                  <option value="Undergraduate">Undergraduate (B.Tech / B.Sc / BCA)</option>
                  <option value="Postgraduate">Postgraduate (M.Tech / M.Sc / MS)</option>
                  <option value="Researcher">Researcher / Ph.D.</option>
                  <option value="Industry Professional">Industry Professional</option>
                  <option value="Self-Taught / Enthusiast">Self-Taught / Enthusiast</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Quantum Experience
                </label>
                <select
                  defaultValue={user?.quantum_experience || 'Beginner (No background)'}
                  className="w-full bg-[#0b0f19] text-slate-100 rounded-xl border border-slate-700/80 px-3.5 py-2.5 text-sm focus:outline-none focus:border-cyan-400"
                >
                  <option value="Beginner (No background)">Beginner</option>
                  <option value="Intermediate (Basic linear algebra & python)">Intermediate</option>
                  <option value="Advanced (Experienced with quantum gates & Qiskit)">Advanced</option>
                </select>
              </div>
            </div>

            <div className="pt-4 border-t border-white/5 flex items-center justify-between">
              {saved ? (
                <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1.5">
                  <Check className="w-4 h-4" /> Preferences updated successfully!
                </span>
              ) : (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={logout}
                  className="text-rose-400 hover:text-rose-300 hover:bg-rose-950/30"
                >
                  Sign Out
                </Button>
              )}
              <Button
                type="submit"
                variant="primary"
                size="md"
                leftIcon={<Save className="w-4 h-4" />}
              >
                Save Preferences
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </PageContainer>
  );
};

export default StudentProfile;
