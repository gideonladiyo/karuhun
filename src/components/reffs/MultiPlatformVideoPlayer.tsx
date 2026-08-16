import React, { useState, useEffect } from 'react';
import { VideoPlatform, getVideoEmbedUrl } from '@/data/static/reffsData';
import { ExternalLink, Play, AlertCircle } from 'lucide-react';

interface MultiPlatformVideoPlayerProps {
  platform: VideoPlatform;
  videoId: string;
  videoUrl: string;
  title: string;
  thumbnailUrl?: string;
  className?: string;
}

export const MultiPlatformVideoPlayer: React.FC<MultiPlatformVideoPlayerProps> = ({
  platform,
  videoId,
  videoUrl,
  title,
  thumbnailUrl,
  className = '',
}) => {
  const [hasError, setHasError] = useState<boolean>(false);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);

  // Dynamically load TikTok embed script if needed
  useEffect(() => {
    if (platform === 'tiktok') {
      const scriptId = 'tiktok-embed-script';
      if (!document.getElementById(scriptId)) {
        const script = document.createElement('script');
        script.id = scriptId;
        script.src = 'https://www.tiktok.com/embed.js';
        script.async = true;
        document.body.appendChild(script);
      }
    }
  }, [platform, videoId]);

  const embedUrl = getVideoEmbedUrl(platform, videoId, videoUrl);

  // TIKTOK VERTICAL THEATER PLAYER
  if (platform === 'tiktok') {
    return (
      <div className={`w-full flex flex-col items-center justify-center space-y-4 ${className}`}>
        
        {/* Responsive TikTok Frame */}
        <div className="relative w-full max-w-[420px] aspect-[9/16] max-h-[720px] bg-black rounded-3xl overflow-hidden border border-[#27272a] shadow-2xl">
          
          {isPlaying && embedUrl && !hasError ? (
            <iframe
              src={embedUrl}
              title={title}
              className="w-full h-full border-0 bg-black"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
              onError={() => setHasError(true)}
            />
          ) : (
            <div className="relative w-full h-full flex flex-col items-center justify-center p-6 text-center bg-[#09090b]">
              {thumbnailUrl && (
                <img
                  src={thumbnailUrl}
                  alt={title}
                  className="absolute inset-0 w-full h-full object-cover opacity-30 blur-sm"
                />
              )}
              <div className="relative z-10 space-y-4">
                <div className="w-16 h-16 rounded-full bg-cyan-500 text-black flex items-center justify-center mx-auto shadow-lg">
                  <Play className="w-8 h-8 fill-current ml-1" />
                </div>
                <div className="space-y-1">
                  <span className="text-xs font-tech text-cyan-400 uppercase font-bold tracking-widest block">
                    TikTok Reference Video
                  </span>
                  <h4 className="text-sm font-heading font-bold text-white max-w-xs mx-auto">
                    {title}
                  </h4>
                </div>
                <a
                  href={videoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-white text-black font-heading font-bold text-xs uppercase shadow-md hover:bg-zinc-200 transition-colors"
                >
                  <span>Watch Directly on TikTok</span>
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            </div>
          )}

        </div>

      </div>
    );
  }

  // BILIBILI HORIZONTAL 16:9 THEATER PLAYER
  if (platform === 'bilibili') {
    return (
      <div className={`w-full aspect-video rounded-2xl bg-black overflow-hidden border border-[#27272a] shadow-2xl relative ${className}`}>
        {embedUrl && !hasError ? (
          <iframe
            src={embedUrl}
            title={title}
            className="w-full h-full border-0 bg-black"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            onError={() => setHasError(true)}
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center bg-[#09090b] space-y-3">
            <AlertCircle className="w-8 h-8 text-pink-400" />
            <h4 className="text-sm font-heading font-bold text-white">Bilibili Player Preview</h4>
            <a
              href={videoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center space-x-2 px-4 py-2 rounded-xl bg-pink-500 text-black font-heading font-bold text-xs uppercase"
            >
              <span>Open on Bilibili</span>
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        )}
      </div>
    );
  }

  // YOUTUBE HORIZONTAL 16:9 THEATER PLAYER (DEFAULT)
  return (
    <div className={`w-full aspect-video rounded-2xl bg-black overflow-hidden border border-[#27272a] shadow-2xl relative ${className}`}>
      <iframe
        src={embedUrl}
        title={title}
        className="w-full h-full border-0 bg-black"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen
      />
    </div>
  );
};
