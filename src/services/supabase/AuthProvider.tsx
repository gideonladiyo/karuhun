import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { Session } from '@supabase/supabase-js';
import { supabase, isSupabaseConfigured } from './client';
import {
  AdminRole,
  UserProfile,
  fetchUserProfile,
  signInWithEmail,
  signUpWithEmail,
  signInWithGoogle,
  signOutAdmin,
  SignUpResult,
} from './auth';

export interface AuthContextValue {
  session: Session | null;
  profile: UserProfile | null;
  role: AdminRole;
  isSuperadmin: boolean;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error?: string }>;
  signUp: (email: string, password: string, displayName?: string) => Promise<SignUpResult>;
  signInGoogle: () => Promise<{ error?: string }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(() => isSupabaseConfigured());

  const loadSessionAndProfile = useCallback(async (nextSession: Session | null) => {
    setSession(nextSession);
    if (!nextSession) {
      setProfile(null);
      setLoading(false);
      return;
    }
    const loadedProfile = await fetchUserProfile(nextSession);
    setProfile(loadedProfile);
    setLoading(false);
  }, []);

  useEffect(() => {
    // Clean up legacy sessionStorage flag so authentication relies strictly on Supabase Session
    try {
      sessionStorage.removeItem('karuhun_admin_authenticated');
    } catch {
      // ignore
    }

    if (!isSupabaseConfigured() || !supabase) {
      setLoading(false);
      return undefined;
    }

    let isMounted = true;

    supabase.auth.getSession().then(({ data }) => {
      if (!isMounted) return;
      loadSessionAndProfile(data.session ?? null);
    });

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      if (!isMounted) return;
      loadSessionAndProfile(nextSession ?? null);
    });

    return () => {
      isMounted = false;
      authListener.subscription.unsubscribe();
    };
  }, [loadSessionAndProfile]);

  const refreshProfile = useCallback(async () => {
    if (session) {
      const updated = await fetchUserProfile(session);
      setProfile(updated);
    }
  }, [session]);

  const handleSignOut = useCallback(async () => {
    await signOutAdmin();
    setSession(null);
    setProfile(null);
  }, []);

  const role: AdminRole = profile?.role ?? 'admin';
  const isSuperadmin = role === 'superadmin';

  return (
    <AuthContext.Provider
      value={{
        session,
        profile,
        role,
        isSuperadmin,
        loading,
        signIn: signInWithEmail,
        signUp: signUpWithEmail,
        signInGoogle: signInWithGoogle,
        signOut: handleSignOut,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used inside an AuthProvider');
  }
  return ctx;
}
