import React, { useState } from 'react';
import { ReferenceItem, getPlatformThumbnail } from '@/data/static/reffsData';
import { Play, ExternalLink, Copy, Check } from 'lucide-react';
import { SafeImage } from '@/components/ui/safe-image';
import { PlatformBadge } from '@/components/ui/platform-icon';

export interface YoutubeReferenceCardProps {
  reference: ReferenceItem;
  onOpen: (item: ReferenceItem) => void;
  variant?: 'grid' | 'featured' | 'compact';
  className?: string;
  showDescription?: boolean;
}

// Relative time formatter like Indonesian YouTube: "11 h lalu", "3 hr lalu"
export function formatRelativeDate(dateStr?: string): string {
  if (!dateStr) return 'Baru saja';
  try {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return dateStr;
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffHours < 1) return 'Baru saja';
    if (diffHours < 24) return `${diffHours} h lalu`;
    if (diffDays === 1) return '1 hr lalu';
    if (diffDays < 7) return `${diffDays} hr lalu`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} mgg lalu`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} bln lalu`;
    return `${Math.floor(diffDays / 365)} thn lalu`;
  } catch {
    return dateStr;
  }
}

// Clean markdown helper for text excerpts
export function cleanMarkdown(text: string): string {
  return text
    .replace(/!\[.*?\]\(.*?\)/g, '')
    .replace(/\[(.*?)\]\(.*?\)/g, '$1')
    .replace(/[#*`_~>-]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

export const YoutubeReferenceCard: React.FC<YoutubeReferenceCardProps> = ({
  reference,
  onOpen,
  variant = 'grid',
  className = '',
  showDescription = false,
}) => {
  const [copied, setCopied] = useState(false);

  const platform = reference.platform || 'youtube';
  const rawThumbnail = getPlatformThumbnail(platform, reference.videoId, reference.thumbnailUrl);
  const authorName = reference.author || 'Karuhun Tactical';
  const cleanedDescription = cleanMarkdown(reference.description);

  const getCategoryDetails = (cat: string) => {
    if (cat === 'warzone') {
      return { label: 'Warzone', dotColor: 'bg-amber-400', textColor: 'text-amber-300' };
    }
    if (cat === 'ppc') {
      return { label: 'PPC Cage', dotColor: 'bg-purple-400', textColor: 'text-purple-300' };
    }
    return { label: 'Guild Siege', dotColor: 'bg-blue-400', textColor: 'text-blue-300' };
  };

  const catDetails = getCategoryDetails(reference.category);

  const handleCopyLink = (e: React.MouseEvent) => {
    e.stopPropagation();
    const url = reference.videoUrl || reference.youtubeUrl || '';
    if (url) {
      navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => {
        setCopied(false);
      }, 1500);
    }
  };

  const handleOpenExternal = (e: React.MouseEvent) => {
    e.stopPropagation();
    const url = reference.videoUrl || reference.youtubeUrl || '';
    if (url) {
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  };

  // -------------------------------------------------------------
  // FEATURED VARIANT (Homepage Large Spotlight)
  // -------------------------------------------------------------
  if (variant === 'featured') {
    return (
      <div
        onClick={() => onOpen(reference)}
        className={`group bg-transparent cursor-pointer flex flex-col w-full ${className}`}
      >
        {/* Thumbnail Container (Max 2 overlays: Featured + Platform) */}
        <div className="relative w-full aspect-video rounded-xl bg-black overflow-hidden border border-[#27272a] group-hover:border-zinc-500 transition-colors duration-200">
          <SafeImage
            src={rawThumbnail}
            alt={reference.title}
            loading="lazy"
            decoding="async"
            className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-300 ease-out"
          />

          <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none z-10">
            <span className="text-xs font-tech font-bold px-2.5 py-0.5 rounded-full bg-red-600/95 text-white inline-flex items-center gap-1.5 shadow-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-white" />
              <span>Featured</span>
            </span>

            <PlatformBadge platform={platform} />
          </div>

          {/* Center Play Button on Hover */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <div className="w-12 h-12 rounded-full bg-black/75 text-white flex items-center justify-center backdrop-blur-sm shadow-lg">
              <Play className="w-5 h-5 fill-white ml-0.5" />
            </div>
          </div>
        </div>

        {/* Title, Metadata Line, and Desktop-Only Description Excerpt */}
        <div className="mt-3.5 flex items-start justify-between gap-3 bg-transparent relative">
          <div className="min-w-0 flex-1 space-y-1">
            <h3 className="font-heading font-extrabold text-base sm:text-lg md:text-xl text-white group-hover:text-amber-300 transition-colors line-clamp-2 leading-tight">
              {reference.title}
            </h3>

            {/* Metadata Line: Author · ● Category · Subcategory */}
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-zinc-400 font-sans">
              <span className="text-zinc-300 font-medium">{authorName}</span>
              <span className="text-zinc-600" aria-hidden="true">·</span>
              <span className="inline-flex items-center gap-1.5 text-zinc-300">
                <span className={`w-1.5 h-1.5 rounded-full ${catDetails.dotColor}`} />
                <span>{catDetails.label}</span>
              </span>
              {reference.subcategory && (
                <>
                  <span className="text-zinc-600" aria-hidden="true">·</span>
                  <span className="text-zinc-400">{reference.subcategory}</span>
                </>
              )}
            </div>

            {/* Description excerpt (Desktop Only) */}
            {cleanedDescription && (
              <p
                title={cleanedDescription}
                className="hidden md:block text-zinc-400 text-xs font-sans line-clamp-2 leading-relaxed pt-1"
              >
                {cleanedDescription}
              </p>
            )}
          </div>

          {/* Direct Quick Actions (Copy Link + External Link) */}
          <div className="flex items-center gap-1 flex-shrink-0 opacity-75 sm:opacity-0 sm:group-hover:opacity-100 focus-within:opacity-100 transition-opacity">
            <button
              type="button"
              onClick={handleCopyLink}
              className="text-zinc-400 hover:text-white p-1.5 rounded-lg hover:bg-white/10 transition-colors"
              title={copied ? 'Link copied!' : 'Copy video link'}
              aria-label="Copy video link"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
            <button
              type="button"
              onClick={handleOpenExternal}
              className="text-zinc-400 hover:text-white p-1.5 rounded-lg hover:bg-white/10 transition-colors"
              title="Open in new tab"
              aria-label="Open video in new tab"
            >
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // GRID & COMPACT VARIANT (Used in ReffsPage & Homepage list)
  // -------------------------------------------------------------
  return (
    <div
      onClick={() => onOpen(reference)}
      className={`group bg-transparent cursor-pointer flex flex-col w-full ${className}`}
    >
      {/* Thumbnail Container (Max 1 overlay: PlatformBadge) */}
      <div className="relative w-full aspect-video rounded-xl bg-black overflow-hidden border border-[#27272a] group-hover:border-zinc-500 transition-colors duration-200">
        <SafeImage
          src={rawThumbnail}
          alt={reference.title}
          loading="lazy"
          decoding="async"
          className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-300 ease-out"
        />

        <div className="absolute top-2.5 right-2.5 flex items-center justify-end pointer-events-none z-10">
          <PlatformBadge platform={platform} />
        </div>

        {/* Center Play Button on Hover */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <div className="w-10 h-10 rounded-full bg-black/75 text-white flex items-center justify-center backdrop-blur-sm shadow-lg">
            <Play className="w-4 h-4 fill-white ml-0.5" />
          </div>
        </div>
      </div>

      {/* Title & Metadata Line */}
      <div className="mt-2.5 flex items-start justify-between gap-2.5 bg-transparent relative">
        <div className="min-w-0 flex-1 space-y-1">
          <h3 className="font-heading font-bold text-sm text-white group-hover:text-amber-300 transition-colors line-clamp-2 leading-snug">
            {reference.title}
          </h3>

          {/* Metadata Line: Author · ● Subcategory/Category */}
          <div className="flex flex-wrap items-center gap-x-1.5 gap-y-0.5 text-xs text-zinc-400 font-sans">
            <span className="text-zinc-400 truncate max-w-[140px]">{authorName}</span>
            <span className="text-zinc-600" aria-hidden="true">·</span>
            <span className="inline-flex items-center gap-1 text-zinc-300">
              <span className={`w-1.5 h-1.5 rounded-full ${catDetails.dotColor}`} />
              <span>{reference.subcategory || catDetails.label}</span>
            </span>
          </div>

          {showDescription && reference.description && (
            <p className="text-zinc-400 text-xs font-sans line-clamp-1 pt-0.5">
              {cleanMarkdown(reference.description)}
            </p>
          )}
        </div>

        {/* Direct Quick Actions */}
        <div className="flex items-center gap-0.5 flex-shrink-0 opacity-75 sm:opacity-0 sm:group-hover:opacity-100 focus-within:opacity-100 transition-opacity">
          <button
            type="button"
            onClick={handleCopyLink}
            className="text-zinc-400 hover:text-white p-1.5 rounded-lg hover:bg-white/10 transition-colors"
            title={copied ? 'Link copied!' : 'Copy video link'}
            aria-label="Copy video link"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          </button>
          <button
            type="button"
            onClick={handleOpenExternal}
            className="text-zinc-400 hover:text-white p-1.5 rounded-lg hover:bg-white/10 transition-colors"
            title="Open in new tab"
            aria-label="Open video in new tab"
          >
            <ExternalLink className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
