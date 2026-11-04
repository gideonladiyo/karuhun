import React, { useState } from 'react';
import { ReferenceItem, getPlatformThumbnail } from '@/data/static/reffsData';
import { Play, ExternalLink, Copy, Check } from 'lucide-react';
import { SafeImage } from '@/components/ui/safe-image';
import { PlatformBadge, PlatformIcon } from '@/components/ui/platform-icon';
import { cn } from '@/lib/utils';

export interface YoutubeReferenceCardProps {
  reference: ReferenceItem;
  onOpen: (item: ReferenceItem) => void;
  variant?: 'grid' | 'compact' | 'spotlight';
  /** Weekly featured slot name (zone / element / boss). Shown in place of the subcategory. */
  slotLabel?: string;
  className?: string;
}

export const CATEGORY_STYLES: Record<ReferenceItem['category'], { label: string; dot: string }> = {
  warzone: { label: 'Warzone', dot: 'bg-amber-400' },
  ppc: { label: 'PPC', dot: 'bg-purple-400' },
  guild_challenge: { label: 'Guild Challenge', dot: 'bg-blue-400' },
};

const getVideoUrl = (ref: ReferenceItem) => ref.videoUrl || ref.youtubeUrl || '';

/** Plain-text excerpt of a markdown description. */
function markdownExcerpt(text: string): string {
  return text
    .replace(/!\[.*?\]\(.*?\)/g, '')
    .replace(/\[(.*?)\]\(.*?\)/g, '$1')
    .replace(/[#*`_~>-]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

const Thumbnail: React.FC<{ reference: ReferenceItem; size: 'lg' | 'md' | 'sm'; slotLabel?: string }> = ({
  reference,
  size,
  slotLabel,
}) => {
  const category = CATEGORY_STYLES[reference.category] ?? CATEGORY_STYLES.warzone;
  const platform = reference.platform || 'youtube';
  const src = getPlatformThumbnail(platform, reference.videoId, reference.thumbnailUrl);

  return (
    <div className="relative w-full aspect-video rounded-xl bg-[#0d0d11] overflow-hidden border border-[#27272a] group-hover:border-zinc-500 transition-colors duration-200">
      {src ? (
        <SafeImage
          src={src}
          alt=""
          className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-300 ease-out"
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center bg-[radial-gradient(circle_at_center,#1c1c21_0%,#0d0d11_70%)]">
          <PlatformIcon
            platform={platform}
            className={cn('fill-current text-zinc-600', size === 'sm' ? 'w-6 h-6' : 'w-10 h-10')}
          />
        </div>
      )}

      {size !== 'sm' && (
        <div
          className={cn(
            'absolute flex items-center justify-between pointer-events-none',
            size === 'lg' ? 'top-3.5 left-3.5 right-3.5' : 'top-2.5 left-2.5 right-2.5'
          )}
        >
          {slotLabel ? (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-black/85 text-white border border-white/15 text-xs font-tech font-bold backdrop-blur-md">
              <span className={cn('w-1.5 h-1.5 rounded-full', category.dot)} />
              {slotLabel}
            </span>
          ) : (
            <span />
          )}
          <PlatformBadge platform={platform} />
        </div>
      )}

      <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-200">
        <div
          className={cn(
            'rounded-full bg-black/75 text-white flex items-center justify-center backdrop-blur-sm',
            size === 'lg' ? 'w-14 h-14' : size === 'md' ? 'w-10 h-10' : 'w-8 h-8'
          )}
        >
          <Play className={cn('fill-white ml-0.5', size === 'lg' ? 'w-5 h-5' : size === 'sm' ? 'w-3 h-3' : 'w-4 h-4')} />
        </div>
      </div>
    </div>
  );
};

const QuickActions: React.FC<{ url: string }> = ({ url }) => {
  const [copied, setCopied] = useState(false);
  if (!url) return null;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // Clipboard blocked (insecure context or permission); the external link still works.
    }
  };

  const btn = 'text-zinc-400 hover:text-white p-1.5 rounded-lg hover:bg-white/10 transition-colors';

  return (
    <div className="relative z-10 flex items-center gap-0.5 flex-shrink-0 opacity-75 sm:opacity-0 sm:group-hover:opacity-100 focus-within:opacity-100 transition-opacity">
      <button
        type="button"
        onClick={handleCopy}
        className={btn}
        title={copied ? 'Link copied' : 'Copy video link'}
        aria-label="Copy video link"
      >
        {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
      </button>
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className={btn}
        title="Open original video"
        aria-label="Open original video in new tab"
      >
        <ExternalLink className="w-3.5 h-3.5" />
      </a>
    </div>
  );
};

export const YoutubeReferenceCard: React.FC<YoutubeReferenceCardProps> = ({
  reference,
  onOpen,
  variant = 'grid',
  slotLabel,
  className = '',
}) => {
  const authorName = reference.author || 'Karuhun Tactical';
  const category = CATEGORY_STYLES[reference.category] ?? CATEGORY_STYLES.warzone;
  const url = getVideoUrl(reference);

  // Real link so middle-click / ctrl-click open the detail in a new tab; plain clicks stay in-app.
  const handleLinkClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    e.preventDefault();
    onOpen(reference);
  };

  const titleLink = (titleClass: string) => (
    <a
      href={`/reffs/${reference.id}`}
      onClick={handleLinkClick}
      className={cn(
        'outline-none after:absolute after:inset-0 after:rounded-xl focus-visible:after:ring-2 focus-visible:after:ring-amber-400',
        'text-white group-hover:text-amber-300 transition-colors',
        titleClass
      )}
    >
      {reference.title}
    </a>
  );

  if (variant === 'compact') {
    return (
      <article className={cn('group relative flex gap-3 w-full', className)}>
        <div className="w-32 sm:w-36 flex-shrink-0">
          <Thumbnail reference={reference} size="sm" />
        </div>
        <div className="min-w-0 flex-1 space-y-1 py-0.5">
          {slotLabel && (
            <p className="inline-flex items-center gap-1.5 text-xs font-tech font-bold text-zinc-200">
              <span className={cn('w-1.5 h-1.5 rounded-full', category.dot)} />
              {slotLabel}
            </p>
          )}
          <h3 className="font-heading font-bold text-sm leading-snug line-clamp-2">
            {titleLink('')}
          </h3>
          <p className="text-xs text-zinc-400 truncate">{authorName}</p>
          {!slotLabel && (
            <p className="inline-flex items-center gap-1.5 text-xs text-zinc-500">
              <span className={cn('w-1.5 h-1.5 rounded-full', category.dot)} />
              <span>{reference.subcategory || category.label}</span>
            </p>
          )}
        </div>
      </article>
    );
  }

  if (variant === 'spotlight') {
    const excerpt = markdownExcerpt(reference.description);
    return (
      <article className={cn('group relative flex flex-col w-full', className)}>
        <Thumbnail reference={reference} size="lg" slotLabel={slotLabel} />

        <div className="mt-4 flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1 space-y-1.5">
            <h3 className="font-heading font-extrabold text-lg md:text-xl leading-tight line-clamp-2">
              {titleLink('')}
            </h3>
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-zinc-400">
              <span className="text-zinc-200 font-medium">{authorName}</span>
              <span className="text-zinc-600" aria-hidden="true">·</span>
              <span className="inline-flex items-center gap-1.5 text-zinc-300">
                <span className={cn('w-1.5 h-1.5 rounded-full', category.dot)} />
                {category.label}
              </span>
              {reference.subcategory && reference.subcategory !== slotLabel && (
                <>
                  <span className="text-zinc-600" aria-hidden="true">·</span>
                  <span>{reference.subcategory}</span>
                </>
              )}
            </div>
            {excerpt && <p className="text-sm text-zinc-400 leading-relaxed line-clamp-2 pt-0.5">{excerpt}</p>}
          </div>

          <QuickActions url={url} />
        </div>
      </article>
    );
  }

  return (
    <article className={cn('group relative flex flex-col w-full', className)}>
      <Thumbnail reference={reference} size="md" slotLabel={slotLabel} />

      <div className="mt-2.5 flex items-start justify-between gap-2.5">
        <div className="min-w-0 flex-1 space-y-1">
          <h3 className="font-heading font-bold text-sm leading-snug line-clamp-2">
            {titleLink('')}
          </h3>

          <div className="flex flex-wrap items-center gap-x-1.5 gap-y-0.5 text-xs text-zinc-400">
            <span className="truncate max-w-[160px]">{authorName}</span>
            <span className="text-zinc-600" aria-hidden="true">·</span>
            <span className="inline-flex items-center gap-1.5 text-zinc-300">
              <span className={cn('w-1.5 h-1.5 rounded-full', category.dot)} />
              <span>{slotLabel ? category.label : reference.subcategory || category.label}</span>
            </span>
          </div>
        </div>

        <QuickActions url={url} />
      </div>
    </article>
  );
};
