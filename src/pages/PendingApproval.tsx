import { useNavigate } from 'react-router-dom';
import { Wine, Clock, LogOut } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export default function PendingApproval() {
  const { user, signOut, isApproved, loading } = useAuth();
  const navigate = useNavigate();

  if (!loading && isApproved) {
    navigate('/dashboard', { replace: true });
    return null;
  }

  if (!loading && !user) {
    navigate('/login', { replace: true });
    return null;
  }

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-cream-50 flex items-center justify-center px-6">
      <div className="max-w-md w-full text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-amber-50 border border-amber-200 mb-6">
          <Clock className="w-8 h-8 text-amber-600" />
        </div>

        <h1 className="text-2xl font-bold text-stone-900 mb-2">Awaiting Approval</h1>
        <p className="text-stone-500 text-sm leading-relaxed mb-2">
          Your account has been created, but an administrator needs to approve it before you can access the app.
        </p>
        <p className="text-stone-400 text-xs mb-8">
          Signed in as {user?.email}
        </p>

        <div className="bg-white rounded-2xl border border-stone-200 p-6 mb-6">
          <div className="flex items-center gap-3 justify-center text-stone-600">
            <Wine className="w-5 h-5 text-wine-800" />
            <span className="text-sm font-medium">You'll be notified once approved</span>
          </div>
        </div>

        <button
          onClick={handleSignOut}
          className="inline-flex items-center gap-2 text-sm text-stone-500 hover:text-red-600 transition-colors font-medium"
        >
          <LogOut className="w-4 h-4" />
          Sign out
        </button>
      </div>
    </div>
  );
}
