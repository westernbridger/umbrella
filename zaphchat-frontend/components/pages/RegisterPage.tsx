import React, { useState } from 'react';
import GlassCard from '../GlassCard';
import PremiumButton from '../PremiumButton';
import { useAuth } from '../../AuthContext';

interface RegisterPageProps { onShowLogin?: () => void; onRegistered?: (name: string) => void; }

const RegisterPage: React.FC<RegisterPageProps> = ({ onShowLogin, onRegistered }) => {
  const { register } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (password !== confirm) {
      setError('Passwords do not match');
      return;
    }
    setLoading(true);
    try {
      await register(name, email, password);
      onRegistered && onRegistered(name);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen p-4 bg-slate-900">
      <GlassCard className="w-full max-w-md">
        <form onSubmit={handleSubmit} className="space-y-4">
          <h2 className="text-2xl font-semibold text-slate-100 text-center mb-4">Create an account</h2>
          {error && <p className="text-red-500 text-sm text-center">{error}</p>}
          <div>
            <label className="block text-sm font-medium text-slate-200 mb-1">Full Name</label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full bg-slate-700/60 border border-slate-600/80 rounded-lg px-3 py-2 text-slate-100 focus:ring-cyan-500 focus:border-cyan-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-200 mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full bg-slate-700/60 border border-slate-600/80 rounded-lg px-3 py-2 text-slate-100 focus:ring-cyan-500 focus:border-cyan-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-200 mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full bg-slate-700/60 border border-slate-600/80 rounded-lg px-3 py-2 text-slate-100 focus:ring-cyan-500 focus:border-cyan-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-200 mb-1">Confirm Password</label>
            <input
              type="password"
              value={confirm}
              onChange={e => setConfirm(e.target.value)}
              className="w-full bg-slate-700/60 border border-slate-600/80 rounded-lg px-3 py-2 text-slate-100 focus:ring-cyan-500 focus:border-cyan-500"
              required
            />
          </div>
          <div className="pt-2 text-center">
            <PremiumButton type="submit" disabled={loading}>
              {loading ? 'Creating account...' : 'Sign Up'}
            </PremiumButton>
          </div>
          {onShowLogin && (
            <p className="text-sm text-slate-300 text-center pt-2">
              Already have an account?{' '}
              <button type="button" onClick={onShowLogin} className="text-cyan-400 hover:underline">
                Log In
              </button>
            </p>
          )}
        </form>
      </GlassCard>
    </div>
  );
};

export default RegisterPage;
