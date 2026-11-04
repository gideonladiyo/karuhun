import React from 'react';
import { GuildMember } from '@/types';
import { PlayerAvatar } from '@/components/domain/PlayerAvatar';
import { FadedPortrait } from '@/components/domain/FadedPortrait';
import { getHuaxuImageUrl } from '@/services/imageUtils';
import { formatMemberActivity } from '@/lib/memberActivity';
import { formatNumber } from '@/lib/format';
import { cn } from '@/lib/utils';

export { formatMemberActivity };

interface MemberTacticalCardProps {
  member: GuildMember;
  server: string;
  onSelectPlayer: (uid: number, server: string) => void;
}

export const MemberTacticalCard: React.FC<MemberTacticalCardProps> = ({ member, server, onSelectPlayer }) => {
  const activity = formatMemberActivity(member.lastLoginTime);

  return (
    <button
      type="button"
      onClick={() => onSelectPlayer(member.playerId, server)}
      className={cn(
        'group relative w-full overflow-hidden [isolation:isolate] flex items-center gap-3.5 p-3.5 sm:p-4 rounded-2xl text-left',
        'border border-[#27272a] bg-gradient-to-r from-[#16161b] via-[#121215] to-[#0f0f13]',
        'hover:border-zinc-500 active:scale-[0.99] transition-all duration-200',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/70',
        activity.isInactive && 'opacity-70 hover:opacity-100'
      )}
    >
      <FadedPortrait
        src={getHuaxuImageUrl(member.portrait)}
        className="inset-y-0 right-0 w-1/2 -z-10"
        imgClassName="opacity-15 group-hover:opacity-35"
      />

      <PlayerAvatar portrait={member.portrait} frame={member.frame} alt={member.name} size="lg" shape="circle" />

      <div className="min-w-0 flex-1 space-y-0.5">
        <div className="font-heading font-semibold text-sm sm:text-base text-white truncate group-hover:text-amber-300 transition-colors">
          {member.name}
        </div>
        <div className="text-xs text-zinc-400 truncate">
          Lv <span className="text-zinc-200 tabular-nums">{member.level}</span>
          {member.contributeWeek ? (
            <>
              <span className="text-zinc-700"> · </span>
              <span className="tabular-nums">{formatNumber(member.contributeWeek)}</span> this week
            </>
          ) : null}
        </div>
        <span
          className={cn(
            'inline-block mt-1 text-[10px] font-tech uppercase px-1.5 py-0.5 rounded-md border leading-none',
            activity.badgeStyle
          )}
        >
          {activity.text}
        </span>
      </div>
    </button>
  );
};
