import React, { useMemo, useState, useEffect } from 'react';
import { GuildInfo, GuildMember } from '@/types';
import { GuildBranchConfig } from '@/services/imageUtils';
import { getGuildsList } from '@/services/apiService';
import { getDivisionTheme } from '@/lib/divisionTag';
import { calculateRosterActivity } from '@/lib/memberActivity';
import { formatNumber } from '@/lib/format';
import { cn } from '@/lib/utils';

interface GuildOverviewTelemetryProps {
  currentGuild: GuildInfo | null;
  members?: GuildMember[];
  activeBranch: GuildBranchConfig;
  loading: boolean;
}

const Metric: React.FC<{ label: string; value: React.ReactNode; sub?: React.ReactNode }> = ({ label, value, sub }) => (
  <div className="px-5 py-5 sm:px-6 bg-[#121215] text-left">
    <div className="text-xs text-zinc-500">{label}</div>
    <div className="mt-1 text-2xl sm:text-3xl font-heading font-semibold text-white tabular-nums tracking-tight">{value}</div>
    {sub && <div className="mt-0.5 text-xs text-zinc-500">{sub}</div>}
  </div>
);

export const GuildOverviewTelemetry: React.FC<GuildOverviewTelemetryProps> = ({
  currentGuild,
  members = [],
  activeBranch,
  loading,
}) => {
  const [serverRank, setServerRank] = useState<number | null>(null);
  const divisionTheme = getDivisionTheme(activeBranch.tag);
  const targetGuildId = currentGuild?.guildId || activeBranch.id;

  useEffect(() => {
    let isMounted = true;
    setServerRank(null);

    getGuildsList(activeBranch.server)
      .then((guildsList) => {
        if (!isMounted || !Array.isArray(guildsList)) return;
        const index = guildsList.findIndex((g) => g.guildId === targetGuildId);
        setServerRank(index === -1 ? null : index + 1);
      })
      .catch((err) => console.warn('Failed to fetch guild rank from /guilds:', err));

    return () => {
      isMounted = false;
    };
  }, [activeBranch.server, targetGuildId]);

  const metrics = useMemo(() => {
    const activity = members.length > 0 ? calculateRosterActivity(members) : null;
    const weeklyContrib =
      currentGuild?.contributionWeek ||
      (members.length > 0 ? members.reduce((acc, m) => acc + (m.contributeWeek || 0), 0) : 0);

    return {
      totalMembers: activity?.totalMembers ?? currentGuild?.memberCount ?? null,
      maxMembers: currentGuild?.maxMemberCount ?? null,
      activity,
      weeklyContrib,
    };
  }, [currentGuild, members]);

  if (loading) {
    return (
      <div className="space-y-6" aria-busy="true" aria-label="Loading guild overview">
        <div className="flex flex-col items-center gap-3">
          <div className="h-9 w-64 rounded-lg bg-[#18181b] animate-pulse" />
          <div className="h-3.5 w-80 max-w-full rounded bg-[#18181b] animate-pulse" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-px rounded-2xl overflow-hidden border border-[#27272a] bg-[#27272a] max-w-4xl mx-auto">
          {Array.from({ length: 3 }, (_, i) => (
            <div key={i} className="px-6 py-5 space-y-2 bg-[#121215]">
              <div className="h-3 w-20 rounded bg-[#18181b] animate-pulse" />
              <div className="h-7 w-24 rounded bg-[#18181b] animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  const guildName = currentGuild?.name || activeBranch.name;
  const declaration = currentGuild?.declaration?.replace(/^["']|["']$/g, '').trim();
  const openSlots =
    metrics.totalMembers !== null && metrics.maxMembers !== null ? metrics.maxMembers - metrics.totalMembers : null;

  return (
    <div className="w-full space-y-7">
      <div className="max-w-3xl mx-auto flex flex-col items-center text-center gap-3">
        <span className={cn('inline-flex items-center gap-2 text-xs font-medium', divisionTheme.textClass)}>
          <span className={cn('w-1.5 h-1.5 rounded-full', divisionTheme.dotClass)} />
          {divisionTheme.label}
        </span>
        <h2 className="font-heading font-bold text-3xl sm:text-4xl lg:text-5xl text-white tracking-tight [text-wrap:balance]">
          {guildName}
        </h2>
        <p className="flex flex-wrap items-center justify-center gap-x-2.5 gap-y-1 text-sm text-zinc-400">
          <span>{activeBranch.region}</span>
          <span className="text-zinc-700">·</span>
          <span className="font-mono text-xs text-zinc-500">ID {String(targetGuildId).padStart(8, '0')}</span>
          {currentGuild?.leaderName && (
            <>
              <span className="text-zinc-700">·</span>
              <span>
                Led by <span className="text-zinc-200">{currentGuild.leaderName}</span>
              </span>
            </>
          )}
        </p>
        {declaration && (
          <p className="text-sm sm:text-base text-zinc-400 italic max-w-[60ch] leading-relaxed [text-wrap:pretty]">
            “{declaration}”
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-px rounded-2xl overflow-hidden border border-[#27272a] bg-[#27272a] max-w-4xl mx-auto">
        <Metric
          label="Members"
          value={
            metrics.totalMembers !== null ? (
              <>
                {metrics.totalMembers}
                {metrics.maxMembers !== null && (
                  <span className="text-base text-zinc-600 font-normal"> / {metrics.maxMembers}</span>
                )}
              </>
            ) : (
              '—'
            )
          }
          sub={openSlots === null ? undefined : openSlots > 0 ? `${openSlots} open slots` : 'Full'}
        />
        <Metric
          label="Active in the last 7 days"
          value={
            metrics.activity ? (
              <>
                {metrics.activity.activePercentage}
                <span className="text-base text-emerald-400">%</span>
              </>
            ) : (
              '—'
            )
          }
          sub={
            metrics.activity
              ? `${metrics.activity.activeCount} active · ${metrics.activity.inactiveCount} inactive`
              : undefined
          }
        />
        <Metric
          label="Weekly contribution"
          value={metrics.weeklyContrib > 0 ? formatNumber(metrics.weeklyContrib) : '—'}
          sub={serverRank !== null ? <span className="text-amber-300">#{serverRank} on {activeBranch.server.toUpperCase()}</span> : undefined}
        />
      </div>
    </div>
  );
};
