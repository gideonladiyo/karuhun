import React, { useState, useEffect } from 'react';
import { getHuaxuImageUrl } from '@/services/imageUtils';
import { LeadershipProfile } from '@/data/static/leadershipData';
import { PlayerAvatar } from '@/components/domain/PlayerAvatar';
import { SafeImage } from '@/components/ui/safe-image';

export interface GuildLeadershipSilhouetteProps {
  profiles: LeadershipProfile[];
  server: string;
  onSelectPlayer?: (uid: number, server: string) => void;
  compact?: boolean;
}

export const GuildLeadershipSilhouette: React.FC<GuildLeadershipSilhouetteProps> = ({
  profiles,
  server,
  onSelectPlayer,
  compact = false,
}) => {
  const [displayIndex, setDisplayIndex] = useState<number>(0);
  const [phase, setPhase] = useState<'idle' | 'exit' | 'enter'>('idle');
  const [isPaused, setIsPaused] = useState<boolean>(false);

  useEffect(() => {
    if (isPaused || profiles.length <= 1) return;
    const interval = setInterval(() => {
      setPhase('exit');
      setTimeout(() => {
        setDisplayIndex((prev) => (prev + 1) % profiles.length);
        setPhase('enter');
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            setPhase('idle');
          });
        });
      }, 240);
    }, 3800);

    return () => clearInterval(interval);
  }, [isPaused, profiles.length]);

  const currentProfile = profiles[displayIndex] || profiles[0];
  if (!currentProfile) return null;

  const animationClasses =
    phase === 'exit'
      ? '-translate-x-5 opacity-0 transition-all duration-240 ease-in'
      : phase === 'enter'
      ? 'translate-x-5 opacity-0 transition-none'
      : 'translate-x-0 opacity-100 transition-all duration-280 ease-out';

  const avatarSrc = getHuaxuImageUrl(currentProfile.portrait);

  if (compact) {
    return (
      <div
        className="w-full select-none pt-1"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        <div className={`overflow-hidden ${animationClasses}`}>
          <div
            onClick={(e) => {
              if (onSelectPlayer) {
                e.stopPropagation();
                onSelectPlayer(currentProfile.playerId, server);
              }
            }}
            className={`relative flex items-center gap-3 p-3 min-h-[66px] rounded-xl border border-[#27272a] hover:border-zinc-500 bg-gradient-to-r from-[#17171d] via-[#121215] to-[#0d0d11] transition-all overflow-hidden [isolation:isolate] ${
              onSelectPlayer ? 'cursor-pointer group' : ''
            }`}
          >
            <PlayerAvatar
              portrait={currentProfile.portrait}
              frame={currentProfile.frame}
              name={currentProfile.name}
              size="md"
              shape="circle"
              className="z-10"
            />

            <div className="min-w-0 flex-1 space-y-0.5 z-10">
              <h4 className="font-heading font-bold text-xs sm:text-sm text-white truncate group-hover:text-amber-300 transition-colors">
                {currentProfile.name}
              </h4>
              <p className="text-xs font-tech text-zinc-400 font-mono truncate">
                LVL <strong className="text-white font-bold">{currentProfile.level}</strong> • UID: {currentProfile.playerId}
              </p>
            </div>

            <div
              className="absolute right-0 top-0 bottom-0 w-3/5 pointer-events-none overflow-hidden rounded-r-xl select-none z-0 flex items-center justify-end"
              style={{
                WebkitMaskImage: 'linear-gradient(to right, transparent 0%, transparent 15%, black 85%)',
                maskImage: 'linear-gradient(to right, transparent 0%, transparent 15%, black 85%)',
              }}
            >
              <SafeImage
                src={avatarSrc}
                alt=""
                hideOnError
                className="h-full w-full object-cover object-right scale-[1.18] opacity-30 filter contrast-125 saturate-125 transition-opacity duration-300 group-hover:opacity-45"
              />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="w-full select-none pt-2 border-t border-[#27272a]/60"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div className={`overflow-hidden min-h-[80px] sm:min-h-[86px] ${animationClasses}`}>
        <div
          onClick={(e) => {
            if (onSelectPlayer) {
              e.stopPropagation();
              onSelectPlayer(currentProfile.playerId, server);
            }
          }}
          className={`w-full p-3.5 sm:p-4 rounded-xl border border-[#27272a] hover:border-zinc-500 bg-gradient-to-r from-[#181820] via-[#121215] to-[#0d0d11] transition-all duration-200 relative overflow-hidden [isolation:isolate] flex items-center gap-3.5 ${
            onSelectPlayer ? 'cursor-pointer group' : ''
          }`}
        >
          <PlayerAvatar
            portrait={currentProfile.portrait}
            frame={currentProfile.frame}
            name={currentProfile.name}
            size="lg"
            shape="circle"
            className="z-10"
          />

          <div className="min-w-0 flex-1 space-y-1 text-left z-10">
            <h4 className="font-heading font-bold text-sm sm:text-base text-white tracking-tight truncate group-hover:text-amber-300 transition-colors">
              {currentProfile.name}
            </h4>

            <p className="text-xs font-tech text-zinc-400 font-mono truncate">
              LVL <strong className="text-white font-bold">{currentProfile.level}</strong> • UID: {currentProfile.playerId}
            </p>
          </div>

          <div
            className="absolute right-0 top-0 bottom-0 w-1/2 sm:w-3/5 pointer-events-none overflow-hidden rounded-r-xl select-none z-0 flex items-center justify-end"
            style={{
              WebkitMaskImage: 'linear-gradient(to right, transparent 0%, transparent 15%, black 85%)',
              maskImage: 'linear-gradient(to right, transparent 0%, transparent 15%, black 85%)',
            }}
          >
            <SafeImage
              src={avatarSrc}
              alt=""
              hideOnError
              className="h-full w-full object-cover object-right scale-[1.05] opacity-30 filter contrast-125 saturate-125 transition-opacity duration-300 group-hover:opacity-45"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
