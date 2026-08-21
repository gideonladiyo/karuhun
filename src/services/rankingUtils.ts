import { getWarzoneLeaderboard, getPPCLeaderboard } from '@/services/apiService';
import { GUILD_BRANCHES } from '@/services/imageUtils';

export interface MemberCompetitiveAchievement {
  id: number;
  name: string;
  guildName: string;
  server: string;
  portrait: string;
  frame?: string;
  warzone?: {
    rank: number;
    division: string;
    divisionRank: number;
    score: number;
    team?: any[];
  } | null;
  ppc?: {
    rank: number;
    level: string;
    levelId: number;
    score: number;
  } | null;
}

/**
 * Checks whether a player belongs to the Karuhun alliance
 */
export const isAllianceMember = (name: string, guildName?: string): boolean => {
  if (guildName) {
    const cleanGuild = guildName.toLowerCase();
    const matchesBranch = GUILD_BRANCHES.some((b) => {
      const baseName = b.name.toLowerCase().replace(/[\s夜’']/g, '');
      return cleanGuild.replace(/[\s夜’']/g, '').includes(baseName);
    });
    if (matchesBranch) return true;
  }
  return name.includes('夜') || name.startsWith('Karuhun');
};

/**
 * Computes composite score for leaderboard ranking
 */
export const calculateAchievementScore = (m: MemberCompetitiveAchievement): number => {
  let score = 0;
  if (m.warzone) {
    const divBonus = m.warzone.divisionRank === 16 ? 1000000 : 500000;
    score += divBonus + (1000 - m.warzone.rank);
  }
  if (m.ppc) {
    const lvlBonus = m.ppc.levelId === 4 ? 1000000 : 500000;
    score += lvlBonus + (1000 - m.ppc.rank);
  }
  return score;
};

/**
 * Fetches and processes composite leaderboard data across WZ and PPC (AP & NA)
 */
export async function fetchCompositeAllianceLeaderboard(): Promise<MemberCompetitiveAchievement[]> {
  const fetchPromises = [
    getWarzoneLeaderboard('na', 16),
    getWarzoneLeaderboard('na', 15),
    getWarzoneLeaderboard('ap', 16),
    getWarzoneLeaderboard('ap', 15),
    getPPCLeaderboard('na', 4),
    getPPCLeaderboard('na', 3),
    getPPCLeaderboard('ap', 4),
    getPPCLeaderboard('ap', 3),
  ];

  const results = await Promise.allSettled(fetchPromises);
  const achievementsMap: Record<number, MemberCompetitiveAchievement> = {};

  // 1. Process Warzone Leaderboard Responses (Indices 0 to 3)
  results.slice(0, 4).forEach((res) => {
    if (res.status !== 'fulfilled' || !res.value || !res.value.data) return;
    const data = res.value.data as any;

    const wzRankings = (data.warzone && data.warzone.rankings) || (data.rankings && !data.ppc ? data.rankings : null);
    if (!wzRankings || !Array.isArray(wzRankings)) return;

    const srv = (data.warzone && data.warzone.server) || 'na';
    const divRank = (data.warzone && data.warzone.challenge) || 16;
    const divLabel = divRank === 16 ? 'Legend' : divRank === 15 ? 'Hero' : 'Leader';

    wzRankings.forEach((item: any) => {
      const p = item.player || item;
      const name = p.name || item.name || '';
      const gname = p.guildName || item.guildName || '';
      const pid = p.id || item.playerId || item.id;

      if (pid && isAllianceMember(name, gname)) {
        if (!achievementsMap[pid]) {
          achievementsMap[pid] = {
            id: pid,
            name,
            guildName: gname || 'Karuhun 夜',
            server: srv,
            portrait: p.portrait || item.portrait || 'image/roleplayersp/roleplayer01',
            frame: p.frame || item.frame,
            warzone: null,
            ppc: null
          };
        }

        if (!achievementsMap[pid].warzone || item.score > (achievementsMap[pid].warzone?.score || 0)) {
          achievementsMap[pid].warzone = {
            rank: item.rank || item.ranking || 1,
            division: divLabel,
            divisionRank: divRank,
            score: item.score || 0,
            team: item.zones?.[0]?.characters || item.team || []
          };
        }
      }
    });
  });

  // 2. Process PPC Leaderboard Responses (Indices 4 to 7)
  results.slice(4, 8).forEach((res) => {
    if (res.status !== 'fulfilled' || !res.value || !res.value.data) return;
    const data = res.value.data as any;

    const ppcRankings = (data.ppc && (data.ppc.ranking || data.ppc.rankings)) || (data.ranking ? data.ranking : null);
    if (!ppcRankings || !Array.isArray(ppcRankings)) return;

    const srv = (data.ppc && data.ppc.server) || 'na';
    const lvlId = (data.ppc && data.ppc.level?.id) || 4;
    const lvlLabel = lvlId === 4 ? 'Ultimate' : 'Advanced';

    ppcRankings.forEach((item: any) => {
      const p = item.player || item;
      const name = p.name || item.name || '';
      const gname = p.guildName || item.guildName || '';
      const pid = p.id || item.playerId || item.id;

      if (pid && isAllianceMember(name, gname)) {
        if (!achievementsMap[pid]) {
          achievementsMap[pid] = {
            id: pid,
            name,
            guildName: gname || 'Karuhun 夜',
            server: srv,
            portrait: p.portrait || item.portrait || 'image/roleplayersp/roleplayer01',
            frame: p.frame || item.frame,
            warzone: null,
            ppc: null
          };
        }

        if (!achievementsMap[pid].ppc || item.score > (achievementsMap[pid].ppc?.score || 0)) {
          achievementsMap[pid].ppc = {
            rank: item.rank || item.ranking || 1,
            level: lvlLabel,
            levelId: lvlId,
            score: item.score || 0
          };
        }
      }
    });
  });

  return Object.values(achievementsMap);
}

/**
 * Sorts alliance members based on ranking mode
 */
export function sortAllianceMembers(
  members: MemberCompetitiveAchievement[],
  sortBy: 'composite' | 'warzone' | 'ppc' | 'rank' = 'composite',
  serverFilter: 'all' | 'ap' | 'na' = 'all'
): MemberCompetitiveAchievement[] {
  return members
    .filter((m) => serverFilter === 'all' || m.server.toLowerCase() === serverFilter.toLowerCase())
    .sort((a, b) => {
      if (sortBy === 'warzone') {
        const aW = a.warzone ? (a.warzone.divisionRank * 1000 - a.warzone.rank) : 0;
        const bW = b.warzone ? (b.warzone.divisionRank * 1000 - b.warzone.rank) : 0;
        return bW - aW;
      }
      if (sortBy === 'ppc') {
        const aP = a.ppc ? (a.ppc.levelId * 1000 - a.ppc.rank) : 0;
        const bP = b.ppc ? (b.ppc.levelId * 1000 - b.ppc.rank) : 0;
        return bP - aP;
      }
      // Default: composite score
      return calculateAchievementScore(b) - calculateAchievementScore(a);
    });
}
