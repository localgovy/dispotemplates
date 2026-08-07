import React, { createContext, useContext, useEffect, useState } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

interface AuthContextValue {
  session: Session | null;
  user: User | null;
  loading: boolean;
  signInWithIdToken: (idToken: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoading(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((event, newSession) => {
      setSession(newSession);

      // On every sign-in, upsert the profile row so it always exists and
      // stays in sync with the latest Google name/avatar. Loyalty pts and
      // notification settings are not included here so they are never reset.
      if (event === 'SIGNED_IN' && newSession?.user) {
        const u = newSession.user;
        supabase.from('profiles').upsert(
          {
            id: u.id,
            display_name:
              u.user_metadata?.full_name ??
              u.user_metadata?.name ??
              u.email?.split('@')[0] ??
              null,
            avatar_url:
              u.user_metadata?.avatar_url ??
              u.user_metadata?.picture ??
              null,
          },
          { onConflict: 'id' },
        );
      }
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  async function signInWithIdToken(idToken: string) {
    const { error } = await supabase.auth.signInWithIdToken({
      provider: 'google',
      token: idToken,
    });
    if (error) throw error;
  }

  async function signOut() {
    await supabase.auth.signOut();
  }

  return (
    <AuthContext.Provider
      value={{ session, user: session?.user ?? null, loading, signInWithIdToken, signOut }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
