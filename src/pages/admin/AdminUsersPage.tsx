import React, { useState, useEffect } from 'react';
import { AdminLayout } from './AdminLayout';
import { UserProfile } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Users, ShieldCheck, User, Search, CheckCircle2 } from 'lucide-react';
import { isSupabaseConfigured, getSupabaseClient } from '../../supabase/client';

export const AdminUsersPage: React.FC = () => {
  const { profile } = useAuth();
  const { showToast } = useToast();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    async function loadUsers() {
      setLoading(true);
      try {
        const client = getSupabaseClient();
        if (isSupabaseConfigured() && client) {
          const { data, error } = await client.from('profiles').select('*');
          if (!error && data) {
            const list: UserProfile[] = data.map((d: any) => ({
              uid: d.id,
              email: d.email,
              displayName: d.display_name || d.displayName || 'Creator',
              photoURL: d.photo_url || null,
              role: d.role || 'user',
              createdAt: d.created_at || new Date().toISOString()
            }));
            setUsers(list);
            setLoading(false);
            return;
          }
        }

        // Real profile fallback if profiles table query is unavailable
        setUsers(profile ? [profile] : []);
      } catch (err) {
        console.error('Failed to load users', err);
      } finally {
        setLoading(false);
      }
    }
    loadUsers();
    }, [profile]);

  const filteredUsers = users.filter(u => 
    !search || 
    (u.email && u.email.toLowerCase().includes(search.toLowerCase())) || 
    (u.displayName && u.displayName.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <AdminLayout activeSection="users">
      <div className="space-y-6 max-w-5xl">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            User Accounts ({users.length})
          </h1>
          <p className="text-xs sm:text-sm text-neutral-400 mt-1">
            Registered accounts, access rights, and permission statuses.
          </p>
        </div>

        {/* Search */}
        <div className="relative max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by email or name..."
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-neutral-900 border border-neutral-800 text-xs sm:text-sm text-white placeholder:text-neutral-500 focus:outline-none focus:border-emerald-500"
          />
        </div>

        {/* Table */}
        <div className="rounded-3xl bg-neutral-900/80 border border-neutral-800 shadow-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-neutral-300">
              <thead className="bg-neutral-950/60 text-neutral-500 uppercase font-semibold text-[10px] tracking-wider border-b border-neutral-800">
                <tr>
                  <th className="px-5 py-3.5">User</th>
                  <th className="px-4 py-3.5">Email</th>
                  <th className="px-4 py-3.5">Role</th>
                  <th className="px-4 py-3.5">Joined</th>
                  <th className="px-5 py-3.5 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-800/60">
                {filteredUsers.map((u) => (
                  <tr key={u.uid} className="hover:bg-neutral-800/30 transition-colors">
                    <td className="px-5 py-3.5 flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-indigo-600/20 text-indigo-400 font-bold text-xs flex items-center justify-center border border-indigo-500/30 shrink-0">
                        {(u.displayName || u.email || 'U')[0].toUpperCase()}
                      </div>
                      <div>
                        <p className="font-semibold text-white truncate">{u.displayName || 'Anonymous User'}</p>
                        <p className="text-[10px] text-neutral-500 font-mono">UID: {u.uid.slice(0, 10)}...</p>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 whitespace-nowrap text-neutral-300">
                      {u.email}
                    </td>
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      {u.role === 'admin' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                          <ShieldCheck className="w-3 h-3" />
                          Admin
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-medium bg-neutral-800 text-neutral-400">
                          <User className="w-3 h-3" />
                          User
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3.5 whitespace-nowrap text-neutral-400">
                      {new Date(u.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-5 py-3.5 whitespace-nowrap text-right">
                      <span className="inline-flex items-center gap-1 text-[11px] text-emerald-400 font-medium">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Active
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};
