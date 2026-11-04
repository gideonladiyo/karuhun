// Competitive Gameplay References Database & CRUD Services with Supabase Integration
import { supabase, isSupabaseConfigured } from '@/services/supabase/client';
import { deleteReferenceThumbnail } from '@/services/supabase/storage';

export type VideoPlatform = 'youtube' | 'tiktok' | 'bilibili' | 'other';

export interface ReferenceItem {
  id: string;
  category: 'guild_challenge' | 'warzone' | 'ppc';
  subcategory: string;
  title: string;
  platform?: VideoPlatform;
  videoUrl: string;
  youtubeUrl?: string; // Kept for backward compatibility
  videoId: string;
  thumbnailUrl?: string;
  description: string;
  tips: string[];
  author?: string;
  dateAdded?: string;
  isPublished?: boolean; // Controls whether item is visible to normal users or draft
  viewsCount?: number | string;
  duration?: string;
}

export interface AdminReferenceItem extends ReferenceItem {
  ownerId: string | null;
  ownerName?: string | null;
  ownerEmail?: string | null;
  deletedAt?: string | null;
  deletedBy?: string | null;
}

export const CATEGORIES_CONFIG = {
  guild_challenge: {
    label: 'Guild Challenge',
    subcategories: ['Zone A', 'Zone Boss', 'Deadzone']
  },
  warzone: {
    label: 'Warzone',
    subcategories: [
      'Physical',
      'Fire',
      'Lightning',
      'Dark',
      'Ice',
      'Nihil',
      'True Slash',
      'Ignition',
      'Plasma',
      'Radiance',
      'Darkflow',
      'Glacio',
      'Disrupt'
    ]
  },
  ppc: {
    label: 'PPC (Phantom Pain Cage)',
    subcategories: ['Advanced', 'Ultimate', 'Intensive Battle']
  }
};

/**
 * Detect video platform from URL
 */
export function detectVideoPlatform(url: string): VideoPlatform {
  if (!url) return 'youtube';
  const clean = url.trim().toLowerCase();
  if (clean.includes('tiktok.com') || clean.includes('vt.tiktok.com') || clean.includes('vm.tiktok.com')) {
    return 'tiktok';
  }
  if (clean.includes('bilibili.com') || clean.includes('b23.tv')) {
    return 'bilibili';
  }
  if (clean.includes('youtube.com') || clean.includes('youtu.be')) {
    return 'youtube';
  }
  return 'youtube';
}

/**
 * Extract YouTube video ID
 */
export function extractYoutubeVideoId(url: string): string {
  const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=|shorts\/))([\w-]{11})/i);
  return match ? match[1] : '';
}

/**
 * Extract video ID across multiple platforms (YouTube, TikTok, Bilibili)
 */
export function extractVideoId(url: string, platform?: VideoPlatform): string {
  if (!url) return '';
  const plat = platform || detectVideoPlatform(url);

  if (plat === 'youtube') {
    return extractYoutubeVideoId(url);
  }

  if (plat === 'tiktok') {
    const matchVideo = url.match(/\/video\/(\d+)/i);
    if (matchVideo) return matchVideo[1];

    const matchShort = url.match(/(?:vm\.tiktok\.com|vt\.tiktok\.com|tiktok\.com\/t)\/([\w-]+)/i);
    if (matchShort) return matchShort[1];

    const matchNum = url.match(/(\d{15,22})/);
    if (matchNum) return matchNum[1];

    return '';
  }

  if (plat === 'bilibili') {
    const matchBv = url.match(/(BV[a-zA-Z0-9]+)/i);
    if (matchBv) return matchBv[1];

    const matchAv = url.match(/(av\d+)/i);
    if (matchAv) return matchAv[1];

    const matchB23 = url.match(/b23\.tv\/([\w]+)/i);
    if (matchB23) return matchB23[1];

    return '';
  }

  return url.trim();
}

/**
 * Generate embed player URL for iframe
 */
export function getVideoEmbedUrl(platform: VideoPlatform, videoId: string, fullUrl?: string): string {
  if (platform === 'youtube') {
    return `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&rel=0`;
  }
  if (platform === 'tiktok') {
    return `https://www.tiktok.com/embed/${videoId}`;
  }
  if (platform === 'bilibili') {
    if (videoId.toLowerCase().startsWith('bv')) {
      return `https://player.bilibili.com/player.html?bvid=${videoId}&autoplay=0&danmaku=0&high_quality=1`;
    }
    if (videoId.toLowerCase().startsWith('av')) {
      const aid = videoId.toLowerCase().replace('av', '');
      return `https://player.bilibili.com/player.html?aid=${aid}&autoplay=0&danmaku=0&high_quality=1`;
    }
    return `https://player.bilibili.com/player.html?bvid=${videoId}&autoplay=0&danmaku=0&high_quality=1`;
  }
  return fullUrl || '';
}

/**
 * Generate platform default or fallback thumbnail
 */
export function getPlatformThumbnail(platform: VideoPlatform, videoId: string, customThumbnail?: string): string {
  if (customThumbnail && customThumbnail.trim()) {
    return customThumbnail.trim();
  }
  if (platform === 'youtube' && videoId && videoId.length === 11) {
    return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
  }
  if (platform === 'tiktok') {
    return 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=800&auto=format&fit=crop';
  }
  if (platform === 'bilibili') {
    return 'https://images.unsplash.com/photo-1578632767115-351597cf2477?q=80&w=800&auto=format&fit=crop';
  }
  return '/logo.png';
}

export const INITIAL_PROTOTYPE_REFERENCES: ReferenceItem[] = [
  {
    id: '11111111-1111-4111-a111-111111111111',
    category: 'guild_challenge',
    subcategory: 'Zone Boss',
    title: 'Guild Challenge - Zone Boss Reference Run',
    platform: 'youtube',
    videoUrl: 'https://youtu.be/cVxAQcUtZn0?si=0lS_x0kz-jjrFgnU',
    youtubeUrl: 'https://youtu.be/cVxAQcUtZn0?si=0lS_x0kz-jjrFgnU',
    videoId: 'cVxAQcUtZn0',
    thumbnailUrl: 'https://img.youtube.com/vi/cVxAQcUtZn0/hqdefault.jpg',
    description: `### Rotation & Strategy Guide\nComprehensive reference run and team rotation strategy for clearing **Zone Boss** in *Guild Challenge*.\n\n> **Note:** Align ultimate ability timings with boss vulnerability windows.`,
    tips: [
      'Pay close attention to character swap timing to maintain burst DMG continuity.',
      'Trigger ultimate abilities during boss vulnerability / stun windows.',
      'Ensure dodge matrix is activated right before area sweeps.'
    ],
    author: 'Karuhun',
    dateAdded: '2026-07-29',
    isPublished: true
  },
  {
    id: '22222222-2222-4222-a222-222222222222',
    category: 'warzone',
    subcategory: 'Nihil',
    title: 'Warzone Nihil 12M+ Score Run',
    platform: 'youtube',
    videoUrl: 'https://www.youtube.com/watch?v=L9D3wqtzZKQ',
    youtubeUrl: 'https://www.youtube.com/watch?v=L9D3wqtzZKQ',
    videoId: 'L9D3wqtzZKQ',
    thumbnailUrl: 'https://img.youtube.com/vi/L9D3wqtzZKQ/hqdefault.jpg',
    description: `## High Score Rotation\nHigh score rotation **12M+ points** for Warzone Nihil weather.\n\n- Seamless character swap loop\n- Precise 3-ping orb management`,
    tips: [
      'Capitalize on Nihil passive weather bonuses to multiply wave points.',
      'Maintain 3-ping orb rhythm to minimize swap animation delay.',
      'Deploy CUB pet skills when multiple enemy waves spawn.'
    ],
    author: 'Karuhun',
    dateAdded: '2026-07-29',
    isPublished: true
  },
  {
    id: '33333333-3333-4333-a333-333333333333',
    category: 'ppc',
    subcategory: 'Intensive Battle',
    title: 'PPC Intensive Battle High Score Clear',
    platform: 'youtube',
    videoUrl: 'https://www.youtube.com/watch?v=Y_Qn5-fj-Rw',
    youtubeUrl: 'https://www.youtube.com/watch?v=Y_Qn5-fj-Rw',
    videoId: 'Y_Qn5-fj-Rw',
    thumbnailUrl: 'https://img.youtube.com/vi/Y_Qn5-fj-Rw/hqdefault.jpg',
    description: `### High Score Clear Strategy\nOptimal guide and strategy for clearing **PPC Intensive Battle mode** with fast kill timer.\n\n> Use opener burst to bypass invincible phase.`,
    tips: [
      'Focus on dodge matrix within the first 0.5s of the battle.',
      'Execute instant burst DMG before boss enters invulnerability phase.',
      'Watch opener delay timer for precise kill sync.'
    ],
    author: 'Karuhun',
    dateAdded: '2026-07-29',
    isPublished: true
  },
  {
    id: '44444444-4444-4444-a444-444444444444',
    category: 'warzone',
    subcategory: 'Lightning',
    title: 'TikTok Highlight: Lightning Warzone Burst Rotation',
    platform: 'tiktok',
    videoUrl: 'https://www.tiktok.com/@larkshinnn/video/7672787506282138896',
    youtubeUrl: 'https://www.tiktok.com/@larkshinnn/video/7672787506282138896',
    videoId: '7672787506282138896',
    thumbnailUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=800&auto=format&fit=crop',
    description: `### Fast TikTok Combat Showcase\nCompact high-speed rotation highlight demonstration for **Lightning Warzone**.\n\n- Frame-perfect 3-ping trigger\n- Instant QTE double-swap chain`,
    tips: [
      'Keep your thumb ready on the QTE portrait as soon as matrix slows time.',
      'Chain the ultimate ability immediately after orb discharge.',
      'Swap to sub-attacker right before main burst buff expires.'
    ],
    author: 'larkshinnn',
    dateAdded: '2026-08-16',
    isPublished: true
  },
  {
    id: '55555555-5555-5555-a555-555555555555',
    category: 'ppc',
    subcategory: 'Ultimate',
    title: 'Bilibili Dalao: Ultimate Hell Mode 0s Kill Guide',
    platform: 'bilibili',
    videoUrl: 'https://b23.tv/mD1GlAc',
    youtubeUrl: 'https://b23.tv/mD1GlAc',
    videoId: 'mD1GlAc',
    thumbnailUrl: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?q=80&w=800&auto=format&fit=crop',
    description: `### CN Dalao 0-Second Clear Theorycrafting\nElite speedrun strategy breakdown from Bilibili CN server for **PPC Ultimate Hell Mode**.\n\n> **Core Rule:** Execute zero-delay pre-buffing before entering the boss engagement radius.`,
    tips: [
      'Pre-cast assist skills right as the battle starts countdown.',
      'Stack memory resonance buffs before initiating the opening matrix strike.',
      'Maximize burst multiplier during the 3-second critical damage window.'
    ],
    author: 'CN Dalao',
    dateAdded: '2026-08-16',
    isPublished: true
  }
];

const STORAGE_KEY = 'karuhun_reffs_db_v2';
const LEGACY_DELETED_KEY = 'karuhun_reffs_deleted_ids_v2';

// One-time cleanup of legacy localStorage soft-delete hack
if (typeof window !== 'undefined') {
  try {
    localStorage.removeItem(LEGACY_DELETED_KEY);
  } catch {
    // ignore
  }
}

/**
 * Get locally cached reference items (offline/network error fallback only)
 */
export function getStoredReferences(): ReferenceItem[] {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed: ReferenceItem[] = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed.map((item) => {
          const rawUrl = item.videoUrl || item.youtubeUrl || '';
          const detectedPlat = item.platform || detectVideoPlatform(rawUrl);
          const resolvedVideoId = item.videoId || extractVideoId(rawUrl, detectedPlat);
          return {
            ...item,
            platform: detectedPlat,
            videoUrl: rawUrl,
            youtubeUrl: rawUrl,
            videoId: resolvedVideoId,
            thumbnailUrl: item.thumbnailUrl || getPlatformThumbnail(detectedPlat, resolvedVideoId)
          };
        });
      }
    }
  } catch (err) {
    console.error('Failed to load references from localStorage', err);
  }

  return INITIAL_PROTOTYPE_REFERENCES;
}

const REFFS_CACHE_TTL_MS = 3 * 60 * 1000;
let refsCache: { data: ReferenceItem[]; timestamp: number } | null = null;
let refsInFlightPromise: Promise<ReferenceItem[]> | null = null;

export function invalidateRefsCache() {
  refsCache = null;
}

function mapSupabaseRowToReference(item: any): ReferenceItem {
  const rawUrl = item.youtube_url || '';
  const detectedPlat = detectVideoPlatform(rawUrl);
  const resolvedVideoId = item.youtube_video_id || extractVideoId(rawUrl, detectedPlat);

  const tipsList = Array.isArray(item.reference_tips)
    ? item.reference_tips
        .sort((a: any, b: any) => (a.step_number || 0) - (b.step_number || 0))
        .map((t: any) => t.tip_content)
    : [];

  const subcategoryObj = item.subcategories;
  const category = (subcategoryObj?.category_id as 'guild_challenge' | 'warzone' | 'ppc') || 'warzone';
  const subcategory = subcategoryObj?.name || 'General';

  return {
    id: item.id,
    category,
    subcategory,
    title: item.title,
    platform: detectedPlat,
    videoUrl: rawUrl,
    youtubeUrl: rawUrl,
    videoId: resolvedVideoId,
    thumbnailUrl: item.thumbnail_url || getPlatformThumbnail(detectedPlat, resolvedVideoId),
    description: item.description || '',
    tips: tipsList,
    author: item.author_name || 'Karuhun Tactical',
    dateAdded: item.created_at ? item.created_at.split('T')[0] : 'Latest',
    isPublished: item.is_published !== false
  };
}

const PUBLIC_SELECT_COLUMNS = `
  id,
  title,
  youtube_url,
  youtube_video_id,
  thumbnail_url,
  description,
  author_name,
  is_published,
  created_at,
  subcategories (
    name,
    category_id
  ),
  reference_tips (
    step_number,
    tip_content
  )
`;

/**
 * Fetch live published references for public pages (/reffs & Home).
 * Never selects owner_id or uploader profile data.
 */
export async function fetchLiveReferences(): Promise<ReferenceItem[]> {
  if (refsCache && Date.now() - refsCache.timestamp < REFFS_CACHE_TTL_MS) {
    return refsCache.data;
  }

  if (refsInFlightPromise) {
    return refsInFlightPromise;
  }

  refsInFlightPromise = (async () => {
    try {
      if (isSupabaseConfigured() && supabase) {
        try {
          // Try filtering with deleted_at IS NULL first; fall back if migration hasn't added deleted_at yet
          let { data, error } = await supabase
            .from('video_references')
            .select(PUBLIC_SELECT_COLUMNS)
            .eq('is_published', true)
            .is('deleted_at', null)
            .order('created_at', { ascending: false });

          if (error) {
            const retry = await supabase
              .from('video_references')
              .select(PUBLIC_SELECT_COLUMNS)
              .eq('is_published', true)
              .order('created_at', { ascending: false });
            data = retry.data;
            error = retry.error;
          }

          if (!error && Array.isArray(data)) {
            const mapped = data.map(mapSupabaseRowToReference);
            try {
              localStorage.setItem(STORAGE_KEY, JSON.stringify(mapped));
            } catch {
              // ignore storage quota errors
            }
            refsCache = { data: mapped, timestamp: Date.now() };
            return mapped;
          }

          if (error) {
            console.warn('Supabase public fetch error, using local fallback:', error.message);
          }
        } catch (err) {
          console.warn('Supabase live fetch error, falling back to local cache', err);
        }
      }

      const fallbackData = getStoredReferences();
      refsCache = { data: fallbackData, timestamp: Date.now() };
      return fallbackData;
    } finally {
      refsInFlightPromise = null;
    }
  })();

  return refsInFlightPromise;
}

/**
 * Fetch active (non-deleted) references for Admin Roster.
 * Includes owner_id and optional owner profile display name (visible to superadmin).
 */
export async function fetchAdminReferences(): Promise<AdminReferenceItem[]> {
  if (!isSupabaseConfigured() || !supabase) {
    return getStoredReferences().map((r) => ({ ...r, ownerId: null }));
  }

  const adminSelectWithOwner = `
    id,
    title,
    youtube_url,
    youtube_video_id,
    thumbnail_url,
    description,
    author_name,
    is_published,
    owner_id,
    deleted_at,
    deleted_by,
    created_at,
    subcategories (
      name,
      category_id
    ),
    reference_tips (
      step_number,
      tip_content
    ),
    owner:profiles!video_references_owner_profile_fkey (
      display_name,
      email
    )
  `;

  let { data, error } = await supabase
    .from('video_references')
    .select(adminSelectWithOwner)
    .is('deleted_at', null)
    .order('created_at', { ascending: false });

  // Fallback if migration hasn't been executed yet (no owner_id / deleted_at / profiles FK)
  if (error) {
    const basicAdminSelect = `
      id,
      title,
      youtube_url,
      youtube_video_id,
      thumbnail_url,
      description,
      author_name,
      is_published,
      owner_id,
      deleted_at,
      created_at,
      subcategories (
        name,
        category_id
      ),
      reference_tips (
        step_number,
        tip_content
      )
    `;
    const retry = await supabase
      .from('video_references')
      .select(basicAdminSelect)
      .is('deleted_at', null)
      .order('created_at', { ascending: false });

    if (retry.error) {
      const legacyRetry = await supabase
        .from('video_references')
        .select(PUBLIC_SELECT_COLUMNS)
        .order('created_at', { ascending: false });
      data = legacyRetry.data as any;
    } else {
      data = retry.data as any;
    }
  }

  if (!Array.isArray(data)) return [];

  return data.map((row: any) => {
    const base = mapSupabaseRowToReference(row);
    const ownerObj = Array.isArray(row.owner) ? row.owner[0] : row.owner;
    return {
      ...base,
      ownerId: row.owner_id ?? null,
      ownerName: ownerObj?.display_name ?? null,
      ownerEmail: ownerObj?.email ?? null,
      deletedAt: row.deleted_at ?? null,
      deletedBy: row.deleted_by ?? null,
    };
  });
}

/**
 * Fetch soft-deleted references for Superadmin Trash view.
 */
export async function fetchTrashedReferences(): Promise<AdminReferenceItem[]> {
  if (!isSupabaseConfigured() || !supabase) return [];

  const trashSelect = `
    id,
    title,
    youtube_url,
    youtube_video_id,
    thumbnail_url,
    description,
    author_name,
    is_published,
    owner_id,
    deleted_at,
    deleted_by,
    created_at,
    subcategories (
      name,
      category_id
    ),
    reference_tips (
      step_number,
      tip_content
    ),
    owner:profiles!video_references_owner_profile_fkey (
      display_name,
      email
    )
  `;

  let { data, error } = await supabase
    .from('video_references')
    .select(trashSelect)
    .not('deleted_at', 'is', null)
    .order('deleted_at', { ascending: false });

  if (error) {
    const fallback = await supabase
      .from('video_references')
      .select(`
        id, title, youtube_url, youtube_video_id, thumbnail_url,
        description, author_name, is_published, owner_id, deleted_at, deleted_by, created_at,
        subcategories ( name, category_id ),
        reference_tips ( step_number, tip_content )
      `)
      .not('deleted_at', 'is', null)
      .order('deleted_at', { ascending: false });
    data = fallback.data as any;
  }

  if (!Array.isArray(data)) return [];

  return data.map((row: any) => {
    const base = mapSupabaseRowToReference(row);
    const ownerObj = Array.isArray(row.owner) ? row.owner[0] : row.owner;
    return {
      ...base,
      ownerId: row.owner_id ?? null,
      ownerName: ownerObj?.display_name ?? null,
      ownerEmail: ownerObj?.email ?? null,
      deletedAt: row.deleted_at ?? null,
      deletedBy: row.deleted_by ?? null,
    };
  });
}

/**
 * Helper to resolve or create a subcategory in Supabase
 */
async function getOrCreateSubcategoryId(category: string, subcategory: string): Promise<string | null> {
  if (!isSupabaseConfigured() || !supabase) return null;
  try {
    const { data: existing } = await supabase
      .from('subcategories')
      .select('id')
      .eq('category_id', category)
      .eq('name', subcategory)
      .maybeSingle();

    if (existing && existing.id) {
      return existing.id;
    }

    const { data: created, error } = await supabase
      .from('subcategories')
      .insert({
        category_id: category,
        name: subcategory
      })
      .select('id')
      .single();

    if (!error && created && created.id) {
      return created.id;
    }
  } catch (err) {
    console.warn('Subcategory lookup/creation failed in Supabase:', err);
  }
  return null;
}

export interface MutationResult {
  success: boolean;
  error?: string;
}

async function syncReferenceTips(referenceId: string, tips: string[]): Promise<string | undefined> {
  if (!supabase) return undefined;
  const cleanTips = tips.map((t) => t.trim()).filter(Boolean);

  const { error: delError } = await supabase
    .from('reference_tips')
    .delete()
    .eq('reference_id', referenceId);

  if (delError) {
    return `Gagal memperbarui tips: ${delError.message}`;
  }

  if (cleanTips.length > 0) {
    const tipsPayload = cleanTips.map((t, idx) => ({
      reference_id: referenceId,
      step_number: idx + 1,
      tip_content: t,
    }));
    const { error: insError } = await supabase.from('reference_tips').insert(tipsPayload);
    if (insError) {
      return `Gagal menyimpan tips: ${insError.message}`;
    }
  }

  return undefined;
}

/**
 * Create a new reference item in Supabase (owner_id = current authenticated user).
 */
export async function createReference(
  item: ReferenceItem,
  ownerId: string
): Promise<MutationResult> {
  if (!isSupabaseConfigured() || !supabase) {
    return { success: false, error: 'Supabase belum dikonfigurasi.' };
  }

  try {
    const subcategoryId = await getOrCreateSubcategoryId(item.category, item.subcategory);
    const payload: Record<string, unknown> = {
      id: item.id,
      title: item.title.trim(),
      youtube_url: item.videoUrl.trim(),
      youtube_video_id: item.videoId,
      thumbnail_url: item.thumbnailUrl,
      description: item.description,
      author_name: (item.author || '').trim(),
      is_published: item.isPublished !== false,
      owner_id: ownerId,
    };

    if (subcategoryId) {
      payload.subcategory_id = subcategoryId;
    }

    const { error } = await supabase.from('video_references').insert(payload);

    if (error) {
      return { success: false, error: error.message };
    }

    const tipsError = await syncReferenceTips(item.id, item.tips || []);
    invalidateRefsCache();

    if (tipsError) {
      return { success: false, error: tipsError };
    }

    return { success: true };
  } catch (err: any) {
    return { success: false, error: err?.message || 'Gagal menyimpan referensi.' };
  }
}

/**
 * Update an existing reference item in Supabase.
 * Enforces via `.select('id')` that RLS actually allowed the row update.
 */
export async function updateReference(item: ReferenceItem): Promise<MutationResult> {
  if (!isSupabaseConfigured() || !supabase) {
    return { success: false, error: 'Supabase belum dikonfigurasi.' };
  }

  try {
    const subcategoryId = await getOrCreateSubcategoryId(item.category, item.subcategory);
    const payload: Record<string, unknown> = {
      title: item.title.trim(),
      youtube_url: item.videoUrl.trim(),
      youtube_video_id: item.videoId,
      thumbnail_url: item.thumbnailUrl,
      description: item.description,
      author_name: (item.author || '').trim(),
      is_published: item.isPublished !== false,
    };

    if (subcategoryId) {
      payload.subcategory_id = subcategoryId;
    }

    const { data, error } = await supabase
      .from('video_references')
      .update(payload)
      .eq('id', item.id)
      .select('id');

    if (error) {
      return { success: false, error: error.message };
    }

    if (!data || data.length === 0) {
      return {
        success: false,
        error: 'Anda tidak memiliki izin untuk mengubah referensi ini.',
      };
    }

    const tipsError = await syncReferenceTips(item.id, item.tips || []);
    invalidateRefsCache();

    if (tipsError) {
      return { success: false, error: tipsError };
    }

    return { success: true };
  } catch (err: any) {
    return { success: false, error: err?.message || 'Gagal memperbarui referensi.' };
  }
}

/**
 * Toggle publication status (Published / Draft) in Supabase live DB
 */
export async function toggleReferencePublish(
  id: string,
  nextPublished: boolean
): Promise<MutationResult> {
  if (!isSupabaseConfigured() || !supabase) {
    return { success: false, error: 'Supabase belum dikonfigurasi.' };
  }

  try {
    const { data, error } = await supabase
      .from('video_references')
      .update({ is_published: nextPublished })
      .eq('id', id)
      .select('id');

    if (error) return { success: false, error: error.message };
    if (!data || data.length === 0) {
      return { success: false, error: 'Anda tidak memiliki izin untuk mengubah status referensi ini.' };
    }

    invalidateRefsCache();
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err?.message || 'Gagal mengubah status referensi.' };
  }
}

/**
 * Soft-delete a reference item (sets deleted_at and deleted_by).
 * Does NOT delete the thumbnail or tips so superadmin can restore it.
 */
export async function softDeleteReference(
  id: string,
  userId: string
): Promise<MutationResult> {
  if (!isSupabaseConfigured() || !supabase) {
    return { success: false, error: 'Supabase belum dikonfigurasi.' };
  }

  try {
    const { data, error } = await supabase
      .from('video_references')
      .update({
        deleted_at: new Date().toISOString(),
        deleted_by: userId,
      })
      .eq('id', id)
      .select('id');

    if (error) return { success: false, error: error.message };
    if (!data || data.length === 0) {
      return { success: false, error: 'Anda tidak memiliki izin untuk menghapus referensi ini.' };
    }

    invalidateRefsCache();
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err?.message || 'Gagal memindahkan referensi ke Trash.' };
  }
}

/**
 * Restore a soft-deleted reference from Trash (superadmin only).
 */
export async function restoreReference(id: string): Promise<MutationResult> {
  if (!isSupabaseConfigured() || !supabase) {
    return { success: false, error: 'Supabase belum dikonfigurasi.' };
  }

  try {
    const { data, error } = await supabase
      .from('video_references')
      .update({
        deleted_at: null,
        deleted_by: null,
      })
      .eq('id', id)
      .select('id');

    if (error) return { success: false, error: error.message };
    if (!data || data.length === 0) {
      return { success: false, error: 'Gagal memulihkan referensi. Pastikan akun Anda Superadmin.' };
    }

    invalidateRefsCache();
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err?.message || 'Gagal memulihkan referensi.' };
  }
}

/**
 * Permanently delete a reference item from DB and remove its custom thumbnail from Storage (superadmin only).
 */
export async function purgeReference(
  id: string,
  thumbnailUrl?: string
): Promise<MutationResult> {
  if (!isSupabaseConfigured() || !supabase) {
    return { success: false, error: 'Supabase belum dikonfigurasi.' };
  }

  try {
    let thumbToDelete = thumbnailUrl;
    if (!thumbToDelete) {
      const { data: existingRow } = await supabase
        .from('video_references')
        .select('thumbnail_url')
        .eq('id', id)
        .maybeSingle();
      thumbToDelete = existingRow?.thumbnail_url;
    }

    const { data, error } = await supabase
      .from('video_references')
      .delete()
      .eq('id', id)
      .select('id');

    if (error) return { success: false, error: error.message };
    if (!data || data.length === 0) {
      return { success: false, error: 'Hanya Superadmin yang dapat menghapus permanen.' };
    }

    if (thumbToDelete) {
      await deleteReferenceThumbnail(thumbToDelete);
    }

    invalidateRefsCache();
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err?.message || 'Gagal menghapus referensi secara permanen.' };
  }
}
