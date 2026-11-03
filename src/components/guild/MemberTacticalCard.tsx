import React from 'react';
import { GuildMember } from '@/types';
import { PlayerAvatar } from '@/components/domain/PlayerAvatar';
import { formatMemberActivity } from '@/lib/memberActivity';

export { formatMemberActivity };

interface MemberTacticalCardProps {
  member: GuildMember;
  server: string;
  onSelectPlayer: (uid: number, server: string) => void;
}

export const MemberTacticalCard: React.FC<MemberTacticalCardProps> = ({
  member,
  server,
  onSelectPlayer
}) => {
  const activity = formatMemberActivity(member.lastLoginTime);

  return (
    <div
      onClick={() => onSelectPlayer(member.playerId, server)}
      className="minimal-card p-3.5 sm:p-4 flex items-center space-x-3.5 hover:border-zinc-500 hover:bg-[#151519] transition-all duration-200 cursor-pointer group bg-[#121215] relative overflow-hidden"
    >
      {/* Avatar Container */}
      <PlayerAvatar
        portrait={member.portrait}
        frame={member.frame}
        alt={member.name}
        size="lg"
        shape="rounded"
        className="group-hover:scale-105 transition-transform"
      />

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
