import { supabase, isSupabaseConfigured } from '@/services/supabase/client';
import type { MutationResult } from '@/data/static/reffsData';

/**
 * Weekly featured references.
 *
 * A featured week runs from Monday 12:00 WIB (UTC+7) to the next Monday 12:00 WIB,
 * the same for every mode. Rows are keyed by `week_start` (the Monday's date, YYYY-MM-DD),
 * so last week's picks stop showing automatically once the reset passes.
 */

const WIB_OFFSET_MS = 7 * 60 * 60 * 1000;
const RESET_HOUR_WIB = 12;
const DAY_MS = 24 * 60 * 60 * 1000;
const WEEK_MS = 7 * DAY_MS;

/** Monday (YYYY-MM-DD, WIB calendar) of the featured week that contains `at`, shifted by `offsetWeeks`. */
export function getFeaturedWeekStart(at: Date = new Date(), offsetWeeks = 0): string {
  // Shift into WIB, then back by the reset hour so Monday 11:59 WIB still counts as last week.
  const shifted = new Date(at.getTime() + WIB_OFFSET_MS - RESET_HOUR_WIB * 60 * 60 * 1000);
  const daysSinceMonday = (shifted.getUTCDay() + 6) % 7;
  const monday = new Date(
    Date.UTC(shifted.getUTCFullYear(), shifted.getUTCMonth(), shifted.getUTCDate() - daysSinceMonday)
  );
  return new Date(monday.getTime() + offsetWeeks * WEEK_MS).toISOString().slice(0, 10);
}

/** Exact instants a featured week starts and ends. */
export function getFeaturedWeekRange(weekStart: string): { start: Date; end: Date } {
  const start = new Date(`${weekStart}T${String(RESET_HOUR_WIB).padStart(2, '0')}:00:00+07:00`);
  return { start, end: new Date(start.getTime() + WEEK_MS) };
}

/** Shift a week_start string by whole weeks. */
export function shiftFeaturedWeek(weekStart: string, weeks: number): string {
  const base = new Date(`${weekStart}T00:00:00Z`);
  return new Date(base.getTime() + weeks * WEEK_MS).toISOString().slice(0, 10);
}

/** "3d 4h", "5h 12m", "8m" — time left until `end`. */
export function formatTimeLeft(end: Date, now: Date = new Date()): string {
  const ms = Math.max(0, end.getTime() - now.getTime());
  const days = Math.floor(ms / DAY_MS);
  const hours = Math.floor((ms % DAY_MS) / (60 * 60 * 1000));
  const minutes = Math.floor((ms % (60 * 60 * 1000)) / (60 * 1000));
  if (days > 0) return `${days}d ${hours}h`;
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${Math.max(1, minutes)}m`;
}

const CACHE_TTL_MS = 3 * 60 * 1000;
const cache = new Map<string, { ids: string[]; timestamp: number }>();
const inFlight = new Map<string, Promise<string[]>>();

export function invalidateFeaturedCache() {
  cache.clear();
}

export interface FeaturedFetchResult {
  ids: string[];
  error?: string;
}

async function queryFeaturedIds(weekStart: string): Promise<FeaturedFetchResult> {
  if (!isSupabaseConfigured() || !supabase) return { ids: [] };

  // Ordered by position (smallest first); ties fall back to the order they were added.
  const { data, error } = await supabase
    .from('featured_references')
    .select('reference_id')
    .eq('week_start', weekStart)
    .order('position', { ascending: true })
    .order('created_at', { ascending: true });

  if (error) return { ids: [], error: error.message };
  return { ids: (data ?? []).map((row: { reference_id: string }) => row.reference_id) };
}

/** Reference IDs featured for a week (public pages). Errors resolve to an empty list. */
export async function fetchFeaturedIds(weekStart: string): Promise<string[]> {
  const cached = cache.get(weekStart);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) return cached.ids;

  const pending = inFlight.get(weekStart);
  if (pending) return pending;

  const request = queryFeaturedIds(weekStart)
    .then(({ ids, error }) => {
      if (error) console.warn('Featured references unavailable:', error);
      cache.set(weekStart, { ids, timestamp: Date.now() });
      return ids;
    })
    .catch((err) => {
      console.warn('Featured references fetch failed:', err);
      return [] as string[];
    })
    .finally(() => inFlight.delete(weekStart));

  inFlight.set(weekStart, request);
  return request;
}

/** Uncached fetch for the admin panel; surfaces errors (e.g. migration not applied yet). */
export async function fetchFeaturedIdsForAdmin(weekStart: string): Promise<FeaturedFetchResult> {
  try {
    return await queryFeaturedIds(weekStart);
  } catch (err: any) {
    return { ids: [], error: err?.message || 'Gagal memuat featured.' };
  }
}

/**
 * Put `nextId` into a slot for the week. When `previousId` is given, that slot's row is
 * re-pointed to `nextId` so it keeps its position; otherwise a new slot is appended at `position`.
 */
export async function setFeaturedSlot(
  weekStart: string,
  nextId: string,
  previousId?: string | null,
  position = 0
): Promise<MutationResult> {
  if (!isSupabaseConfigured() || !supabase) {
    return { success: false, error: 'Supabase belum dikonfigurasi.' };
  }

  if (previousId && previousId !== nextId) {
    const { data, error } = await supabase
      .from('featured_references')
      .update({ reference_id: nextId })
      .eq('week_start', weekStart)
      .eq('reference_id', previousId)
      .select('reference_id');

    invalidateFeaturedCache();
    if (error) return { success: false, error: error.message };
    if (!data || data.length === 0) {
      return { success: false, error: 'Slot tidak ditemukan atau tidak diizinkan (cek izin superadmin).' };
    }
    return { success: true };
  }

  const { error } = await supabase
    .from('featured_references')
    .upsert({ week_start: weekStart, reference_id: nextId, position }, { onConflict: 'week_start,reference_id' });

  invalidateFeaturedCache();
  return error ? { success: false, error: error.message } : { success: true };
}

/** Save display order: `orderedIds[0]` gets position 0 (top / spotlight), and so on. */
export async function reorderFeatured(weekStart: string, orderedIds: string[]): Promise<MutationResult> {
  if (!isSupabaseConfigured() || !supabase) {
    return { success: false, error: 'Supabase belum dikonfigurasi.' };
  }

  const results = await Promise.all(
    orderedIds.map((id, position) =>
      supabase!
        .from('featured_references')
        .update({ position })
        .eq('week_start', weekStart)
        .eq('reference_id', id)
    )
  );

  invalidateFeaturedCache();
  const failed = results.find((r) => r.error);
  return failed?.error ? { success: false, error: failed.error.message } : { success: true };
}

export async function removeFeatured(weekStart: string, referenceId: string): Promise<MutationResult> {
  if (!isSupabaseConfigured() || !supabase) {
    return { success: false, error: 'Supabase belum dikonfigurasi.' };
  }

  const { data, error } = await supabase
    .from('featured_references')
    .delete()
    .eq('week_start', weekStart)
    .eq('reference_id', referenceId)
    .select('reference_id');

  invalidateFeaturedCache();
  if (error) return { success: false, error: error.message };
  if (!data || data.length === 0) {
    return { success: false, error: 'Tidak ada baris yang terhapus (cek izin superadmin).' };
  }
  return { success: true };
}
