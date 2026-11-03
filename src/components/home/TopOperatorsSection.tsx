import React, { useState, useEffect } from 'react';
import { Trophy, ChevronRight, ArrowUpRight } from 'lucide-react';
import {
  fetchCompositeAllianceLeaderboard,
  sortAllianceMembers,
  MemberCompetitiveAchievement
} from '@/services/rankingUtils';
import { MainTab } from '@/pages/HomePage';
import { SegmentedTabs, COMPETITIVE_MODE_OPTIONS } from '@/components/ui/segmented-tabs';
import { PlayerAvatar } from '@/components/domain/PlayerAvatar';
import { Button } from '@/components/ui/button';
import { Empty, EmptyHeader, EmptyMedia, EmptyTitle, EmptyDescription } from '@/components/ui/empty';

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

  const top5Operators = sortAllianceMembers(members, activeFilter, 'all').slice(0, 5);

  return (
    <section className="relative w-full">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-stretch">
        {/* LEFT COLUMN (5 of 12): Section Info & Mode Filter */}
        <div className="lg:col-span-5 flex flex-col justify-center space-y-5 py-2 sm:py-4">
          <div className="space-y-4">
            <h2 className="font-heading font-bold text-xl sm:text-3xl text-white tracking-tight leading-tight">
              Top Players
            </h2>

            <p className="text-zinc-400 text-xs sm:text-sm font-sans leading-relaxed">
              Leading Warzone Legend and Phantom Pain Cage Ultimate records across the Karuhun union.
            </p>

            <div className="space-y-2 pt-1">
              <span className="text-xs font-tech text-zinc-400 block">
                Ranking Mode
              </span>

              <SegmentedTabs
                options={COMPETITIVE_MODE_OPTIONS}
                value={activeFilter}
                onChange={setActiveFilter}
                fullWidthOnMobile
                className="w-full"
              />
            </div>
          </div>

          <div className="pt-1">
            <Button
              variant="default"
              size="lg"
              onClick={() => onNavigate('leaderboards')}
              className="w-full"
            >
              <span>View Full Member Rankings</span>
              <ArrowUpRight className="w-4 h-4 text-black" />
            </Button>
          </div>
        </div>

        {/* RIGHT COLUMN (7 of 12): Top 5 Competitive Members Leaderboard Table */}
        <div className="lg:col-span-7 rounded-xl bg-[#121215] border border-[#27272a] overflow-hidden flex flex-col justify-between">
          <div>
            {/* Table Header */}
            <div className="bg-[#09090b] px-5 sm:px-6 py-3.5 border-b border-[#27272a] flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Trophy className="w-4 h-4 text-amber-400" />
                <span className="font-heading font-bold text-sm text-white">
                  Top 5 Union Leaderboard
                </span>
              </div>
            </div>

            {/* Column Titles */}
            <div className="hidden sm:grid grid-cols-12 gap-3 px-5 sm:px-6 py-2.5 bg-[#0d0d11] border-b border-[#27272a] text-xs font-heading font-semibold text-zinc-400 select-none">
              <div className="col-span-2">Rank</div>
              <div className="col-span-6">Player / Branch</div>
              <div className="col-span-4 text-right">Standings</div>
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
              <Empty className="py-12">
                <EmptyHeader>
                  <EmptyMedia variant="icon">
                    <Trophy className="w-5 h-5 text-zinc-400" />
                  </EmptyMedia>
                  <EmptyTitle className="font-heading font-bold text-sm text-zinc-200">
                    No Records Found
                  </EmptyTitle>
                  <EmptyDescription className="text-xs text-zinc-400">
                    No competitive records found for this category.
                  </EmptyDescription>
                </EmptyHeader>
              </Empty>
            )}

            {/* Top 5 Rows List */}
            {!loading && top5Operators.length > 0 && (
              <div className="divide-y divide-[#27272a]/60">
                {top5Operators.map((operator, index) => {
                  const rank = index + 1;
                  const isMvp = rank === 1;

                  let medalBadgeClass = 'bg-[#18181b] text-zinc-300 border-[#27272a]';
                  let rowBgClass = index % 2 === 0 ? 'bg-[#0d0d11]' : 'bg-[#121215]';

                  if (rank === 1) {
                    medalBadgeClass = 'bg-amber-400 text-black border-amber-200 font-black';
                    rowBgClass = 'bg-[#141418] border-l-2 border-l-amber-400';
                  } else if (rank === 2) {
                    medalBadgeClass = 'bg-zinc-200 text-black border-white font-black';
                  } else if (rank === 3) {
                    medalBadgeClass = 'bg-orange-500 text-white border-orange-300 font-black';
                  }

                  return (
                    <div
                      key={`${operator.server}-${operator.id}`}
                      onClick={() => onSelectPlayer(operator.id, operator.server)}
                      className={`px-3.5 sm:px-6 py-3 sm:py-3.5 transition-colors duration-150 hover:bg-[#1a1a22] cursor-pointer group ${rowBgClass}`}
                    >
                      <div className="flex items-center justify-between gap-3 sm:grid sm:grid-cols-12 sm:gap-4">
                        {/* Rank + Avatar + Player Name */}
                        <div className="sm:col-span-8 flex items-center space-x-2.5 sm:space-x-3 min-w-0 flex-1">
                          <div className="flex-shrink-0">
                            <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs font-heading border ${medalBadgeClass}`}>
                              {rank}
                            </div>
                          </div>

                          <PlayerAvatar
                            portrait={operator.portrait}
                            frame={operator.frame}
                            alt={operator.name}
                            size="md"
                            className="group-hover:scale-105 transition-transform duration-200"
                          />

                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className={`font-heading font-bold text-xs sm:text-sm tracking-tight truncate ${
                                isMvp ? 'text-amber-300 group-hover:text-amber-200' : 'text-white group-hover:text-zinc-200'
                              }`}>
                                {operator.name}
                              </span>

                              {isMvp && (
                                <span className="text-xs font-tech font-bold px-2 py-0.5 rounded-full bg-amber-400/15 text-amber-300 border border-amber-400/30 flex-shrink-0">
                                  #1 Overall
                                </span>
                              )}
                            </div>

                            <div className="text-xs font-tech text-zinc-400 truncate flex items-center space-x-1.5 mt-0.5">
                              <span className="truncate">{operator.guildName}</span>
                              <span className="text-zinc-600">·</span>
                              <span className="text-zinc-400 uppercase font-semibold">{operator.server}</span>
                            </div>
                          </div>
                        </div>

                        {/* Performance Stats */}
                        <div className="sm:col-span-4 flex items-center justify-end space-x-2 sm:space-x-3 text-right flex-shrink-0">
                          <div className="space-y-0.5 text-xs font-tech">
                            <div className="text-zinc-200 flex items-center justify-end space-x-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 flex-shrink-0" />
                              <span>WZ: <strong className="text-white">{operator.warzone ? `#${operator.warzone.rank}` : '—'}</strong></span>
                            </div>
                            <div className="text-zinc-400 flex items-center justify-end space-x-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-purple-400 flex-shrink-0" />
                              <span>PPC: <strong className="text-zinc-300">{operator.ppc ? `#${operator.ppc.rank}` : '—'}</strong></span>
                            </div>
                          </div>

                          <div className="hidden sm:flex w-7 h-7 rounded-lg bg-[#18181b] border border-[#27272a] items-center justify-center text-zinc-400 group-hover:text-white group-hover:border-zinc-500 transition-colors flex-shrink-0">
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
          <div className="px-5 sm:px-6 py-3 bg-[#09090b] border-t border-[#27272a] flex items-center justify-between text-xs font-sans text-zinc-400">
            <span>Showing Top 5 Players</span>
            <button
              type="button"
              onClick={() => onNavigate('leaderboards')}
              className="text-white hover:text-amber-300 font-semibold flex items-center space-x-1 transition-colors"
            >
              <span>See All (100+)</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};
