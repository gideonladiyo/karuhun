import React, { useState, useEffect, useMemo } from 'react';
import { Trophy, ChevronRight, Users, UserCheck } from 'lucide-react';
import { getGuildsList, getAllianceLiveActivity } from '@/services/apiService';
import { getHuaxuImageUrl, GUILD_BRANCHES, GuildBranchConfig } from '@/services/imageUtils';
import { GuildListItem, AllianceActivitySummary, GuildActivityStats } from '@/types';
import { MainTab } from '@/pages/HomePage';

interface GuildLeaderboardSectionProps {
  onNavigate: (tab: MainTab, branchId?: number) => void;
}

interface PodiumEntry {
  branch: GuildBranchConfig;
  guild: GuildListItem | null;
  globalRank: number | null;
  activity: GuildActivityStats | null;
}

const PODIUM_PLACES = [
  {
    plinthHeight: 'h-28 sm:h-40',
    plinthTheme: 'bg-gradient-to-b from-amber-500/40 via-amber-950/30 to-[#0d0d11] border-amber-400/60',
    plinthNumeral: 'text-amber-300',
    badge: 'bg-gradient-to-br from-amber-300 via-amber-400 to-yellow-600 text-black border-yellow-200',
    ring: 'border-amber-400/70 shadow-amber-500/20'
  },
  {
    plinthHeight: 'h-20 sm:h-28',
    plinthTheme: 'bg-gradient-to-b from-zinc-400/25 via-zinc-900/40 to-[#0d0d11] border-zinc-500/50',
    plinthNumeral: 'text-zinc-200',
    badge: 'bg-gradient-to-br from-zinc-200 via-zinc-300 to-zinc-400 text-black border-white',
    ring: 'border-zinc-400/60'
  },
  {
    plinthHeight: 'h-14 sm:h-20',
    plinthTheme: 'bg-gradient-to-b from-orange-800/40 via-orange-950/30 to-[#0d0d11] border-orange-700/50',
    plinthNumeral: 'text-orange-300',
    badge: 'bg-gradient-to-br from-amber-600 via-orange-500 to-yellow-700 text-white border-amber-400',
    ring: 'border-orange-600/60'
  }
] as const;

const placeStyle = (position: number) => PODIUM_PLACES[Math.min(position, 3) - 1];

export const GuildLeaderboardSection: React.FC<GuildLeaderboardSectionProps> = ({ onNavigate }) => {
  const [selectedServer, setSelectedServer] = useState<'ap' | 'na'>('ap');
  const [guilds, setGuilds] = useState<GuildListItem[]>([]);
  const [liveActivity, setLiveActivity] = useState<AllianceActivitySummary | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      getGuildsList(selectedServer),
      getAllianceLiveActivity()
    ])
      .then(([guildsData, activityData]) => {
        setGuilds(guildsData);
        setLiveActivity(activityData);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to load leaderboard data', err);
        setLoading(false);
      });
  }, [selectedServer]);

  const podium = useMemo<PodiumEntry[]>(() => {
    const rankIndex = new Map<number, { guild: GuildListItem; globalRank: number }>();
    guilds.forEach((guild, idx) => {
      if (!rankIndex.has(guild.guildId)) {
        rankIndex.set(guild.guildId, { guild, globalRank: idx + 1 });
      }
    });

    return GUILD_BRANCHES
      .filter((branch) => branch.server === selectedServer)
      .map((branch) => {
        const hit = rankIndex.get(branch.id);
        return {
          branch,
          guild: hit?.guild ?? null,
          globalRank: hit?.globalRank ?? null,
          activity: liveActivity?.branches?.[branch.id] ?? null
        };
      })
      .sort((a, b) => {
        if (a.globalRank === null) return b.globalRank === null ? a.branch.id - b.branch.id : 1;
        if (b.globalRank === null) return -1;
        return a.globalRank - b.globalRank;
      });
  }, [guilds, liveActivity, selectedServer]);

  const podiumOrder = useMemo<PodiumEntry[]>(() => {
    if (podium.length !== 3) return podium;
    return [podium[1], podium[0], podium[2]];
  }, [podium]);

  const tierOf = (branch: GuildBranchConfig): string =>
    branch.server === 'na' ? `${branch.tag} NA` : branch.tag;

  const renderCrest = (entry: PodiumEntry, ringClass: string, sizeClass: string) => (
    <div className={`${sizeClass} shrink-0 rounded-full border-[3px] flex items-center justify-center overflow-hidden bg-black/50 ${ringClass}`}>
      <img
        src={entry.guild?.icon ? getHuaxuImageUrl(entry.guild.icon) : '/logo.png'}
        alt={entry.guild?.name ?? entry.branch.name}
        loading="lazy"
        decoding="async"
        onError={(e) => {
          const el = e.target as HTMLImageElement;
          if (el.src.endsWith('/logo.png')) return;
          el.src = '/logo.png';
        }}
        className="w-full h-full object-cover filter contrast-125"
      />
    </div>
  );

  return (
    <section className="relative w-full mb-14 sm:mb-20 animate-fadeIn">

      {/* Section Top Header & Server Switcher */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6 pb-4 border-b border-[#27272a]">
        <div>
          <h2 className="font-heading font-black text-2xl sm:text-4xl text-white tracking-tight flex items-center gap-3">
            <span>ALLIANCE PODIUM</span>
          </h2>
          <p className="text-zinc-400 text-xs sm:text-sm font-sans mt-1 max-w-3xl">
            Official Karuhun union branches only, ranked by their real standing on the
            {' '}
            {selectedServer === 'ap' ? 'Asia-Pacific' : 'North America'} simulated siege ladder.
          </p>
        </div>

        {/* Server Switcher */}
        <div className="flex items-center space-x-1 bg-[#121215] p-1 rounded-xl border border-[#27272a] self-stretch md:self-auto">
          <button
            onClick={() => setSelectedServer('ap')}
            className={`flex-1 md:flex-none px-3.5 py-1.5 rounded-lg text-xs font-heading font-bold transition-all focus-tactical ${
              selectedServer === 'ap'
                ? 'bg-white text-black shadow-sm'
                : 'text-zinc-400 hover:text-white hover:bg-[#18181b]'
            }`}
          >
            AP SERVER
          </button>
          <button
            onClick={() => setSelectedServer('na')}
            className={`flex-1 md:flex-none px-3.5 py-1.5 rounded-lg text-xs font-heading font-bold transition-all focus-tactical ${
              selectedServer === 'na'
                ? 'bg-white text-black shadow-sm'
                : 'text-zinc-400 hover:text-white hover:bg-[#18181b]'
            }`}
          >
            NA SERVER
          </button>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-72 sm:h-80 rounded-2xl sm:rounded-3xl bg-[#121215] border border-[#27272a] animate-pulse" />
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && podium.length === 0 && (
        <div className="rounded-2xl sm:rounded-3xl bg-[#121215] border border-[#27272a] py-16 text-center text-zinc-500 space-y-2">
          <Trophy className="w-8 h-8 mx-auto text-zinc-600 opacity-50" />
          <div className="font-heading font-bold text-sm text-zinc-300">Empty Data</div>
          <div className="text-xs font-sans">
            No alliance branches configured for {selectedServer.toUpperCase()} server.
          </div>
        </div>
      )}

      {!loading && podium.length > 0 && (
        <>
          {/* Desktop Podium */}
          <div
            className={`hidden md:grid gap-4 sm:gap-6 items-end ${
              podium.length === 3 ? 'grid-cols-3' : 'grid-cols-1 max-w-sm mx-auto'
            }`}
          >
            {podiumOrder.map((entry) => {
              const position = podium.findIndex((p) => p.branch.id === entry.branch.id) + 1;
              const style = placeStyle(position);
              const points = entry.guild?.contributionWeek ?? null;
              const memberCount = entry.guild?.memberCount ?? entry.branch.defaultMembers ?? 0;
              const maxMembers = entry.guild?.maxMemberCount ?? 80;

              return (
                <div key={entry.branch.id} className="flex flex-col items-center">
                  {/* Crest, Rank & Guild Details */}
                  <div className="w-full flex flex-col items-center text-center space-y-3 px-2 pb-4">
                    <div className="relative">
                      {renderCrest(entry, `${style.ring} shadow-xl`, 'w-20 h-20 sm:w-24 sm:h-24')}
                      <div className={`absolute -bottom-1.5 -right-1.5 w-8 h-8 rounded-full flex items-center justify-center text-sm font-heading font-black border-2 shadow-lg ${style.badge}`}>
                        {position}
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <div className="text-[9px] font-tech font-bold px-2 py-0.5 rounded bg-amber-500 text-black uppercase tracking-wider inline-block">
                        KARUHUN 夜 ({tierOf(entry.branch)})
                      </div>
                      <h3 className="font-heading font-black text-base sm:text-lg text-white tracking-tight leading-tight">
                        {entry.guild?.name ?? entry.branch.name}
                      </h3>
                      <div className="text-[11px] font-tech text-zinc-400">
                        Leader: <span className="text-zinc-300">{entry.guild?.leaderName || 'Unknown'}</span>
                      </div>
                    </div>

                    <div className="w-full space-y-1.5 pt-2 border-t border-[#27272a]/60">
                      <div className="flex items-center justify-between text-[11px] font-tech">
                        <span className="text-zinc-500 uppercase tracking-wider">Server Rank</span>
                        <span className="font-heading font-black text-white tabular-nums">
                          {entry.globalRank !== null ? `#${entry.globalRank}` : '—'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-[11px] font-tech">
                        <span className="text-zinc-500 uppercase tracking-wider">Weekly Pts</span>
                        <span className="font-heading font-black text-amber-400 tabular-nums">
                          {points !== null ? points.toLocaleString() : '—'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-[11px] font-tech">
                        <span className="flex items-center space-x-1 text-zinc-500 uppercase tracking-wider">
                          <Users className="w-3 h-3" />
                          <span>Members</span>
                        </span>
                        <span className="font-tech text-zinc-200 tabular-nums">
                          {memberCount}/{maxMembers}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-[11px] font-tech">
                        <span className="flex items-center space-x-1 text-zinc-500 uppercase tracking-wider">
                          <UserCheck className="w-3 h-3" />
                          <span>Active</span>
                        </span>
                        <span className="font-tech text-emerald-400 font-bold tabular-nums">
                          {entry.activity ? `${entry.activity.activePercentage}%` : '—'}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => onNavigate('hub', entry.branch.id)}
                      className="w-full px-3 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-black text-xs font-heading font-bold transition-all flex items-center justify-center space-x-1 shadow-sm focus-tactical"
                    >
                      <span>View Branch</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Plinth */}
                  <div
                    className={`w-full flex items-center justify-center rounded-t-2xl border-x border-t ${style.plinthHeight} ${style.plinthTheme}`}
                  >
                    <span className={`font-heading font-black text-5xl sm:text-6xl ${style.plinthNumeral}`}>
                      {position}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Mobile Stacked Circles */}
          <div className="md:hidden space-y-3">
            {podium.map((entry, idx) => {
              const position = idx + 1;
              const style = placeStyle(position);
              const points = entry.guild?.contributionWeek ?? null;
              const memberCount = entry.guild?.memberCount ?? entry.branch.defaultMembers ?? 0;
              const maxMembers = entry.guild?.maxMemberCount ?? 80;

              return (
                <div
                  key={entry.branch.id}
                  className="flex items-center gap-4 rounded-2xl bg-[#121215] border border-[#27272a] p-4 shadow-xl"
                >
                  {/* Big Circle Crest */}
                  <div className="relative shrink-0">
                    {renderCrest(entry, `${style.ring} shadow-xl`, 'w-24 h-24')}
                    <div className={`absolute -bottom-1 -right-1 w-8 h-8 rounded-full flex items-center justify-center text-sm font-heading font-black border-2 shadow-lg ${style.badge}`}>
                      {position}
                    </div>
                  </div>

                  {/* Guild Details */}
                  <div className="min-w-0 flex-1 space-y-1.5">
                    <div className="text-[8px] font-tech font-bold px-1.5 py-0.5 rounded bg-amber-500 text-black uppercase tracking-wider inline-block">
                      KARUHUN 夜 ({tierOf(entry.branch)})
                    </div>
                    <h3 className="font-heading font-black text-sm text-white tracking-tight leading-tight truncate">
                      {entry.guild?.name ?? entry.branch.name}
                    </h3>
                    <div className="text-[10px] font-tech text-zinc-400 truncate">
                      Leader: <span className="text-zinc-300">{entry.guild?.leaderName || 'Unknown'}</span>
                    </div>
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 pt-1 text-[10px] font-tech">
                      <span className="text-zinc-500">
                        Rank{' '}
                        <strong className="text-white tabular-nums">
                          {entry.globalRank !== null ? `#${entry.globalRank}` : '—'}
                        </strong>
                      </span>
                      <span className="text-zinc-500">
                        <strong className="text-amber-400 tabular-nums">
                          {points !== null ? points.toLocaleString() : '—'}
                        </strong>{' '}
                        Pts
                      </span>
                      <span className="flex items-center space-x-1 text-zinc-400">
                        <Users className="w-2.5 h-2.5" />
                        {memberCount}/{maxMembers}
                      </span>
                      <span className="flex items-center space-x-1 text-emerald-400 font-bold">
                        <UserCheck className="w-2.5 h-2.5" />
                        {entry.activity ? `${entry.activity.activePercentage}%` : '—'}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => onNavigate('hub', entry.branch.id)}
                    aria-label={`View ${entry.branch.name}`}
                    className="shrink-0 w-9 h-9 rounded-lg bg-amber-500 hover:bg-amber-400 text-black flex items-center justify-center shadow-sm focus-tactical"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              );
            })}
          </div>

          {/* Footer Summary */}
          <div className="mt-6 px-5 py-3.5 bg-[#09090b] border border-[#27272a] rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3 text-xs font-tech text-zinc-500">
            <div>
              Tracking <strong className="text-zinc-300">{podium.length}</strong> official Karuhun branch
              {podium.length === 1 ? '' : 'es'} on{' '}
              <strong className="text-zinc-300">{selectedServer.toUpperCase()}</strong> server
              {guilds.length > 0 && (
                <span className="text-zinc-600"> &middot; ranked against {guilds.length} guilds total</span>
              )}
            </div>
            <div className="text-zinc-600 uppercase tracking-wider">
              {selectedServer === 'ap' ? 'Asia-Pacific Ladder' : 'North America Ladder'}
            </div>
          </div>
        </>
      )}
    </section>
  );
};