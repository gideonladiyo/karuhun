// Competitive Gameplay References Database & CRUD Services with Supabase Integration
import { supabase, isSupabaseConfigured } from '../services/supabaseClient';

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
    id: 'ref-1',
    category: 'guild_challenge',
    subcategory: 'Zone Boss',
    title: 'Guild Challenge - Zone Boss Reference Run',
    youtubeUrl: 'https://youtu.be/cVxAQcUtZn0?si=0lS_x0kz-jjrFgnU',
    videoId: 'cVxAQcUtZn0',
    thumbnailUrl: 'https://img.youtube.com/vi/cVxAQcUtZn0/hqdefault.jpg',
    description: '### Rotasi & Strategi Zone Boss\nReferensi rotasi dan strategi komprehensif untuk penyelesaian **Zone Boss** pada *Guild Challenge*.\n\n> **Catatan:** Pastikan timing ult disesuaikan dengan stun window.',
    tips: [
      'Perhatikan waktu swap character untuk menjaga kontinuitas burst DMG.',
      'Gunakan ultimate ability saat boss memasuki stun / vulnerability window.',
      'Pastikan matriks dodge di-trigger tepat sebelum serangan sweep area.'
    ],
    author: 'Karuhun Corps',
    dateAdded: '2026-07-29',
    isPublished: true
  },
  {
    id: 'ref-2',
    category: 'warzone',
    subcategory: 'Nihil',
    title: 'Warzone Nihil 12M+ Score Run',
    youtubeUrl: 'https://www.youtube.com/watch?v=L9D3wqtzZKQ',
    videoId: 'L9D3wqtzZKQ',
    thumbnailUrl: 'https://img.youtube.com/vi/L9D3wqtzZKQ/hqdefault.jpg',
    description: '## High Score Rotation\nHigh score rotation **12M+ poin** untuk Warzone Nihil weather.\n\n- Rotasi karakter tanpa jeda\n- Pemilihan orb yang presisi',
    tips: [
      'Manfaatkan bonus pasif Nihil weather untuk melipatgandakan akumulasi poin wave.',
      'Jaga ritme 3-ping orb agar tidak ada jeda animasi rotasi karakter utama.',
      'Gunakan CUB pet skill saat wave musuh spawn secara bersamaan.'
    ],
    author: 'Karuhun Corps',
    dateAdded: '2026-07-29',
    isPublished: true
  },
  {
    id: 'ref-3',
    category: 'ppc',
    subcategory: 'Intensive Battle',
    title: 'PPC Intensive Battle High Score Clear',
    youtubeUrl: 'https://www.youtube.com/watch?v=Y_Qn5-fj-Rw',
    videoId: 'Y_Qn5-fj-Rw',
    thumbnailUrl: 'https://img.youtube.com/vi/Y_Qn5-fj-Rw/hqdefault.jpg',
    description: '### High Score Clear Strategy\nPanduan dan strategi optimal menyelesaikan **PPC Intensive Battle mode** dengan waktu kill cepat.\n\n> Gunakan burst instan pembuka untuk menghindari invincible phase.',
    tips: [
      'Fokus pada dodge matrix pembuka di 0.5 detik pertama.',
      'Eksekusi burst DMG instan sebelum boss masuk ke invincible phase.',
      'Perhatikan pergerakan opener delay timer untuk sinkronisasi waktu kill.'
    ],
    author: 'Karuhun Corps',
    dateAdded: '2026-07-29',
    isPublished: true
  }
];

const STORAGE_KEY = 'karuhun_reffs_db_v1';

/**
 * Fetch references list (supports Supabase API or LocalStorage fallback)
 */
export function getStoredReferences(): ReferenceItem[] {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (err) {
    console.warn('Failed to load references from localStorage', err);
  }
  return INITIAL_PROTOTYPE_REFERENCES;
}

/**
 * Async fetch from Supabase if credentials are set, otherwise returns sync stored references
 */
export async function fetchLiveReferences(): Promise<ReferenceItem[]> {
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
        const mapped: ReferenceItem[] = data.map((item: any) => {
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

        // Sync to LocalStorage for offline cache
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(mapped));
        } catch (e) {}

        return mapped;
      }
    } catch (err) {
      console.warn('Supabase live fetch error, falling back to local cache', err);
    }
  }

  return getStoredReferences();
}

/**
 * Save / Update a reference item
 */
export function saveStoredReference(item: ReferenceItem): ReferenceItem[] {
  const current = getStoredReferences();
  const existingIdx = current.findIndex((r) => r.id === item.id);
  
  let updatedList: ReferenceItem[];
  if (existingIdx >= 0) {
    updatedList = [...current];
    updatedList[existingIdx] = { ...item };
  } else {
    updatedList = [item, ...current];
  }

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedList));
  } catch (err) {
    console.error('Failed to save reference', err);
  }
  return updatedList;
}

/**
 * Delete a reference item by ID
 */
export function deleteStoredReference(id: string): ReferenceItem[] {
  const current = getStoredReferences();
  const updatedList = current.filter((r) => r.id !== id);

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedList));
  } catch (err) {
    console.error('Failed to delete reference', err);
  }
  return updatedList;
}

/**
 * Toggle publication status (Published / Draft)
 */
export function toggleStoredReferencePublish(id: string): ReferenceItem[] {
  const current = getStoredReferences();
  const updatedList = current.map((r) => {
    if (r.id === id) {
      return { ...r, isPublished: !r.isPublished };
    }
    return r;
  });

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedList));
  } catch (err) {
    console.error('Failed to toggle publish status', err);
  }
  return updatedList;
}
