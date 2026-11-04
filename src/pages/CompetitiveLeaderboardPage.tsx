import React, { useState, useEffect, useMemo } from 'react';
import { Search } from 'lucide-react';
import {
  fetchCompositeAllianceLeaderboard,
  sortAllianceMembers,
  getTotalScore,
  MemberCompetitiveAchievement,
  RankingSort
} from '@/services/rankingUtils';
import { GUILD_BRANCHES } from '@/services/imageUtils';
import { SegmentedTabs, COMPETITIVE_MODE_OPTIONS } from '@/components/ui/segmented-tabs';
import { PlayerAvatar } from '@/components/domain/PlayerAvatar';
import { formatNumber } from '@/lib/format';
import { cn } from '@/lib/utils';
import { PlayerScoreModal } from '@/components/domain/PlayerScoreModal';

interface CompetitiveLeaderboardProps {
  onSelectPlayer: (playerId: number, server: string) => void;
}

const GUILD_OPTIONS = [
  { value: 'all', label: 'All guilds' },
  ...GUILD_BRANCHES.map((b) => ({ value: String(b.id), label: `${b.name} · ${b.shortRegion}` })),
];

const scoreClass = (active: boolean) =>
  cn('tabular-nums text-right', active ? 'text-white font-semibold' : 'text-zinc-400');

export const CompetitiveLeaderboard: React.FC<CompetitiveLeaderboardProps> = ({ onSelectPlayer }) => {
  const [guildFilter, setGuildFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<RankingSort>('total');
  const [loading, setLoading] = useState(true);
  const [members, setMembers] = useState<MemberCompetitiveAchievement[]>([]);
  const [selected, setSelected] = useState<MemberCompetitiveAchievement | null>(null);

  useEffect(() => {
    fetchCompositeAllianceLeaderboard()
      .then(setMembers)
      .catch((err) => console.error('Failed to load rankings', err))
      .finally(() => setLoading(false));
  }, []);

  const rows = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    return sortAllianceMembers(
      members.filter(
        (m) =>
          (guildFilter === 'all' || String(m.guildId) === guildFilter) &&
          (!q || m.name.toLowerCase().includes(q) || String(m.id).includes(q))
      ),
      sortBy
    );
  }, [members, guildFilter, searchTerm, sortBy]);

  return (
    <div className="space-y-6 animate-fadeIn pb-16 md:pb-0">
      <header className="flex flex-col gap-1 pt-2">
        <h1 className="text-2xl sm:text-3xl font-heading font-bold text-white tracking-tight">Rankings</h1>
        <p className="text-sm text-zinc-400">
          Current-week Warzone (all tiers) and PPC scores for members of the four Karuhun guilds, AP &amp; NA.
        </p>
      </header>

      <div className="flex flex-col lg:flex-row lg:items-center gap-3">
        <SegmentedTabs
          options={COMPETITIVE_MODE_OPTIONS}
          value={sortBy}
          onChange={setSortBy}
          ariaLabel="Sort by"
          fullWidthOnMobile
        />
        <SegmentedTabs
          options={GUILD_OPTIONS}
          value={guildFilter}
          onChange={setGuildFilter}
          ariaLabel="Filter by guild"
          className="max-w-full"
        />
        <div className="relative lg:ml-auto lg:w-60">
          <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search name or ID"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[#09090b] text-sm text-white border border-[#27272a] rounded-xl pl-9 pr-3 py-2 focus:outline-none focus:border-zinc-500"
          />
        </div>
      </div>

      <div className="rounded-xl border border-[#27272a] bg-[#0d0d10] overflow-hidden">
        {loading ? (
          <div className="divide-y divide-[#1f1f23]">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="h-16 px-4 flex items-center gap-4">
                <div className="w-6 h-3 rounded bg-[#18181b] animate-pulse" />
                <div className="w-10 h-10 rounded-lg bg-[#18181b] animate-pulse" />
                <div className="h-3 w-40 rounded bg-[#18181b] animate-pulse" />
              </div>
            ))}
          </div>
        ) : rows.length === 0 ? (
          <p className="py-16 text-center text-sm text-zinc-500">No members found.</p>
        ) : (
          <>
            {/* Desktop table */}
            <table className="hidden md:table w-full text-sm">
              <thead>
                <tr className="text-xs text-zinc-500 border-b border-[#27272a]">
                  <th className="w-12 py-3 pl-4 text-left font-medium">#</th>
                  <th className="py-3 text-left font-medium">Player</th>
                  <th className="py-3 text-left font-medium">Guild</th>
                  <th className={cn('py-3 text-right font-medium', sortBy === 'warzone' && 'text-white')}>Warzone</th>
                  <th className={cn('py-3 text-right font-medium', sortBy === 'ppc' && 'text-white')}>PPC</th>
                  <th className={cn('py-3 pr-4 text-right font-medium', sortBy === 'total' && 'text-white')}>Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1f1f23]">
                {rows.map((m, idx) => (
                  <tr
                    key={`${m.server}:${m.id}`}
                    tabIndex={0}
                    onClick={() => setSelected(m)}
                    onKeyDown={(e) => e.key === 'Enter' && setSelected(m)}
                    className="cursor-pointer hover:bg-[#151519] focus:outline-none focus-visible:bg-[#151519] transition-colors"
                  >
                    <td className={cn('py-3 pl-4 tabular-nums', idx < 3 ? 'text-white font-semibold' : 'text-zinc-500')}>
                      {idx + 1}
                    </td>
                    <td className="py-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <PlayerAvatar portrait={m.portrait} frame={m.frame} alt={m.name} size="sm" />
                        <div className="min-w-0">
                          <div className="text-white font-medium truncate">{m.name}</div>
                          <div className="text-xs text-zinc-500 tabular-nums">{m.id}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 text-zinc-300">
                      {m.guildName} <span className="text-zinc-500 text-xs uppercase">{m.server}</span>
                    </td>
                    <td className={cn('py-3', scoreClass(sortBy === 'warzone'))}>
                      {m.warzone ? (
                        <>
                          <div>{formatNumber(m.warzone.score)}</div>
                          <div className="text-xs text-zinc-500 font-normal">
                            {m.warzone.tierLabel} #{m.warzone.rank}
                          </div>
                        </>
                      ) : (
                        <span className="text-zinc-600">—</span>
                      )}
                    </td>
                    <td className={cn('py-3', scoreClass(sortBy === 'ppc'))}>
                      {m.ppc ? (
                        <>
                          <div>{formatNumber(m.ppc.score)}</div>
                          <div className="text-xs text-zinc-500 font-normal">
                            {m.ppc.level} #{m.ppc.rank}
                          </div>
                        </>
                      ) : (
                        <span className="text-zinc-600">—</span>
                      )}
                    </td>
                    <td className={cn('py-3 pr-4', scoreClass(sortBy === 'total'))}>
                      {formatNumber(getTotalScore(m))}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Mobile list */}
            <ul className="md:hidden divide-y divide-[#1f1f23]">
              {rows.map((m, idx) => {
                const primary = sortBy === 'total' ? getTotalScore(m) : m[sortBy]?.score;
                return (
                  <li key={`${m.server}:${m.id}`}>
                    <button
                      type="button"
                      onClick={() => setSelected(m)}
                      className="w-full flex items-center gap-3 px-4 py-3 text-left active:bg-[#151519]"
                    >
                      <span className={cn('w-6 text-sm tabular-nums', idx < 3 ? 'text-white font-semibold' : 'text-zinc-500')}>
                        {idx + 1}
                      </span>
                      <PlayerAvatar portrait={m.portrait} frame={m.frame} alt={m.name} size="sm" />
                      <div className="min-w-0 flex-1">
                        <div className="text-sm text-white font-medium truncate">{m.name}</div>
                        <div className="text-xs text-zinc-500 truncate">
                          {m.guildName} · WZ {m.warzone ? formatNumber(m.warzone.score) : '—'} · PPC{' '}
                          {m.ppc ? formatNumber(m.ppc.score) : '—'}
                        </div>
                      </div>
                      <span className="text-sm text-white font-semibold tabular-nums">
                        {primary ? formatNumber(primary) : '—'}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </>
        )}
      </div>

      {!loading && (
        <p className="text-xs text-zinc-500">
          {rows.length} members. The API only lists the top 100 per Warzone tier and PPC level, so members outside
          those boards don't appear.
        </p>
      )}

      <PlayerScoreModal
        member={selected}
        onClose={() => setSelected(null)}
        onOpenProfile={(id, server) => {
          setSelected(null);
          onSelectPlayer(id, server);
        }}
      />
    </div>
  );
};
