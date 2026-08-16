// Competitive Gameplay References Database & CRUD Services with Supabase Integration
import { supabase, isSupabaseConfigured } from '@/services/supabase/client';

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
    // 1. Desktop format: https://www.tiktok.com/@user/video/7672787506282138896
    const matchVideo = url.match(/\/video\/(\d+)/i);
    if (matchVideo) return matchVideo[1];

    // 2. Shortlinks: https://vm.tiktok.com/ZM... or https://vt.tiktok.com/...
    const matchShort = url.match(/(?:vm\.tiktok\.com|vt\.tiktok\.com|tiktok\.com\/t)\/([\w-]+)/i);
    if (matchShort) return matchShort[1];

    // 3. Any numeric 15-22 digits
    const matchNum = url.match(/(\d{15,22})/);
    if (matchNum) return matchNum[1];

    return url.trim();
  }

  if (plat === 'bilibili') {
    // 1. BV id: https://www.bilibili.com/video/BV1xx411c7mD
    const matchBv = url.match(/(BV[a-zA-Z0-9]+)/i);
    if (matchBv) return matchBv[1];

    // 2. AV id: https://www.bilibili.com/video/av170001
    const matchAv = url.match(/(av\d+)/i);
    if (matchAv) return matchAv[1];

    // 3. Shortlink: https://b23.tv/mD1GlAc
    const matchB23 = url.match(/b23\.tv\/([\w]+)/i);
    if (matchB23) return matchB23[1];

    return url.trim();
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
  // TikTok & Bilibili fallback posters
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
const STORAGE_DELETED_KEY = 'karuhun_reffs_deleted_ids_v2';

export function getDeletedIds(): string[] {
  try {
    const saved = localStorage.getItem(STORAGE_DELETED_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (err) {}
  return [];
}

export function addDeletedId(id: string) {
  try {
    const current = getDeletedIds();
    if (!current.includes(id)) {
      current.push(id);
      localStorage.setItem(STORAGE_DELETED_KEY, JSON.stringify(current));
    }
  } catch (err) {}
}

/**
 * Get locally stored reference items with automatic migration
 */
export function getStoredReferences(): ReferenceItem[] {
  const deletedIds = getDeletedIds();
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed: ReferenceItem[] = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed
          .filter((item) => !deletedIds.includes(item.id))
          .map((item) => {
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

  // Fallback to initial prototype items
  return INITIAL_PROTOTYPE_REFERENCES.filter((item) => !deletedIds.includes(item.id));
}

/**
 * Fetch live references from Supabase DB, fallback to local storage
 */
export async function fetchLiveReferences(): Promise<ReferenceItem[]> {
  const localItems = getStoredReferences();
  const deletedIds = getDeletedIds();

  if (isSupabaseConfigured() && supabase) {
    try {
      const { data, error } = await supabase
        .from('video_references')
        .select(`
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
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.warn('Supabase fetch error, using local fallback:', error.message);
      } else if (data && data.length > 0) {
        const supabaseMapped: ReferenceItem[] = data.map((item: any) => {
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
            author: item.author_name || 'Karuhun Corps',
            dateAdded: item.created_at ? item.created_at.split('T')[0] : 'Latest',
            isPublished: item.is_published !== false
          };
        });

        const filteredSupabase = supabaseMapped.filter((item) => !deletedIds.includes(item.id));

        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(filteredSupabase));
        } catch (e) {}

        return filteredSupabase;
      }
    } catch (err) {
      console.warn('Supabase live fetch error, falling back to local cache', err);
    }
  }

  return localItems.filter((item) => !deletedIds.includes(item.id));
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

export interface SaveResult {
  success: boolean;
  error?: string;
  list: ReferenceItem[];
}

/**
 * Save / Update a reference item (Syncs directly to Supabase DB + LocalStorage fallback)
 */
export async function saveStoredReference(item: ReferenceItem): Promise<SaveResult> {
  const isValidUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(item.id);
  const targetId = isValidUuid
    ? item.id
    : (typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `00000000-0000-4000-a000-${Date.now().toString().padStart(12, '0')}`);
  
  const rawUrl = item.videoUrl || item.youtubeUrl || '';
  const detectedPlat = item.platform || detectVideoPlatform(rawUrl);
  const resolvedVideoId = item.videoId || extractVideoId(rawUrl, detectedPlat);

  const updatedItem: ReferenceItem = {
    ...item,
    id: targetId,
    platform: detectedPlat,
    videoUrl: rawUrl,
    youtubeUrl: rawUrl,
    videoId: resolvedVideoId,
    thumbnailUrl: item.thumbnailUrl || getPlatformThumbnail(detectedPlat, resolvedVideoId)
  };

  const current = getStoredReferences();
  const existingIdx = current.findIndex((r) => r.id === updatedItem.id || r.id === item.id);
  
  let updatedList: ReferenceItem[];
  if (existingIdx >= 0) {
    updatedList = [...current];
    updatedList[existingIdx] = { ...updatedItem };
  } else {
    updatedList = [updatedItem, ...current];
  }

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedList));
  } catch (err) {
    console.error('Failed to save reference to localStorage', err);
  }

  let supabaseErrorMessage: string | undefined = undefined;

  // Direct Supabase DB Save
  if (isSupabaseConfigured() && supabase) {
    try {
      const subcategoryId = await getOrCreateSubcategoryId(updatedItem.category, updatedItem.subcategory);

      const payload: any = {
        id: updatedItem.id,
        title: updatedItem.title,
        youtube_url: updatedItem.videoUrl,
        youtube_video_id: updatedItem.videoId,
        thumbnail_url: updatedItem.thumbnailUrl,
        description: updatedItem.description,
        author_name: updatedItem.author || 'Karuhun Corps',
        is_published: updatedItem.isPublished !== false
      };

      if (subcategoryId) {
        payload.subcategory_id = subcategoryId;
      }

      const { error } = await supabase
        .from('video_references')
        .upsert(payload);

      if (error) {
        console.error('[Supabase Error] Direct video_references upsert failed:', error);
        supabaseErrorMessage = `Supabase Error [Code: ${error.code || 'UNKNOWN'}]: ${error.message}`;
      } else {
        if (updatedItem.tips && updatedItem.tips.length > 0) {
          await supabase.from('reference_tips').delete().eq('reference_id', updatedItem.id);
          const tipsPayload = updatedItem.tips.map((t, idx) => ({
            reference_id: updatedItem.id,
            step_number: idx + 1,
            tip_content: t
          }));
          await supabase.from('reference_tips').insert(tipsPayload);
        }
      }
    } catch (err: any) {
      console.error('[Supabase Exception] Failed to save directly to Supabase:', err);
      supabaseErrorMessage = `Supabase Exception: ${err?.message || String(err)}`;
    }
  }

  return {
    success: !supabaseErrorMessage,
    error: supabaseErrorMessage,
    list: updatedList
  };
}

/**
 * Delete a reference item by ID
 */
export async function deleteStoredReference(id: string): Promise<ReferenceItem[]> {
  addDeletedId(id);
  const current = getStoredReferences();
  const updatedList = current.filter((r) => r.id !== id);

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedList));
  } catch (err) {
    console.error('Failed to delete reference from localStorage', err);
  }

  if (isSupabaseConfigured() && supabase) {
    try {
      await supabase.from('video_references').delete().eq('id', id);
    } catch (err) {
      console.warn('Failed to sync delete to Supabase', err);
    }
  }

  return updatedList;
}

/**
 * Toggle publication status (Published / Draft) in Supabase live DB + LocalStorage
 */
export async function toggleStoredReferencePublish(id: string, explicitStatus?: boolean): Promise<ReferenceItem[]> {
  const current = getStoredReferences();
  const targetItem = current.find((r) => r.id === id);
  const targetNewStatus = explicitStatus !== undefined ? explicitStatus : targetItem ? (targetItem.isPublished === false ? true : false) : false;

  if (isSupabaseConfigured() && supabase) {
    try {
      await supabase
        .from('video_references')
        .update({ is_published: targetNewStatus })
        .eq('id', id);
    } catch (err) {
      console.warn('Failed to sync toggle publish to Supabase', err);
    }
  }

  const updatedList = current.map((r) => {
    if (r.id === id) {
      return { ...r, isPublished: targetNewStatus };
    }
    return r;
  });

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedList));
  } catch (err) {
    console.error('Failed to update localStorage after toggle publish', err);
  }

  return updatedList;
}
