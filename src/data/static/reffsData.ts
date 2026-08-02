// Competitive Gameplay References Database & CRUD Services with Supabase Integration
import { supabase, isSupabaseConfigured } from '@/services/supabase/client';

export interface ReferenceItem {
  id: string;
  category: 'guild_challenge' | 'warzone' | 'ppc';
  subcategory: string;
  title: string;
  youtubeUrl: string;
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

export function extractYoutubeVideoId(url: string): string {
  const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/);
  return match ? match[1] : '';
}

export const INITIAL_PROTOTYPE_REFERENCES: ReferenceItem[] = [
  {
    id: '11111111-1111-4111-a111-111111111111',
    category: 'guild_challenge',
    subcategory: 'Zone Boss',
    title: 'Guild Challenge - Zone Boss Reference Run',
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
  }
];

const STORAGE_KEY = 'karuhun_reffs_db_v1';
const STORAGE_DELETED_KEY = 'karuhun_reffs_deleted_ids_v1';

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
      const updated = [...current, id];
      localStorage.setItem(STORAGE_DELETED_KEY, JSON.stringify(updated));
    }
  } catch (err) {}
}

/**
 * Fetch references list from LocalStorage fallback
 */
export function getStoredReferences(): ReferenceItem[] {
  const deletedIds = getDeletedIds();
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved !== null) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed)) {
        return parsed.filter((r: ReferenceItem) => !deletedIds.includes(r.id));
      }
    }
  } catch (err) {
    console.warn('Failed to load references from localStorage', err);
  }
  return INITIAL_PROTOTYPE_REFERENCES.filter((r) => !deletedIds.includes(r.id));
}

/**
 * Async fetch from Supabase if configured, falling back to LocalStorage
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

      if (!error && data) {
        const supabaseMapped: ReferenceItem[] = data.map((item: any) => {
          const sortedTips = (item.reference_tips || [])
            .sort((a: any, b: any) => a.step_number - b.step_number)
            .map((t: any) => t.tip_content);

          return {
            id: item.id,
            category: item.subcategories?.category_id || 'guild_challenge',
            subcategory: item.subcategories?.name || 'Zone Boss',
            title: item.title,
            youtubeUrl: item.youtube_url,
            videoId: item.youtube_video_id,
            thumbnailUrl: item.thumbnail_url,
            description: item.description,
            tips: sortedTips,
            author: item.author_name || 'Karuhun Corps',
            dateAdded: item.created_at ? item.created_at.split('T')[0] : 'Latest',
            isPublished: item.is_published !== false
          };
        });

        // Filter out deleted items from Supabase mapped results
        const filteredSupabase = supabaseMapped.filter((item) => !deletedIds.includes(item.id));

        // Update local cache with live Supabase data
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
  
  const updatedItem: ReferenceItem = {
    ...item,
    id: targetId
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
        youtube_url: updatedItem.youtubeUrl,
        youtube_video_id: updatedItem.videoId,
        thumbnail_url: updatedItem.thumbnailUrl,
        description: updatedItem.description,
        author_name: updatedItem.author || 'Karuhun Corps',
        is_published: updatedItem.isPublished !== false
      };

      if (subcategoryId) {
        payload.subcategory_id = subcategoryId;
      }

      console.log('[Supabase Debug] Sending payload to video_references table:', payload);

      const { error } = await supabase
        .from('video_references')
        .upsert(payload);

      if (error) {
        console.error('[Supabase Error] Direct video_references upsert failed:', error);
        supabaseErrorMessage = `Supabase Error [Code: ${error.code || 'UNKNOWN'}]: ${error.message}${error.details ? ` | Details: ${error.details}` : ''}${error.hint ? ` | Hint: ${error.hint}` : ''}`;
      } else {
        console.log(`[Supabase Success] DIRECTLY SAVED to Supabase DB! ID: ${updatedItem.id}`);

        // Sync Tips to reference_tips table
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
  } else {
    supabaseErrorMessage = 'Supabase client is not configured or VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY environment variables are missing!';
  }

  return {
    success: !supabaseErrorMessage,
    error: supabaseErrorMessage,
    list: updatedList
  };
}

/**
 * Delete a reference item by ID (Syncs directly to Supabase DB + LocalStorage fallback)
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

  // Live Supabase Sync
  if (isSupabaseConfigured() && supabase) {
    try {
      const { error } = await supabase
        .from('video_references')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('[Supabase Error] Delete reference failed:', error);
      } else {
        console.log(`[Supabase Success] DIRECTLY DELETED from Supabase DB! ID: ${id}`);
      }
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

  // Live Supabase Sync
  if (isSupabaseConfigured() && supabase) {
    try {
      const { error } = await supabase
        .from('video_references')
        .update({ is_published: targetNewStatus })
        .eq('id', id);

      if (error) {
        console.error('[Supabase Error] Toggle is_published failed:', error);
      } else {
        console.log(`[Supabase Success] Updated is_published for ${id} to ${targetNewStatus}`);
      }
    } catch (err) {
      console.warn('Failed to sync toggle publish to Supabase', err);
    }
  }

  // Update local list
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

