import React, { useEffect, useState } from 'react';
import {
  RefreshCw,
  Download,
  Copy,
  Search,
  AlertTriangle,
  CheckCircle,
} from 'lucide-react';
import {
  fetchAllGuildMembersSnapshot,
  loadBaselineSnapshot,
  loadBaselineSnapshotAsync,
  compareGuildMembersData,
  generateDiscordRecapText,
  BaselineDataset,
  RecapComparisonResult,
  MemberComparisonItem,
} from '@/services/recapService';
import { GUILD_BRANCHES } from '@/services/imageUtils';
import { Button } from '@/components/ui/button';
import { SegmentedTabs, SegmentedTabOption } from '@/components/ui/segmented-tabs';
import {
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  EmptyDescription,
} from '@/components/ui/empty';
import {
  Badge,
  Input,
  Select,
  ToastMessage,
} from '@/components/admin/AdminPrimitives';

type RecapStatusTab = 'uncontributed' | 'contributed' | 'all';

export interface RecapTabProps {
  onNotify: (tone: ToastMessage['tone'], text: string) => void;
}

export const RecapTab: React.FC<RecapTabProps> = ({ onNotify }) => {
  const [baselineData, setBaselineData] = useState<BaselineDataset>(() =>
    loadBaselineSnapshot()
  );
  const [comparisonResult, setComparisonResult] =
    useState<RecapComparisonResult | null>(null);
  const [loadingRecap, setLoadingRecap] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [statusTab, setStatusTab] = useState<RecapStatusTab>('uncontributed');
  const [guildFilter, setGuildFilter] = useState<number>(0);

  useEffect(() => {
    loadBaselineSnapshotAsync().then((bData) => {
      if (bData && bData.members?.length > 0) {
        setBaselineData(bData);
      }
    });
  }, []);

  const handleTriggerComparison = async () => {
    setLoadingRecap(true);
    try {
      const currentLiveDataset = await fetchAllGuildMembersSnapshot();
      const currentBaseline =
        baselineData.members.length > 0
          ? baselineData
          : await loadBaselineSnapshotAsync();
      const result = compareGuildMembersData(currentBaseline, currentLiveDataset);
      setComparisonResult(result);
    } catch {
      onNotify(
        'error',
        'Gagal melakukan komparasi data. Pastikan koneksi jaringan stabil.'
      );
    } finally {
      setLoadingRecap(false);
    }
  };

  const handleExportBaselineJson = () => {
    const dataToExport =
      baselineData.members.length > 0 ? baselineData : loadBaselineSnapshot();
    const dataStr =
      'data:text/json;charset=utf-8,' +
      encodeURIComponent(JSON.stringify(dataToExport, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute(
      'download',
      `guild_members_gc_data_${new Date().toISOString().split('T')[0]}.json`
    );
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleCopyDiscordReport = () => {
    if (!comparisonResult) return;
    const text = generateDiscordRecapText(comparisonResult, guildFilter);
    navigator.clipboard.writeText(text);
    onNotify('success', 'Rekap laporan Discord berhasil disalin ke clipboard.');
  };

  const statusTabOptions: readonly SegmentedTabOption<RecapStatusTab>[] =
    comparisonResult
      ? [
          {
            value: 'uncontributed',
            label: `Belum Kontribusi (${comparisonResult.uncontributedCount})`,
            icon: AlertTriangle,
          },
          {
            value: 'contributed',
            label: `Sudah Kontribusi (${comparisonResult.contributedCount})`,
            icon: CheckCircle,
          },
          {
            value: 'all',
            label: `Semua (${comparisonResult.totalMembers})`,
          },
        ]
      : [];

  let filteredItems: MemberComparisonItem[] = comparisonResult
    ? comparisonResult.items
    : [];

  if (comparisonResult) {
    if (statusTab === 'uncontributed') {
      filteredItems = comparisonResult.uncontributedList;
    } else if (statusTab === 'contributed') {
      filteredItems = comparisonResult.contributedList;
    }

    if (guildFilter > 0) {
      filteredItems = filteredItems.filter((item) => item.guildId === guildFilter);
    }

    if (searchTerm.trim().length > 0) {
      const q = searchTerm.toLowerCase();
      filteredItems = filteredItems.filter(
        (item) =>
          item.name.toLowerCase().includes(q) ||
          String(item.playerId).includes(q) ||
          item.guildName.toLowerCase().includes(q)
      );
    }
  }

  return (
    <div className="space-y-6">
      {/* Header & Actions */}
      <div className="minimal-card p-6 space-y-5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-[#27272a] pb-5">
          <div className="space-y-1">
            <h2 className="font-heading font-bold text-lg text-white">
              Deteksi Kontribusi Guild Challenge
            </h2>
            <p className="text-xs text-zinc-400">
              Data dasar terakhir:{' '}
              <span className="text-zinc-200 font-medium">
                {baselineData.fetchedAt
                  ? new Date(baselineData.fetchedAt).toLocaleString('id-ID')
                  : 'Belum ada snapshot'}
              </span>{' '}
              ({baselineData.totalMembers || baselineData.members?.length || 0} member)
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={handleExportBaselineJson}
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export JSON</span>
            </Button>

            {comparisonResult && (
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={handleCopyDiscordReport}
              >
                <Copy className="w-3.5 h-3.5" />
                <span>Salin Laporan Discord</span>
              </Button>
            )}

            <Button
              type="button"
              size="sm"
              disabled={loadingRecap}
              onClick={handleTriggerComparison}
            >
              <RefreshCw
                className={`w-3.5 h-3.5 ${loadingRecap ? 'animate-spin' : ''}`}
              />
              <span>{loadingRecap ? 'Membandingkan...' : 'Bandingkan Data'}</span>
            </Button>
          </div>
        </div>

        {/* Summary Breakdown */}
        {comparisonResult ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {comparisonResult.guildSummary.map((g) => (
              <div
                key={g.guildId}
                className="bg-[#09090b] border border-[#27272a] rounded-xl p-4 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="font-heading font-bold text-sm text-white">
                    {g.guildName}
                  </span>
                  <Badge tone="neutral">
                    {(g.server || (g.guildId === 2013 ? 'NA' : 'AP')).toUpperCase()}
                  </Badge>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-[#27272a]">
                  <div className="bg-red-950/40 border border-red-900/50 p-2.5 rounded-lg">
                    <span className="text-red-300 text-xs block">Belum Kontribusi</span>
                    <strong className="text-white text-base font-bold tabular-nums">
                      {g.uncontributed}
                    </strong>
                  </div>
                  <div className="bg-emerald-950/40 border border-emerald-900/50 p-2.5 rounded-lg">
                    <span className="text-emerald-300 text-xs block">Sudah Kontribusi</span>
                    <strong className="text-white text-base font-bold tabular-nums">
                      {g.contributed}
                    </strong>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <Empty className="py-8">
            <EmptyHeader>
              <EmptyMedia variant="icon" className="bg-[#18181b] text-zinc-300">
                <RefreshCw className="w-5 h-5" />
              </EmptyMedia>
              <EmptyTitle className="text-white text-base">
                Belum ada hasil komparasi
              </EmptyTitle>
              <EmptyDescription className="text-zinc-400 text-xs">
                Klik tombol &ldquo;Bandingkan Data&rdquo; di kanan atas untuk mengambil data
                terbaru dari 4 guild dan membandingkannya dengan data dasar.
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        )}
      </div>

      {/* Results Table */}
      {comparisonResult && (
        <div className="minimal-card p-4 sm:p-6 space-y-5">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-[#27272a] pb-4">
            <SegmentedTabs
              options={statusTabOptions}
              value={statusTab}
              onChange={setStatusTab}
              size="sm"
              ariaLabel="Filter status kontribusi"
            />

            <div className="flex flex-wrap items-center gap-2.5">
              <Select
                value={guildFilter}
                onChange={(e) => setGuildFilter(Number(e.target.value))}
                className="w-auto text-xs py-2"
              >
                <option value={0}>Semua Guild</option>
                {GUILD_BRANCHES.map((branch) => (
                  <option key={branch.id} value={branch.id}>
                    {branch.name} ({branch.shortRegion})
                  </option>
                ))}
              </Select>

              <div className="relative min-w-[200px]">
                <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <Input
                  type="text"
                  placeholder="Cari nama atau UID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 text-xs py-2"
                />
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#27272a] text-zinc-400 uppercase tracking-wider">
                  <th className="pb-3 px-3 font-semibold">Guild</th>
                  <th className="pb-3 px-3 font-semibold">Nama Member</th>
                  <th className="pb-3 px-3 font-semibold">Player ID</th>
                  <th className="pb-3 px-3 font-semibold text-right">Minggu Lalu</th>
                  <th className="pb-3 px-3 font-semibold text-right">Minggu Ini</th>
                  <th className="pb-3 px-3 font-semibold text-right">Selisih</th>
                  <th className="pb-3 px-3 font-semibold text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#27272a]">
                {filteredItems.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-zinc-500">
                      Tidak ada data member yang cocok dengan filter.
                    </td>
                  </tr>
                ) : (
                  filteredItems.map((item) => (
                    <tr
                      key={`${item.guildId}_${item.playerId}`}
                      className="hover:bg-[#18181b]/60 transition-colors"
                    >
                      <td className="py-3 px-3 text-white font-medium">
                        {item.guildName}
                        <span className="text-xs text-zinc-500 block uppercase">
                          {item.server}
                        </span>
                      </td>
                      <td className="py-3 px-3 font-heading font-semibold text-white">
                        {item.name}
                      </td>
                      <td className="py-3 px-3 font-mono text-zinc-400 tabular-nums">
                        {item.playerId}
                      </td>
                      <td className="py-3 px-3 font-mono text-right text-zinc-300 tabular-nums">
                        {item.oldContribution.toLocaleString()}
                      </td>
                      <td className="py-3 px-3 font-mono text-right text-white font-semibold tabular-nums">
                        {item.newContribution.toLocaleString()}
                      </td>
                      <td className="py-3 px-3 font-mono text-right font-semibold tabular-nums">
                        {item.difference > 0 ? (
                          <span className="text-emerald-400">
                            +{item.difference.toLocaleString()}
                          </span>
                        ) : item.difference < 0 ? (
                          <span className="text-red-400">
                            {item.difference.toLocaleString()}
                          </span>
                        ) : (
                          <span className="text-zinc-500">0</span>
                        )}
                      </td>
                      <td className="py-3 px-3 text-center">
                        {item.statusReason === 'MEMBER_BARU' ? (
                          <Badge tone="warning">Member Baru</Badge>
                        ) : !item.hasContributed ? (
                          <Badge tone="danger">Belum Kontribusi</Badge>
                        ) : (
                          <Badge tone="success">Sudah Kontribusi</Badge>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
