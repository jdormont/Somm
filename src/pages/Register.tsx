import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Wine, ArrowLeft, Loader2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export default function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signUp } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    const { error } = await signUp(email, password);
    if (error) {
      setError(error);
      setLoading(false);
    } else {
      navigate('/pending');
    }
  };

  return (
    <div className="min-h-screen bg-wine-slate-950 flex flex-col">
      <div className="p-6">
        <Link to="/" className="inline-flex items-center gap-2 text-stone-400 hover:text-champagne-100 transition-colors text-sm">
          <ArrowLeft className="w-4 h-4" />
          Back
        </Link>
      </div>

      <div className="flex-1 flex items-center justify-center px-6 pb-20">
        <div className="w-full max-w-sm">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-somm-red-900/20 text-somm-red-500 mb-4 border border-somm-red-500/20">
              <Wine className="w-6 h-6" />
            </div>
            <h1 className="text-3xl font-serif font-bold text-champagne-100">Create your account</h1>
            <p className="text-stone-400 text-sm mt-2">Start making better wine decisions</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-red-900/20 border border-red-500/20 text-red-200 text-sm rounded-xl px-4 py-3">
                {error}
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-stone-400 mb-1.5">Email</label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-white/10 bg-wine-slate-900/50 text-champagne-100 placeholder:text-stone-600 focus:outline-none focus:ring-1 focus:ring-champagne-400/50 focus:border-champagne-400/50 transition-all text-sm"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-stone-400 mb-1.5">Password</label>
              <input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-white/10 bg-wine-slate-900/50 text-champagne-100 placeholder:text-stone-600 focus:outline-none focus:ring-1 focus:ring-champagne-400/50 focus:border-champagne-400/50 transition-all text-sm"
                placeholder="At least 6 characters"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-somm-red-900 border border-somm-red-500/30 text-champagne-100 py-2.5 rounded-xl font-medium text-sm hover:bg-somm-red-500 hover:text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-somm-red-900/20"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Creating account...
                </>
              ) : (
                'Create account'
              )}
            </button>
          </form>

          <p className="text-center text-sm text-stone-500 mt-8">
            Already have an account?{' '}
            <Link to="/login" className="text-champagne-400 font-medium hover:text-champagne-100 transition-colors">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
