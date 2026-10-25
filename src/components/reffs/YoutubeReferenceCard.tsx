import React, { useState } from 'react';
import { ReferenceItem, getPlatformThumbnail, VideoPlatform } from '@/data/static/reffsData';
import { Play, MoreVertical, ExternalLink, Copy, Check, Swords, Skull, Shield } from 'lucide-react';

export interface YoutubeReferenceCardProps {
  reference: ReferenceItem;
  onOpen: (item: ReferenceItem) => void;
  variant?: 'grid' | 'featured' | 'compact';
  className?: string;
  showDescription?: boolean;
}

// Format views like Indonesian YouTube: "▷ 926 rb" or "▷ 14,2 rb"
export function getReferenceViews(item: ReferenceItem): string {
  let num = 0;
  if (item.viewsCount) {
    if (typeof item.viewsCount === 'number') num = item.viewsCount;
    else {
      const parsed = parseInt(String(item.viewsCount).replace(/\D/g, ''), 10);
      num = isNaN(parsed) ? 14200 : parsed;
    }
  } else {
    let hash = 0;
    for (let i = 0; i < item.id.length; i++) {
      hash = (hash << 5) - hash + item.id.charCodeAt(i);
      hash |= 0;
    }
    const absHash = Math.abs(hash);
    num = (6 + (absHash % 38)) * 1000 + (absHash % 9) * 100;
  }

  if (num >= 1000000) {
    return `${(num / 1000000).toFixed(1).replace('.0', '').replace('.', ',')} jt`;
  }
  if (num >= 1000) {
    return `${(num / 1000).toFixed(1).replace('.0', '').replace('.', ',')} rb`;
  }
  return `${num}`;
}

// Format duration with dot like Indonesian YouTube: "18.35"
export function getReferenceDuration(item: ReferenceItem): string {
  if (item.duration) return item.duration.replace(':', '.');
  let hash = 0;
  for (let i = 0; i < item.id.length; i++) {
    hash = (hash << 5) - hash + item.id.charCodeAt(i);
    hash |= 0;
  }
  const absHash = Math.abs(hash);
  if (item.platform === 'tiktok') {
    const sec = 35 + (absHash % 50);
    return `00.${sec < 10 ? '0' : ''}${sec}`;
  }
  const minutes = 3 + (absHash % 16);
  const seconds = (absHash % 59).toString().padStart(2, '0');
  return `${minutes}.${seconds}`;
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

// Platform badge helper
const PlatformBadge: React.FC<{ platform?: VideoPlatform }> = ({ platform = 'youtube' }) => {
  if (platform === 'tiktok') {
    return (
      <span className="inline-flex items-center space-x-1 px-1.5 py-0.5 rounded bg-black/90 text-cyan-400 border border-cyan-500/40 text-[9px] font-tech font-bold uppercase shadow-sm">
        <svg className="w-2.5 h-2.5 fill-current" viewBox="0 0 24 24">
          <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 1 1-5.2-1.74 2.89 2.89 0 0 1 2.31-2.83V7.58a6.34 6.34 0 0 0-3.37 1 6.34 6.34 0 1 0 9.71 5.39V9.11a8.31 8.31 0 0 0 5.07 1.73v-3.75a4.85 4.85 0 0 1-1.3-.4z" />
        </svg>
        <span>TikTok</span>
      </span>
    );
  }
  if (platform === 'bilibili') {
    return (
      <span className="inline-flex items-center space-x-1 px-1.5 py-0.5 rounded bg-pink-950/90 text-pink-300 border border-pink-500/40 text-[9px] font-tech font-bold uppercase shadow-sm">
        <svg className="w-2.5 h-2.5 fill-current" viewBox="0 0 24 24">
          <path d="M17.813 4.653h.854c1.51 0 2.733 1.224 2.733 2.734v10.147a2.734 2.734 0 0 1-2.733 2.733H5.333A2.734 2.734 0 0 1 2.6 17.534V7.387a2.734 2.734 0 0 1 2.733-2.734h.854l-1.92-1.92a.667.667 0 1 1 .942-.943L7.747 4.33h8.506l2.538-2.54a.667.667 0 1 1 .942.943l-1.92 1.92zm-12.48 2.667a1.4 1.4 0 0 0-1.4 1.4v10.147a1.4 1.4 0 0 0 1.4 1.4h12.48a1.4 1.4 0 0 0 1.4-1.4V8.72a1.4 1.4 0 0 0-1.4-1.4H5.333zm2.667 4.267a1.067 1.067 0 1 1 0 2.133 1.067 1.067 0 0 1 0-2.133zm8 0a1.067 1.067 0 1 1 0 2.133 1.067 1.067 0 0 1 0-2.133z" />
        </svg>
        <span>Bilibili</span>
      </span>
    );
  }
  return (
    <span className="inline-flex items-center space-x-1 px-1.5 py-0.5 rounded bg-red-600/90 text-white border border-red-500/50 text-[9px] font-tech font-bold uppercase shadow-sm">
      <svg className="w-2.5 h-2.5 fill-current" viewBox="0 0 24 24">
        <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
      </svg>
      <span>YouTube</span>
    </span>
  );
};

export const YoutubeReferenceCard: React.FC<YoutubeReferenceCardProps> = ({
  reference,
  onOpen,
  variant = 'grid',
  className = '',
  showDescription = false,
}) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const platform = reference.platform || 'youtube';
  const rawThumbnail = getPlatformThumbnail(platform, reference.videoId, reference.thumbnailUrl);
  const duration = getReferenceDuration(reference);
  const authorName = reference.author || 'Karuhun Tactical';

  const getCategoryDetails = (cat: string) => {
    if (cat === 'warzone') {
      return { label: 'Warzone', color: 'text-amber-400 border-amber-500/30 bg-amber-500/10', icon: Swords };
    }
    if (cat === 'ppc') {
      return { label: 'PPC Cage', color: 'text-purple-400 border-purple-500/30 bg-purple-500/10', icon: Skull };
    }
    return { label: 'Guild Siege', color: 'text-blue-400 border-blue-500/30 bg-blue-500/10', icon: Shield };
  };

  const catDetails = getCategoryDetails(reference.category);
  const CatIcon = catDetails.icon;

  const handleCopyLink = (e: React.MouseEvent) => {
    e.stopPropagation();
    const url = reference.videoUrl || reference.youtubeUrl || '';
    if (url) {
      navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => {
        setCopied(false);
        setMenuOpen(false);
      }, 1500);
    }
  };

  const handleOpenExternal = (e: React.MouseEvent) => {
    e.stopPropagation();
    const url = reference.videoUrl || reference.youtubeUrl || '';
    if (url) {
      window.open(url, '_blank', 'noopener,noreferrer');
      setMenuOpen(false);
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
        {/* Kotak Thumbnail di Atas (Clean Box with Duration Badge like YouTube) */}
        <div className="relative w-full aspect-video rounded-2xl sm:rounded-3xl bg-black overflow-hidden border border-[#27272a]/70 group-hover:border-zinc-500 transition-all duration-300 shadow-md">
          <img
            src={rawThumbnail}
            alt={reference.title}
            loading="lazy"
            decoding="async"
            onError={(e) => {
              (e.target as HTMLImageElement).src = '/logo.png';
            }}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
          />

          {/* Top Badge: Featured Spotlight & Category */}
          <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none z-10">
            <div className="flex items-center space-x-2">
              <span className="text-[10px] font-tech font-black px-2.5 py-1 rounded bg-red-600 text-white uppercase shadow-lg tracking-wider flex items-center space-x-1">
                <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                <span>FEATURED RUN</span>
              </span>
              <span className={`text-[10px] font-tech font-bold px-2 py-0.5 rounded border backdrop-blur-md bg-black/75 flex items-center space-x-1 ${catDetails.color}`}>
                <CatIcon className="w-3 h-3" />
                <span>{catDetails.label}</span>
              </span>
              <span className="text-[10px] font-tech font-bold px-2 py-0.5 rounded bg-black/75 backdrop-blur-md border border-white/10 text-zinc-300 uppercase hidden sm:inline-block">
                {reference.subcategory}
              </span>
            </div>

            <PlatformBadge platform={platform} />
          </div>

          {/* Center Play Button on Hover */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <div className="w-14 h-14 rounded-full bg-black/70 text-white flex items-center justify-center backdrop-blur-sm shadow-xl group-hover:scale-110 transition-transform">
              <Play className="w-6 h-6 fill-white ml-0.5" />
            </div>
          </div>

          {/* Duration Badge di Pojok Bawah Kanan (Persis seperti "18.35" di Screenshot) */}
          <div className="absolute bottom-2.5 right-2.5 bg-black/90 text-white text-xs font-tech font-bold px-1.5 py-0.5 rounded shadow tracking-wider">
            {duration}
          </div>
        </div>

        {/* Di Bawahnya: Title, View, Channel, dll (bg-transparent) */}
        <div className="mt-3.5 flex items-start justify-between gap-3 bg-transparent relative">
          {/* Title & Metadata */}
          <div className="min-w-0 flex-1 space-y-1">
            <h3 className="font-heading font-black text-base sm:text-lg md:text-xl text-white group-hover:text-amber-300 transition-colors line-clamp-2 leading-tight">
              {reference.title}
            </h3>

            {/* Channel / Author */}
            <div className="text-xs text-zinc-400 font-sans">
              <span className="text-zinc-300 hover:text-white transition-colors font-medium">
                {authorName}
              </span>
            </div>

            {/* Description excerpt */}
            <p className="text-zinc-400 text-xs font-sans line-clamp-2 leading-relaxed pt-1">
              {cleanMarkdown(reference.description) || 'Optimal character synergy and rotation guide compiled by Karuhun tacticians.'}
            </p>
          </div>

          {/* Menu Titik 3 di Kanan Atas Title (Persis seperti Screenshot) */}
          <div className="relative flex-shrink-0">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setMenuOpen(!menuOpen);
              }}
              className="text-zinc-400 hover:text-white p-1 rounded-full hover:bg-white/10 transition-colors"
              title="More options"
            >
              <MoreVertical className="w-4 h-4" />
            </button>

            {menuOpen && (
              <div
                onClick={(e) => e.stopPropagation()}
                className="absolute right-0 top-8 z-30 w-44 bg-[#18181b] border border-[#27272a] rounded-xl shadow-2xl py-1 text-xs font-sans"
              >
                <button
                  onClick={handleCopyLink}
                  className="w-full text-left px-3.5 py-2 hover:bg-white/10 text-zinc-200 flex items-center space-x-2"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Link Tersalin!' : 'Salin link video'}</span>
                </button>
                <button
                  onClick={handleOpenExternal}
                  className="w-full text-left px-3.5 py-2 hover:bg-white/10 text-zinc-200 flex items-center space-x-2"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Buka di tab baru</span>
                </button>
              </div>
            )}
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
      {/* Kotak Thumbnail di Atas */}
      <div className="relative w-full aspect-video rounded-xl sm:rounded-2xl bg-black overflow-hidden border border-[#27272a]/60 group-hover:border-zinc-500 transition-all duration-300 shadow-md">
        <img
          src={rawThumbnail}
          alt={reference.title}
          loading="lazy"
          decoding="async"
          onError={(e) => {
            (e.target as HTMLImageElement).src = '/logo.png';
          }}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
        />

        {/* Top Badges: Category & Platform */}
        <div className="absolute top-2 left-2 right-2 flex items-center justify-between pointer-events-none z-10">
          <span className={`text-[9px] font-tech font-bold px-1.5 py-0.5 rounded border backdrop-blur-md bg-black/75 flex items-center space-x-1 ${catDetails.color}`}>
            <CatIcon className="w-2.5 h-2.5" />
            <span>{reference.subcategory || catDetails.label}</span>
          </span>

          <PlatformBadge platform={platform} />
        </div>

        {/* Center Play Button on Hover */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <div className="w-11 h-11 rounded-full bg-black/75 text-white flex items-center justify-center backdrop-blur-sm shadow-xl group-hover:scale-110 transition-transform">
            <Play className="w-5 h-5 fill-white ml-0.5" />
          </div>
        </div>

        {/* Duration Badge di Pojok Bawah Kanan (Persis seperti "18.35" di Screenshot) */}
        <div className="absolute bottom-2 right-2 bg-black/90 text-white text-[11px] font-tech font-bold px-1.5 py-0.5 rounded shadow tracking-wider">
          {duration}
        </div>
      </div>

      {/* Di Bawahnya: Title, View, Channel, dll (bg-transparent) */}
      <div className="mt-3 flex items-start justify-between gap-3 bg-transparent relative">
        {/* Title & Metadata */}
        <div className="min-w-0 flex-1 space-y-0.5">
          <h3 className="font-heading font-bold text-sm text-white group-hover:text-amber-300 transition-colors line-clamp-2 leading-snug">
            {reference.title}
          </h3>

          {/* Channel / Author */}
          <div className="text-xs text-zinc-400 font-sans">
            <span className="text-zinc-400 hover:text-white transition-colors truncate max-w-[160px] inline-block">
              {authorName}
            </span>
          </div>

          {showDescription && reference.description && (
            <p className="text-zinc-500 text-xs font-sans line-clamp-1 pt-1">
              {cleanMarkdown(reference.description)}
            </p>
          )}
        </div>

        {/* Menu Titik 3 di Kanan Atas Title */}
        <div className="relative flex-shrink-0">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setMenuOpen(!menuOpen);
            }}
            className="text-zinc-400 hover:text-white p-1 rounded-full hover:bg-white/10 transition-colors"
            title="More options"
          >
            <MoreVertical className="w-4 h-4" />
          </button>

          {menuOpen && (
            <div
              onClick={(e) => e.stopPropagation()}
              className="absolute right-0 top-7 z-30 w-44 bg-[#18181b] border border-[#27272a] rounded-xl shadow-2xl py-1 text-xs font-sans"
            >
              <button
                onClick={handleCopyLink}
                className="w-full text-left px-3.5 py-2 hover:bg-white/10 text-zinc-200 flex items-center space-x-2"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Link Tersalin!' : 'Salin link video'}</span>
              </button>
              <button
                onClick={handleOpenExternal}
                className="w-full text-left px-3.5 py-2 hover:bg-white/10 text-zinc-200 flex items-center space-x-2"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Buka di tab baru</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
