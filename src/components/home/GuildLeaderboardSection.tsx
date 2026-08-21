import React, { useState, useEffect, useMemo } from 'react';
import { Trophy, ChevronRight, Users, UserCheck, ChevronDown, ChevronUp, UnfoldVertical, FoldVertical } from 'lucide-react';
import { getGuildsList, getAllianceLiveActivity } from '@/services/apiService';
import { getHuaxuImageUrl, GUILD_BRANCHES } from '@/services/imageUtils';
import { GuildListItem, AllianceActivitySummary } from '@/types';
import { MainTab } from '@/pages/HomePage';

interface GuildLeaderboardSectionProps {
  onNavigate: (tab: MainTab, branchId?: number) => void;
}

export const GuildLeaderboardSection: React.FC<GuildLeaderboardSectionProps> = ({ onNavigate }) => {
  const [selectedServer, setSelectedServer] = useState<'ap' | 'na'>('ap');
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [searchTerm] = useState<string>('');
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

  // Check if a guild is an official Karuhun alliance branch
  const isAllianceBranch = (guild: GuildListItem): boolean => {
    return GUILD_BRANCHES.some(
      (b) => b.id === guild.guildId && b.server.toLowerCase() === guild.server.toLowerCase()
    ) || guild.name.includes('夜') || guild.name.toLowerCase().includes('karuhun');
  };

  // Get alliance tier tag dynamically from branch config
  const getAllianceTier = (guildId: number): string => {
    const branch = GUILD_BRANCHES.find((b) => b.id === guildId);
    if (!branch) return 'Union';
    return branch.server === 'na' ? `${branch.tag} NA` : branch.tag;
  };

  // Filter guilds based on search term
  const searchedGuilds = useMemo(() => {
    return guilds.map((g, idx) => ({ ...g, globalRank: idx + 1 }))
      .filter((g) => {
        const term = searchTerm.toLowerCase().trim();
        if (!term) return true;
        return (
          g.name.toLowerCase().includes(term) ||
          g.leaderName.toLowerCase().includes(term) ||
          g.guildId.toString().includes(term) ||
          (g.declaration && g.declaration.toLowerCase().includes(term))
        );
      });
  }, [guilds, searchTerm]);

  // Smart Compressed Rows with Ellipsis/Skip Gaps
  const renderedItems = useMemo(() => {
    // If searching or user explicitly expanded all rows, show full list
    if (searchTerm.trim() || isExpanded) {
      return searchedGuilds.map((g) => ({ type: 'guild' as const, guild: g, rank: g.globalRank }));
    }

    // Default compressed focus view: Show Top 5 + Alliance Branches + Skip Dividers
    const visibleRanks = new Set<number>();
    
    // 1. Always show Top 5
    for (let i = 1; i <= Math.min(5, searchedGuilds.length); i++) {
      visibleRanks.add(i);
    }

    // 2. Always show all Karuhun alliance branches
    searchedGuilds.forEach((g) => {
      if (isAllianceBranch(g)) {
        visibleRanks.add(g.globalRank);
      }
    });

    const sortedVisibleRanks = Array.from(visibleRanks).sort((a, b) => a - b);
    const items: Array<
      | { type: 'guild'; guild: typeof searchedGuilds[0]; rank: number }
      | { type: 'skip'; fromRank: number; toRank: number; count: number }
    > = [];

    let lastRank = 0;
    for (const rank of sortedVisibleRanks) {
      if (lastRank > 0 && rank - lastRank > 1) {
        items.push({
          type: 'skip',
          fromRank: lastRank + 1,
          toRank: rank - 1,
          count: rank - lastRank - 1
        });
      }
      const guild = searchedGuilds.find((g) => g.globalRank === rank);
      if (guild) {
        items.push({ type: 'guild', guild, rank });
      }
      lastRank = rank;
    }

    // Check if there are remaining guilds after the last visible rank
    if (lastRank < searchedGuilds.length) {
      items.push({
        type: 'skip',
        fromRank: lastRank + 1,
        toRank: searchedGuilds.length,
        count: searchedGuilds.length - lastRank
      });
    }

    return items;
  }, [searchedGuilds, isExpanded, searchTerm]);

  return (
    <section className="relative w-full mb-14 sm:mb-20 animate-fadeIn">
      
      {/* Section Top Header & Controls */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6 pb-4 border-b border-[#27272a]">
        <div>
          <h2 className="font-heading font-black text-2xl sm:text-4xl text-white tracking-tight flex items-center gap-3">
            <span>GUILD RANKINGS</span>
          </h2>
          <p className="text-zinc-400 text-xs sm:text-sm font-sans mt-1">
            Official Simulated Siege standings tracking top guild scores and Karuhun union divisions across Asia-Pacific servers.
          </p>
        </div>

        {/* Controls: Expand/Compress View, Server Switcher, Search */}
        <div className="flex flex-wrap items-center gap-2.5 self-stretch md:self-auto">
          
          {/* Stretch / Compress Toggle Button */}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-[#121215] hover:bg-[#18181b] border border-[#27272a] text-xs font-tech text-zinc-300 hover:text-white transition-all focus-tactical"
            title={isExpanded ? 'Kembalikan ke Tampilan Fokus (Top 5 + Cabang)' : 'Buka Semua 50 Guild'}
          >
            {isExpanded ? (
              <>
                <FoldVertical className="w-3.5 h-3.5 text-amber-400" />
                <span>FOCUS VIEW</span>
              </>
            ) : (
              <>
                <UnfoldVertical className="w-3.5 h-3.5 text-amber-400" />
                <span>EXPAND ALL ({guilds.length})</span>
              </>
            )}
          </button>

          {/* Server Switcher */}
          <div className="flex items-center space-x-1 bg-[#121215] p-1 rounded-xl border border-[#27272a]">
            <button
              onClick={() => setSelectedServer('ap')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-heading font-bold transition-all focus-tactical ${
                selectedServer === 'ap'
                  ? 'bg-white text-black shadow-sm'
                  : 'text-zinc-400 hover:text-white hover:bg-[#18181b]'
              }`}
            >
              AP SERVER
            </button>
            <button
              onClick={() => setSelectedServer('na')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-heading font-bold transition-all focus-tactical ${
                selectedServer === 'na'
                  ? 'bg-white text-black shadow-sm'
                  : 'text-zinc-400 hover:text-white hover:bg-[#18181b]'
              }`}
            >
              NA SERVER
            </button>
          </div>

        </div>
      </div>

      {/* Main Leaderboard Table Container */}
      <div className="rounded-2xl sm:rounded-3xl bg-[#121215] border border-[#27272a] overflow-hidden shadow-2xl">
        
        {/* Table Title Banner (Authentic reference styling) */}
        <div className="bg-[#09090b] px-6 py-4 border-b border-[#27272a] flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center space-x-3">
            <div className="w-3 h-3 rounded-full bg-amber-500 animate-pulse" />
            <h3 className="font-heading font-black text-xl sm:text-2xl text-white tracking-tight">
              Leaderboard
            </h3>
          </div>
        </div>

        {/* Column Headers (Number, Member Name, Serial, Remark) */}
        <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-3 bg-[#0d0d11] border-b border-[#27272a] text-xs font-heading font-bold text-zinc-300 select-none">
          <div className="col-span-2 flex items-center">
            <span>Number</span>
          </div>
          <div className="col-span-5">
            <span>Member Name</span>
          </div>
          <div className="col-span-2 text-right">
            <span>Total Contribution</span>
          </div>
          <div className="col-span-3 text-right">
            <span>Total Member</span>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="p-6 space-y-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-16 rounded-xl bg-[#18181b]/60 border border-[#27272a]/50 animate-pulse" />
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && renderedItems.length === 0 && (
          <div className="py-16 text-center text-zinc-500 space-y-2">
            <Trophy className="w-8 h-8 mx-auto text-zinc-600 opacity-50" />
            <div className="font-heading font-bold text-sm text-zinc-300">Empty Data</div>
            <div className="text-xs font-sans">Empty Data.</div>
          </div>
        )}

        {/* Rows & Smart Skip Dividers */}
        {!loading && renderedItems.length > 0 && (
          <div className="divide-y divide-[#27272a]/50">
            {renderedItems.map((item, index) => {
              
              // 1. SMART SKIP / JUMP GAP DIVIDER
              if (item.type === 'skip') {
                return (
                  <div
                    key={`skip-${item.fromRank}-${item.toRank}`}
                    onClick={() => setIsExpanded(true)}
                    className="group px-4 sm:px-6 py-3 bg-[#09090b]/90 hover:bg-[#18181b] border-y border-dashed border-[#27272a] cursor-pointer transition-all flex items-center justify-between gap-3 select-none"
                    title="Klik untuk membuka semua guild di antara rank ini"
                  >
                    <div className="flex items-center space-x-3 text-xs font-tech text-zinc-500 group-hover:text-amber-400 transition-colors">
                      <div className="flex items-center space-x-1 font-mono tracking-widest text-zinc-600 group-hover:text-amber-500">
                        <span>•</span>
                        <span>•</span>
                        <span>•</span>
                      </div>
                      <span className="font-bold uppercase tracking-wider text-[11px] sm:text-xs">
                        [ SKIP: {item.count} GUILDS // RANK #{item.fromRank} &ndash; #{item.toRank} ]
                      </span>
                    </div>
                  </div>
                );
              }

              // 2. GUILD RANK ROW
              const guild = item.guild;
              const rank = item.rank;
              const isAlliance = isAllianceBranch(guild);
              const branchStats = liveActivity?.branches[guild.guildId];
              const tierLabel = getAllianceTier(guild.guildId);

              // Row styling (Top 3 Medals & Alternating Tints inspired by image)
              let medalBadgeClass = 'bg-[#18181b] text-zinc-300 border-zinc-700';
              let rowBgClass = index % 2 === 0 ? 'bg-[#0d0d11]' : 'bg-[#121215]';

              if (rank === 1) {
                medalBadgeClass = 'bg-gradient-to-br from-amber-300 via-amber-400 to-yellow-600 text-black border-yellow-200 font-black shadow-lg shadow-amber-500/20';
              } else if (rank === 2) {
                medalBadgeClass = 'bg-gradient-to-br from-zinc-200 via-zinc-300 to-zinc-400 text-black border-white font-black shadow-md';
              } else if (rank === 3) {
                medalBadgeClass = 'bg-gradient-to-br from-amber-600 via-orange-500 to-yellow-700 text-white border-amber-400 font-black shadow-md';
              }

              // Special Alliance Highlight styling
              if (isAlliance) {
                rowBgClass = 'bg-gradient-to-r from-amber-950/40 via-[#18181b] to-[#121215] border-l-4 border-l-amber-500 shadow-inner';
              }

              return (
                <div
                  key={`${guild.server}-${guild.guildId}`}
                  className={`px-4 sm:px-6 py-4 transition-all duration-150 hover:bg-[#1a1a22] ${rowBgClass}`}
                >
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-3 md:gap-4 items-center">
                    
                    {/* 1. NUMBER COLUMN (Ribbon & Medals for 1-3, Clean numbered circles for 4+) */}
                    <div className="md:col-span-2 flex items-center justify-between md:justify-start space-x-3">
                      <div className="flex items-center space-x-3">
                        {rank <= 3 ? (
                          <div className="relative flex items-center justify-center">
                            {/* Medal Round Badge */}
                            <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-heading border ${medalBadgeClass}`}>
                              {rank}
                            </div>
                            {/* Ribbon tails underneath badge */}
                            <div className="absolute -bottom-1.5 flex space-x-1">
                              <span className="w-1.5 h-2 bg-amber-600 rounded-sm transform rotate-12" />
                              <span className="w-1.5 h-2 bg-amber-600 rounded-sm transform -rotate-12" />
                            </div>
                          </div>
                        ) : (
                          /* Numbered Circle Badge for 4+ (Exactly matching the reference image) */
                          <div className={`w-8 h-8 rounded-full font-heading font-black flex items-center justify-center text-xs shadow-md ${
                            isAlliance ? 'bg-amber-400 text-black ring-2 ring-amber-400/50' : 'bg-white text-black'
                          }`}>
                            {rank}
                          </div>
                        )}

                        <span className={`text-[11px] font-tech uppercase tracking-widest hidden sm:inline ${
                          isAlliance ? 'text-amber-400 font-bold' : 'text-zinc-500'
                        }`}>
                          Rank #{rank}
                        </span>
                      </div>

                      {/* Mobile Serial & Score preview */}
                      <div className="md:hidden text-right">
                        <div className="text-xs font-heading font-bold text-amber-400 tabular-nums">
                          {guild.contributionWeek?.toLocaleString()} Pts
                        </div>
                        <div className="text-[10px] font-tech text-zinc-500 font-mono">
                          ID: #{guild.guildId}
                        </div>
                      </div>
                    </div>

                    {/* 2. MEMBER NAME / GUILD COLUMN */}
                    <div className="md:col-span-5 flex items-center space-x-3 min-w-0">
                      {/* Guild Crest */}
                      <div className={`w-10 h-10 rounded-xl bg-black border p-1 flex-shrink-0 relative overflow-hidden flex items-center justify-center ${
                        isAlliance ? 'border-amber-500 shadow-sm shadow-amber-500/20' : 'border-[#27272a]'
                      }`}>
                        <img
                          src={guild.icon ? getHuaxuImageUrl(guild.icon) : '/logo.png'}
                          alt={guild.name}
                          onError={(e) => {
                            (e.target as HTMLElement).style.display = 'none';
                          }}
                          className="w-full h-full object-contain filter contrast-125"
                        />
                      </div>

                      {/* Guild Info */}
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center space-x-2 flex-wrap">
                          <span className={`font-heading font-black text-sm sm:text-base tracking-tight truncate ${
                            isAlliance ? 'text-white font-extrabold' : 'text-zinc-200'
                          }`}>
                            {guild.name}
                          </span>

                          {/* Alliance Tag Badge */}
                          {isAlliance && (
                            <span className="text-[9px] font-tech font-bold px-2 py-0.5 rounded bg-amber-500 text-black uppercase tracking-wider shadow-sm">
                              KARUHUN 夜 ({tierLabel})
                            </span>
                          )}
                        </div>

                        <div className="text-[11px] font-tech text-zinc-400 flex items-center space-x-2 mt-0.5 truncate">
                          <span className="text-zinc-500">Leader:</span>
                          <span className="text-zinc-300 font-medium truncate">{guild.leaderName || 'Unknown'}</span>
                          <span className="text-zinc-600">•</span>
                          <span className="text-zinc-400">Lv. {guild.level}</span>
                        </div>
                      </div>
                    </div>

                    {/* 3. SERIAL COLUMN (Guild Serial ID & Weekly Points) */}
                    <div className="hidden md:block md:col-span-2 text-right">
                      <div className="font-heading font-black text-sm sm:text-base text-white tabular-nums">
                        {guild.contributionWeek ? guild.contributionWeek.toLocaleString() : '0'}
                      </div>
                    </div>

                    {/* 4. REMARK COLUMN (Live Activity Status & Action) */}
                    <div className="md:col-span-3 flex items-center justify-between md:justify-end gap-3 pt-2 md:pt-0 border-t md:border-t-0 border-[#27272a]/50">
                      
                      {/* Live Activity & Roster Details */}
                      <div className="text-left md:text-right">
                        {isAlliance && branchStats ? (
                          <div className="space-y-0.5">
                            <div className="text-xs font-tech text-emerald-400 font-bold flex items-center md:justify-end space-x-1">
                              <UserCheck className="w-3.5 h-3.5" />
                              <span>{branchStats.activePercentage}% Active (&le;7d)</span>
                            </div>
                            <div className="text-[10px] font-tech text-zinc-400">
                              {branchStats.activeMembers}/{branchStats.totalMembers} Active Member
                              {branchStats.inactiveMembers > 0 && ` (${branchStats.inactiveMembers} Offline)`}
                            </div>
                          </div>
                        ) : (
                          <div className="space-y-0.5">
                            <div className="text-xs font-tech text-zinc-300 flex items-center md:justify-end space-x-1">
                              <Users className="w-3.5 h-3.5 text-zinc-500" />
                              <span>{guild.memberCount || 0}/{guild.maxMemberCount || 80} Member</span>
                            </div>
                            <div className="text-[10px] font-tech text-zinc-500 truncate max-w-[180px]">
                              {guild.declaration ? guild.declaration.slice(0, 30) : 'Active Guild'}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Direct Hub CTA for Alliance Branches */}
                      {isAlliance && (
                        <button
                          onClick={() => onNavigate('hub', guild.guildId)}
                          className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-black text-xs font-heading font-bold transition-all flex items-center space-x-1 shadow-sm flex-shrink-0 focus-tactical"
                        >
                          <span>View</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      )}

                    </div>

                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Footer info & Toggle Trigger */}
        <div className="px-6 py-3.5 bg-[#09090b] border-t border-[#27272a] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs font-tech text-zinc-500">
          <div>
            Shows <strong className="text-zinc-300">{renderedItems.filter(i => i.type === 'guild').length}</strong> of {guilds.length} guild total ({selectedServer.toUpperCase()} Server)
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-amber-400 hover:text-amber-300 font-bold flex items-center space-x-1 transition-colors"
            >
              {isExpanded ? (
                <>
                  <span>Close</span>
                  <ChevronUp className="w-3.5 h-3.5" />
                </>
              ) : (
                <>
                  <span>SHOW ALL RANKS (50 GUILDS)</span>
                  <ChevronDown className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};
