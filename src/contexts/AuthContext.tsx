import { createContext, useContext, useEffect, useState } from 'react';
import { User, AuthError } from '@supabase/supabase-js';
import { supabase, Profile } from '../lib/supabase';

type AuthResponse = {
  error: AuthError | Error | null;
  user?: User | null;
};

type AuthContextType = {
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  signUp: (email: string, password: string, fullName: string, phone?: string) => Promise<AuthResponse>;
  signIn: (email: string, password: string) => Promise<AuthResponse>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<AuthResponse>;
  isAdmin: boolean;
  reloadProfile: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    // Robust Session Init Check
    supabase.auth.getSession().then(({ data, error }) => {
      if (error || !data.session) {
        if (error) console.error('[Auth Context] Session init error - forcing clean state:', error);
        localStorage.clear();
        sessionStorage.clear();
        supabase.auth.signOut().catch(() => {});
      }
    });

    // Use onAuthStateChange for both initial session and subsequent changes
    // This is more stable as Supabase triggers INITIAL_SESSION automatically
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return;

      const sessionUser = session?.user ?? null;
      
      // Only set loading(true) for specific identity-changing events to prevent flicker
      // background token refreshes shouldn't trigger a full UI reload/spinner
      const isCriticalEvent = ['SIGNED_IN', 'SIGNED_OUT', 'USER_UPDATED', 'TOKEN_REFRESHED'].includes(event);
      if (isCriticalEvent && !sessionUser) {
         setLoading(true);
      }

      // 1. Set user immediately
      setUser(sessionUser);

      // 2. Load profile if we have a user
      if (sessionUser) {
        try {
          const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', sessionUser.id)
            .maybeSingle();
            
          if (error) throw error;
          if (mounted) setProfile(data || null);
        } catch (err) {
          console.error('[Auth Context] Profile load error:', err);
          if (mounted) setProfile(null);
        }
      } else {
        if (mounted) setProfile(null);
      }

      // 3. Finalize loading state
      if (mounted) setLoading(false);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signUp = async (email: string, password: string, fullName: string, phone?: string): Promise<AuthResponse> => {
    try {
      const { data, error } = await supabase.auth.signUp({ email, password });
      if (error) return { error };

      if (data.user) {
        const { error: profileError } = await supabase
          .from('profiles')
          .insert({
            id: data.user.id,
            full_name: fullName,
            phone: phone || null,
            role: 'client',
          });

        if (profileError) return { error: profileError };

        // Async email notification
        fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-approval-email`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ userId: data.user.id, email, fullName, phone: phone || '' }),
        }).catch(err => console.error('[Auth Context] Approval email error:', err));
      }

      return { user: data.user, error: null };
    } catch (err: any) {
      return { error: err, user: null };
    }
  };

  const signIn = async (email: string, password: string): Promise<AuthResponse> => {
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      return { error };
    } catch (err: any) {
      return { error: err };
    }
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
    } catch (err) {
      console.error('[Auth Context] Sign out error:', err);
    } finally {
      localStorage.clear();
      sessionStorage.clear();
      setUser(null);
      setProfile(null);
      window.location.reload();
    }
  };

  const resetPassword = async (email: string): Promise<AuthResponse> => {
    try {
      const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-password-reset`;
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
        },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        const result = await response.json();
        return { error: new Error(result.error || 'Erro ao solicitar recuperação') };
      }

      return { error: null };
    } catch (err: any) {
      return { error: err };
    }
  };

  const isAdmin = profile?.role === 'admin';

  const reloadProfile = async () => {
    // Golden Rule: Guard against missing session/token
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.access_token || !user) return;

    try {
      const { data } = await supabase.from('profiles').select('*').eq('id', user.id).maybeSingle();
      if (data) setProfile(data);
    } catch (err) {
      console.error('[Auth Context] Profile reload error:', err);
    }
  };

  return (
    <AuthContext.Provider value={{ user, profile, loading, signUp, signIn, signOut, resetPassword, isAdmin, reloadProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
