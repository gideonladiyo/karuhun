import React, { useState, useEffect } from 'react';
import { VideoPlatform, getVideoEmbedUrl } from '@/data/static/reffsData';
import { ExternalLink, Play } from 'lucide-react';
import { SafeImage } from '@/components/ui/safe-image';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { PLATFORM_LABELS } from '@/components/ui/platform-icon';

export interface MultiPlatformVideoPlayerProps {
  platform: VideoPlatform;
  videoId: string;
  videoUrl: string;
  title: string;
  thumbnailUrl?: string;
  compact?: boolean;
  className?: string;
}

const IFRAME_ALLOW =
  'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share';

const PlayerFallback: React.FC<{
  platformLabel: string;
  title: string;
  videoUrl: string;
  thumbnailUrl?: string;
}> = ({ platformLabel, title, videoUrl, thumbnailUrl }) => (
  <div className="relative w-full h-full flex flex-col items-center justify-center p-6 text-center bg-[#09090b] overflow-hidden">
    {thumbnailUrl && (
      <SafeImage
        src={thumbnailUrl}
        alt=""
        className="absolute inset-0 w-full h-full object-cover opacity-35 blur-sm scale-105"
      />
    )}
    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/60 to-black/40" />

    <div className="relative z-10 space-y-3.5 max-w-xs">
      <div className="w-12 h-12 rounded-2xl bg-white/10 border border-white/20 text-white flex items-center justify-center mx-auto backdrop-blur-sm">
        <Play className="w-5 h-5 fill-current ml-0.5" />
      </div>
      <div className="space-y-1">
        <span className="text-xs text-zinc-400 block">
          This link can’t be previewed here
        </span>
        <h4 className="text-sm font-heading font-bold text-white line-clamp-2">
          {title}
        </h4>
      </div>
      {videoUrl && (
        <Button asChild size="sm">
          <a href={videoUrl} target="_blank" rel="noopener noreferrer">
            <span>Watch on {platformLabel}</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </Button>
      )}
    </div>
  </div>
);

export const MultiPlatformVideoPlayer: React.FC<MultiPlatformVideoPlayerProps> = ({
  platform,
  videoId,
  videoUrl,
  title,
  thumbnailUrl,
  compact = false,
  className = '',
}) => {
  const [loaded, setLoaded] = useState<boolean>(false);
  const [slowLoad, setSlowLoad] = useState<boolean>(false);

  const embedUrl = getVideoEmbedUrl(platform, videoId, videoUrl);
  const platformLabel = PLATFORM_LABELS[platform] ?? PLATFORM_LABELS.youtube;
  const isVertical = platform === 'tiktok';

  useEffect(() => {
    setLoaded(false);
    setSlowLoad(false);

    if (!embedUrl) return undefined;

    const timer = setTimeout(() => {
      setSlowLoad(true);
    }, 8000);

    return () => clearTimeout(timer);
  }, [embedUrl]);

  const frameClass = isVertical
    ? compact
      ? 'w-full max-w-[300px] sm:max-w-[320px] aspect-[9/16] max-h-[min(64vh,540px)]'
      : 'w-full max-w-[360px] aspect-[9/16] max-h-[min(72vh,640px)]'
    : compact
    ? 'w-full max-w-xl aspect-video'
    : 'w-full aspect-video';

  return (
    <div
      className={cn(
        'w-full flex flex-col items-center justify-center',
        className
      )}
    >
      <div
        className={cn(
          'relative bg-black rounded-2xl overflow-hidden border border-[#27272a]',
          frameClass
        )}
      >
        {embedUrl ? (
          <>
            <iframe
              key={embedUrl}
              src={embedUrl}
              title={title}
              className="w-full h-full border-0 bg-black"
              allow={IFRAME_ALLOW}
              allowFullScreen
              onLoad={() => {
                setLoaded(true);
                setSlowLoad(false);
              }}
            />

            {!loaded && slowLoad && videoUrl && (
              <div className="absolute inset-x-3 bottom-3 z-10 flex items-center justify-between gap-2 rounded-xl bg-black/90 border border-[#27272a] px-3 py-2 text-xs text-zinc-200 backdrop-blur-md">
                <span>Video not loading?</span>
                <a
                  href={videoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 font-semibold text-amber-400 hover:text-amber-300 shrink-0"
                >
                  <span>Watch on {platformLabel}</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            )}
          </>
        ) : (
          <PlayerFallback
            platformLabel={platformLabel}
            title={title}
            videoUrl={videoUrl}
            thumbnailUrl={thumbnailUrl}
          />
        )}
      </div>
    </div>
  );
};
