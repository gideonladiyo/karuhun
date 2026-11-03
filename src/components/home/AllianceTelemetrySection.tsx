import React, { useState, useEffect } from 'react';
import { Activity, Shield, Users, Trophy, BookOpen } from 'lucide-react';
import { getAllianceLiveActivity } from '@/services/apiService';
import { fetchLiveReferences, getStoredReferences } from '@/data/static/reffsData';
import { AllianceActivitySummary } from '@/types';
import { ALLIANCE_TELEMETRY_MODULES } from '@/data/static/telemetryData';
import { GUILD_BRANCHES } from '@/services/imageUtils';
import { SectionHeader } from '@/components/ui/section-header';

export const AllianceTelemetrySection: React.FC = () => {
  const [activity, setActivity] = useState<AllianceActivitySummary | null>(null);
  const [referencesCount, setReferencesCount] = useState<number>(() => getStoredReferences().length);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    Promise.all([
      getAllianceLiveActivity(),
      fetchLiveReferences()
    ])
      .then(([activityData, refsData]) => {
        if (activityData) setActivity(activityData);
        if (refsData && Array.isArray(refsData)) {
          const published = refsData.filter((r) => r.isPublished !== false);
          setReferencesCount(published.length);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to load telemetry live activity', err);
        setLoading(false);
      });
  }, []);

  const totalMaxSlots = 320; // 4 branches * 80 slots
  const currentTotalMembers = activity?.totalMembers ?? null;
  const remainingOpenSlots =
    currentTotalMembers !== null ? Math.max(0, totalMaxSlots - currentTotalMembers) : null;

  const getModuleIcon = (id: string) => {
    switch (id) {
      case 'active_divisions':
        return Shield;
      case 'roster_capacity':
        return Users;
      case 'readiness_rate':
        return Activity;
      case 'cumulative_siege':
        return Trophy;
      default:
        return BookOpen;
    }
  };

  const dynamicModules = ALLIANCE_TELEMETRY_MODULES.map((mod) => {
    if (mod.id === 'readiness_rate') {
      return {
        ...mod,
        metricValue: activity ? `${activity.overallActivePercentage}%` : loading ? '—' : mod.metricValue,
        subValue: activity ? `${activity.totalActive} Active Members (≤7 Days)` : mod.subValue,
      };
    }
    if (mod.id === 'construct_mastery') {
      return {
        ...mod,
        metricLabel: 'Combat References & Guides',
        metricValue: `${referencesCount} Guides`,
        subValue: `${referencesCount} Published Union Guides`,
      };
    }
    return mod;
  });

  const topTwoModules = dynamicModules.slice(0, 2);
  const bottomThreeModules = dynamicModules.slice(2, 5);

  return (
    <section className="relative w-full">
      <SectionHeader
        level="secondary"
        title="Union Overview"
        subtitle="Live member capacity, readiness rate, and guide catalog across 4 branches."
      />

      <div className="space-y-4 sm:space-y-5">
        {/* Row 1: 2 Prominent Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
          {topTwoModules.map((mod) => {
            const IconComp = getModuleIcon(mod.id);
            const isSlotsCard = mod.id === 'roster_capacity';

            return (
              <div
                key={mod.id}
                className="rounded-xl bg-[#121215] border border-[#27272a] p-5 sm:p-6 flex flex-col justify-between space-y-4"
              >
                {/* Top Header Strip */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-xl bg-[#18181b] border border-[#27272a] text-zinc-200 flex items-center justify-center">
                      <IconComp className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-xs font-tech text-zinc-300 font-semibold block">
                        {mod.metricLabel}
                      </span>
                      {isSlotsCard && (
                        <span className="text-xs font-tech text-zinc-500">
                          {currentTotalMembers !== null ? `${currentTotalMembers}/${totalMaxSlots} Total Roster` : `${totalMaxSlots} Max Capacity`}
                        </span>
                      )}
                    </div>
                  </div>

                  {isSlotsCard && (
                    <div className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-amber-400 text-black font-heading font-black text-sm tabular-nums">
                      <span>{loading || remainingOpenSlots === null ? '—' : remainingOpenSlots}</span>
                      <span className="text-xs font-tech font-bold">Open</span>
                    </div>
                  )}
                </div>

                {/* Main Metric & 4-Branch Breakdown for Slots Card */}
                {isSlotsCard ? (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1">
                    {GUILD_BRANCHES.map((branch) => {
                      const stats = activity?.branches?.[branch.id];
                      const memberCount = stats?.totalMembers ?? null;
                      const openSlots = memberCount !== null ? Math.max(0, 80 - memberCount) : null;
                      const isFull = openSlots === 0;

                      return (
                        <div
                          key={branch.id}
                          className="p-3 rounded-xl bg-[#09090b] border border-[#27272a] flex flex-col justify-between space-y-2"
                        >
                          <div className="flex items-center justify-between gap-1">
                            <span className="font-heading font-bold text-xs text-zinc-200 truncate">
                              {branch.name.replace(' 夜', '').replace('’', '')}
                            </span>
                            <span className="text-xs font-tech font-semibold text-zinc-400">
                              {branch.shortRegion}
                            </span>
                          </div>

                          <div className="space-y-1.5">
                            <div className="flex items-baseline justify-between">
                              <div className="flex items-baseline space-x-1">
                                <span className={`font-heading font-black text-base sm:text-lg tracking-tight tabular-nums ${
                                  openSlots === null
                                    ? 'text-zinc-500'
                                    : isFull
                                    ? 'text-zinc-500'
                                    : openSlots <= 2
                                    ? 'text-red-400'
                                    : 'text-amber-400'
                                }`}>
                                  {loading || openSlots === null ? '—' : isFull ? '0' : openSlots}
                                </span>
                                <span className="text-xs font-tech text-zinc-400">
                                  {openSlots === null ? '' : isFull ? 'Full' : 'open'}
                                </span>
                              </div>
                              <span className="text-xs font-tech text-zinc-500 tabular-nums">
                                {memberCount !== null ? `${memberCount}/80` : '—/80'}
                              </span>
                            </div>

                            <div className="w-full h-1.5 rounded-full bg-zinc-800 overflow-hidden">
                              <div
                                className={`h-full rounded-full transition-all duration-300 ${
                                  memberCount === null
                                    ? 'bg-zinc-700'
                                    : isFull
                                    ? 'bg-zinc-600'
                                    : openSlots !== null && openSlots <= 2
                                    ? 'bg-red-400'
                                    : 'bg-amber-400'
                                }`}
                                style={{ width: `${memberCount !== null ? Math.min(100, (memberCount / 80) * 100) : 0}%` }}
                              />
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div>
                    <div className="font-heading font-black text-3xl sm:text-4xl tracking-tight tabular-nums text-white mb-1">
                      {mod.metricValue}
                    </div>
                    {mod.subValue && (
                      <div className="text-xs font-tech text-zinc-400">
                        {mod.subValue}
                      </div>
                    )}
                  </div>
                )}

                <p className="text-xs font-sans text-zinc-400 pt-3 border-t border-[#27272a]">
                  {mod.description}
                </p>
              </div>
            );
          })}
        </div>

        {/* Row 2: 3 Metric Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5">
          {bottomThreeModules.map((mod) => {
            const IconComp = getModuleIcon(mod.id);

            return (
              <div
                key={mod.id}
                className="rounded-xl bg-[#121215] border border-[#27272a] p-5 flex flex-col justify-between space-y-3.5"
              >
                <div className="flex items-center space-x-2.5">
                  <div className="w-8 h-8 rounded-lg bg-[#18181b] border border-[#27272a] text-zinc-300 flex items-center justify-center">
                    <IconComp className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-tech text-zinc-300 font-semibold">
                    {mod.metricLabel}
                  </span>
                </div>

                <div>
                  <div className="font-heading font-black text-2xl sm:text-3xl tracking-tight tabular-nums text-white mb-0.5">
                    {mod.metricValue}
                  </div>
                  {mod.subValue && (
                    <div className="text-xs font-tech text-zinc-400">
                      {mod.subValue}
                    </div>
                  )}
                </div>

                <p className="text-xs font-sans text-zinc-400 pt-2.5 border-t border-[#27272a]">
                  {mod.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
