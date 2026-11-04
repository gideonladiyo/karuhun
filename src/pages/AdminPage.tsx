import React, { useState, useCallback } from 'react';
import { FileText, Clock, Trash2, LogOut } from 'lucide-react';
import { AuthProvider, useAuth } from '@/services/supabase/AuthProvider';
import { Button } from '@/components/ui/button';
import { SectionHeader } from '@/components/ui/section-header';
import { SegmentedTabs, SegmentedTabOption } from '@/components/ui/segmented-tabs';
import {
  RoleBadge,
  ToastBanner,
  ToastMessage,
} from '@/components/admin/AdminPrimitives';
import { AuthCard } from '@/pages/admin/AuthCard';
import { ReferencesTab } from '@/pages/admin/references/ReferencesTab';
import { TrashTab } from '@/pages/admin/references/TrashTab';
import { RecapTab } from '@/pages/admin/recap/RecapTab';

type AdminTab = 'reffs' | 'recap' | 'trash';

const AdminShell: React.FC = () => {
  const { session, profile, role, isSuperadmin, loading, signOut } = useAuth();
  const [activeTab, setActiveTab] = useState<AdminTab>('reffs');
  const [toast, setToast] = useState<ToastMessage | null>(null);

  const notify = useCallback((tone: ToastMessage['tone'], text: string) => {
    setToast({ id: Date.now(), tone, text });
  }, []);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-xs text-zinc-400">Memeriksa sesi autentikasi...</div>
      </div>
    );
  }

  if (!session) {
    return <AuthCard />;
  }

  const tabOptions: SegmentedTabOption<AdminTab>[] = [
    { value: 'reffs', label: 'Referensi Video', icon: FileText },
    { value: 'recap', label: 'Rekap Kontribusi', icon: Clock },
    ...(isSuperadmin
      ? ([{ value: 'trash', label: 'Trash', icon: Trash2 }] as const)
      : []),
  ];

  const resolvedTab: AdminTab =
    !isSuperadmin && activeTab === 'trash' ? 'reffs' : activeTab;

  return (
    <div className="space-y-6 animate-fadeIn pb-16 md:pb-0">
      <div className="minimal-card p-5 sm:p-7 space-y-5">
        <SectionHeader
          level="secondary"
          className="mb-0 pb-4"
          title="Karuhun Admin Panel"
          subtitle="Kelola referensi video strategi dan rekapitulasi kontribusi mingguan."
          actions={
            <div className="flex flex-wrap items-center gap-2.5">
              <RoleBadge role={role} />
              {profile?.email && (
                <span className="text-xs text-zinc-400 px-2.5 py-1 rounded-lg bg-[#09090b] border border-[#27272a]">
                  {profile.email}
                </span>
              )}
              <Button type="button" variant="secondary" size="sm" onClick={signOut}>
                <LogOut className="w-3.5 h-3.5" />
                <span>Keluar</span>
              </Button>
            </div>
          }
        />

        <div className="flex flex-wrap items-center justify-between gap-3">
          <SegmentedTabs
            options={tabOptions}
            value={resolvedTab}
            onChange={setActiveTab}
            ariaLabel="Navigasi Admin"
          />
        </div>
      </div>

      <ToastBanner toast={toast} onDismiss={() => setToast(null)} />

      {resolvedTab === 'reffs' && (
        <ReferencesTab
          currentUserId={session.user.id}
          isSuperadmin={isSuperadmin}
          onNotify={notify}
        />
      )}

      {resolvedTab === 'recap' && <RecapTab onNotify={notify} />}

      {resolvedTab === 'trash' && isSuperadmin && <TrashTab onNotify={notify} />}
    </div>
  );
};

export const AdminPage: React.FC = () => (
  <AuthProvider>
    <AdminShell />
  </AuthProvider>
);
