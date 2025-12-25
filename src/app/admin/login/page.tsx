'use client';

import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function AdminLoginPage() {
  const supabase = createClient();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Check for errors in URL (handled by Supabase or Middleware)
    const params = new URLSearchParams(window.location.search);
    const errorParam = params.get('error_description') || params.get('error');
    if (errorParam) {
      setError(decodeURIComponent(errorParam));
    }

    // Check hash for errors (fragment)
    if (window.location.hash) {
      const hashParams = new URLSearchParams(window.location.hash.substring(1));
      const hashError = hashParams.get('error_description') || hashParams.get('error');
      if (hashError) {
        setError(decodeURIComponent(hashError));
      }
    }

    // Check if already logged in
    async function checkSession() {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        if (session.user.email?.toLowerCase() === 'sushilpatel7489@gmail.com'.toLowerCase()) {
          router.push('/admin');
          return;
        } else {
          await supabase.auth.signOut();
          setError(`Unauthorized: You are logged in with a non-admin account (${session.user.email}).`);
        }
      }
      setPageLoading(false);
    }
    checkSession();
  }, [router]);

  const handleGoogleLogin = async () => {
    try {
      setLoading(true);
      setError(null);
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      if (error) throw error;
    } catch (error) {
      setError((error as Error).message);
      setLoading(false);
    }
  };

  if (pageLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0f0f23]">
        <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0f0f23]">
      {/* Login Form */}
      <div className="w-full max-w-md p-8">
        <div className="text-center mb-8">
          <p className="text-slate-400">Sign in to access control panel</p>
        </div>

        <div className="bg-[#1a1a2e] border border-white/5 rounded-2xl p-8 shadow-xl backdrop-blur-sm">
          <h3 className="text-xl font-bold text-white mb-6 text-center">Sign in to your account</h3>

          {error && (
            <div className="mb-4 p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
              {error}
            </div>
          )}

          <button
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 bg-white hover:bg-gray-50 text-slate-900 font-medium py-3 px-4 rounded-xl transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-70 disabled:hover:scale-100"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-slate-900 border-t-transparent rounded-full animate-spin" />
            ) : (
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="currentColor"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="currentColor"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="currentColor"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
            )}
            <span>Continue with Google</span>
          </button>

          <p className="mt-6 text-center text-sm text-slate-500">
            Only authorized administrators can access this panel.
          </p>
        </div>
      </div>
    </div>
  );
}