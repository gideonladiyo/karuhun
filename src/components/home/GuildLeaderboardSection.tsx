import React, { useState, useEffect, useMemo } from 'react';
import { Trophy, ChevronRight } from 'lucide-react';
import { getGuildsList, getAllianceLiveActivity, getGuildData } from '@/services/apiService';
import { GUILD_BRANCHES, GuildBranchConfig } from '@/services/imageUtils';
import { GuildListItem, AllianceActivitySummary, GuildActivityStats, GuildMember } from '@/types';
import { MainTab } from '@/pages/HomePage';
import { DEFAULT_LEADERSHIP, LeadershipProfile } from '@/data/static/leadershipData';
import { GuildLeadershipSilhouette } from './GuildLeadershipSilhouette';
import { SectionHeader } from '@/components/ui/section-header';
import { SegmentedTabs, SERVER_OPTIONS } from '@/components/ui/segmented-tabs';
import { GuildCrest } from '@/components/domain/GuildCrest';
import { Button } from '@/components/ui/button';
import { Empty, EmptyHeader, EmptyMedia, EmptyTitle, EmptyDescription } from '@/components/ui/empty';

export type { LeadershipProfile };
export { GuildLeadershipSilhouette };

interface GuildLeaderboardSectionProps {
  onNavigate: (tab: MainTab, branchId?: number) => void;
  onSelectPlayer?: (uid: number, server: string) => void;
}

interface PodiumEntry {
  branch: GuildBranchConfig;
  guild: GuildListItem | null;
  globalRank: number | null;
  activity: GuildActivityStats | null;
  leadership: LeadershipProfile[];
}

const PODIUM_PLACES = [
  {
    plinthHeight: 'h-28 sm:h-40',
    plinthTheme: 'bg-gradient-to-b from-amber-500/35 via-amber-950/25 to-[#0d0d11] border-amber-400/60',
    plinthNumeral: 'text-amber-300',
    badge: 'bg-amber-400 text-black border-amber-200',
    ring: 'border-amber-400/70'
  },
  {
    plinthHeight: 'h-20 sm:h-28',
    plinthTheme: 'bg-gradient-to-b from-zinc-400/20 via-zinc-900/35 to-[#0d0d11] border-zinc-500/50',
    plinthNumeral: 'text-zinc-200',
    badge: 'bg-zinc-200 text-black border-white',
    ring: 'border-zinc-400/60'
  },
  {
    plinthHeight: 'h-14 sm:h-20',
    plinthTheme: 'bg-gradient-to-b from-orange-800/35 via-orange-950/25 to-[#0d0d11] border-orange-700/50',
    plinthNumeral: 'text-orange-300',
    badge: 'bg-orange-500 text-white border-orange-300',
    ring: 'border-orange-600/60'
  }
] as const;

const placeStyle = (position: number) => PODIUM_PLACES[Math.min(position, 3) - 1];

export const GuildLeaderboardSection: React.FC<GuildLeaderboardSectionProps> = ({
  onNavigate,
  onSelectPlayer
}) => {
  const [selectedServer, setSelectedServer] = useState<'ap' | 'na'>('ap');
  const [guilds, setGuilds] = useState<GuildListItem[]>([]);
  const [liveActivity, setLiveActivity] = useState<AllianceActivitySummary | null>(null);
  const [liveLeadership, setLiveLeadership] = useState<Record<number, LeadershipProfile[]>>({});
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    setLoading(true);
    const serverBranches = GUILD_BRANCHES.filter((b) => b.server === selectedServer);

    Promise.all([
      getGuildsList(selectedServer),
      getAllianceLiveActivity(),
      ...serverBranches.map((b) => getGuildData(b.server, b.id).catch(() => null))
    ])
      .then(([guildsData, activityData, ...branchGuildResponses]) => {
        setGuilds(guildsData);
        setLiveActivity(activityData);

        const leadershipMap: Record<number, LeadershipProfile[]> = {};
        branchGuildResponses.forEach((res, idx) => {
          const branch = serverBranches[idx];
          if (!branch) return;

          const members = res?.data?.members || [];
          const leaders = members.filter((m: GuildMember) => m.rankLevel === 1);
          const vices = members.filter((m: GuildMember) => m.rankLevel === 2);

          const list: LeadershipProfile[] = [];
          leaders.forEach((leader) => {
            list.push({
              playerId: leader.playerId,
              name: leader.name,
              role: 'LEADER',
              rankLevel: 1,
              portrait: leader.portrait,
              frame: leader.frame,
              level: leader.level
            });
          });

          const orderedVices = branch.id === 3638 ? [...vices].reverse() : vices;

          orderedVices.forEach((vice) => {
            list.push({
              playerId: vice.playerId,
              name: vice.name,
              role: 'VICE LEADER',
              rankLevel: 2,
              portrait: vice.portrait,
              frame: vice.frame,
              level: vice.level
            });
          });

          if (list.length > 0) {
            leadershipMap[branch.id] = list;
          }
        });

        setLiveLeadership(leadershipMap);
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
        const leadership =
          liveLeadership[branch.id] ||
          DEFAULT_LEADERSHIP[branch.id] ||
          [];

        return {
          branch,
          guild: hit?.guild ?? null,
          globalRank: hit?.globalRank ?? null,
          activity: liveActivity?.branches?.[branch.id] ?? null,
          leadership
        };
      })
      .sort((a, b) => {
        if (a.globalRank === null) return b.globalRank === null ? a.branch.id - b.branch.id : 1;
        if (b.globalRank === null) return -1;
        return a.globalRank - b.globalRank;
      });
  }, [guilds, liveActivity, liveLeadership, selectedServer]);

  const podiumOrder = useMemo<PodiumEntry[]>(() => {
    if (podium.length !== 3) return podium;
    return [podium[1], podium[0], podium[2]];
  }, [podium]);

  const tierOf = (branch: GuildBranchConfig): string =>
    branch.server === 'na' ? `${branch.tag} NA` : branch.tag;

  return (
    <section className="relative w-full">
      <SectionHeader
        level="primary"
        title="Guild Ranking"
        subtitle="Simulated Siege standings across AP and NA divisions."
        actions={
          <SegmentedTabs
            options={SERVER_OPTIONS}
            value={selectedServer}
            onChange={setSelectedServer}
          />
        }
      />

      {/* Loading State */}
      {loading && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-72 sm:h-80 rounded-xl bg-[#121215] border border-[#27272a] animate-pulse" />
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && podium.length === 0 && (
        <Empty className="rounded-xl bg-[#121215] border border-[#27272a] py-14">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <Trophy className="w-5 h-5 text-zinc-400" />
            </EmptyMedia>
            <EmptyTitle className="font-heading font-bold text-sm text-zinc-200">
              No Standings Available
            </EmptyTitle>
            <EmptyDescription className="text-xs text-zinc-400">
              No branches found for {selectedServer.toUpperCase()} server.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
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

              return (
                <div key={entry.branch.id} className="flex flex-col items-center">
                  <div className="w-full flex flex-col items-center text-center space-y-3 px-2 pb-4">
                    <div className="relative">
                      <GuildCrest
                        src={entry.branch.logo}
                        alt={entry.branch.name}
                        size="xl"
                        ringClassName={`${style.ring} shadow-lg`}
                      />
                      <div className={`absolute -bottom-2 -right-2 w-9 h-9 rounded-full flex items-center justify-center text-base font-heading font-black border-2 shadow-md ${style.badge}`}>
                        {position}
                      </div>
                    </div>

                    <div className="space-y-0.5">
                      <h3 className="font-heading font-black text-base sm:text-xl text-white tracking-tight leading-tight">
                        {entry.guild?.name ?? entry.branch.name}
                      </h3>
                      <p className="text-xs font-tech text-zinc-400 font-semibold">
                        {tierOf(entry.branch)}
                      </p>
                    </div>

                    <GuildLeadershipSilhouette
                      profiles={entry.leadership}
                      server={entry.branch.server}
                      onSelectPlayer={onSelectPlayer}
                    />

                    <Button
                      variant={position === 1 ? 'amber' : 'secondary'}
                      size="default"
                      onClick={() => onNavigate('hub', entry.branch.id)}
                      className="w-full mt-1"
                    >
                      <span>View Branch</span>
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>

                  {/* Plinth */}
                  <div
                    className={`w-full flex items-center justify-center rounded-t-xl border-x border-t ${style.plinthHeight} ${style.plinthTheme}`}
                  >
                    <span className={`font-heading font-black text-5xl sm:text-6xl ${style.plinthNumeral}`}>
                      {position}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Mobile Stacked Cards */}
          <div className="md:hidden space-y-3">
            {podium.map((entry, idx) => {
              const position = idx + 1;
              const style = placeStyle(position);

              return (
                <div
                  key={entry.branch.id}
                  className="flex items-center gap-3.5 rounded-xl bg-[#121215] border border-[#27272a] p-3.5"
                >
                  <div className="relative shrink-0">
                    <GuildCrest
                      src={entry.branch.logo}
                      alt={entry.branch.name}
                      size="lg"
                      ringClassName={style.ring}
                    />
                    <div className={`absolute -bottom-1 -right-1 w-7 h-7 rounded-full flex items-center justify-center text-xs font-heading font-black border-2 shadow-md ${style.badge}`}>
                      {position}
                    </div>
                  </div>

                  <div className="min-w-0 flex-1 space-y-1">
                    <div className="text-xs font-tech font-semibold text-zinc-400">
                      Karuhun 夜 · {tierOf(entry.branch)}
                    </div>
                    <h3 className="font-heading font-extrabold text-sm text-white tracking-tight leading-tight truncate">
                      {entry.guild?.name ?? entry.branch.name}
                    </h3>

                    <GuildLeadershipSilhouette
                      profiles={entry.leadership}
                      server={entry.branch.server}
                      onSelectPlayer={onSelectPlayer}
                      compact={true}
                    />
                  </div>

                  <Button
                    variant={position === 1 ? 'amber' : 'secondary'}
                    size="icon"
                    onClick={() => onNavigate('hub', entry.branch.id)}
                    aria-label={`View ${entry.branch.name}`}
                    className="shrink-0 self-center"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              );
            })}
          </div>
        </>
      )}
    </section>
  );
};
