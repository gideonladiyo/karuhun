import {
  GuildResponse,
  PlayerProfileData,
  CharacterDetailResponse,
  PPCResponse,
  WarzoneResponse,
  GuildListItem,
  GuildActivityStats,
  AllianceActivitySummary
} from '@/types';

import guildFallback from '@/data/fallbacks/guild_fallback.json';
import guildsListFallback from '@/data/fallbacks/guilds_list_fallback.json';
import characterFallback from '@/data/fallbacks/character_fallback.json';
import ppcFallback from '@/data/fallbacks/ppc_fallback.json';
import warzoneFallback from '@/data/fallbacks/warzone_fallback.json';
import { GUILD_BRANCHES, getHuaxuImageUrl } from './imageUtils';

const HUAXU_BASE_URL = import.meta.env.VITE_HUAXU_API_URL || 'https://api.huaxu.app';
const HUAXU_API_KEY = import.meta.env.VITE_HUAXU_API_KEY || '';
const FETCH_TIMEOUT_MS = 4000;
const CACHE_TTL_MS = 3 * 60 * 1000; // 3 minutes cache

// In-Memory API Cache to prevent rate-limit exploitation and redundant network calls
const apiCache = new Map<string, { data: any; timestamp: number }>();

function getCachedData<T>(key: string): T | null {
  const cached = apiCache.get(key);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
    return cached.data as T;
  }
  return null;
}

function setCachedData(key: string, data: any): void {
  apiCache.set(key, { data, timestamp: Date.now() });
}

async function fetchWithTimeout(url: string, options: RequestInit = {}): Promise<Response> {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    const headers = {
      'x-api-key': HUAXU_API_KEY,
      ...(options.headers || {})
    };

    const response = await fetch(url, {
      ...options,
      headers,
      signal: controller.signal
    });
    clearTimeout(id);
    return response;
  } catch (err) {
    clearTimeout(id);
    throw err;
  }
}

/**
 * Fetch Guild data by server & guildId with client-side caching
 * @param isLive If true, uses the live endpoint (`/servers/:server/live/guilds/:guildId`) with 5-min server cache
 */
export async function getGuildData(server: string, guildId: number, isLive: boolean = false): Promise<GuildResponse> {
  const cacheKey = `guild_${isLive ? 'live_' : ''}${server}_${guildId}`;
  const cached = getCachedData<GuildResponse>(cacheKey);
  if (cached) return cached;

  const url = isLive
    ? `${HUAXU_BASE_URL}/servers/${server}/live/guilds/${guildId}`
    : `${HUAXU_BASE_URL}/servers/${server}/guilds/${guildId}`;
  try {
    const res = await fetchWithTimeout(url);
    if (res.ok) {
      const data = await res.json();
      if (data && data.status === 'success') {
        setCachedData(cacheKey, data);
        return data as GuildResponse;
      }
    }
  } catch (err) {
    console.warn(`[APIService] Fetching ${isLive ? 'live ' : ''}guild ${guildId} failed, using fallback data.`, err);
  }

  // Fallback adjustment for the requested guildId
  const fallback = JSON.parse(JSON.stringify(guildFallback)) as GuildResponse;

  if (guildId === 1164) {
    fallback.data.guild.guildId = 1164;
    fallback.data.guild.name = 'Izanami 夜';
    fallback.data.guild.declaration = '— Izanami Karuhun Division AP — Join Discord to apply!';
  } else if (guildId === 7641) {
    fallback.data.guild.guildId = 7641;
    fallback.data.guild.name = 'Astrelume 夜';
    fallback.data.guild.declaration = '— Astrelume Karuhun Division AP — Join Discord to apply!';
  } else if (guildId === 2013) {
    fallback.data.guild.guildId = 2013;
    fallback.data.guild.server = 'na';
    fallback.data.guild.name = 'Karuhun 夜’';
    fallback.data.guild.declaration = '— Karuhun North America Division — Top NA Guild!';
  }

  setCachedData(cacheKey, fallback);
  return fallback;
}

/**
 * Fetch and cache icons for all alliance guild branches from /guilds/:id API
 */
export async function getAllGuildBranchIcons(): Promise<Record<number, string>> {
  const cacheKey = 'guild_branch_icons_map';
  const cached = getCachedData<Record<number, string>>(cacheKey);
  if (cached) return cached;

  const iconsMap: Record<number, string> = {};

  await Promise.all(
    GUILD_BRANCHES.map(async (branch) => {
      try {
        const res = await getGuildData(branch.server, branch.id);
        if (res?.data?.guild?.icon) {
          iconsMap[branch.id] = getHuaxuImageUrl(res.data.guild.icon);
        }
      } catch (err) {
        console.warn(`[APIService] Failed to fetch icon for guild ${branch.id}`, err);
      }
    })
  );

  setCachedData(cacheKey, iconsMap);
  return iconsMap;
}

/**
 * Fetch List of all Guilds in a server (e.g. 'ap' or 'na')
 */
export async function getGuildsList(server: string = 'ap'): Promise<GuildListItem[]> {
  const cacheKey = `guilds_list_${server}`;
  const cached = getCachedData<GuildListItem[]>(cacheKey);
  if (cached) return cached;

  const url = `${HUAXU_BASE_URL}/servers/${server}/guilds`;
  try {
    const res = await fetchWithTimeout(url);
    if (res.ok) {
      const data = await res.json();
      if (data && data.status === 'success' && data.data && Array.isArray(data.data.guilds)) {
        const sorted = data.data.guilds.sort((a: GuildListItem, b: GuildListItem) => (b.contributionWeek || 0) - (a.contributionWeek || 0));
        setCachedData(cacheKey, sorted);
        return sorted;
      }
    }
  } catch (err) {
    console.warn(`[APIService] Fetching guilds list for ${server} failed, using fallback.`, err);
  }

  // Fallback guilds list from JSON fallback
  const filtered = (guildsListFallback as GuildListItem[]).filter(g => g.server === server);
  setCachedData(cacheKey, filtered);
  return filtered;
}

/**
 * Fetch and calculate member activity statistics (active <= 7d offline vs inactive > 7d offline)
 */
export async function getGuildActivityStats(server: string, guildId: number): Promise<GuildActivityStats> {
  const guildData = await getGuildData(server, guildId, true);
  const members = (guildData && guildData.data && guildData.data.members) || [];
  const guildInfo = (guildData && guildData.data && guildData.data.guild) || {
    name: 'Karuhun Division',
    memberCount: members.length,
    maxMemberCount: 80,
    contributionWeek: 0,
    leaderName: 'Commander'
  };

  const now = Date.now();
  const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

  const activeMembers = members.filter((m) => {
    if (!m.lastLoginTime) return false;
    const lastLogin = new Date(m.lastLoginTime).getTime();
    return (now - lastLogin) <= SEVEN_DAYS_MS;
  }).length;

  const totalMembers = members.length || guildInfo.memberCount || 0;
  const inactiveMembers = Math.max(0, totalMembers - activeMembers);
  const activePercentage = totalMembers > 0 ? Number(((activeMembers / totalMembers) * 100).toFixed(1)) : 0;

  return {
    guildId,
    server,
    name: guildInfo.name,
    totalMembers,
    maxMembers: guildInfo.maxMemberCount || 80,
    activeMembers,
    inactiveMembers,
    activePercentage,
    contributionWeek: guildInfo.contributionWeek || 0,
    leaderName: guildInfo.leaderName || ''
  };
}

/**
 * Fetch combined live alliance activity for all 4 branches
 */
export async function getAllianceLiveActivity(): Promise<AllianceActivitySummary> {
  const cacheKey = 'alliance_live_activity_summary';
  const cached = getCachedData<AllianceActivitySummary>(cacheKey);
  if (cached) return cached;

  const results = await Promise.allSettled(
    GUILD_BRANCHES.map(b => getGuildActivityStats(b.server, b.id))
  );

  const branches: Record<number, GuildActivityStats> = {};
  let totalMembers = 0;
  let totalActive = 0;
  let totalInactive = 0;

  results.forEach((res, index) => {
    const config = GUILD_BRANCHES[index];
    if (res.status === 'fulfilled') {
      const stats = res.value;
      branches[config.id] = stats;
      totalMembers += stats.totalMembers;
      totalActive += stats.activeMembers;
      totalInactive += stats.inactiveMembers;
    }
  });

  const overallActivePercentage = totalMembers > 0 
    ? Number(((totalActive / totalMembers) * 100).toFixed(1)) 
    : 0;

  const summary: AllianceActivitySummary = {
    totalMembers,
    totalActive,
    totalInactive,
    overallActivePercentage,
    branches
  };

  setCachedData(cacheKey, summary);
  return summary;
}

export interface PlayerProfileResponse {
  data: PlayerProfileData | null;
  error?: {
    code: string | number;
    message: string;
  } | null;
}

/**
 * Fetch Player Profile by server & uid with client-side caching
 */
export async function getPlayerProfile(server: string, uid: number): Promise<PlayerProfileResponse> {
  const cacheKey = `profile_${server}_${uid}`;
  const cached = getCachedData<PlayerProfileData>(cacheKey);
  if (cached) return { data: cached, error: null };

  const url = `${HUAXU_BASE_URL}/servers/${server}/players/${uid}`;
  try {
    const res = await fetchWithTimeout(url);
    const json = await res.json().catch(() => null);

    if (res.ok && json && json.status === 'success' && json.data) {
      setCachedData(cacheKey, json.data);
      return { data: json.data as PlayerProfileData, error: null };
    }

    // Capture dynamic error code & message from API response
    const errorCode = res.status !== 200 ? res.status : (json?.code || 404);
    const errorMessage = json?.message || (res.status === 404 ? 'Player not found' : 'Failed to get player');

    return {
      data: null,
      error: {
        code: errorCode,
        message: errorMessage
      }
    };
  } catch (err: any) {
    console.warn(`[APIService] Fetching player ${uid} failed.`, err);
    return {
      data: null,
      error: {
        code: err.name === 'AbortError' ? 504 : 500,
        message: err.message || 'Network error / API unreachable'
      }
    };
  }
}

/**
 * Fetch Character Detail for a specific player & character with caching
 */
export async function getCharacterDetail(
  server: string,
  uid: number,
  characterUid: number
): Promise<CharacterDetailResponse> {
  const cacheKey = `character_${server}_${uid}_${characterUid}`;
  const cached = getCachedData<CharacterDetailResponse>(cacheKey);
  if (cached) return cached;

  const url = `${HUAXU_BASE_URL}/servers/${server}/players/${uid}/characters/${characterUid}`;
  try {
    const res = await fetchWithTimeout(url);
    if (res.ok) {
      const data = await res.json();
      if (data && data.status === 'success') {
        setCachedData(cacheKey, data);
        return data as CharacterDetailResponse;
      }
    }
  } catch (err) {
    console.warn(`[APIService] Fetching character detail ${characterUid} failed, using fallback.`, err);
  }

  const fallback = characterFallback as CharacterDetailResponse;
  setCachedData(cacheKey, fallback);
  return fallback;
}

/**
 * Fetch PPC Leaderboard by server & rank level
 */
export async function getPPCLeaderboard(server: string, rank: number = 4): Promise<PPCResponse> {
  const cacheKey = `ppc_${server}_${rank}`;
  const cached = getCachedData<PPCResponse>(cacheKey);
  if (cached) return cached;

  const url = `${HUAXU_BASE_URL}/servers/${server}/ppc/current/${rank}?ranking=true`;
  try {
    const res = await fetchWithTimeout(url);
    if (res.ok) {
      const data = await res.json();
      if (data && data.status === 'success') {
        setCachedData(cacheKey, data);
        return data as PPCResponse;
      }
    }
  } catch (err) {
    console.warn(`[APIService] Fetching PPC leaderboard for ${server}/${rank} failed, using fallback.`, err);
  }

  const fallback = JSON.parse(JSON.stringify(ppcFallback)) as PPCResponse;
  if (fallback.data && fallback.data.ppc) {
    fallback.data.ppc.server = server;
    if (rank === 3) {
      fallback.data.ppc.level.id = 3;
      fallback.data.ppc.level.name = 'Advanced';
    }
  }
  setCachedData(cacheKey, fallback);
  return fallback;
}

/**
 * Fetch Warzone Leaderboard by server & optional zone
 */
export async function getWarzoneLeaderboard(server: string, zone?: number): Promise<WarzoneResponse> {
  const cacheKey = `warzone_${server}_${zone || 'default'}`;
  const cached = getCachedData<WarzoneResponse>(cacheKey);
  if (cached) return cached;

  const url = zone
    ? `${HUAXU_BASE_URL}/servers/${server}/warzone/current/${zone}?ranking=true`
    : `${HUAXU_BASE_URL}/servers/${server}/warzone/current?ranking=true`;

  try {
    const res = await fetchWithTimeout(url);
    if (res.ok) {
      const data = await res.json();
      if (data && data.status === 'success') {
        setCachedData(cacheKey, data);
        return data as WarzoneResponse;
      }
    }
  } catch (err) {
    console.warn(`[APIService] Fetching Warzone leaderboard for ${server} failed, using fallback.`, err);
  }

  const fallback = JSON.parse(JSON.stringify(warzoneFallback)) as WarzoneResponse;
  setCachedData(cacheKey, fallback);
  return fallback;
}
