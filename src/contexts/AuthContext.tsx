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
    let timeoutId: NodeJS.Timeout;

    const forceLoadingComplete = () => {
      timeoutId = setTimeout(() => {
        if (mounted) {
          console.warn('Auth timeout - forcing loading to complete');
          setLoading(false);
        }
      }, 10000);
    };

    forceLoadingComplete();

    const initAuth = async () => {
      console.log('[Auth Context] Starting initAuth...');
      try {
        const { data: { session } } = await supabase.auth.getSession();
        console.log('[Auth Context] getSession finished. Session exists:', !!session);

        if (!mounted) return;

        setUser(session?.user ?? null);
        console.log('[Auth Context] User set:', session?.user?.email || 'null');

        if (session?.user) {
          console.log('[Auth Context] Loading profile for:', session.user.id);
          await loadProfile(session.user.id);
          console.log('[Auth Context] Profile loading triggered.');
        } else {
          console.log('[Auth Context] No user, setting loading to false.');
          setLoading(false);
        }
      } catch (error) {
        console.error('[Auth Context] Initialization error:', error);
        if (mounted) {
          setLoading(false);
        }
      }
    };

    const setupAuthListener = () => {
      const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
        if (!mounted) return;

        (async () => {
          setUser(session?.user ?? null);
          if (session?.user) {
            await loadProfile(session.user.id);
          } else {
            setProfile(null);
            setLoading(false);
          }
        })();
      });

      return subscription;
    };

    initAuth();
    const subscription = setupAuthListener();

    return () => {
      mounted = false;
      clearTimeout(timeoutId);
      subscription.unsubscribe();
    };
  }, []);

  const loadProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (error) {
        console.error('Error loading profile:', error);
      }

      if (data) {
        setProfile(data);
      } else {
        console.log('No profile found for user:', userId);
      }
    } catch (error) {
      console.error('Profile load error:', error);
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string, fullName: string, phone?: string): Promise<AuthResponse> => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

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

      try {
        const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-approval-email`;
        const response = await fetch(apiUrl, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userId: data.user.id,
            email,
            fullName,
            phone: phone || '',
          }),
        });

        if (!response.ok) {
          console.error('Erro ao enviar email de aprovação:', await response.text());
        }
      } catch (emailError) {
        console.error('Erro ao chamar função de email:', emailError);
      }
    }

    return { user: data.user, error: null };
  };

  const signIn = async (email: string, password: string): Promise<AuthResponse> => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    return { error };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
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

      const result = await response.json();

      if (!response.ok) {
        return { error: new Error(result.error || 'Erro ao solicitar recuperação de senha') };
      }

      return { error: null };
    } catch (error) {
      console.error('Erro ao solicitar recuperação de senha:', error);
      return { error: new Error('Erro ao solicitar recuperação de senha') };
    }
  };

  const isAdmin = profile?.role === 'admin';

  const reloadProfile = async () => {
    if (user) {
      await loadProfile(user.id);
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
