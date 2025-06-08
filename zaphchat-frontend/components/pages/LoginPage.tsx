import React, { useState } from 'react';
import GlassCard from '../GlassCard';
import PremiumButton from '../PremiumButton';
import { useAuth } from '../../AuthContext';

interface LoginPageProps { onShowRegister?: () => void; }

const LoginPage: React.FC<LoginPageProps> = ({ onShowRegister }) => {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await login(email, password);
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
          <h2 className="text-2xl font-semibold text-slate-100 text-center mb-4">Login to ZaphChat</h2>
          {error && <p className="text-red-500 text-sm text-center">{error}</p>}
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
        <div className="pt-2 text-center">
          <PremiumButton type="submit" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign In'}
          </PremiumButton>
        </div>
        {onShowRegister && (
          <p className="text-sm text-slate-300 text-center pt-2">
            Don't have an account?{' '}
            <button type="button" onClick={onShowRegister} className="text-cyan-400 hover:underline">
              Register
            </button>
          </p>
        )}
      </form>
      </GlassCard>
    </div>
  );
};

export default LoginPage;
