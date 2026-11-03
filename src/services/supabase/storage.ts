import { supabase, isSupabaseConfigured } from './client';

export const THUMBNAIL_BUCKET = 'reference-thumbnails';
export const MAX_THUMB_BYTES = 2 * 1024 * 1024; // 2 MB
export const ALLOWED_THUMB_TYPES = ['image/jpeg', 'image/png', 'image/webp'] as const;
export const ALLOWED_THUMB_EXTENSIONS = ['jpg', 'jpeg', 'png', 'webp'] as const;

export interface ThumbnailValidationResult {
  valid: boolean;
  error?: string;
}

/**
 * Validate a thumbnail File against format (JPG, JPEG, PNG) and max size (2 MB).
 */
export function validateThumbnail(file: File): ThumbnailValidationResult {
  const nameParts = file.name.split('.');
  const ext = nameParts.length > 1 ? nameParts[nameParts.length - 1].toLowerCase() : '';

  const hasValidExt = (ALLOWED_THUMB_EXTENSIONS as readonly string[]).includes(ext);
  const hasValidMime =
    file.type === ''
      ? hasValidExt
      : (ALLOWED_THUMB_TYPES as readonly string[]).includes(file.type.toLowerCase());

  if (!hasValidExt || !hasValidMime) {
    return {
      valid: false,
      error: 'Format not supported. Use JPG, JPEG, PNG or WebP.',
    };
  }

  if (file.size > MAX_THUMB_BYTES) {
    const sizeMb = (file.size / (1024 * 1024)).toFixed(1);
    return {
      valid: false,
      error: `File is ${sizeMb} MB. Maximum is 2 MB.`,
    };
  }

  return { valid: true };
}

/**
 * Check whether a URL points to an object inside our Supabase `reference-thumbnails` bucket,
 * and return its storage object path if so.
 */
export function extractBucketObjectPath(url?: string): string | null {
  if (!url) return null;
  const marker = `/storage/v1/object/public/${THUMBNAIL_BUCKET}/`;
  const idx = url.indexOf(marker);
  if (idx === -1) return null;
  const rawPath = url.slice(idx + marker.length).split('?')[0];
  return rawPath ? decodeURIComponent(rawPath) : null;
}

/**
 * Upload a validated thumbnail image to the `reference-thumbnails` bucket
 * and return its public URL.
 */
export async function uploadReferenceThumbnail(file: File, refId: string): Promise<string> {
  if (!isSupabaseConfigured() || !supabase) {
    throw new Error('Supabase is not configured. Check VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.');
  }

  const validation = validateThumbnail(file);
  if (!validation.valid) {
    throw new Error(validation.error || 'Invalid thumbnail file.');
  }

  const ext = (file.name.split('.').pop() || 'jpg').toLowerCase();
  const safeExt = ext === 'png' ? 'png' : ext === 'webp' ? 'webp' : ext === 'jpeg' ? 'jpeg' : 'jpg';
  const contentType = safeExt === 'png' ? 'image/png' : safeExt === 'webp' ? 'image/webp' : 'image/jpeg';
  const cleanRefId = refId.replace(/[^a-zA-Z0-9_-]/g, '');
  const objectPath = `thumbnails/${cleanRefId}-${Date.now()}.${safeExt}`;

  const { error: uploadError } = await supabase.storage
    .from(THUMBNAIL_BUCKET)
    .upload(objectPath, file, {
      cacheControl: '3600',
      upsert: false,
      contentType,
    });

  if (uploadError) {
    throw new Error(`Thumbnail upload failed: ${uploadError.message}`);
  }

  const { data } = supabase.storage.from(THUMBNAIL_BUCKET).getPublicUrl(objectPath);
  if (!data?.publicUrl) {
    throw new Error('Failed to resolve public URL for uploaded thumbnail.');
  }

  return data.publicUrl;
}

/**
 * Delete a thumbnail from the `reference-thumbnails` bucket if the URL belongs to it.
 */
export async function deleteReferenceThumbnail(url?: string): Promise<void> {
  if (!url || !isSupabaseConfigured() || !supabase) return;
  const objectPath = extractBucketObjectPath(url);
  if (!objectPath) return;

  try {
    const { error } = await supabase.storage.from(THUMBNAIL_BUCKET).remove([objectPath]);
    if (error) {
      console.warn('[Supabase Storage] Failed to delete old thumbnail:', error.message);
    }
  } catch (err) {
    console.warn('[Supabase Storage] Exception deleting old thumbnail:', err);
  }
}
