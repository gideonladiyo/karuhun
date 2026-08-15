import React, { useState, useEffect } from 'react';
import { Activity, Shield, Users, Trophy, BookOpen } from 'lucide-react';
import { getAllianceLiveActivity } from '@/services/apiService';
import { fetchLiveReferences, getStoredReferences } from '@/data/static/reffsData';
import { AllianceActivitySummary } from '@/types';
import { ALLIANCE_TELEMETRY_MODULES, TelemetryModule } from '@/data/telemetryData';
import { GUILD_BRANCHES } from '@/services/imageUtils';

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
  const currentTotalMembers = activity?.totalMembers || 289;
  const remainingOpenSlots = Math.max(0, totalMaxSlots - currentTotalMembers);

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

  // Dynamic modules computed from live data with alternating amber/dark themes
  const dynamicModules = ALLIANCE_TELEMETRY_MODULES.map((mod) => {
    // Amber theme on Card 2 (Remaining Open Slots) and Card 4 (Weekly Contribution Points)
    const isAmber = mod.id === 'roster_capacity' || mod.id === 'cumulative_siege';
    if (mod.id === 'readiness_rate' && activity) {
      return {
        ...mod,
        metricValue: `${activity.overallActivePercentage}%`,
        subValue: `${activity.totalActive} Active Member (≤7 Days)`,
        isAmber
      };
    }
    if (mod.id === 'construct_mastery') {
      return {
        ...mod,
        metricLabel: 'Combat References & Guides',
        metricValue: `${referencesCount} GUIDES`,
        subValue: `${referencesCount} Official Guides from Dalaos`,
        isAmber
      };
    }
    return { ...mod, isAmber };
  });

  const topTwoModules = dynamicModules.slice(0, 2);
  const bottomThreeModules = dynamicModules.slice(2, 5);

  return (
    <section className="relative w-full mb-14 sm:mb-20 animate-fadeIn">
      
      {/* Section Header */}
      <div className="mb-6 sm:mb-8 pb-4 border-b border-[#27272a]">
        <h2 className="font-heading font-black text-2xl sm:text-4xl text-white tracking-tight">
          KARUHUN STATISTICS
        </h2>
        <p className="text-zinc-400 text-xs sm:text-sm font-sans mt-1 max-w-3xl leading-relaxed">
          Live operational telemetry across all 4 Karuhun union divisions, tracking real-time readiness rates, roster capacities, and cumulative weekly performance.
        </p>
      </div>

      {/* Asymmetrical 5-Module Bento Grid */}
      <div className="space-y-4 sm:space-y-6">
        
        {/* Row 1: 2 Prominent Cards (Grid 2 cols) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          {topTwoModules.map((mod) => {
            const IconComp = getModuleIcon(mod.id);
            const isAmber = mod.isAmber;
            const isSlotsCard = mod.id === 'roster_capacity';

            return (
              <div
                key={mod.id}
                className={`p-1 rounded-2xl sm:rounded-3xl transition-all duration-200 ${
                  isAmber
                    ? 'bg-gradient-to-b from-amber-500/25 via-amber-950/20 to-[#121215] border border-amber-500/50 hover:border-amber-400 shadow-xl shadow-amber-500/5'
                    : 'bg-[#18181b]/50 border border-[#27272a] hover:border-zinc-500'
                }`}
              >
                <div className={`h-full rounded-xl sm:rounded-2xl p-6 sm:p-7 bracket-corner flex flex-col justify-between space-y-4 ${
                  isAmber
                    ? 'bg-gradient-to-b from-amber-950/40 via-[#18181b] to-[#0d0d11] border border-amber-500/30'
                    : 'bg-[#0d0d11] border border-[#27272a]/60'
                }`}>
                  
                  {/* Top Header Strip of the Card */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                        isAmber 
                          ? 'bg-amber-400 text-black shadow-md' 
                          : 'bg-[#18181b] border border-[#27272a] text-zinc-300'
                      }`}>
                        <IconComp className="w-5 h-5" />
                      </div>
                      <div>
                        <span className={`text-xs font-tech uppercase tracking-wider block ${
                          isAmber ? 'text-amber-200 font-semibold' : 'text-zinc-400'
                        }`}>
                          {mod.metricLabel}
                        </span>
                        {isSlotsCard && (
                          <span className="text-[10px] font-tech text-zinc-400">
                            {currentTotalMembers}/320 TOTAL ROSTER
                          </span>
                        )}
                      </div>
                    </div>

                    {isSlotsCard && (
                      <div className="flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-amber-400 text-black shadow-md border border-amber-300">
                        <span className="font-heading font-black text-xl sm:text-base tabular-nums">
                          {loading ? '...' : remainingOpenSlots}
                        </span>
                        <span className="text-[14px] font-tech font-black uppercase tracking-wider">
                          SLOTS
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Main Metric & 4-Branch Breakdown for Slots Card */}
                  {isSlotsCard ? (
                    <div className="space-y-3 pt-1">
                      
                      {/* 4-Branch Slot Breakdown Grid */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
                        {GUILD_BRANCHES.map((branch) => {
                          const stats = activity?.branches?.[branch.id];
                          // Fallback values if API is still loading
                          const defaultMembers = branch.id === 3638 ? 78 : branch.id === 1164 ? 76 : branch.id === 7641 ? 67 : 68;
                          const memberCount = stats?.totalMembers ?? defaultMembers;
                          const openSlots = Math.max(0, 80 - memberCount);
                          const isFull = openSlots === 0;

                          return (
                            <div 
                              key={branch.id} 
                              className="p-3 rounded-xl bg-black/70 border border-amber-500/30 flex flex-col justify-between space-y-2 hover:border-amber-400 transition-colors shadow-inner"
                            >
                              <div className="flex items-center justify-between gap-1">
                                <span className="font-heading font-bold text-xs text-zinc-200 truncate">
                                  {branch.name.replace(' 夜', '').replace('’', '')}
                                </span>
                                <span className="text-[9px] font-tech font-extrabold px-1.5 py-0.5 rounded bg-amber-400/15 text-amber-300 border border-amber-500/30">
                                  {branch.shortRegion}
                                </span>
                              </div>
                              
                              <div className="space-y-1.5">
                                <div className="flex items-baseline justify-between">
                                  <div className="flex items-baseline space-x-1">
                                    <span className={`font-heading font-black text-base sm:text-xl tracking-tight tabular-nums ${
                                      isFull ? 'text-zinc-500' : openSlots <= 2 ? 'text-red-400' : 'text-amber-300'
                                    }`}>
                                      {loading ? '...' : isFull ? '0' : openSlots}
                                    </span>
                                    <span className={`text-[10px] font-tech font-extrabold uppercase tracking-wider ${
                                      isFull ? 'text-zinc-500' : openSlots <= 2 ? 'text-red-400/90' : 'text-amber-400'
                                    }`}>
                                      {isFull ? 'FULL' : 'SLOTS'}
                                    </span>
                                  </div>
                                  <span className="text-[11px] font-tech text-zinc-400 font-medium tabular-nums">
                                    {loading ? '80/80' : `${memberCount}/80`}
                                  </span>
                                </div>
                                
                                {/* Micro capacity progress bar */}
                                <div className="w-full h-1.5 rounded-full bg-zinc-800/90 overflow-hidden">
                                  <div 
                                    className={`h-full rounded-full transition-all duration-500 ${
                                      isFull ? 'bg-zinc-600' : openSlots <= 2 ? 'bg-red-400' : 'bg-amber-400'
                                    }`}
                                    style={{ width: `${Math.min(100, (memberCount / 80) * 100)}%` }}
                                  />
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>

                    </div>
                  ) : (
                    <div>
                      <div className={`font-heading font-black text-3xl sm:text-5xl tracking-tight tabular-nums mb-1 ${
                        isAmber ? 'text-amber-300' : 'text-white'
                      }`}>
                        {mod.metricValue}
                      </div>
                      {mod.subValue && (
                        <div className={`text-xs font-tech font-medium ${
                          isAmber ? 'text-amber-400' : 'text-zinc-400'
                        }`}>
                          {mod.subValue}
                        </div>
                      )}
                    </div>
                  )}

                  <p className={`text-xs font-sans pt-3 border-t ${
                    isAmber ? 'text-zinc-300 border-amber-500/20' : 'text-zinc-500 border-[#27272a]/60'
                  }`}>
                    {mod.description}
                  </p>

                </div>
              </div>
            );
          })}
        </div>

        {/* Row 2: 3 Metric Cards (Grid 3 cols) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
          {bottomThreeModules.map((mod) => {
            const IconComp = getModuleIcon(mod.id);
            const isAmber = mod.isAmber;

            return (
              <div
                key={mod.id}
                className={`p-1 rounded-2xl sm:rounded-3xl transition-all duration-200 ${
                  isAmber
                    ? 'bg-gradient-to-b from-amber-500/25 via-amber-950/20 to-[#121215] border border-amber-500/50 hover:border-amber-400 shadow-xl shadow-amber-500/5'
                    : 'bg-[#18181b]/50 border border-[#27272a] hover:border-zinc-500'
                }`}
              >
                <div className={`h-full rounded-xl sm:rounded-2xl p-5 sm:p-6 bracket-corner flex flex-col justify-between space-y-4 ${
                  isAmber
                    ? 'bg-gradient-to-b from-amber-950/40 via-[#18181b] to-[#0d0d11] border border-amber-500/30'
                    : 'bg-[#0d0d11] border border-[#27272a]/60'
                }`}>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2.5">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                        isAmber 
                          ? 'bg-amber-400 text-black shadow-md' 
                          : 'bg-[#18181b] border border-[#27272a] text-zinc-300'
                      }`}>
                        <IconComp className="w-4 h-4" />
                      </div>
                      <span className={`text-[11px] font-tech uppercase tracking-wider ${
                        isAmber ? 'text-amber-200 font-semibold' : 'text-zinc-400'
                      }`}>
                        {mod.metricLabel}
                      </span>
                    </div>
                  </div>

                  <div>
                    <div className={`font-heading font-black text-2xl sm:text-3xl tracking-tight tabular-nums mb-0.5 ${
                      isAmber ? 'text-amber-300' : 'text-white'
                    }`}>
                      {mod.metricValue}
                    </div>
                    {mod.subValue && (
                      <div className={`text-[11px] font-tech font-medium ${
                        isAmber ? 'text-amber-400' : 'text-zinc-400'
                      }`}>
                        {mod.subValue}
                      </div>
                    )}
                  </div>

                  <p className={`text-[11px] font-sans pt-2.5 border-t ${
                    isAmber ? 'text-zinc-300 border-amber-500/20' : 'text-zinc-500 border-[#27272a]/60'
                  }`}>
                    {mod.description}
                  </p>

                </div>
              </div>
            );
          })}
        </div>

      </div>

    </section>
  );
};
