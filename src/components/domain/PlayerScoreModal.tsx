import React from 'react';
import { ArrowUpRight } from 'lucide-react';
import { Modal } from '@/components/admin/AdminPrimitives';
import { Button } from '@/components/ui/button';
import { SafeImage } from '@/components/ui/safe-image';
import { PlayerAvatar } from '@/components/domain/PlayerAvatar';
import { MemberCompetitiveAchievement, getTotalScore } from '@/services/rankingUtils';
import { getHuaxuImageUrl, getConstructRankLabel } from '@/services/imageUtils';
import { formatNumber } from '@/lib/format';

interface PlayerScoreModalProps {
  member: MemberCompetitiveAchievement | null;
  onClose: () => void;
  onOpenProfile: (playerId: number, server: string) => void;
}

const Stat: React.FC<{ label: string; value: string; sub?: string }> = ({ label, value, sub }) => (
  <div className="min-w-0">
    <div className="text-xs text-zinc-500">{label}</div>
    <div className="text-lg font-semibold text-white tabular-nums truncate">{value}</div>
    {sub && <div className="text-xs text-zinc-500 truncate">{sub}</div>}
  </div>
);

export const PlayerScoreModal: React.FC<PlayerScoreModalProps> = ({ member, onClose, onOpenProfile }) => {
  if (!member) return null;
  const { warzone, ppc } = member;

  return (
    <Modal
      open
      onClose={onClose}
      maxWidthClass="max-w-2xl"
      title={
        <span className="flex items-center gap-3 min-w-0">
          <PlayerAvatar portrait={member.portrait} frame={member.frame} alt={member.name} size="sm" />
          <span className="truncate">{member.name}</span>
        </span>
      }
      subtitle={`${member.guildName} · ${member.server.toUpperCase()} · ID ${member.id}`}
      footer={
        <div className="flex justify-end">
          <Button type="button" variant="secondary" size="sm" onClick={() => onOpenProfile(member.id, member.server)}>
            <span>Open profile</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Button>
        </div>
      }
    >
      <div className="space-y-6">
        <div className="grid grid-cols-3 gap-4 pb-5 border-b border-[#27272a]">
          <Stat label="Total" value={formatNumber(getTotalScore(member))} />
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

        <section className="space-y-3">
          <h4 className="text-sm font-semibold text-white">Warzone setup</h4>
          {!warzone || warzone.zones.length === 0 ? (
            <p className="text-sm text-zinc-500">No Warzone record this week.</p>
          ) : (
            <div className="divide-y divide-[#1f1f23]">
              {warzone.zones.map((zone) => (
                <div key={zone.id} className="py-3 first:pt-0 last:pb-0 space-y-2.5">
                  <div className="flex items-baseline justify-between gap-3">
                    <span className="text-sm text-zinc-200">{zone.name}</span>
                    <span className="text-sm text-white font-semibold tabular-nums">{formatNumber(zone.score)}</span>
                  </div>
                  <ul className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    {zone.characters.map((c) => (
                      <li key={c.id} className="flex items-center gap-2.5 min-w-0">
                        <SafeImage
                          src={getHuaxuImageUrl(c.icon)}
                          alt={c.characterName}
                          className="w-10 h-10 rounded-lg bg-[#18181b] object-cover shrink-0"
                        />
                        <div className="min-w-0 text-xs leading-tight">
                          <div className="text-zinc-100 font-medium truncate">
                            {c.characterName}: {c.frameName}
                          </div>
                          <div className="text-zinc-500 truncate">
                            {getConstructRankLabel(c.rank).label} · BP {formatNumber(c.bp)}
                          </div>
                          {c.cubName && <div className="text-zinc-500 truncate">{c.cubName}</div>}
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="space-y-2">
          <h4 className="text-sm font-semibold text-white">PPC</h4>
          {ppc ? (
            <p className="text-sm text-zinc-400">
              {ppc.level}, rank #{ppc.rank} with {formatNumber(ppc.score)} pts. The API doesn't publish PPC teams or
              per-boss scores.
            </p>
          ) : (
            <p className="text-sm text-zinc-500">Not in the PPC top 100 this week.</p>
          )}
        </section>
      </div>
    </Modal>
  );
};
