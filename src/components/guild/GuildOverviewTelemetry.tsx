import React, { useMemo, useState, useEffect } from 'react';
import { GuildInfo, GuildMember } from '@/types';
import { GuildBranchConfig } from '@/services/imageUtils';
import { getGuildsList } from '@/services/apiService';
import { Users, CheckCircle2, Award } from 'lucide-react';
import { getDivisionTheme } from '@/lib/divisionTag';
import { calculateRosterActivity } from '@/lib/memberActivity';
import { formatNumber } from '@/lib/format';

interface GuildOverviewTelemetryProps {
  currentGuild: GuildInfo | null;
  members?: GuildMember[];
  activeBranch: GuildBranchConfig;
  loading: boolean;
}

export const GuildOverviewTelemetry: React.FC<GuildOverviewTelemetryProps> = ({
  currentGuild,
  members = [],
  activeBranch,
  loading
}) => {
  const [serverRank, setServerRank] = useState<number | null>(null);
  const divisionTheme = getDivisionTheme(activeBranch.tag);

  useEffect(() => {
    let isMounted = true;
    const targetGuildId = currentGuild?.guildId || activeBranch.id;

    getGuildsList(activeBranch.server)
      .then((guildsList) => {
        if (!isMounted) return;
        if (Array.isArray(guildsList) && guildsList.length > 0) {
          const index = guildsList.findIndex((g) => g.guildId === targetGuildId);
          if (index !== -1) {
            setServerRank(index + 1);
            return;
          }
        }
        setServerRank(divisionTheme.fallbackRank);
      })
      .catch((err) => {
        console.warn('Failed to fetch guild rank from /guilds:', err);
        if (isMounted) {
          setServerRank(divisionTheme.fallbackRank);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [activeBranch.server, activeBranch.id, currentGuild?.guildId, divisionTheme.fallbackRank]);

  const metrics = useMemo(() => {
    const totalMembers = members.length > 0 ? members.length : (currentGuild?.memberCount || 72);
    const maxMembers = currentGuild?.maxMemberCount || 80;

    const activityStats =
      members.length > 0
        ? calculateRosterActivity(members)
        : {
            totalMembers,
            activeCount: totalMembers,
            inactiveCount: 0,
            activePercentage: 100
          };

    const weeklyContrib =
      currentGuild?.contributionWeek ||
      (members.length > 0 ? members.reduce((acc, m) => acc + (m.contributeWeek || 0), 0) : 422565);

    return {
      totalMembers: activityStats.totalMembers,
      maxMembers,
      activeCount: activityStats.activeCount,
      inactiveCount: activityStats.inactiveCount,
      activePercentage: activityStats.activePercentage,
      weeklyContrib
    };
  }, [currentGuild, members]);

  if (loading) {
    return (
      <div className="py-8 text-center space-y-2">
        <div className="inline-block animate-spin w-6 h-6 border-2 border-amber-400 border-t-transparent rounded-full" />
        <p className="text-xs font-tech text-zinc-500">Loading Sector Telemetry...</p>
      </div>
    );
  }

  const guildName = currentGuild?.name || activeBranch.name;
  const declarationText = currentGuild?.declaration
    ? currentGuild.declaration.replace(/^["']|["']$/g, '')
    : 'Premier Punishing: Gray Raven union commanding multi-tier divisions across Asia-Pacific and North America.';

  const displayRank = serverRank !== null ? serverRank : divisionTheme.fallbackRank;

  return (
    <div className="w-full space-y-6 pt-2 pb-2 text-center">
      {/* 1. HEADER, SUBHEADER & PARAGRAPH */}
      <div className="space-y-2.5 max-w-3xl mx-auto flex flex-col items-center justify-center">
        <h2 className="font-heading font-black text-2xl sm:text-3xl lg:text-4xl text-white tracking-tight">
          {guildName}
        </h2>

        <p className="text-xs sm:text-sm font-tech text-zinc-400 flex flex-wrap items-center justify-center gap-x-2.5 gap-y-1">
          <span>Guild ID: <strong className="text-white font-mono font-bold">{String(currentGuild?.guildId || activeBranch.id).padStart(8, '0')}</strong></span>
          <span className="text-zinc-600">•</span>
          <span>Region: <strong className="text-zinc-200">{activeBranch.region}</strong></span>
          <span className="text-zinc-600">•</span>
          <span>Leader: <strong className="text-amber-300">{currentGuild?.leaderName || 'Commander In-Charge'}</strong></span>
        </p>

        <p className="text-xs sm:text-sm font-sans text-zinc-300 leading-relaxed pt-1 text-center">
          "{declarationText}"
        </p>
      </div>

      {/* 2. INLINE TELEMETRY READOUT METRICS */}
      <div className="pt-5 border-t border-[#27272a]/80 grid grid-cols-1 sm:grid-cols-3 gap-5 sm:gap-6 text-zinc-300 max-w-4xl mx-auto">
        {/* Metric 1: Total Members */}
        <div className="space-y-1 flex flex-col items-center text-center">
          <div className="flex items-center space-x-1.5 text-[10px] sm:text-xs font-tech text-zinc-400 uppercase tracking-wider font-bold">
            <Users className="w-3.5 h-3.5 text-zinc-400" />
            <span>Total Members</span>
          </div>
          <div className="font-heading font-black text-xl sm:text-2xl text-white tabular-nums">
            {metrics.totalMembers} <span className="text-zinc-500 text-sm font-normal">/ {metrics.maxMembers}</span>
          </div>
          <div className="text-[11px] font-tech text-zinc-500">
            {metrics.maxMembers - metrics.totalMembers > 0
              ? `${metrics.maxMembers - metrics.totalMembers} Open Recruitment Slots`
              : 'Full Capacity (320 Union Total)'}
          </div>
        </div>

        {/* Metric 2: Active Rate */}
        <div className="space-y-1 flex flex-col items-center text-center">
          <div className="flex items-center space-x-1.5 text-[10px] sm:text-xs font-tech text-emerald-400 uppercase tracking-wider font-bold">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>Active Rate (&le;7 Days)</span>
          </div>
          <div className="font-heading font-black text-xl sm:text-2xl text-white tabular-nums">
            {metrics.activePercentage}<span className="text-emerald-400 text-base">%</span>
          </div>
          <div className="text-[11px] font-tech text-zinc-500">
            <span className="text-emerald-400 font-bold">{metrics.activeCount} Active</span> • <span className="text-zinc-500">{metrics.inactiveCount} Inactive</span>
          </div>
        </div>

        {/* Metric 3: Weekly Contribution with Dynamic Server Rank */}
        <div className="space-y-1 flex flex-col items-center text-center">
          <div className="flex items-center space-x-1.5 text-[10px] sm:text-xs font-tech text-amber-400 uppercase tracking-wider font-bold">
            <Award className="w-3.5 h-3.5 text-amber-400" />
            <span>Weekly Contribution</span>
          </div>
          <div className="font-heading font-black text-xl sm:text-2xl text-amber-300 tabular-nums flex items-baseline justify-center space-x-2.5">
            <span className="text-2xl sm:text-3xl text-amber-400 font-heading font-black tracking-tight">
              #{displayRank}
            </span>
            <span>{metrics.weeklyContrib > 0 ? formatNumber(metrics.weeklyContrib) : '-'}</span>
          </div>
          <div className="text-[11px] font-tech text-zinc-400">
            Simulated Siege Points
          </div>
        </div>
      </div>
    </div>
  );
};
