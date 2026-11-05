import React, { useState } from 'react';
import { ArrowUpRight } from 'lucide-react';
import { getPpcStageScore, PpcStage, PpcTier, PPC_MAX_SEC } from '@/data/static/ppcScores';
import { SectionHeader } from '@/components/ui/section-header';
import { SegmentedTabs, SegmentedTabOption } from '@/components/ui/segmented-tabs';
import { Button } from '@/components/ui/button';
import { formatNumber } from '@/lib/format';

interface PpcTacticalSuiteProps {
  onOpenPpcTool: (subTab: 'bosses' | 'calculator') => void;
}

const PPC_TIER_OPTIONS: SegmentedTabOption<PpcTier>[] = [
  { value: 'ultimate', label: 'Ultimate' },
  { value: 'advanced', label: 'Advanced' },
];

const STAGES: { key: PpcStage; label: string }[] = [
  { key: 'knight', label: 'Knight' },
  { key: 'chaos', label: 'Chaos' },
  { key: 'hell', label: 'Hell' },
];

export const PpcTacticalSuite: React.FC<PpcTacticalSuiteProps> = ({ onOpenPpcTool }) => {
  const [tier, setTier] = useState<PpcTier>('ultimate');
  const [clearSec, setClearSec] = useState<number>(10);

  const scores = STAGES.map((s) => getPpcStageScore(tier, s.key, clearSec));
  const total = scores.reduce((sum, n) => sum + n, 0);

  return (
    <section className="relative w-full">
      <SectionHeader
        level="secondary"
        title="PPC Score Calculator"
        subtitle="Quick estimate for one boss, assuming the same clear time on every stage."
        actions={
          <Button variant="secondary" size="sm" onClick={() => onOpenPpcTool('calculator')}>
            <span>Compare runs</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Button>
        }
      />

      <div className="rounded-xl bg-[#121215] border border-[#27272a] grid grid-cols-1 md:grid-cols-2">
        <div className="p-5 sm:p-6 space-y-6 border-b md:border-b-0 md:border-r border-[#27272a]">
          <div className="flex items-center justify-between gap-3">
            <span className="text-xs font-tech text-zinc-400">Tier</span>
            <SegmentedTabs options={PPC_TIER_OPTIONS} value={tier} onChange={setTier} size="sm" ariaLabel="PPC tier" />
          </div>

          <div className="space-y-3">
            <div className="flex items-baseline justify-between gap-3">
              <label htmlFor="home-ppc-clear" className="text-xs font-tech text-zinc-400">
                Clear time per stage
              </label>
              <span className="font-heading font-bold text-2xl text-white tabular-nums">
                {clearSec}
                <span className="text-sm text-zinc-500 font-normal ml-0.5">s</span>
              </span>
            </div>
            <input
              id="home-ppc-clear"
              type="range"
              min={0}
              max={PPC_MAX_SEC}
              value={clearSec}
              onChange={(e) => setClearSec(Number(e.target.value))}
              className="w-full cursor-pointer accent-amber-400"
            />
            <div className="flex justify-between text-[11px] font-tech text-zinc-500 tabular-nums">
              <span>0s</span>
              <span>30s</span>
              <span>60s</span>
            </div>
          </div>
        </div>

        <div className="p-5 sm:p-6 flex flex-col justify-between gap-5">
          <dl className="divide-y divide-[#27272a] text-sm">
            {STAGES.map((s, i) => (
              <div key={s.key} className="flex justify-between py-2.5 first:pt-0">
                <dt className="text-zinc-400">{s.label}</dt>
                <dd className="font-tech font-bold text-zinc-100 tabular-nums">{formatNumber(scores[i])}</dd>
              </div>
            ))}
          </dl>
          <div className="flex items-end justify-between gap-3 pt-4 border-t border-[#27272a]">
            <span className="text-xs font-tech text-zinc-400">Boss total</span>
            <span className="font-heading font-black text-3xl text-amber-400 tabular-nums leading-none">
              {formatNumber(total)}
            </span>
          </div>
        </div>
      </div>
    </section>
  );
};
