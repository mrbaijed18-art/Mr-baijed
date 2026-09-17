import React, { useState } from 'react';
import { 
  Sparkles, 
  Mail, 
  Lock, 
  User, 
  ShieldCheck, 
  ArrowRight
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useRouter } from '../context/RouterContext';
import { siteConfig } from '../config/siteConfig';

interface LoginPageProps {
  isAdminLogin?: boolean;
}

export const LoginPage: React.FC<LoginPageProps> = ({ isAdminLogin = false }) => {
  const { loginWithEmail, registerWithEmail, loginWithGoogle, isAdmin } = useAuth();
  const { navigate } = useRouter();

  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSubmitting(true);

    try {
      const loggedUser = (isRegister && !isAdminLogin)
        ? await registerWithEmail(email, password, displayName)
        : await loginWithEmail(email, password);

      if (isAdminLogin || loggedUser?.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/explore');
      }
    } catch (err: any) {
      setErrorMsg(err?.message || 'Authentication error. Please check your credentials.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleGoogleLogin = async () => {
    setErrorMsg('');
    setSubmitting(true);
    try {
      await loginWithGoogle();
      if (isAdminLogin) {
        navigate('/admin');
      } else {
        navigate('/explore');
      }
    } catch (err: any) {
      setErrorMsg('Google login failed or was cancelled.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-10">
      <div className="max-w-md w-full rounded-3xl bg-white dark:bg-neutral-900/90 border border-neutral-200 dark:border-neutral-800 p-7 sm:p-9 shadow-xl dark:shadow-2xl backdrop-blur-xl relative overflow-hidden transition-colors">
        {/* Ambient Top Glow */}
        <div className={`absolute top-0 left-1/2 -translate-x-1/2 w-48 h-24 rounded-full blur-3xl pointer-events-none ${
          isAdminLogin ? 'bg-emerald-500/15' : 'bg-indigo-500/15'
        }`} />

        {/* Header Icon & Title */}
        <div className="flex flex-col items-center text-center mb-8 relative z-10">
          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-4 shadow-md border ${
            isAdminLogin 
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400'
              : 'bg-indigo-500/10 border-indigo-500/30 text-indigo-600 dark:text-indigo-400'
          }`}>
            {isAdminLogin ? <ShieldCheck className="w-7 h-7" /> : <Sparkles className="w-7 h-7" />}
          </div>

          <h1 className="text-2xl font-extrabold text-neutral-900 dark:text-white tracking-tight">
            {isAdminLogin 
              ? 'Admin Portal Access' 
              : isRegister 
                ? 'Create PromptVerse Account' 
                : 'Welcome Back'}
          </h1>

          <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-1.5 max-w-xs leading-relaxed">
            {isAdminLogin
              ? 'Sign in with verified administrator credentials to manage prompts, categories, and settings.'
              : isRegister
                ? 'Join to bookmark your favorite AI prompts and keep them synced across your devices.'
                : 'Sign in to access your saved prompts and personalized AI preferences.'}
          </p>
        </div>

        {errorMsg && (
          <div className="p-3 mb-5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-300 text-xs leading-relaxed">
            {errorMsg}
          </div>
        )}

        {/* Standard Email & Password Form */}
        <form onSubmit={handleSubmit} className="space-y-4 relative z-10">
          {isRegister && !isAdminLogin && (
            <div>
              <label className="block text-xs font-medium text-neutral-600 dark:text-neutral-400 mb-1.5">
                Display Name
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                <input
                  type="text"
                  required
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="e.g. Neo Artist"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 text-sm text-neutral-900 dark:text-white placeholder:text-neutral-400 dark:placeholder:text-neutral-600 focus:outline-none focus:border-indigo-500 transition-colors shadow-xs"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-neutral-600 dark:text-neutral-400 mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@domain.com"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 text-sm text-neutral-900 dark:text-white placeholder:text-neutral-400 dark:placeholder:text-neutral-600 focus:outline-none focus:border-indigo-500 transition-colors shadow-xs"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-neutral-600 dark:text-neutral-400 mb-1.5">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 text-sm text-neutral-900 dark:text-white placeholder:text-neutral-400 dark:placeholder:text-neutral-600 focus:outline-none focus:border-indigo-500 transition-colors shadow-xs"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className={`w-full py-3 rounded-2xl font-bold text-sm text-white shadow-lg transition-all flex items-center justify-center gap-2 active:scale-98 ${
              isAdminLogin
                ? 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 shadow-emerald-500/20'
                : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 shadow-indigo-500/25'
            }`}
          >
            <span>
              {submitting
                ? 'Signing in...'
                : isAdminLogin
                  ? 'Access Admin Dashboard'
                  : isRegister
                    ? 'Create Account'
                    : 'Sign In'}
            </span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Divider & Google Sign-In */}
        {!isAdminLogin && (
          <div className="mt-6 pt-5 border-t border-neutral-100 dark:border-neutral-800 space-y-4">
            <button
              type="button"
              onClick={handleGoogleLogin}
              disabled={submitting}
              className="w-full py-2.5 px-4 rounded-xl bg-white dark:bg-neutral-950 hover:bg-neutral-50 dark:hover:bg-neutral-800 border border-neutral-200 dark:border-neutral-800 text-xs font-semibold text-neutral-700 dark:text-neutral-200 shadow-xs transition-all flex items-center justify-center gap-2.5"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>Continue with Google</span>
            </button>

            <div className="text-center">
              <button
                type="button"
                onClick={() => setIsRegister(!isRegister)}
                className="text-xs text-neutral-500 dark:text-neutral-400 hover:text-indigo-600 dark:hover:text-indigo-400 font-medium transition-colors"
              >
                {isRegister
                  ? 'Already have an account? Sign in here'
                  : "Don't have an account? Create one"}
              </button>
            </div>
          </div>
        )}

        {/* Footer info */}
        {isAdminLogin && (
          <div className="mt-6 text-center">
            <button
              type="button"
              onClick={() => navigate('/login')}
              className="text-[11px] text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-300 transition-colors"
            >
              ← Return to public gallery
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
