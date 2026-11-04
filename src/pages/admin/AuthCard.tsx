import React, { useState } from 'react';
import { Shield } from 'lucide-react';
import { useAuth } from '@/services/supabase/AuthProvider';
import { isSupabaseConfigured } from '@/services/supabase/client';
import { Button } from '@/components/ui/button';
import { SegmentedTabs, SegmentedTabOption } from '@/components/ui/segmented-tabs';
import { Field, Input } from '@/components/admin/AdminPrimitives';

type AuthMode = 'login' | 'register';

const AUTH_MODE_OPTIONS: readonly SegmentedTabOption<AuthMode>[] = [
  { value: 'login', label: 'Masuk' },
  { value: 'register', label: 'Daftar Akun' },
];

const GoogleIcon: React.FC<{ className?: string }> = ({ className = 'w-4 h-4' }) => (
  <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
    <path
      fill="#EA4335"
      d="M12 10.2v3.9h5.4c-.2 1.2-.9 2.3-2 3l3.2 2.5c1.9-1.7 3-4.3 3-7.3 0-.7-.1-1.4-.2-2.1H12z"
    />
    <path
      fill="#34A853"
      d="M12 22c2.7 0 5-.9 6.6-2.4l-3.2-2.5c-.9.6-2 .9-3.4.9-2.6 0-4.8-1.8-5.6-4.1H3.1v2.6C4.8 19.9 8.1 22 12 22z"
    />
    <path
      fill="#4A90E2"
      d="M6.4 13.9c-.2-.6-.3-1.2-.3-1.9s.1-1.3.3-1.9V7.5H3.1C2.4 8.9 2 10.4 2 12s.4 3.1 1.1 4.5l3.3-2.6z"
    />
    <path
      fill="#FBBC05"
      d="M12 6c1.5 0 2.8.5 3.8 1.5l2.8-2.8C16.9 3.1 14.7 2 12 2 8.1 2 4.8 4.1 3.1 7.5l3.3 2.6C7.2 7.8 9.4 6 12 6z"
    />
  </svg>
);

export const AuthCard: React.FC = () => {
  const { signIn, signUp, signInGoogle } = useAuth();
  const [mode, setMode] = useState<AuthMode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [googleSubmitting, setGoogleSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);

  const switchMode = (nextMode: AuthMode) => {
    setMode(nextMode);
    setErrorMessage(null);
    setInfoMessage(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setInfoMessage(null);

    if (mode === 'register') {
      if (password.length < 8) {
        setErrorMessage('Password minimal 8 karakter.');
        return;
      }
      if (password !== confirmPassword) {
        setErrorMessage('Konfirmasi password tidak cocok.');
        return;
      }

      setSubmitting(true);
      const res = await signUp(email, password);
      setSubmitting(false);

      if (res.error) {
        setErrorMessage(res.error);
        return;
      }

      if (res.needsEmailConfirmation) {
        setInfoMessage(
          'Pendaftaran berhasil. Silakan cek email kamu untuk klik tautan verifikasi sebelum masuk.'
        );
        setPassword('');
        setConfirmPassword('');
      }
      return;
    }

    setSubmitting(true);
    const res = await signIn(email, password);
    setSubmitting(false);
    if (res.error) {
      setErrorMessage(res.error);
    }
  };

  const handleGoogle = async () => {
    setErrorMessage(null);
    setInfoMessage(null);
    setGoogleSubmitting(true);
    const res = await signInGoogle();
    if (res.error) {
      setGoogleSubmitting(false);
      setErrorMessage(res.error);
    }
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 animate-fadeIn">
      <div className="minimal-card p-6 sm:p-8 w-full max-w-md space-y-6">
        <div className="space-y-2 text-center">
          <div className="w-11 h-11 rounded-2xl bg-[#18181b] border border-[#27272a] flex items-center justify-center mx-auto">
            <Shield className="w-5 h-5 text-white" />
          </div>
          <h1 className="font-heading font-bold text-xl sm:text-2xl text-white">
            Karuhun Admin
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400">
            {mode === 'login'
              ? 'Masuk untuk mengelola referensi video dan rekap kontribusi guild.'
              : 'Buat akun admin baru. Akun baru otomatis mendapat role Admin.'}
          </p>
        </div>

        <SegmentedTabs
          options={AUTH_MODE_OPTIONS}
          value={mode}
          onChange={switchMode}
          fullWidth
          ariaLabel="Mode autentikasi"
        />

        {!isSupabaseConfigured() && (
          <div className="bg-amber-950/60 border border-amber-800/70 text-amber-200 text-xs p-3 rounded-xl">
            Konfigurasi Supabase belum ditemukan di <code className="font-mono">.env</code>.
          </div>
        )}

        <Button
          type="button"
          variant="secondary"
          className="w-full py-2.5"
          disabled={submitting || googleSubmitting || !isSupabaseConfigured()}
          onClick={handleGoogle}
        >
          <GoogleIcon />
          <span>
            {googleSubmitting ? 'Mengarahkan ke Google...' : 'Lanjutkan dengan Google'}
          </span>
        </Button>

        <div className="flex items-center gap-3 text-xs text-zinc-500">
          <div className="h-px flex-1 bg-[#27272a]" />
          <span>atau dengan email</span>
          <div className="h-px flex-1 bg-[#27272a]" />
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Field label="Email">
            <Input
              type="email"
              placeholder="nama@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
          </Field>

          <Field
            label="Password"
            hint={mode === 'register' ? 'Minimal 8 karakter.' : undefined}
          >
            <Input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={mode === 'register' ? 8 : undefined}
              autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
            />
          </Field>

          {mode === 'register' && (
            <Field label="Konfirmasi Password">
              <Input
                type="password"
                placeholder="Ulangi password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={8}
                autoComplete="new-password"
              />
            </Field>
          )}

          {errorMessage && (
            <div className="bg-red-950/80 border border-red-800 text-red-200 text-xs p-3 rounded-xl">
              {errorMessage}
            </div>
          )}

          {infoMessage && (
            <div className="bg-emerald-950/80 border border-emerald-800 text-emerald-200 text-xs p-3 rounded-xl">
              {infoMessage}
            </div>
          )}

          <Button
            type="submit"
            className="w-full py-2.5"
            disabled={submitting || googleSubmitting || !isSupabaseConfigured()}
          >
            {submitting
              ? 'Memproses...'
              : mode === 'login'
              ? 'Masuk'
              : 'Daftar Akun Admin'}
          </Button>
        </form>
      </div>
    </div>
  );
};
