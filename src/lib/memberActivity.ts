import { GuildMember } from '@/types';

export interface MemberActivityStatus {
  text: string;
  badgeStyle: string;
  isInactive: boolean;
  days: number | null;
}

const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

/**
 * Evaluate a single member's login timestamp against the 7-day activity threshold.
 */
export function formatMemberActivity(lastLoginStr?: string): MemberActivityStatus {
  if (!lastLoginStr) {
    return {
      text: 'ACTIVE TODAY',
      badgeStyle: 'text-emerald-400 bg-emerald-950/40 border-emerald-500/30 font-semibold',
      isInactive: false,
      days: 0,
    };
  }

  try {
    const loginDate = new Date(lastLoginStr);
    const now = new Date();
    const diffTimeMs = now.getTime() - loginDate.getTime();
    const diffDays = Math.floor(diffTimeMs / (1000 * 60 * 60 * 24));

    if (Number.isNaN(diffDays) || diffDays <= 0) {
      return {
        text: 'ACTIVE TODAY',
        badgeStyle: 'text-emerald-400 bg-emerald-950/40 border-emerald-500/30 font-semibold',
        isInactive: false,
        days: 0,
      };
    }

    if (diffDays >= 7) {
      return {
        text: `${diffDays}D AGO • INACTIVE`,
        badgeStyle: 'text-red-400 bg-red-950/50 border-red-500/40 font-bold',
        isInactive: true,
        days: diffDays,
      };
    }

    return {
      text: `ACTIVE ${diffDays}D AGO`,
      badgeStyle: 'text-zinc-300 bg-[#18181b] border-[#27272a]',
      isInactive: false,
      days: diffDays,
    };
  } catch {
    return {
      text: 'ACTIVE',
      badgeStyle: 'text-zinc-400 bg-[#18181b] border-[#27272a]',
      isInactive: false,
      days: null,
    };
  }
}

/**
 * Compute aggregate member activity metrics for a guild roster.
 */
export function calculateRosterActivity(
  members: GuildMember[],
  fallbackMemberCount?: number,
  maxMembers: number = 80
) {
  const now = Date.now();
  const totalMembers = members.length > 0 ? members.length : (fallbackMemberCount ?? 0);

  let activeCount = 0;
  let inactiveCount = 0;

  if (members.length > 0) {
    members.forEach((m) => {
      if (!m.lastLoginTime) {
        inactiveCount += 1;
        return;
      }
      const lastLoginMs = new Date(m.lastLoginTime).getTime();
      if (now - lastLoginMs <= SEVEN_DAYS_MS) {
        activeCount += 1;
      } else {
        inactiveCount += 1;
      }
    });
  } else {
    activeCount = totalMembers;
    inactiveCount = 0;
  }

  const activePercentage =
    totalMembers > 0 ? Number(((activeCount / totalMembers) * 100).toFixed(1)) : 0;

  return {
    totalMembers,
    maxMembers,
    activeCount,
    inactiveCount,
    activePercentage,
  };
}
