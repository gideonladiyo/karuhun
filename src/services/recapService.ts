import { getGuildData } from '@/services/apiService';
import { GUILD_BRANCHES } from '@/services/imageUtils';
import { supabase, isSupabaseConfigured } from '@/services/supabase/client';
import fallbackComparisonData from '@/data/fallbacks/guild_members_comparison.json';

export interface GuildMemberSnapshot {
  guildId: number;
  guildName: string;
  server: string;
  playerId: number;
  name: string;
  weeklyContribution: number;
  snapshotTime?: string;
}

export interface BaselineDataset {
  fetchedAt: string;
  totalMembers: number;
  members: GuildMemberSnapshot[];
  isAutoSnapshot?: boolean;
}

export interface MemberComparisonItem {
  guildId: number;
  guildName: string;
  server: string;
  playerId: number;
  name: string;
  oldContribution: number;
  newContribution: number;
  difference: number;
  hasContributed: boolean;
  isNewMember?: boolean;
  statusReason: 'BELUM_KONTRIBUSI' | 'SUDAH_KONTRIBUSI' | 'MEMBER_BARU' | 'MEMBER_KELUAR';
}

export interface RecapComparisonResult {
  comparedAt: string;
  baselineTime: string;
  totalMembers: number;
  contributedCount: number;
  uncontributedCount: number;
  newMembersCount: number;
  leftMembersCount: number;
  items: MemberComparisonItem[];
  uncontributedList: MemberComparisonItem[];
  contributedList: MemberComparisonItem[];
  leftMembersList: MemberComparisonItem[];
  guildSummary: Array<{
    guildId: number;
    guildName: string;
    total: number;
    contributed: number;
    uncontributed: number;
    newMembers: number;
    leftMembers: number;
  }>;
}

const STORAGE_KEY_BASELINE = 'karuhun_recap_baseline_v1';
const STORAGE_KEY_LAST_COMPARISON = 'karuhun_recap_last_result_v1';
const STORAGE_KEY_AUTO_DATE = 'karuhun_recap_auto_snapshot_date';

/**
 * Fetch live data for all 4 Karuhun Alliance Guilds from API
 */
export async function fetchAllGuildMembersSnapshot(isAuto = false): Promise<BaselineDataset> {
  const allMembers: GuildMemberSnapshot[] = [];
  const fetchedAt = new Date().toISOString();

  for (const branch of GUILD_BRANCHES) {
    try {
      const res = await getGuildData(branch.server, branch.id);
      if (res && res.data && res.data.members) {
        const guildName = res.data.guild?.name || branch.name;
        const membersList = res.data.members.map((m) => ({
          guildId: branch.id,
          guildName: guildName,
          server: branch.server,
          playerId: m.playerId,
          name: m.name,
          weeklyContribution: m.contributeWeek ?? 0,
          snapshotTime: fetchedAt
        }));
        allMembers.push(...membersList);
      }
    } catch (err) {
      console.warn(`[RecapService] Failed fetching live data for guild ${branch.id}:`, err);
    }
  }

  const dataset: BaselineDataset = {
    fetchedAt,
    totalMembers: allMembers.length,
    members: allMembers,
    isAutoSnapshot: isAuto
  };

  return dataset;
}

/**
 * Save baseline snapshot (Data Lama) to LocalStorage & Supabase (if configured)
 */
export async function saveBaselineSnapshot(dataset: BaselineDataset): Promise<void> {
  try {
    localStorage.setItem(STORAGE_KEY_BASELINE, JSON.stringify(dataset));
  } catch (err) {
    console.error('[RecapService] Failed saving baseline to localStorage:', err);
  }

  // Sync to Supabase if configured so all devices share the 11:58 WIB snapshot
  if (isSupabaseConfigured() && supabase) {
    try {
      await supabase.from('guild_recap_snapshots').upsert({
        id: 'latest_baseline',
        fetched_at: dataset.fetchedAt,
        total_members: dataset.totalMembers,
        is_auto: dataset.isAutoSnapshot ?? false,
        data: dataset,
        updated_at: new Date().toISOString()
      });
    } catch (e) {
      console.warn('[RecapService] Supabase sync optional notice:', e);
    }
  }
}

/**
 * Load baseline snapshot from LocalStorage, Supabase, or fallback JSON
 */
export function loadBaselineSnapshot(): BaselineDataset {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_BASELINE);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && Array.isArray(parsed.members) && parsed.members.length > 0) {
        return parsed as BaselineDataset;
      }
    }
  } catch (err) {
    console.warn('[RecapService] LocalStorage read failed, using fallback json:', err);
  }

  // Fallback to static JSON file if present
  if (fallbackComparisonData && Array.isArray(fallbackComparisonData.members)) {
    return fallbackComparisonData as BaselineDataset;
  }

  return {
    fetchedAt: new Date().toISOString(),
    totalMembers: 0,
    members: []
  };
}

/**
 * Async version of loading baseline snapshot that checks Supabase first if available
 */
export async function loadBaselineSnapshotAsync(): Promise<BaselineDataset> {
  if (isSupabaseConfigured() && supabase) {
    try {
      const { data } = await supabase
        .from('guild_recap_snapshots')
        .select('data')
        .eq('id', 'latest_baseline')
        .maybeSingle();

      if (data && data.data && Array.isArray(data.data.members) && data.data.members.length > 0) {
        // Cache to local storage as well
        localStorage.setItem(STORAGE_KEY_BASELINE, JSON.stringify(data.data));
        return data.data as BaselineDataset;
      }
    } catch (e) {
      console.warn('[RecapService] Supabase baseline fetch optional notice:', e);
    }
  }

  return loadBaselineSnapshot();
}

/**
 * Core Comparison Logic:
 * Compares current weekly data against old baseline data.
 */
export function compareGuildMembersData(
  baselineDataset: BaselineDataset,
  currentDataset: BaselineDataset
): RecapComparisonResult {
  const baselineMap = new Map<number, GuildMemberSnapshot>();
  baselineDataset.members.forEach((m) => {
    baselineMap.set(m.playerId, m);
  });

  const items: MemberComparisonItem[] = [];
  const uncontributedList: MemberComparisonItem[] = [];
  const contributedList: MemberComparisonItem[] = [];
  const leftMembersList: MemberComparisonItem[] = [];
  let newMembersCount = 0;

  const currentMemberIds = new Set<number>();

  const guildSummaryMap = new Map<number, { guildId: number; guildName: string; total: number; contributed: number; uncontributed: number; newMembers: number; leftMembers: number }>();

  GUILD_BRANCHES.forEach((b) => {
    guildSummaryMap.set(b.id, {
      guildId: b.id,
      guildName: b.name,
      total: 0,
      contributed: 0,
      uncontributed: 0,
      newMembers: 0,
      leftMembers: 0
    });
  });

  for (const currentMember of currentDataset.members) {
    currentMemberIds.add(currentMember.playerId);
    const oldMember = baselineMap.get(currentMember.playerId);
    const isNew = !oldMember;
    const oldContrib = oldMember ? oldMember.weeklyContribution : 0;
    const newContrib = currentMember.weeklyContribution;
    const diff = newContrib - oldContrib;

    // User Rule: Member dikategorikan Belum Kontribusi HANYA jika (diff === 0 ATAU newContrib === 0)
    const isUncontributed = (diff === 0) || (newContrib === 0);
    const hasContributed = !isUncontributed;

    if (isNew) {
      newMembersCount++;
    }

    const statusReason: 'BELUM_KONTRIBUSI' | 'SUDAH_KONTRIBUSI' | 'MEMBER_BARU' | 'MEMBER_KELUAR' = isNew && isUncontributed
      ? 'MEMBER_BARU'
      : isUncontributed
      ? 'BELUM_KONTRIBUSI'
      : 'SUDAH_KONTRIBUSI';

    const item: MemberComparisonItem = {
      guildId: currentMember.guildId,
      guildName: currentMember.guildName,
      server: currentMember.server,
      playerId: currentMember.playerId,
      name: currentMember.name,
      oldContribution: oldContrib,
      newContribution: newContrib,
      difference: diff,
      hasContributed,
      isNewMember: isNew,
      statusReason
    };

    items.push(item);

    if (hasContributed) {
      contributedList.push(item);
    } else {
      uncontributedList.push(item);
    }

    const gSummary = guildSummaryMap.get(currentMember.guildId) || {
      guildId: currentMember.guildId,
      guildName: currentMember.guildName,
      total: 0,
      contributed: 0,
      uncontributed: 0,
      newMembers: 0,
      leftMembers: 0
    };
    gSummary.total += 1;
    if (isNew) {
      gSummary.newMembers += 1;
    }
    if (hasContributed) {
      gSummary.contributed += 1;
    } else {
      gSummary.uncontributed += 1;
    }
    guildSummaryMap.set(currentMember.guildId, gSummary);
  }

  // Detect members who left guild (in baseline but not in current live data)
  for (const oldMember of baselineDataset.members) {
    if (!currentMemberIds.has(oldMember.playerId)) {
      const leftItem: MemberComparisonItem = {
        guildId: oldMember.guildId,
        guildName: oldMember.guildName,
        server: oldMember.server,
        playerId: oldMember.playerId,
        name: oldMember.name,
        oldContribution: oldMember.weeklyContribution,
        newContribution: 0,
        difference: -oldMember.weeklyContribution,
        hasContributed: false,
        statusReason: 'MEMBER_KELUAR'
      };
      leftMembersList.push(leftItem);

      const gSummary = guildSummaryMap.get(oldMember.guildId);
      if (gSummary) {
        gSummary.leftMembers += 1;
      }
    }
  }

  const result: RecapComparisonResult = {
    comparedAt: new Date().toISOString(),
    baselineTime: baselineDataset.fetchedAt || 'Data Lama (Baseline)',
    totalMembers: items.length,
    contributedCount: contributedList.length,
    uncontributedCount: uncontributedList.length,
    newMembersCount,
    leftMembersCount: leftMembersList.length,
    items,
    uncontributedList,
    contributedList,
    leftMembersList,
    guildSummary: Array.from(guildSummaryMap.values())
  };

  try {
    localStorage.setItem(STORAGE_KEY_LAST_COMPARISON, JSON.stringify(result));
  } catch (err) {
    console.error('[RecapService] Failed saving last comparison result:', err);
  }

  return result;
}

/**
 * Get current time string & objects in WIB (Asia/Jakarta, UTC+7)
 */
export function getWibDateInfo(): { timeString: string; hours: number; minutes: number; dateKey: string } {
  try {
    const now = new Date();
    // Convert to Asia/Jakarta timezone
    const wibString = now.toLocaleString('en-US', { timeZone: 'Asia/Jakarta' });
    const wibDate = new Date(wibString);

    const hours = wibDate.getHours();
    const minutes = wibDate.getMinutes();
    const dateKey = `${wibDate.getFullYear()}-${String(wibDate.getMonth() + 1).padStart(2, '0')}-${String(wibDate.getDate()).padStart(2, '0')}`;

    const formattedTime = wibDate.toLocaleTimeString('id-ID', {
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    }) + ' WIB';

    return { timeString: formattedTime, hours, minutes, dateKey };
  } catch (e) {
    const now = new Date();
    return {
      timeString: now.toLocaleTimeString() + ' Local',
      hours: now.getHours(),
      minutes: now.getMinutes(),
      dateKey: now.toISOString().split('T')[0]
    };
  }
}

/**
 * Automatic Snapshot Check (runs in background interval):
 * Checks if current time is 11:58 WIB (or between 11:58 - 12:00 WIB).
 * Takes auto snapshot if not taken yet for today.
 */
export async function checkAndTriggerAutoSnapshot(): Promise<{ triggered: boolean; dataset?: BaselineDataset }> {
  const { hours, minutes, dateKey } = getWibDateInfo();
  const lastAutoDate = localStorage.getItem(STORAGE_KEY_AUTO_DATE);

  // Check if current time is 11:58 WIB or 11:59 WIB and hasn't run today
  if (hours === 11 && (minutes === 58 || minutes === 59) && lastAutoDate !== dateKey) {
    console.log(`[AutoSnapshot] 11:58 WIB detected! Triggering automatic baseline snapshot for ${dateKey}...`);
    const dataset = await fetchAllGuildMembersSnapshot(true);
    await saveBaselineSnapshot(dataset);
    localStorage.setItem(STORAGE_KEY_AUTO_DATE, dateKey);
    return { triggered: true, dataset };
  }

  return { triggered: false };
}

/**
 * Generate formatted text report for Discord / WhatsApp
 */
export function generateDiscordRecapText(result: RecapComparisonResult, targetGuildId?: number): string {
  let filteredUncontributed = result.uncontributedList;
  let title = 'REKAP ANGGOTA BELUM KONTRIBUSI (ALL GUILDS)';

  if (targetGuildId && targetGuildId > 0) {
    filteredUncontributed = result.uncontributedList.filter((m) => m.guildId === targetGuildId);
    const gName = filteredUncontributed[0]?.guildName || `Guild ID ${targetGuildId}`;
    title = `REKAP ANGGOTA BELUM KONTRIBUSI - ${gName.toUpperCase()}`;
  }

  const dateStr = new Date(result.comparedAt).toLocaleDateString('id-ID', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const { timeString } = getWibDateInfo();

  let text = `📋 **${title}**\n`;
  text += `📅 *Waktu Komparasi: ${dateStr} (${timeString})*\n`;
  text += `📊 *Baseline Snapshot: ${result.baselineTime ? new Date(result.baselineTime).toLocaleString('id-ID') : 'Data 11:58 WIB'}*\n`;
  text += `⚠️ *Total Belum Kontribusi: ${filteredUncontributed.length} Member*\n\n`;

  if (filteredUncontributed.length === 0) {
    text += `✅ **Luar biasa! Semua anggota telah menyelesaikan kontribusi mingguan.**\n`;
  } else {
    const grouped = new Map<string, MemberComparisonItem[]>();
    filteredUncontributed.forEach((m) => {
      const list = grouped.get(m.guildName) || [];
      list.push(m);
      grouped.set(m.guildName, list);
    });

    grouped.forEach((members, guildName) => {
      text += `🏛️ **${guildName}** (${members.length} member):\n`;
      members.forEach((m, idx) => {
        text += `${idx + 1}. **${m.name}** (UID: ${m.playerId}) - Baseline: ${m.oldContribution} | Current: ${m.newContribution} (Diff: ${m.difference})\n`;
      });
      text += `\n`;
    });
  }

  text += `— *Generated by Karuhun Alliance Admin System*`;
  return text;
}
