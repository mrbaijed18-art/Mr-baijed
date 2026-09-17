import React, { useState, useEffect, useMemo } from 'react';
import { AdminLayout } from './AdminLayout';
import { UserProfile } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { 
  Users, 
  ShieldCheck, 
  User, 
  Search, 
  CheckCircle2, 
  Copy, 
  Mail, 
  Calendar,
  Sparkles,
  UserCheck,
  X
} from 'lucide-react';
import { isSupabaseConfigured, getSupabaseClient } from '../../supabase/client';

export const AdminUsersPage: React.FC = () => {
  const { profile } = useAuth();
  const { showToast } = useToast();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | 'admin' | 'user'>('all');

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

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    showToast(`${label} copied to clipboard`, 'info');
  };

  const filteredUsers = useMemo(() => {
    return users.filter(u => {
      const matchesSearch = !search.trim() || 
        (u.email && u.email.toLowerCase().includes(search.toLowerCase())) || 
        (u.displayName && u.displayName.toLowerCase().includes(search.toLowerCase())) ||
        u.uid.toLowerCase().includes(search.toLowerCase());

      const matchesRole = roleFilter === 'all' || u.role === roleFilter;

      return matchesSearch && matchesRole;
    });
  }, [users, search, roleFilter]);

  const adminCount = users.filter(u => u.role === 'admin').length;
  const regularCount = users.length - adminCount;

  return (
    <AdminLayout activeSection="users">
      <div className="space-y-6 max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-neutral-200/80 dark:border-neutral-800/80">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2 py-0.5 rounded-md bg-blue-500/10 text-blue-600 dark:text-blue-400 font-mono text-[10px] font-bold uppercase tracking-wider">
                ACCESS CONTROL
              </span>
              <span className="text-xs text-neutral-400">•</span>
              <span className="text-xs text-neutral-500">{users.length} Total Registered</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-neutral-900 dark:text-white tracking-tight">
              User Accounts &amp; Permissions
            </h1>
            <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400 mt-0.5">
              Inspect registered accounts, administrative roles, and authentication security.
            </p>
          </div>
        </div>

        {/* Top Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200/90 dark:border-neutral-800/90 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-neutral-400 uppercase tracking-wider">Total Accounts</span>
              <div className="w-7 h-7 rounded-lg bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 flex items-center justify-center">
                <Users className="w-3.5 h-3.5" />
              </div>
            </div>
            <p className="text-2xl font-extrabold text-neutral-900 dark:text-white mt-2">
              {users.length}
            </p>
            <p className="text-[11px] text-neutral-400 mt-1">
              Synced with authentication database
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200/90 dark:border-neutral-800/90 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-neutral-400 uppercase tracking-wider">Administrators</span>
              <div className="w-7 h-7 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <ShieldCheck className="w-3.5 h-3.5" />
              </div>
            </div>
            <p className="text-2xl font-extrabold text-neutral-900 dark:text-white mt-2">
              {adminCount}
            </p>
            <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium mt-1">
              Full admin privileges active
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200/90 dark:border-neutral-800/90 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-neutral-400 uppercase tracking-wider">Standard Creators</span>
              <div className="w-7 h-7 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                <UserCheck className="w-3.5 h-3.5" />
              </div>
            </div>
            <p className="text-2xl font-extrabold text-neutral-900 dark:text-white mt-2">
              {regularCount}
            </p>
            <p className="text-[11px] text-neutral-400 mt-1">
              General community members
            </p>
          </div>
        </div>

        {/* Filter Strip */}
        <div className="p-4 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200/90 dark:border-neutral-800/90 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, email or UID..."
              className="w-full pl-10 pr-9 py-2 rounded-xl bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 text-xs sm:text-sm text-neutral-900 dark:text-white placeholder:text-neutral-400 focus:outline-none focus:border-emerald-500"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-1.5 w-full sm:w-auto justify-end">
            <button
              type="button"
              onClick={() => setRoleFilter('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
                roleFilter === 'all'
                  ? 'bg-neutral-900 dark:bg-white text-white dark:text-neutral-900'
                  : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200'
              }`}
            >
              All ({users.length})
            </button>
            <button
              type="button"
              onClick={() => setRoleFilter('admin')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
                roleFilter === 'admin'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200'
              }`}
            >
              Admins ({adminCount})
            </button>
            <button
              type="button"
              onClick={() => setRoleFilter('user')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
                roleFilter === 'user'
                  ? 'bg-neutral-900 dark:bg-white text-white dark:text-neutral-900'
                  : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200'
              }`}
            >
              Users ({regularCount})
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200/90 dark:border-neutral-800/90 shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-neutral-700 dark:text-neutral-300">
              <thead className="bg-neutral-50/80 dark:bg-neutral-950/60 text-neutral-400 dark:text-neutral-500 uppercase font-bold text-[10px] tracking-wider border-b border-neutral-100 dark:border-neutral-800">
                <tr>
                  <th className="px-5 py-3.5">User Identity</th>
                  <th className="px-4 py-3.5">Email Address</th>
                  <th className="px-4 py-3.5">Role</th>
                  <th className="px-4 py-3.5">Registered</th>
                  <th className="px-5 py-3.5 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800/60">
                {filteredUsers.map((u) => (
                  <tr key={u.uid} className="hover:bg-neutral-50/80 dark:hover:bg-neutral-850/50 transition-colors">
                    <td className="px-5 py-3.5 flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-500/20 to-teal-500/20 text-emerald-700 dark:text-emerald-300 font-bold text-xs flex items-center justify-center border border-emerald-500/20 shrink-0">
                        {(u.displayName || u.email || 'U')[0].toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-neutral-900 dark:text-white truncate">
                          {u.displayName || 'Anonymous User'}
                        </p>
                        <div className="flex items-center gap-1 mt-0.5">
                          <span className="text-[10px] text-neutral-400 font-mono">
                            {u.uid.slice(0, 10)}...
                          </span>
                          <button
                            type="button"
                            onClick={() => copyToClipboard(u.uid, 'UID')}
                            className="text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200"
                            title="Copy UID"
                          >
                            <Copy className="w-2.5 h-2.5" />
                          </button>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 whitespace-nowrap text-neutral-800 dark:text-neutral-200 font-medium">
                      {u.email}
                    </td>
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      {u.role === 'admin' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-[10px] font-bold bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30">
                          <ShieldCheck className="w-3 h-3" />
                          Admin
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-[10px] font-semibold bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400">
                          <User className="w-3 h-3" />
                          User
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3.5 whitespace-nowrap text-neutral-500 dark:text-neutral-400">
                      {new Date(u.createdAt).toLocaleDateString(undefined, {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </td>
                    <td className="px-5 py-3.5 whitespace-nowrap text-right">
                      <span className="inline-flex items-center gap-1 text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Active
                      </span>
                    </td>
                  </tr>
                ))}

                {filteredUsers.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-5 py-12 text-center text-neutral-400 text-xs">
                      No accounts found matching your query.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="p-4 bg-neutral-50/50 dark:bg-neutral-950/40 border-t border-neutral-100 dark:border-neutral-800 text-xs text-neutral-500">
            Displaying {filteredUsers.length} of {users.length} accounts
          </div>
        </div>

      </div>
    </AdminLayout>
  );
};

