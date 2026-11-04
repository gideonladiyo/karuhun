import { getWarzoneLeaderboard, getPPCLeaderboard } from '@/services/apiService';
import { GUILD_BRANCHES } from '@/services/imageUtils';
import warzoneFallback from '@/data/fallbacks/warzone_fallback.json';
import ppcFallback from '@/data/fallbacks/ppc_fallback.json';

export interface WarzoneCharacter {
  id: number;
  characterName: string;
  frameName: string;
  icon: string;
  bp: number;
  rank: number;
  cubName?: string;
  cubIcon?: string;
}

export interface WarzoneZoneResult {
  id: number;
  name: string;
  score: number;
  characters: WarzoneCharacter[];
}

export interface MemberCompetitiveAchievement {
  id: number;
  name: string;
  guildId: number;
  guildName: string;
  server: string;
  portrait: string;
  frame?: string;
  warzone: {
    tier: number;
    tierLabel: string;
    rank: number;
    score: number;
    zones: WarzoneZoneResult[];
  } | null;
  ppc: {
    levelId: number;
    level: string;
    rank: number;
    score: number;
  } | null;
}

export type RankingSort = 'total' | 'warzone' | 'ppc';

const SERVERS = ['ap', 'na'] as const;
const WZ_TIERS = Array.from({ length: 16 }, (_, i) => i + 1);
const PPC_LEVELS = [3, 4]; // levels 1 & 2 are not served by the API

const WZ_TIER_LABELS: Record<number, string> = { 16: 'Legend', 15: 'Hero' };
const PPC_LEVEL_LABELS: Record<number, string> = { 4: 'Ultimate', 3: 'Advanced' };

const branchByKey = new Map(GUILD_BRANCHES.map((b) => [`${b.server}:${b.id}`, b]));

export const getWarzoneTierLabel = (tier: number) => WZ_TIER_LABELS[tier] ?? `Tier ${tier}`;

export const getTotalScore = (m: MemberCompetitiveAchievement) =>
  (m.warzone?.score ?? 0) + (m.ppc?.score ?? 0);

/**
 * Fetches every Warzone tier and PPC level on both servers, keeps only players
 * whose guildId belongs to one of the configured guild branches.
 */
export async function fetchCompositeAllianceLeaderboard(): Promise<MemberCompetitiveAchievement[]> {
  const wzJobs = SERVERS.flatMap((server) => WZ_TIERS.map((tier) => ({ server, tier })));
  const ppcJobs = SERVERS.flatMap((server) => PPC_LEVELS.map((level) => ({ server, level })));

  const [wzResults, ppcResults] = await Promise.all([
    Promise.allSettled(wzJobs.map((j) => getWarzoneLeaderboard(j.server, j.tier))),
    Promise.allSettled(ppcJobs.map((j) => getPPCLeaderboard(j.server, j.level))),
  ]);

  const members = new Map<string, MemberCompetitiveAchievement>();

  const upsert = (server: string, entry: any): MemberCompetitiveAchievement | null => {
    const p = entry?.player;
    if (!p?.id) return null;
    const branch = branchByKey.get(`${server}:${p.guildId}`);
    if (!branch) return null;

    const key = `${server}:${p.id}`;
    let m = members.get(key);
    if (!m) {
      m = {
        id: p.id,
        name: p.name || '',
        guildId: branch.id,
        guildName: branch.name,
        server,
        portrait: p.portrait || 'image/roleplayersp/roleplayer01',
        frame: p.frame,
        warzone: null,
        ppc: null,
      };
      members.set(key, m);
    }
    return m;
  };

  wzResults.forEach((res, i) => {
    if (res.status !== 'fulfilled') return;
    const { server, tier } = wzJobs[i];
    const data = res.value?.data;
    // Ignore the bundled fallback snapshot and any mismatched response
    if (!data?.warzone || data.warzone.updatedAt === warzoneFallback.data.warzone.updatedAt) return;
    if (data.warzone.challenge !== tier || !Array.isArray(data.rankings)) return;

    const zoneNames = new Map<number, string>(
      (data.warzone.area?.zones || []).map((z: any) => [z.id, z.name])
    );

    data.rankings.forEach((entry: any) => {
      const m = upsert(server, entry);
      const score = Number(entry.score) || 0;
      if (!m || (m.warzone && m.warzone.score >= score)) return;
      m.warzone = {
        tier,
        tierLabel: getWarzoneTierLabel(tier),
        rank: entry.rank,
        score,
        zones: (entry.zones || []).map((z: any) => ({
          id: z.id,
          name: zoneNames.get(z.id) || `Zone ${z.id}`,
          score: Number(z.score) || 0,
          characters: z.characters || [],
        })),
      };
    });
  });

  ppcResults.forEach((res, i) => {
    if (res.status !== 'fulfilled') return;
    const { server, level } = ppcJobs[i];
    const data = res.value?.data;
    if (!data?.ppc || data.ppc.updatedAt === ppcFallback.data.ppc.updatedAt) return;
    if (data.ppc.level?.id !== level || !Array.isArray(data.ranking)) return;

    data.ranking.forEach((entry: any) => {
      const m = upsert(server, entry);
      const score = Number(entry.score) || 0;
      if (!m || (m.ppc && m.ppc.score >= score)) return;
      m.ppc = {
        levelId: level,
        level: data.ppc.level?.name || PPC_LEVEL_LABELS[level],
        rank: entry.rank,
        score,
      };
    });
  });

  return [...members.values()];
}

/**
 * Sorts by total (WZ + PPC), WZ score only, or PPC score only.
 * In single-mode sorts, members without a score in that mode go last (ordered by total).
 */
export function sortAllianceMembers(
  members: MemberCompetitiveAchievement[],
  sortBy: RankingSort = 'total'
): MemberCompetitiveAchievement[] {
  return [...members].sort((a, b) => {
    if (sortBy !== 'total') {
      const aS = a[sortBy]?.score ?? -1;
      const bS = b[sortBy]?.score ?? -1;
      if (aS !== bS) return bS - aS;
    }
    return getTotalScore(b) - getTotalScore(a);
  });
}
