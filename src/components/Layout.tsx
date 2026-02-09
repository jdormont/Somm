import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { Wine, LayoutDashboard, ScanLine, Heart, Settings, LogOut, BookOpen, Shield, GraduationCap } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useState, useEffect } from 'react';
import OnboardingModal from './OnboardingModal';
import { supabase } from '../lib/supabase';

const baseNavItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/scan', icon: ScanLine, label: 'Scan' },
  { to: '/cellar', icon: BookOpen, label: 'Cellar' },
  { to: '/preferences', icon: Heart, label: 'Tastes' },
  { to: '/knowledge', icon: GraduationCap, label: 'Learn' },
  { to: '/settings', icon: Settings, label: 'Settings' },
];

export default function Layout() {
  const { user, signOut, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    checkOnboardingStatus();
  }, [user]);

  const checkOnboardingStatus = async () => {
    if (!user) return;
    
    // Check local dismissal first
    if (localStorage.getItem('somm_onboarding_dismissed') === 'true') {
        return;
    }

    // Check if user has completed onboarding
    const { data } = await supabase
      .from('user_profiles')
      .select('onboarding_completed, approved')
      .eq('user_id', user.id)
      .maybeSingle();

    // Show modal if approved but NOT completed onboarding
    if (data?.approved && !data.onboarding_completed) {
      setShowOnboarding(true);
    }
  };


  const navItems = isAdmin
    ? [...baseNavItems, { to: '/admin', icon: Shield, label: 'Admin' }]
    : baseNavItems;

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-wine-slate-950 text-stone-300 md:flex flex-row">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-64 flex-col fixed inset-y-0 left-0 bg-wine-slate-950 border-r border-white/5 z-40">
        <div className="h-20 flex items-center px-6 border-b border-white/5">
          <NavLink to="/dashboard" className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-full bg-somm-red-900/20 text-somm-red-500">
               <Wine className="w-5 h-5" />
            </div>
            <span className="font-serif font-bold text-xl text-champagne-100 tracking-wide">Somm</span>
          </NavLink>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto scrollbar-thin scrollbar-thumb-white/10">
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300 ${
                  isActive
                    ? 'bg-somm-red-900/10 text-champagne-100 shadow-[0_0_15px_-5px_rgba(212,196,163,0.1)] border border-somm-red-500/10'
                    : 'text-stone-500 hover:text-stone-300 hover:bg-white/5 border border-transparent'
                }`
              }
            >
              <Icon className={`w-5 h-5 transition-colors ${ ({ isActive }: { isActive: boolean }) => isActive ? 'text-champagne-400' : 'text-stone-600' }`} />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="px-4 py-6 border-t border-white/5">
          <button
            onClick={handleSignOut}
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-stone-500 hover:text-somm-red-400 hover:bg-somm-red-900/10 transition-all w-full border border-transparent hover:border-somm-red-500/10"
          >
            <LogOut className="w-5 h-5" />
            Sign out
          </button>
        </div>
      </aside>

      {/* Mobile Bottom Nav */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-wine-slate-950/90 backdrop-blur-xl border-t border-white/10 safe-area-bottom">
        <nav className="flex items-center justify-around px-2 py-3">
          {navItems.slice(0, 5).map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex flex-col items-center gap-1.5 px-2 py-1 rounded-xl text-[10px] font-medium transition-all ${
                  isActive ? 'text-champagne-400' : 'text-stone-500'
                }`
              }
            >
              <Icon className={`w-6 h-6 ${ ({ isActive }: { isActive: boolean }) => isActive ? 'text-champagne-400 drop-shadow-[0_0_8px_rgba(212,196,163,0.3)]' : 'text-stone-600' }`} />
              <span className="tracking-wide">{label}</span>
            </NavLink>
          ))}
        </nav>
      </div>

      {/* Main Content Area */}
      <main className="flex-1 md:ml-64 pb-24 md:pb-0 bg-wine-slate-950 min-h-screen">
        <Outlet />
      </main>

      {showOnboarding && (
        <OnboardingModal onComplete={() => setShowOnboarding(false)} />
      )}
    </div>
  );
}
