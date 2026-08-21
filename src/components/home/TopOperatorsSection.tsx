import React, { useState, useEffect } from 'react';
import { Trophy, Swords, Skull, ChevronRight, Shield, ArrowUpRight } from 'lucide-react';
import { 
  fetchCompositeAllianceLeaderboard, 
  sortAllianceMembers, 
  MemberCompetitiveAchievement 
} from '@/services/rankingUtils';
import { getHuaxuImageUrl } from '@/services/imageUtils';
import { MainTab } from '@/pages/HomePage';

interface TopOperatorsSectionProps {
  onNavigate: (tab: MainTab, branchId?: number) => void;
  onSelectPlayer: (uid: number, server: string) => void;
}

export const TopOperatorsSection: React.FC<TopOperatorsSectionProps> = ({
  onNavigate,
  onSelectPlayer
}) => {
  const [activeFilter, setActiveFilter] = useState<'composite' | 'warzone' | 'ppc'>('composite');
  const [members, setMembers] = useState<MemberCompetitiveAchievement[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    setLoading(true);
    fetchCompositeAllianceLeaderboard()
      .then((list) => {
        setMembers(list);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to load top operators', err);
        setLoading(false);
      });
  }, []);

  // Get Top 5 members based on active filter
  const top5Operators = sortAllianceMembers(members, activeFilter, 'all').slice(0, 5);

  return (
    <section className="relative w-full mb-14 sm:mb-20 animate-fadeIn">
      
      {/* 2-Column Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-stretch">
        
        {/* LEFT COLUMN (5 of 12): Plain text directly on background, vertically centered */}
        <div className="lg:col-span-5 flex flex-col justify-center space-y-6 py-2 sm:py-4">
          
          <div className="space-y-4 sm:space-y-5">

            {/* Title */}
            <h2 className="font-heading font-black text-2xl sm:text-4xl text-white tracking-tight leading-tight">
              TOP COMPETITIVE MEMBERS
            </h2>

            {/* Description */}
            <p className="text-zinc-400 text-xs sm:text-sm font-sans leading-relaxed">
              Showcasing top-performing commanders and dalaos across Warzone Legend brackets and Phantom Pain Cage Ultimate tiers within the Karuhun union.
            </p>

            {/* Mode Filter Selector */}
            <div className="space-y-2 pt-1">
              <span className="text-[11px] font-tech text-zinc-500 uppercase tracking-wider block">
                Ranking Mode Filter:
              </span>
              
              <div className="grid grid-cols-3 gap-1.5 bg-[#121215] p-1.5 rounded-xl border border-[#27272a]">
                <button
                  onClick={() => setActiveFilter('composite')}
                  className={`py-2 px-2 rounded-lg text-xs font-tech font-bold transition-all text-center focus-tactical ${
                    activeFilter === 'composite'
                      ? 'bg-white text-black shadow-sm'
                      : 'text-zinc-400 hover:text-white hover:bg-[#18181b]'
                  }`}
                >
                  ALL
                </button>

                <button
                  onClick={() => setActiveFilter('warzone')}
                  className={`py-2 px-2 rounded-lg text-xs font-tech font-bold transition-all text-center focus-tactical flex items-center justify-center space-x-1 ${
                    activeFilter === 'warzone'
                      ? 'bg-white text-black shadow-sm'
                      : 'text-zinc-400 hover:text-white hover:bg-[#18181b]'
                  }`}
                >
                  <Swords className="w-3 h-3 flex-shrink-0" />
                  <span>WARZONE</span>
                </button>

                <button
                  onClick={() => setActiveFilter('ppc')}
                  className={`py-2 px-2 rounded-lg text-xs font-tech font-bold transition-all text-center focus-tactical flex items-center justify-center space-x-1 ${
                    activeFilter === 'ppc'
                      ? 'bg-white text-black shadow-sm'
                      : 'text-zinc-400 hover:text-white hover:bg-[#18181b]'
                  }`}
                >
                  <Skull className="w-3 h-3 flex-shrink-0" />
                  <span>PPC</span>
                </button>
              </div>
            </div>
          </div>

          {/* Action CTA Button */}
          <div className="pt-2">
            <button
              onClick={() => onNavigate('leaderboards')}
              className="w-full flex items-center justify-center space-x-2 p-3 rounded-xl bg-white hover:bg-zinc-200 text-black font-heading font-bold text-xs sm:text-sm transition-all focus-tactical shadow-md"
            >
              <span>VIEW FULL MEMBER RANKINGS</span>
              <ArrowUpRight className="w-4 h-4 text-black" />
            </button>
          </div>

        </div>

        {/* RIGHT COLUMN (7 of 12): Top 5 Competitive Members Leaderboard Table */}
        <div className="lg:col-span-7 rounded-2xl sm:rounded-3xl bg-[#121215] border border-[#27272a] overflow-hidden shadow-2xl flex flex-col justify-between">
          
          <div>
            {/* Table Header Banner */}
            <div className="bg-[#09090b] px-5 sm:px-6 py-3.5 border-b border-[#27272a] flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Trophy className="w-4 h-4 text-amber-500" />
                <span className="font-heading font-bold text-sm text-white">
                  TOP 5 MEMBER LEADERBOARD
                </span>
              </div>
            </div>

            {/* Column Titles */}
            <div className="hidden sm:grid grid-cols-12 gap-3 px-5 sm:px-6 py-2.5 bg-[#0d0d11] border-b border-[#27272a] text-[11px] font-heading font-bold text-zinc-400 uppercase tracking-wider select-none">
              <div className="col-span-2">Number</div>
              <div className="col-span-6">Member Name / Guild</div>
              <div className="col-span-4 text-right">Performance / Score</div>
            </div>

            {/* Loading Skeleton */}
            {loading && (
              <div className="p-4 space-y-3">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="h-14 rounded-xl bg-[#18181b]/60 border border-[#27272a]/50 animate-pulse" />
                ))}
              </div>
            )}

            {/* Empty State */}
            {!loading && top5Operators.length === 0 && (
              <div className="py-12 text-center text-zinc-500 space-y-2">
                <Trophy className="w-8 h-8 mx-auto text-zinc-600 opacity-50" />
                <div className="font-heading font-bold text-sm text-zinc-300">Data Operator Kosong</div>
                <div className="text-xs font-sans">No competitive records found for this category.</div>
              </div>
            )}

            {/* Top 5 Rows List */}
            {!loading && top5Operators.length > 0 && (
              <div className="divide-y divide-[#27272a]/50">
                {top5Operators.map((operator, index) => {
                  const rank = index + 1;
                  const isMvp = rank === 1;

                  // Medal styling
                  let medalBadgeClass = 'bg-[#18181b] text-zinc-300 border-zinc-700';
                  let rowBgClass = index % 2 === 0 ? 'bg-[#0d0d11]' : 'bg-[#121215]';

                  if (rank === 1) {
                    medalBadgeClass = 'bg-gradient-to-br from-amber-300 via-amber-400 to-yellow-600 text-black border-yellow-200 font-black shadow-lg shadow-amber-500/20';
                    rowBgClass = 'bg-gradient-to-r from-amber-950/35 via-[#18181b] to-[#121215] border-l-4 border-l-amber-500';
                  } else if (rank === 2) {
                    medalBadgeClass = 'bg-gradient-to-br from-zinc-200 via-zinc-300 to-zinc-400 text-black border-white font-black shadow-md';
                  } else if (rank === 3) {
                    medalBadgeClass = 'bg-gradient-to-br from-amber-600 via-orange-500 to-yellow-700 text-white border-amber-400 font-black shadow-md';
                  }

                  return (
                    <div
                      key={`${operator.server}-${operator.id}`}
                      onClick={() => onSelectPlayer(operator.id, operator.server)}
                      className={`px-3.5 sm:px-6 py-3 sm:py-3.5 transition-all duration-150 hover:bg-[#1a1a24] cursor-pointer group ${rowBgClass}`}
                    >
                      <div className="flex items-center justify-between gap-3 sm:grid sm:grid-cols-12 sm:gap-4">
                        
                        {/* 1 & 2. COMBINED LEFT: MEDAL + AVATAR + MEMBER NAME (Single line on mobile & desktop) */}
                        <div className="sm:col-span-8 flex items-center space-x-2.5 sm:space-x-3 min-w-0 flex-1">
                          
                          {/* MEDAL / RANK BADGE */}
                          <div className="flex-shrink-0">
                            {rank <= 3 ? (
                              <div className="relative flex items-center justify-center">
                                <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs font-heading border ${medalBadgeClass}`}>
                                  {rank}
                                </div>
                                <div className="absolute -bottom-1 flex space-x-0.5">
                                  <span className="w-1 h-1.5 bg-amber-600 rounded-sm transform rotate-12" />
                                  <span className="w-1 h-1.5 bg-amber-600 rounded-sm transform -rotate-12" />
                                </div>
                              </div>
                            ) : (
                              <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-white text-black font-heading font-black flex items-center justify-center text-[11px] sm:text-xs shadow-md">
                                {rank}
                              </div>
                            )}
                          </div>

                          {/* AVATAR PORTRAIT */}
                          <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-black border p-0.5 flex-shrink-0 relative overflow-hidden flex items-center justify-center ${
                            isMvp ? 'border-amber-400 ring-2 ring-amber-500/20' : 'border-[#27272a]'
                          }`}>
                            <img
                              src={getHuaxuImageUrl(operator.portrait)}
                              alt={operator.name}
                              onError={(e) => {
                                (e.target as HTMLElement).style.display = 'none';
                              }}
                              className="w-full h-full object-contain filter contrast-125 group-hover:scale-105 transition-transform"
                            />
                          </div>

                          {/* NAME & GUILD DETAILS */}
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center space-x-1.5 flex-wrap">
                              <span className={`font-heading font-black text-xs sm:text-sm tracking-tight truncate ${
                                isMvp ? 'text-amber-300 group-hover:text-amber-200' : 'text-white group-hover:text-zinc-200'
                              }`}>
                                {operator.name}
                              </span>

                              {isMvp && (
                                <span className="text-[8px] sm:text-[9px] font-tech font-black px-1.5 py-0.5 rounded bg-amber-400 text-black uppercase flex-shrink-0">
                                  MVP #1
                                </span>
                              )}
                            </div>

                            <div className="text-[10px] sm:text-[11px] font-tech text-zinc-400 truncate flex items-center space-x-1 sm:space-x-1.5 mt-0.5">
                              <Shield className="w-3 h-3 text-zinc-500 flex-shrink-0" />
                              <span className="truncate">{operator.guildName}</span>
                              <span className="text-zinc-600">•</span>
                              <span className="text-zinc-400 uppercase font-bold">{operator.server}</span>
                            </div>
                          </div>

                        </div>

                        {/* 3. PERFORMANCE STATS (Right-aligned compact on mobile & desktop) */}
                        <div className="sm:col-span-4 flex items-center justify-end space-x-2 sm:space-x-3 text-right flex-shrink-0">
                          <div className="space-y-0.5 text-[11px] sm:text-xs font-tech">
                            <div className="text-zinc-200 flex items-center justify-end space-x-1">
                              <Swords className="w-3 h-3 text-amber-500 flex-shrink-0" />
                              <span>WZ: <strong className="text-white">{operator.warzone ? `#${operator.warzone.rank}` : '-'}</strong></span>
                            </div>
                            <div className="text-zinc-400 flex items-center justify-end space-x-1">
                              <Skull className="w-3 h-3 text-purple-400 flex-shrink-0" />
                              <span>PPC: <strong className="text-zinc-300">{operator.ppc ? `#${operator.ppc.rank}` : '-'}</strong></span>
                            </div>
                          </div>

                          <div className="hidden sm:flex w-7 h-7 rounded-lg bg-[#18181b] border border-[#27272a] items-center justify-center text-zinc-400 group-hover:text-white group-hover:border-zinc-500 transition-all flex-shrink-0">
                            <ChevronRight className="w-3.5 h-3.5" />
                          </div>
                        </div>

                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Table Footer */}
          <div className="px-5 sm:px-6 py-3 bg-[#09090b] border-t border-[#27272a] flex items-center justify-between text-xs font-tech text-zinc-500">
            <span>Shows 5 Top Members</span>
            <button
              onClick={() => onNavigate('leaderboards')}
              className="text-amber-400 hover:text-amber-300 font-bold flex items-center space-x-1"
            >
              <span>SEE ALL (100+)</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

        </div>

      </div>

    </section>
  );
};
