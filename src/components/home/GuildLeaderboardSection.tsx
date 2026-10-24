import React, { useState, useEffect, useMemo } from 'react';
import { Trophy, ChevronRight } from 'lucide-react';
import { getGuildsList, getAllianceLiveActivity, getGuildData } from '@/services/apiService';
import { GUILD_BRANCHES, GuildBranchConfig, getHuaxuImageUrl } from '@/services/imageUtils';
import { GuildListItem, AllianceActivitySummary, GuildActivityStats, GuildMember } from '@/types';
import { MainTab } from '@/pages/HomePage';

interface GuildLeaderboardSectionProps {
  onNavigate: (tab: MainTab, branchId?: number) => void;
  onSelectPlayer?: (uid: number, server: string) => void;
}

export interface LeadershipProfile {
  playerId: number;
  name: string;
  role: 'LEADER' | 'VICE LEADER';
  rankLevel: number;
  portrait: string;
  frame?: string;
  level: number;
}

const DEFAULT_LEADERSHIP: Record<number, LeadershipProfile[]> = {
  3638: [
    {
      playerId: 18445854,
      name: '夜’ Narasula_',
      role: 'LEADER',
      rankLevel: 1,
      portrait: 'image/roleplayersp/roleheadluolan5',
      frame: 'image/roleplayersp/headframe24',
      level: 120
    },
    {
      playerId: 26438993,
      name: '夜’ Ronova',
      role: 'VICE LEADER',
      rankLevel: 2,
      portrait: 'image/roleplayersp/roleheadr3kurumi4',
      frame: 'image/roleplayersp/headframe23',
      level: 120
    },
    {
      playerId: 11143541,
      name: '夜’ Yezki',
      role: 'VICE LEADER',
      rankLevel: 2,
      portrait: 'image/roleplayersp/roleheadr2jietawei5',
      frame: 'image/roleplayersp/headframe23',
      level: 120
    }
  ],
  1164: [
    {
      playerId: 12301680,
      name: '夜’ しにがみ',
      role: 'LEADER',
      rankLevel: 1,
      portrait: 'image/roleplayersp/roleheadkuluomu7',
      frame: '',
      level: 120
    },
    {
      playerId: 10353724,
      name: '夜’ YukiTo',
      role: 'VICE LEADER',
      rankLevel: 2,
      portrait: 'image/roleplayersp/roleheadr3kurumi4',
      frame: 'image/roleplayersp/headframe23',
      level: 120
    },
    {
      playerId: 26523528,
      name: "夜' MoskDark",
      role: 'VICE LEADER',
      rankLevel: 2,
      portrait: 'image/roleplayersp/roleheadr4luna7',
      frame: '',
      level: 120
    },
    {
      playerId: 29375482,
      name: '夜’ Aleph א',
      role: 'VICE LEADER',
      rankLevel: 2,
      portrait: 'image/roleplayersp/roleheadr3cibeizhe7',
      frame: '',
      level: 120
    }
  ],
  7641: [
    {
      playerId: 26173412,
      name: "夜' MysriouX",
      role: 'LEADER',
      rankLevel: 1,
      portrait: 'image/roleplayersp/roleheadshenwei5ss',
      frame: '',
      level: 96
    },
    {
      playerId: 25830009,
      name: '夜’ Seira',
      role: 'VICE LEADER',
      rankLevel: 2,
      portrait: 'image/roleplayersp/roleheadr3kurumi4',
      frame: 'image/roleplayersp/headframe31',
      level: 105
    },
    {
      playerId: 29487893,
      name: "夜' Evelyn",
      role: 'VICE LEADER',
      rankLevel: 2,
      portrait: 'image/roleplayersp/roleheadr3lamiya6',
      frame: 'image/roleplayersp/headframe24',
      level: 113
    }
  ],
  2013: [
    {
      playerId: 27528870,
      name: "夜' xoxo",
      role: 'LEADER',
      rankLevel: 1,
      portrait: 'image/roleplayersp/roleplayer27',
      frame: 'image/roleplayersp/headframe34',
      level: 59
    },
    {
      playerId: 16667588,
      name: "夜' Yoru ʜʟᴄ",
      role: 'VICE LEADER',
      rankLevel: 2,
      portrait: 'image/roleplayersp/roleheadveracharactertower6',
      frame: 'image/roleplayersp/headframe34',
      level: 113
    }
  ]
};

interface GuildLeadershipSilhouetteProps {
  profiles: LeadershipProfile[];
  server: string;
  onSelectPlayer?: (uid: number, server: string) => void;
  compact?: boolean;
}

export const GuildLeadershipSilhouette: React.FC<GuildLeadershipSilhouetteProps> = ({
  profiles,
  server,
  onSelectPlayer,
  compact = false
}) => {
  const [displayIndex, setDisplayIndex] = useState<number>(0);
  const [phase, setPhase] = useState<'idle' | 'exit' | 'enter'>('idle');
  const [isPaused, setIsPaused] = useState<boolean>(false);

  useEffect(() => {
    if (isPaused || profiles.length <= 1) return;
    const interval = setInterval(() => {
      setPhase('exit');
      setTimeout(() => {
        setDisplayIndex((prev) => (prev + 1) % profiles.length);
        setPhase('enter');
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            setPhase('idle');
          });
        });
      }, 240);
    }, 3800);

    return () => clearInterval(interval);
  }, [isPaused, profiles.length]);

  const currentProfile = profiles[displayIndex] || profiles[0];
  if (!currentProfile) return null;

  const animationClasses =
    phase === 'exit'
      ? '-translate-x-5 opacity-0 transition-all duration-240 ease-in'
      : phase === 'enter'
      ? 'translate-x-5 opacity-0 transition-none'
      : 'translate-x-0 opacity-100 transition-all duration-280 ease-out';

  const avatarSrc = getHuaxuImageUrl(currentProfile.portrait);
  const frameSrc = currentProfile.frame ? getHuaxuImageUrl(currentProfile.frame) : '';

  if (compact) {
    return (
      <div
        className="w-full select-none pt-1"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        {/* Silhouette Profile Card (Mobile) */}
        <div className={`overflow-hidden ${animationClasses}`}>
          <div
            onClick={(e) => {
              if (onSelectPlayer) {
                e.stopPropagation();
                onSelectPlayer(currentProfile.playerId, server);
              }
            }}
            className={`relative flex items-center gap-3 p-3 min-h-[66px] rounded-xl border border-[#27272a] hover:border-zinc-500 bg-gradient-to-r from-[#17171d] via-[#121215] to-[#0d0d11] shadow-md transition-all overflow-hidden [isolation:isolate] ${
              onSelectPlayer ? 'cursor-pointer group' : ''
            }`}
          >
            {/* Left: Avatar with Frame */}
            <div className="relative w-11 h-11 shrink-0 flex items-center justify-center rounded-full z-10">
              {frameSrc && (
                <img
                  src={frameSrc}
                  alt="Frame"
                  className="absolute inset-0 w-full h-full object-contain pointer-events-none z-10 scale-125"
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                />
              )}
              <img
                src={avatarSrc}
                alt={currentProfile.name}
                className="w-full h-full object-cover rounded-full z-0 filter contrast-110"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/logo.png';
                }}
              />
            </div>

            {/* Center: Name & Telemetry (No leader/vice label) */}
            <div className="min-w-0 flex-1 space-y-0.5 z-10">
              <h4 className="font-heading font-black text-xs sm:text-sm text-white truncate group-hover:text-amber-300 transition-colors">
                {currentProfile.name}
              </h4>
              <p className="text-[10px] font-tech text-zinc-400 font-mono truncate">
                LVL <strong className="text-white font-bold">{currentProfile.level}</strong> • UID: {currentProfile.playerId}
              </p>
            </div>

            {/* Right: Low-Opacity Profile Artwork with Natural Scale & Seamless Alpha Mask */}
            <div
              className="absolute right-0 top-0 bottom-0 w-3/5 pointer-events-none overflow-hidden rounded-r-xl select-none z-0 flex items-center justify-end"
              style={{
                WebkitMaskImage: 'linear-gradient(to right, transparent 0%, transparent 15%, black 85%)',
                maskImage: 'linear-gradient(to right, transparent 0%, transparent 15%, black 85%)'
              }}
            >
              <img
                src={avatarSrc}
                alt=""
                loading="lazy"
                decoding="async"
                className="h-full w-full object-cover object-right scale-[1.18] opacity-35 filter contrast-125 saturate-125 transition-opacity duration-300 group-hover:opacity-50"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="w-full select-none pt-2 border-t border-[#27272a]/60"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Silhouette Profile Card (Desktop - Expanded Size) */}
      <div className={`overflow-hidden min-h-[80px] sm:min-h-[86px] ${animationClasses}`}>
        <div
          onClick={(e) => {
            if (onSelectPlayer) {
              e.stopPropagation();
              onSelectPlayer(currentProfile.playerId, server);
            }
          }}
          className={`w-full p-3.5 sm:p-4 rounded-2xl border border-[#27272a] hover:border-amber-400/50 bg-gradient-to-r from-[#181820] via-[#121215] to-[#0d0d11] shadow-lg shadow-black/40 transition-all duration-200 relative overflow-hidden [isolation:isolate] flex items-center gap-3.5 ${
            onSelectPlayer ? 'cursor-pointer group' : ''
          }`}
        >
          {/* Left: Avatar Silhouette with Frame */}
          <div className="relative w-12 h-12 sm:w-14 sm:h-14 shrink-0 flex items-center justify-center rounded-full z-10">
            <div className="absolute inset-0 rounded-full bg-amber-500/10 blur-xs" />
            {frameSrc && (
              <img
                src={frameSrc}
                alt="Frame"
                loading="lazy"
                decoding="async"
                className="absolute inset-0 w-full h-full object-contain pointer-events-none z-10 scale-125"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
            )}
            <img
              src={avatarSrc}
              alt={currentProfile.name}
              loading="lazy"
              decoding="async"
              className="w-full h-full object-cover rounded-full z-0 filter contrast-110 drop-shadow-md group-hover:scale-105 transition-transform"
              onError={(e) => {
                (e.target as HTMLImageElement).src = '/logo.png';
              }}
            />
          </div>

          {/* Center: Info (No leader/vice label) */}
          <div className="min-w-0 flex-1 space-y-1 text-left z-10">
            <h4 className="font-heading font-black text-sm sm:text-base text-white tracking-tight truncate group-hover:text-amber-300 transition-colors">
              {currentProfile.name}
            </h4>

            <p className="text-[11px] sm:text-xs font-tech text-zinc-400 font-mono truncate">
              LVL <strong className="text-white font-bold">{currentProfile.level}</strong> • UID: {currentProfile.playerId}
            </p>
          </div>

          {/* Right: Low-Opacity Profile Artwork with Natural Scale & Seamless Alpha Mask */}
          <div
            className="absolute right-0 top-0 bottom-0 w-1/2 sm:w-3/5 pointer-events-none overflow-hidden rounded-r-2xl select-none z-0 flex items-center justify-end"
            style={{
              WebkitMaskImage: 'linear-gradient(to right, transparent 0%, transparent 15%, black 85%)',
              maskImage: 'linear-gradient(to right, transparent 0%, transparent 15%, black 85%)'
            }}
          >
            <img
              src={avatarSrc}
              alt=""
              loading="lazy"
              decoding="async"
              className="h-full w-full object-cover object-right scale-[1.05] opacity-35 filter contrast-125 saturate-125 transition-opacity duration-300 group-hover:opacity-50"
              onError={(e) => {
                (e.target as HTMLElement).style.display = 'none';
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

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

          // Specifically for Karuhun AP (3638), place Vice 2 (Ronova) before Vice 1 (Yezki)
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

  const renderCrest = (entry: PodiumEntry, ringClass: string, sizeClass: string) => (
    <div className={`${sizeClass} shrink-0 rounded-full border-[3px] flex items-center justify-center overflow-hidden bg-black/50 ${ringClass}`}>
      <img
        src={entry.branch.logo || '/logo.png'}
        alt={entry.branch.name}
        loading="lazy"
        decoding="async"
        onError={(e) => {
          const el = e.target as HTMLImageElement;
          if (el.src.endsWith('/logo.png')) return;
          el.src = '/logo.png';
        }}
        className="w-full h-full object-contain p-1.5 filter contrast-125"
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

              return (
                <div key={entry.branch.id} className="flex flex-col items-center">
                  {/* Crest, Rank & Guild Details */}
                  <div className="w-full flex flex-col items-center text-center space-y-3 px-2 pb-4">
                    <div className="relative">
                      {renderCrest(entry, `${style.ring} shadow-xl`, 'w-20 h-20 sm:w-24 sm:h-24')}
                      <div className={`absolute -bottom-2 -right-2 w-10 h-10 rounded-full flex items-center justify-center text-lg font-heading font-black border-2 shadow-lg ${style.badge}`}>
                        {position}
                      </div>
                    </div>

                    <div className="space-y-0.5">
                      <h3 className="font-heading font-black text-base sm:text-xl text-white tracking-tight leading-tight">
                        {entry.guild?.name ?? entry.branch.name}
                      </h3>
                      <p className="text-[11px] font-tech text-amber-400 font-bold tracking-wider uppercase">
                        {tierOf(entry.branch)}
                      </p>
                    </div>

                    {/* Officer Silhouette Showcase */}
                    <GuildLeadershipSilhouette
                      profiles={entry.leadership}
                      server={entry.branch.server}
                      onSelectPlayer={onSelectPlayer}
                    />

                    {/* View Branch Hub CTA */}
                    <button
                      onClick={() => onNavigate('hub', entry.branch.id)}
                      className="w-full px-4 py-2.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-black text-sm font-heading font-bold transition-all flex items-center justify-center space-x-1 shadow-sm focus-tactical mt-1"
                    >
                      <span>View Branch</span>
                      <ChevronRight className="w-4 h-4" />
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

              return (
                <div
                  key={entry.branch.id}
                  className="flex items-center gap-3.5 rounded-2xl bg-[#121215] border border-[#27272a] p-3.5 shadow-xl"
                >
                  {/* Circle Crest */}
                  <div className="relative shrink-0">
                    {renderCrest(entry, `${style.ring} shadow-xl`, 'w-20 h-20')}
                    <div className={`absolute -bottom-1 -right-1 w-8 h-8 rounded-full flex items-center justify-center text-sm font-heading font-black border-2 shadow-lg ${style.badge}`}>
                      {position}
                    </div>
                  </div>

                  {/* Guild Details & Officer Showcase */}
                  <div className="min-w-0 flex-1 space-y-1">
                    <div className="text-[9px] font-tech font-bold px-2 py-0.5 rounded bg-amber-500 text-black uppercase tracking-wider inline-block">
                      KARUHUN 夜 ({tierOf(entry.branch)})
                    </div>
                    <h3 className="font-heading font-black text-sm text-white tracking-tight leading-tight truncate">
                      {entry.guild?.name ?? entry.branch.name}
                    </h3>

                    {/* Mobile Silhouette Officer Showcase */}
                    <GuildLeadershipSilhouette
                      profiles={entry.leadership}
                      server={entry.branch.server}
                      onSelectPlayer={onSelectPlayer}
                      compact={true}
                    />
                  </div>

                  <button
                    onClick={() => onNavigate('hub', entry.branch.id)}
                    aria-label={`View ${entry.branch.name}`}
                    className="shrink-0 w-8 h-8 rounded-lg bg-amber-500 hover:bg-amber-400 text-black flex items-center justify-center shadow-sm focus-tactical self-center"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              );
            })}
          </div>
        </>
      )}
    </section>
  );
};
