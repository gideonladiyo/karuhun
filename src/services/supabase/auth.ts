import { Session } from '@supabase/supabase-js';
import { supabase, isSupabaseConfigured } from './client';

export type AdminRole = 'admin' | 'superadmin';

export interface UserProfile {
  id: string;
  email: string;
  displayName: string;
  role: AdminRole;
  createdAt?: string;
}

/**
 * Translate raw Supabase Auth error messages into clean Indonesian messages.
 */
export function formatAuthError(error: unknown): string {
  if (!error) return 'Terjadi kesalahan autentikasi.';
  const raw =
    typeof error === 'string'
      ? error
      : (error as { message?: string })?.message || 'Terjadi kesalahan autentikasi.';
  const lower = raw.toLowerCase();

  if (lower.includes('invalid login credentials')) {
    return 'Email atau password salah.';
  }
  if (lower.includes('email not confirmed')) {
    return 'Email belum diverifikasi. Silakan cek kotak masuk email kamu.';
  }
  if (lower.includes('user already registered') || lower.includes('already been registered')) {
    return 'Email ini sudah terdaftar. Silakan masuk.';
  }
  if (lower.includes('password should be at least')) {
    return 'Password minimal harus 8 karakter.';
  }
  if (lower.includes('rate limit') || lower.includes('too many requests')) {
    return 'Terlalu banyak percobaan. Coba lagi beberapa saat lagi.';
  }
  if (lower.includes('unable to validate email')) {
    return 'Format email tidak valid.';
  }
  return raw;
}

/**
 * Fetch the authenticated user's profile and role from `public.profiles`.
 * Falls back gracefully to role `'admin'` if the migration has not been run yet.
 */
export async function fetchUserProfile(session: Session): Promise<UserProfile> {
  const user = session.user;
  const fallbackName =
    (user.user_metadata?.full_name as string | undefined) ||
    (user.user_metadata?.name as string | undefined) ||
    (user.email ? user.email.split('@')[0] : 'Admin');

  const fallbackProfile: UserProfile = {
    id: user.id,
    email: user.email || '',
    displayName: fallbackName,
    role: 'admin',
  };

  if (!isSupabaseConfigured() || !supabase) {
    return fallbackProfile;
  }

  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('id, email, display_name, role, created_at')
      .eq('id', user.id)
      .maybeSingle();

    if (error || !data) {
      return fallbackProfile;
    }

    const role: AdminRole = data.role === 'superadmin' ? 'superadmin' : 'admin';

    return {
      id: data.id,
      email: data.email || user.email || '',
      displayName: data.display_name || fallbackName,
      role,
      createdAt: data.created_at,
    };
  } catch {
    return fallbackProfile;
  }
}

export async function signInWithEmail(email: string, password: string): Promise<{ error?: string }> {
  if (!isSupabaseConfigured() || !supabase) {
    return { error: 'Konfigurasi Supabase belum diatur pada file .env.' };
  }
  const { error } = await supabase.auth.signInWithPassword({
    email: email.trim(),
    password,
  });
  if (error) return { error: formatAuthError(error) };
  return {};
}

export interface SignUpResult {
  needsEmailConfirmation: boolean;
  error?: string;
}

export async function signUpWithEmail(
  email: string,
  password: string,
  displayName?: string
): Promise<SignUpResult> {
  if (!isSupabaseConfigured() || !supabase) {
    return {
      needsEmailConfirmation: false,
      error: 'Konfigurasi Supabase belum diatur pada file .env.',
    };
  }

  const trimmedEmail = email.trim();
  const cleanName = displayName?.trim() || trimmedEmail.split('@')[0];

  const { data, error } = await supabase.auth.signUp({
    email: trimmedEmail,
    password,
    options: {
      emailRedirectTo: `${window.location.origin}/admin`,
      data: {
        full_name: cleanName,
      },
    },
  });

  if (error) {
    return { needsEmailConfirmation: false, error: formatAuthError(error) };
  }

  // Supabase returns an obfuscated user with empty identities array when email is already registered
  if (data.user && Array.isArray(data.user.identities) && data.user.identities.length === 0) {
    return {
      needsEmailConfirmation: false,
      error: 'Email ini sudah terdaftar. Silakan masuk.',
    };
  }

  const needsEmailConfirmation = Boolean(data.user && !data.session);
  return { needsEmailConfirmation };
}

export async function signInWithGoogle(): Promise<{ error?: string }> {
  if (!isSupabaseConfigured() || !supabase) {
    return { error: 'Konfigurasi Supabase belum diatur pada file .env.' };
  }

  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${window.location.origin}/admin`,
    },
  });

  if (error) return { error: formatAuthError(error) };
  return {};
}

export async function signOutAdmin(): Promise<void> {
  try {
    sessionStorage.removeItem('karuhun_admin_authenticated');
  } catch {
    // ignore storage errors
  }
  if (isSupabaseConfigured() && supabase) {
    await supabase.auth.signOut();
  }
}
