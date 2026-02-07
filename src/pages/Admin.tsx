import { useState, useEffect } from 'react';
import { Shield, UserCheck, UserX, Loader2, Users, Clock, CheckCircle2, Key } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

interface UserProfileRow {
  id: string;
  user_id: string;
  email: string;
  role: string;
  approved: boolean;
  use_shared_key: boolean;
  created_at: string;
}

type FilterTab = 'pending' | 'approved' | 'all';

export default function Admin() {
  const { user } = useAuth();
  const [profiles, setProfiles] = useState<UserProfileRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [filter, setFilter] = useState<FilterTab>('pending');

  useEffect(() => {
    if (user) loadProfiles();
  }, [user]);

  const loadProfiles = async () => {
    const { data } = await supabase
      .from('user_profiles')
      .select('*')
      .order('created_at', { ascending: false });

    setProfiles(data || []);
    setLoading(false);
  };

  const updateApproval = async (profileId: string, approved: boolean) => {
    setUpdatingId(profileId);
    await supabase
      .from('user_profiles')
      .update({ approved })
      .eq('id', profileId);
    setProfiles((prev) =>
      prev.map((p) => (p.id === profileId ? { ...p, approved } : p))
    );
    setUpdatingId(null);
  };

  const updateRole = async (profileId: string, role: string) => {
    setUpdatingId(profileId);
    await supabase
      .from('user_profiles')
      .update({ role })
      .eq('id', profileId);
    setProfiles((prev) =>
      prev.map((p) => (p.id === profileId ? { ...p, role } : p))
    );
    setUpdatingId(null);
  };

  const updateSharedKey = async (profileId: string, useSharedKey: boolean) => {
    setUpdatingId(profileId);
    await supabase
      .from('user_profiles')
      .update({ use_shared_key: useSharedKey })
      .eq('id', profileId);
    setProfiles((prev) =>
      prev.map((p) => (p.id === profileId ? { ...p, use_shared_key: useSharedKey } : p))
    );
    setUpdatingId(null);
  };

  const filtered = profiles.filter((p) => {
    if (filter === 'pending') return !p.approved;
    if (filter === 'approved') return p.approved;
    return true;
  });

  const pendingCount = profiles.filter((p) => !p.approved).length;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-6 h-6 text-champagne-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-6 py-8">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 rounded-xl bg-somm-red-900/20 flex items-center justify-center border border-somm-red-500/20">
          <Shield className="w-5 h-5 text-somm-red-500" />
        </div>
        <div>
          <h1 className="text-2xl font-serif text-champagne-100">User Management</h1>
          <p className="text-sm font-light text-stone-400">
            {profiles.length} user{profiles.length !== 1 ? 's' : ''} total
            {pendingCount > 0 && (
              <span className="text-amber-400 font-medium"> / {pendingCount} pending</span>
            )}
          </p>
        </div>
      </div>

      <div className="flex gap-1 mb-6 bg-white/5 rounded-xl p-1 border border-white/5">
        {([
          { key: 'pending' as FilterTab, label: 'Pending', icon: Clock, count: pendingCount },
          { key: 'approved' as FilterTab, label: 'Approved', icon: CheckCircle2, count: profiles.filter((p) => p.approved).length },
          { key: 'all' as FilterTab, label: 'All', icon: Users, count: profiles.length },
        ]).map(({ key, label, icon: Icon, count }) => (
          <button
            key={key}
            onClick={() => setFilter(key)}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all ${
              filter === key
                ? 'bg-wine-slate-900/80 text-champagne-100 shadow-sm border border-white/10'
                : 'text-stone-500 hover:text-stone-300 hover:bg-white/5'
            }`}
          >
            <Icon className="w-4 h-4" />
            {label}
            <span className={`text-xs px-1.5 py-0.5 rounded-full ${
              filter === key ? 'bg-champagne-400/20 text-champagne-100' : 'bg-white/5 text-stone-500'
            }`}>
              {count}
            </span>
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-16">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-white/5 mb-4 border border-white/5">
            <Users className="w-6 h-6 text-stone-500" />
          </div>
          <p className="text-stone-400 text-sm font-light">
            {filter === 'pending' ? 'No pending users' : 'No users found'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((profile) => {
            const isSelf = profile.user_id === user?.id;
            const isUpdating = updatingId === profile.id;

            return (
              <div
                key={profile.id}
                className="bg-wine-slate-900/40 backdrop-blur-sm border border-white/5 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 hover:bg-wine-slate-900/60 transition-all hover:border-white/10"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-champagne-100 truncate">
                      {profile.email}
                    </p>
                    {isSelf && (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-champagne-400/20 text-champagne-100 font-light flex-shrink-0 border border-champagne-400/20">
                        You
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3 mt-1 text-xs text-stone-500 font-light">
                    <span>
                      Joined {new Date(profile.created_at).toLocaleDateString()}
                    </span>
                    <span className={`font-medium ${
                      profile.role === 'admin' ? 'text-somm-red-400' : 'text-stone-400'
                    }`}>
                      {profile.role}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-wrap sm:flex-shrink-0">
                  {!isSelf && (
                    <>
                      {profile.role !== 'admin' ? (
                        <button
                          onClick={() => updateRole(profile.id, 'admin')}
                          disabled={isUpdating}
                          className="text-xs px-4 py-2 rounded-lg border border-white/10 text-stone-400 hover:bg-white/5 hover:text-stone-200 transition-colors disabled:opacity-50 font-medium"
                          title="Make admin"
                        >
                          <Shield className="w-3.5 h-3.5" />
                        </button>
                      ) : (
                        <button
                          onClick={() => updateRole(profile.id, 'user')}
                          disabled={isUpdating}
                          className="text-xs px-4 py-2 rounded-lg border border-somm-red-500/20 text-somm-red-400 bg-somm-red-900/20 hover:bg-somm-red-900/40 transition-colors disabled:opacity-50 font-medium"
                          title="Remove admin"
                        >
                          <Shield className="w-3.5 h-3.5" />
                        </button>
                      )}

                      {profile.approved ? (
                        <button
                          onClick={() => updateApproval(profile.id, false)}
                          disabled={isUpdating}
                          className="flex items-center gap-1.5 text-xs px-4 py-2 rounded-lg border border-red-500/20 text-red-400 hover:bg-red-500/10 transition-colors disabled:opacity-50 font-medium"
                        >
                          {isUpdating ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <UserX className="w-3.5 h-3.5" />
                          )}
                          Revoke
                        </button>
                      ) : (
                        <button
                          onClick={() => updateApproval(profile.id, true)}
                          disabled={isUpdating}
                          className="flex items-center gap-1.5 text-xs px-4 py-2 rounded-lg bg-emerald-600/90 text-white hover:bg-emerald-600 transition-colors disabled:opacity-50 font-medium shadow-sm"
                        >
                          {isUpdating ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <UserCheck className="w-3.5 h-3.5" />
                          )}
                          Approve
                        </button>
                      )}
                      
                      {profile.approved && (
                        <button
                          onClick={() => updateSharedKey(profile.id, !profile.use_shared_key)}
                          disabled={isUpdating}
                          className={`flex items-center gap-1.5 text-xs px-3 py-2 rounded-lg border transition-colors disabled:opacity-50 font-medium ${
                            profile.use_shared_key
                              ? 'bg-amber-500/10 border-amber-500/20 text-amber-400 hover:bg-amber-500/20'
                              : 'bg-white/5 border-white/10 text-stone-400 hover:bg-white/10 hover:text-stone-300'
                          }`}
                          title={profile.use_shared_key ? 'Using shared API key' : 'Using own API key'}
                        >
                          <Key className="w-3.5 h-3.5" />
                          {profile.use_shared_key ? 'Shared Key' : 'Own Key'}
                        </button>
                      )}
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
