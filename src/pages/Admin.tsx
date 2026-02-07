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
        <Loader2 className="w-6 h-6 text-wine-800 animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-6 py-8">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 rounded-xl bg-wine-50 flex items-center justify-center">
          <Shield className="w-5 h-5 text-wine-700" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-stone-900">User Management</h1>
          <p className="text-sm text-stone-500">
            {profiles.length} user{profiles.length !== 1 ? 's' : ''} total
            {pendingCount > 0 && (
              <span className="text-amber-600 font-medium"> / {pendingCount} pending</span>
            )}
          </p>
        </div>
      </div>

      <div className="flex gap-1 mb-6 bg-stone-100 rounded-xl p-1">
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
                ? 'bg-white text-stone-900 shadow-sm'
                : 'text-stone-500 hover:text-stone-700'
            }`}
          >
            <Icon className="w-4 h-4" />
            {label}
            <span className={`text-xs px-1.5 py-0.5 rounded-full ${
              filter === key ? 'bg-stone-100 text-stone-600' : 'bg-stone-200/60 text-stone-400'
            }`}>
              {count}
            </span>
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-16">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-stone-100 mb-4">
            <Users className="w-6 h-6 text-stone-400" />
          </div>
          <p className="text-stone-500 text-sm">
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
                className="bg-white border border-stone-200 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-stone-900 truncate">
                      {profile.email}
                    </p>
                    {isSelf && (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-wine-50 text-wine-700 font-medium flex-shrink-0">
                        You
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3 mt-1 text-xs text-stone-400">
                    <span>
                      Joined {new Date(profile.created_at).toLocaleDateString()}
                    </span>
                    <span className={`font-medium ${
                      profile.role === 'admin' ? 'text-wine-700' : 'text-stone-500'
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
                          className="text-xs px-4 py-2 rounded-lg border border-stone-200 text-stone-600 hover:bg-stone-50 transition-colors disabled:opacity-50"
                          title="Make admin"
                        >
                          <Shield className="w-3.5 h-3.5" />
                        </button>
                      ) : (
                        <button
                          onClick={() => updateRole(profile.id, 'user')}
                          disabled={isUpdating}
                          className="text-xs px-4 py-2 rounded-lg border border-wine-200 text-wine-700 bg-wine-50 hover:bg-wine-100 transition-colors disabled:opacity-50"
                          title="Remove admin"
                        >
                          <Shield className="w-3.5 h-3.5" />
                        </button>
                      )}

                      {profile.approved ? (
                        <button
                          onClick={() => updateApproval(profile.id, false)}
                          disabled={isUpdating}
                          className="flex items-center gap-1.5 text-xs px-4 py-2 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50"
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
                          className="flex items-center gap-1.5 text-xs px-4 py-2 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 transition-colors disabled:opacity-50"
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
                          className={`flex items-center gap-1.5 text-xs px-3 py-2 rounded-lg border transition-colors disabled:opacity-50 ${
                            profile.use_shared_key
                              ? 'bg-amber-50 border-amber-200 text-amber-700 hover:bg-amber-100'
                              : 'bg-white border-stone-200 text-stone-500 hover:bg-stone-50'
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
