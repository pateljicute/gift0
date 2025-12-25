'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';

interface AuthContextType {
    user: User | null;
    session: Session | null;
    isAdmin: boolean;
    loading: boolean;
    signInWithGoogle: () => Promise<void>;
    signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    session: null,
    isAdmin: false,
    loading: true,
    signInWithGoogle: async () => { },
    signOut: async () => { },
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const supabase = createClient();
    const [user, setUser] = useState<User | null>(null);
    const [session, setSession] = useState<Session | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    // Use environment variable for admin email (Security Best Practice), fallback for immediate access
    const ADMIN_EMAIL = process.env.NEXT_PUBLIC_ADMIN_EMAIL || 'sushilpatel7489@gmail.com';

    useEffect(() => {
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            async (_event, session) => {
                setSession(session);
                setUser(session?.user ?? null);
                setLoading(false);

                // Sync profile if user is logged in
                if (session?.user) {
                    try {
                        const { user } = session;
                        const updates = {
                            id: user.id,
                            email: user.email,
                            full_name: user.user_metadata?.full_name || '',
                            avatar_url: user.user_metadata?.avatar_url || '',
                            updated_at: new Date().toISOString(),
                        };

                        const { error } = await supabase
                            .from('profiles')
                            .upsert(updates, { onConflict: 'id' });

                        if (error) {
                            console.error('Error syncing profile:', error.message);
                        }
                    } catch (err) {
                        console.error('Unexpected error syncing profile:', err);
                    }
                }
            }
        );

        return () => subscription.unsubscribe();
    }, []);

    const isAdmin = !!(user?.email && ADMIN_EMAIL && user.email.toLowerCase() === ADMIN_EMAIL.toLowerCase());

    const signInWithGoogle = async () => {
        try {
            const { error } = await supabase.auth.signInWithOAuth({
                provider: 'google',
                options: {
                    redirectTo: `${window.location.origin}/auth/callback`,
                },
            });
            if (error) throw error;
        } catch (error: any) {
            console.error('Error signing in with Google:', error);
            // Replaced alert with console error for better UX. 
            // TODO: Implement a proper Toast notification here.
            if (error?.status === 429 || error?.code === 'over_request_rate_limit') {
                console.error('Too many login attempts. Please wait 2 minutes before trying again.');
            }
        }
    };

    const signOut = async () => {
        try {
            await supabase.auth.signOut();
            router.push('/');
            router.refresh();
        } catch (error) {
            console.error('Error signing out:', error);
        }
    };

    return (
        <AuthContext.Provider value={{ user, session, isAdmin, loading, signInWithGoogle, signOut }}>
            {children}
        </AuthContext.Provider>
    );
};
