import {
  GuildResponse,
  PlayerProfileData,
  CharacterDetailResponse,
  PPCResponse,
  WarzoneResponse
} from '@/types';

import guildFallback from '@/data/fallbacks/guild_fallback.json';
import profileFallback from '@/data/fallbacks/profile_fallback.json';
import characterFallback from '@/data/fallbacks/character_fallback.json';
import ppcFallback from '@/data/fallbacks/ppc_fallback.json';
import warzoneFallback from '@/data/fallbacks/warzone_fallback.json';

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
 * Fetch Player Profile by server & uid with client-side caching
 */
export async function getPlayerProfile(server: string, uid: number): Promise<PlayerProfileData> {
  const cacheKey = `profile_${server}_${uid}`;
  const cached = getCachedData<PlayerProfileData>(cacheKey);
  if (cached) return cached;

  const url = `${HUAXU_BASE_URL}/servers/${server}/players/${uid}`;
  try {
    const res = await fetchWithTimeout(url);
    if (res.ok) {
      const data = await res.json();
      if (data && data.status === 'success' && data.data) {
        setCachedData(cacheKey, data.data);
        return data.data as PlayerProfileData;
      }
    }
  } catch (err) {
    console.warn(`[APIService] Fetching player ${uid} failed, using fallback.`, err);
  }

  const fallbackData = JSON.parse(JSON.stringify(profileFallback)).data as PlayerProfileData;
  if (fallbackData.player) {
    fallbackData.player.id = uid;
  }

  setCachedData(cacheKey, fallbackData);
  return fallbackData;
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
