import React from 'react';
import { VideoPlatform } from '@/data/static/reffsData';

export type SocialOrVideoPlatform = VideoPlatform | 'discord';

export interface PlatformIconProps {
  platform: SocialOrVideoPlatform;
  className?: string;
}

export const PlatformIcon: React.FC<PlatformIconProps> = ({
  platform,
  className = 'w-3.5 h-3.5 fill-current',
}) => {
  if (platform === 'tiktok') {
    return (
      <svg className={className} viewBox="0 0 24 24" fill="currentColor">
        <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 1 1-5.2-1.74 2.89 2.89 0 0 1 2.31-2.83V7.58a6.34 6.34 0 0 0-3.37 1 6.34 6.34 0 1 0 9.71 5.39V9.11a8.31 8.31 0 0 0 5.07 1.73v-3.75a4.85 4.85 0 0 1-1.3-.4z" />
      </svg>
    );
  }
  if (platform === 'bilibili') {
    return (
      <svg className={className} viewBox="0 0 24 24" fill="currentColor">
        <path d="M17.813 4.653h.854c1.51 0 2.733 1.224 2.733 2.734v10.147a2.734 2.734 0 0 1-2.733 2.733H5.333A2.734 2.734 0 0 1 2.6 17.534V7.387a2.734 2.734 0 0 1 2.733-2.734h.854l-1.92-1.92a.667.667 0 1 1 .942-.943L7.747 4.33h8.506l2.538-2.54a.667.667 0 1 1 .942.943l-1.92 1.92zm-12.48 2.667a1.4 1.4 0 0 0-1.4 1.4v10.147a1.4 1.4 0 0 0 1.4 1.4h12.48a1.4 1.4 0 0 0 1.4-1.4V8.72a1.4 1.4 0 0 0-1.4-1.4H5.333zm2.667 4.267a1.067 1.067 0 1 1 0 2.133 1.067 1.067 0 0 1 0-2.133zm8 0a1.067 1.067 0 1 1 0 2.133 1.067 1.067 0 0 1 0-2.133z" />
      </svg>
    );
  }
  if (platform === 'discord') {
    return (
      <svg className={className} viewBox="0 0 24 24" fill="currentColor">
        <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994.021-.041.001-.09-.041-.106a13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.061 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.028zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
      </svg>
    );
  }
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
    </svg>
  );
};

export const PLATFORM_LABELS: Record<VideoPlatform, string> = {
  youtube: 'YouTube',
  tiktok: 'TikTok',
  bilibili: 'Bilibili',
  other: 'Source',
};

export const PlatformBadge: React.FC<{ platform?: VideoPlatform }> = ({ platform = 'youtube' }) => (
  <span className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-black/85 text-zinc-200 border border-white/15 text-xs font-tech font-medium backdrop-blur-md">
    <PlatformIcon platform={platform} className="w-3 h-3 fill-current" />
    <span>{PLATFORM_LABELS[platform] ?? PLATFORM_LABELS.youtube}</span>
  </span>
);
