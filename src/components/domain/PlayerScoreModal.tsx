import React from 'react';
import { ArrowUpRight } from 'lucide-react';
import { Modal } from '@/components/admin/AdminPrimitives';
import { SafeImage } from '@/components/ui/safe-image';
import { PlayerAvatar } from '@/components/domain/PlayerAvatar';
import { FadedPortrait } from '@/components/domain/FadedPortrait';
import { MemberCompetitiveAchievement } from '@/services/rankingUtils';
import { getHuaxuImageUrl, getConstructRankLabel } from '@/services/imageUtils';
import { formatNumber } from '@/lib/format';

interface PlayerScoreModalProps {
  member: MemberCompetitiveAchievement | null;
  onClose: () => void;
  onOpenProfile: (playerId: number, server: string) => void;
}

const Stat: React.FC<{ label: string; value: string; sub: string }> = ({ label, value, sub }) => (
  <div className="min-w-0 rounded-xl border border-[#27272a] bg-[#121215] px-3.5 py-3">
    <div className="text-xs sm:text-sm text-zinc-500">{label}</div>
    <div className="text-xl sm:text-2xl font-semibold text-white tabular-nums truncate">{value}</div>
    <div className="text-xs sm:text-sm text-zinc-500 truncate">{sub}</div>
  </div>
);

export const PlayerScoreModal: React.FC<PlayerScoreModalProps> = ({ member, onClose, onOpenProfile }) => {
  if (!member) return null;
  const { warzone, ppc } = member;

  return (
    <Modal
      open
      onClose={onClose}
      maxWidthClass="max-w-md"
      maxHeightClass="max-h-[95dvh]"
      title="Competitive Score"
    >
      <div className="space-y-4">
        <button
          type="button"
          onClick={() => onOpenProfile(member.id, member.server)}
          className="group relative w-full flex items-center gap-3.5 sm:gap-4 p-4 rounded-xl border border-[#27272a] hover:border-zinc-500 bg-gradient-to-r from-[#181820] via-[#121215] to-[#0d0d11] text-left overflow-hidden [isolation:isolate] transition-colors"
        >
          <PlayerAvatar
            portrait={member.portrait}
            frame={member.frame}
            alt={member.name}
            size="lg"
            shape="circle"
            className="z-10"
          />
          <div className="min-w-0 flex-1 z-10">
            <div className="font-heading font-bold text-xl sm:text-2xl text-white tracking-tight truncate group-hover:text-amber-300 transition-colors">
              {member.name}
            </div>
            <div className="text-sm sm:text-base text-zinc-400 truncate">
              {member.guildName} · {member.server.toUpperCase()}
            </div>
            <div className="text-xs font-tech font-mono text-zinc-500 truncate">UID: {member.id}</div>
          </div>
          <ArrowUpRight className="w-4 h-4 shrink-0 self-start z-10 text-zinc-500 group-hover:text-white transition-colors" />

          <FadedPortrait
            src={getHuaxuImageUrl(member.portrait)}
            className="inset-y-0 right-0 w-3/5 rounded-r-xl z-0"
            imgClassName="group-hover:opacity-45"
          />
        </button>

        <div className="grid grid-cols-2 gap-3">
          <Stat
            label="Warzone"
            value={warzone ? formatNumber(warzone.score) : '—'}
            sub={warzone ? `${warzone.tierLabel} · #${warzone.rank}` : 'Not ranked'}
          />
          <Stat
            label="PPC"
            value={ppc ? formatNumber(ppc.score) : '—'}
            sub={ppc ? `${ppc.level} · #${ppc.rank}` : 'Not ranked'}
          />
        </div>

        {warzone && warzone.zones.length > 0 && (
          <ul className="divide-y divide-[#1f1f23] border-t border-[#27272a]">
            {warzone.zones.map((zone) => (
              <li key={zone.id} className="py-3 last:pb-0 space-y-2">
                <div className="flex items-baseline justify-between gap-3">
                  <span className="text-sm sm:text-base text-zinc-300 truncate">{zone.name}</span>
                  <span className="text-base sm:text-lg font-semibold text-white tabular-nums">
                    {formatNumber(zone.score)}
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-3 sm:gap-4 px-2 sm:px-4">
                  {zone.characters.map((c) => {
                    const rank = getConstructRankLabel(c.rank).label;
                    return (
                      <div
                        key={c.id}
                        className="relative aspect-square"
                        title={`${c.characterName}: ${c.frameName} · ${rank} · BP ${formatNumber(c.bp)}${
                          c.cubName ? ` · ${c.cubName}` : ''
                        }`}
                      >
                        <SafeImage
                          src={getHuaxuImageUrl(c.icon)}
                          alt={c.characterName}
                          className="w-full h-full rounded-lg bg-[#18181b] object-cover"
                        />
                        <span className="absolute bottom-1 left-1 px-1.5 rounded bg-black/75 text-[11px] font-semibold text-white leading-5">
                          {rank}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </Modal>
  );
};
