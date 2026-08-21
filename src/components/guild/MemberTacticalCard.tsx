import React from 'react';
import { GuildMember } from '@/types';
import { getHuaxuImageUrl } from '@/services/imageUtils';

interface MemberTacticalCardProps {
  member: GuildMember;
  server: string;
  onSelectPlayer: (uid: number, server: string) => void;
}

export function formatMemberActivity(lastLoginStr?: string): { text: string; badgeStyle: string; isInactive: boolean } {
  if (!lastLoginStr) {
    return {
      text: 'Inactive (No Record)',
      badgeStyle: 'bg-red-950/80 text-red-300 border-red-800/80',
      isInactive: true
    };
  }

  const loginDate = new Date(lastLoginStr);
  const now = new Date();
  const diffTimeMs = now.getTime() - loginDate.getTime();
  const diffDays = Math.floor(diffTimeMs / (1000 * 60 * 60 * 24));

  if (diffDays <= 1) {
    return {
      text: diffDays <= 0 ? 'Active Today' : '1 day ago',
      badgeStyle: 'bg-emerald-950/80 text-emerald-300 border-emerald-800/80',
      isInactive: false
    };
  } else if (diffDays >= 2 && diffDays <= 6) {
    return {
      text: `${diffDays} days ago`,
      badgeStyle: 'bg-amber-950/80 text-amber-300 border-amber-800/80',
      isInactive: false
    };
  } else {
    // >= 7 days considered inactive
    return {
      text: `${diffDays}d ago (Inactive)`,
      badgeStyle: 'bg-red-950/80 text-red-300 border-red-800/80',
      isInactive: true
    };
  }
}

export const MemberTacticalCard: React.FC<MemberTacticalCardProps> = ({
  member,
  server,
  onSelectPlayer
}) => {
  const hasCustomFrame = Boolean(member.frame && member.frame.trim() !== '');
  const activity = formatMemberActivity(member.lastLoginTime);

  return (
    <div
      onClick={() => onSelectPlayer(member.playerId, server)}
      className="minimal-card p-3.5 sm:p-4 flex items-center space-x-3.5 hover:border-zinc-500 hover:bg-[#151519] transition-all duration-200 cursor-pointer group bg-[#121215] relative overflow-hidden"
    >
      {/* Avatar Container: Pure portrait and frame without extra background or border wrapper */}
      <div className="relative w-12 h-12 sm:w-14 sm:h-14 flex-shrink-0 flex items-center justify-center group-hover:scale-105">
        {/* Custom Head Frame Image Layer (if exists) */}
        {hasCustomFrame && (
          <img
            src={getHuaxuImageUrl(member.frame)}
            alt="Avatar Frame"
            loading="lazy"
            decoding="async"
            className="absolute inset-0 w-full h-full object-contain pointer-events-none z-10 scale-125"
            onError={(e) => {
              (e.target as HTMLElement).style.display = 'none';
            }}
          />
        )}

        {/* Character Portrait */}
        <img
          src={getHuaxuImageUrl(member.portrait)}
          alt={member.name}
          loading="lazy"
          decoding="async"
          className="w-full h-full object-cover rounded-xl z-0 filter contrast-105 transition-transform"
          onError={(e) => {
            (e.target as HTMLImageElement).src = '/logo.png';
          }}
        />
      </div>

      {/* 3 Rows of Info: 1) Name, 2) ID & Level, 3) Active status */}
      <div className="min-w-0 flex-1 space-y-1">
        
        {/* Baris 1: Nama */}
        <h4 className="font-heading font-bold text-sm sm:text-base text-white group-hover:text-amber-300 transition-colors truncate">
          {member.name}
        </h4>

        {/* Baris 2: ID dan Level */}
        <p className="text-[11px] sm:text-xs font-tech text-zinc-400 truncate">
          ID: <strong className="text-zinc-200 font-mono">{member.playerId}</strong> • LVL <strong className="text-white">{member.level}</strong>
        </p>

        {/* Baris 3: Active Status */}
        <div className="pt-0.5">
          <span className={`text-[9px] sm:text-[10px] font-tech uppercase px-2 py-0.5 rounded-md border inline-block ${activity.badgeStyle}`}>
            {activity.text}
          </span>
        </div>

      </div>

    </div>
  );
};
