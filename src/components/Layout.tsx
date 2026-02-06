import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { Wine, LayoutDashboard, ScanLine, Heart, Settings, LogOut, BookOpen, Shield, GraduationCap } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const baseNavItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/scan', icon: ScanLine, label: 'Scan' },
  { to: '/cellar', icon: BookOpen, label: 'Cellar' },
  { to: '/preferences', icon: Heart, label: 'Tastes' },
  { to: '/knowledge', icon: GraduationCap, label: 'Learn' },
  { to: '/settings', icon: Settings, label: 'Settings' },
];

export default function Layout() {
  const { signOut, isAdmin } = useAuth();
  const navigate = useNavigate();

  const navItems = isAdmin
    ? [...baseNavItems, { to: '/admin', icon: Shield, label: 'Admin' }]
    : baseNavItems;

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-cream-50 flex">
      <aside className="hidden md:flex w-64 flex-col fixed inset-y-0 left-0 bg-white border-r border-stone-200/80 z-40">
        <div className="h-16 flex items-center px-6 border-b border-stone-100">
          <NavLink to="/dashboard" className="flex items-center gap-2.5">
            <Wine className="w-6 h-6 text-wine-800" />
            <span className="font-semibold text-lg text-stone-900 tracking-tight">Somm</span>
          </NavLink>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1">
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-wine-50 text-wine-800'
                    : 'text-stone-500 hover:text-stone-900 hover:bg-stone-50'
                }`
              }
            >
              <Icon className="w-5 h-5" />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="px-3 py-4 border-t border-stone-100">
          <button
            onClick={handleSignOut}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-stone-500 hover:text-red-600 hover:bg-red-50 transition-all w-full"
          >
            <LogOut className="w-5 h-5" />
            Sign out
          </button>
        </div>
      </aside>

      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-stone-200/80 safe-area-bottom">
        <nav className="flex items-center justify-around px-2 py-2">
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex flex-col items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                  isActive ? 'text-wine-800' : 'text-stone-400'
                }`
              }
            >
              <Icon className="w-5 h-5" />
              {label}
            </NavLink>
          ))}
          <button
            onClick={handleSignOut}
            className="flex flex-col items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-medium text-stone-400 hover:text-red-600 transition-all"
          >
            <LogOut className="w-5 h-5" />
            Out
          </button>
        </nav>
      </div>

      <main className="flex-1 md:ml-64 pb-20 md:pb-0">
        <Outlet />
      </main>
    </div>
  );
}
