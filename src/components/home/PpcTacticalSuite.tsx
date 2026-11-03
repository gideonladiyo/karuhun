import React, { useState, useEffect } from 'react';
import { Calculator, Flame, ChevronRight, Sliders, Timer, ArrowUpRight, Clock } from 'lucide-react';
import {
  ADVANCED_PPC_SCORES,
  ULTIMATE_PPC_SCORES,
  getLiveOrStoredPpcBossesInfoAsync,
  getLiveOrStoredPpcBossesInfo,
  PPCBossInfo
} from '@/data/static/ppcScores';
import { SectionHeader } from '@/components/ui/section-header';
import { SegmentedTabs, SegmentedTabOption } from '@/components/ui/segmented-tabs';
import { Button } from '@/components/ui/button';
import { SafeImage } from '@/components/ui/safe-image';
import { formatHp, formatNumber } from '@/lib/format';

interface PpcTacticalSuiteProps {
  onOpenPpcTool: (subTab: 'bosses' | 'calculator') => void;
}

const PPC_TIER_OPTIONS: SegmentedTabOption<'ultimate' | 'advanced'>[] = [
  { value: 'ultimate', label: 'Ultimate' },
  { value: 'advanced', label: 'Advanced' },
];

export const PpcTacticalSuite: React.FC<PpcTacticalSuiteProps> = ({ onOpenPpcTool }) => {
  const [tier, setTier] = useState<'ultimate' | 'advanced'>('ultimate');
  const [clearSec, setClearSec] = useState<number>(10);

  const [bossesData, setBossesData] = useState<PPCBossInfo[]>(() => {
    return getLiveOrStoredPpcBossesInfo().bosses.slice(0, 4);
  });

  useEffect(() => {
    getLiveOrStoredPpcBossesInfoAsync().then((res) => {
      if (res && res.bosses && res.bosses.length > 0) {
        setBossesData(res.bosses.slice(0, 4));
      }
    });
  }, []);

  const scoresTable = tier === 'ultimate' ? ULTIMATE_PPC_SCORES : ADVANCED_PPC_SCORES;

  const getScoreForSec = (sec: number, diff: 'knight' | 'chaos' | 'hell') => {
    const clamped = Math.max(0, Math.min(60, sec));
    const entry = scoresTable[clamped];
    if (!entry) return 0;
    return entry[diff] || 0;
  };

  const knightScore = getScoreForSec(clearSec, 'knight');
  const chaosScore = getScoreForSec(clearSec, 'chaos');
  const hellScore = getScoreForSec(clearSec, 'hell');
  const totalSimulatedScore = knightScore + chaosScore + hellScore;

  return (
    <section className="relative w-full">
      <SectionHeader
        level="secondary"
        title="PPC Tools & Bosses"
        subtitle="Score simulator and boss HP directory."
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => onOpenPpcTool('calculator')}
            >
              <Calculator className="w-3.5 h-3.5 text-amber-400" />
              <span>Calculator</span>
            </Button>

            <Button
              variant="default"
              size="sm"
              onClick={() => onOpenPpcTool('bosses')}
            >
              <span>Boss Directory</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Button>
          </div>
        }
      />

      {/* Grid: Simulator (Left 5 cols) + 4 Boss Cards (Right 7 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Left 5 Cols: Quick Score Simulator */}
        <div className="lg:col-span-5 rounded-xl bg-[#121215] p-5 sm:p-6 border border-[#27272a] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between gap-2 mb-4">
              <div className="flex items-center space-x-2">
                <Sliders className="w-4 h-4 text-amber-400" />
                <span className="font-heading font-bold text-sm text-white">
                  Score Simulator
                </span>
              </div>

              <SegmentedTabs
                options={PPC_TIER_OPTIONS}
                value={tier}
                onChange={setTier}
                size="sm"
                activeVariant="amber"
              />
            </div>

            {/* Slider Control */}
            <div className="bg-[#09090b] border border-[#27272a] rounded-xl p-4 mb-4 space-y-3">
              <div className="flex items-center justify-between text-xs font-tech">
                <span className="text-zinc-400 flex items-center space-x-1.5">
                  <Timer className="w-3.5 h-3.5 text-zinc-500" />
                  <span>Average Clear Time:</span>
                </span>
                <span className="font-heading font-black text-amber-400 text-sm tabular-nums">
                  {clearSec}s <span className="text-xs text-zinc-500 font-normal">/ stage</span>
                </span>
              </div>

              <input
                type="range"
                min="0"
                max="60"
                value={clearSec}
                onChange={(e) => setClearSec(Number(e.target.value))}
                aria-label="Average clear time in seconds"
                className="w-full h-2 bg-[#18181b] rounded-lg appearance-none cursor-pointer accent-amber-400"
              />

              <div className="flex justify-between text-xs font-tech text-zinc-500">
                <span>0s (Max)</span>
                <span>30s</span>
                <span>60s (Base)</span>
              </div>
            </div>

            {/* Breakdown Rows */}
            <div className="space-y-2 mb-4 text-xs font-tech">
              <div className="flex justify-between p-2.5 rounded-lg bg-[#09090b] border border-[#27272a]">
                <span className="text-zinc-400">Knight Stage</span>
                <span className="font-bold text-white tabular-nums">{formatNumber(knightScore)}</span>
              </div>
              <div className="flex justify-between p-2.5 rounded-lg bg-[#09090b] border border-[#27272a]">
                <span className="text-zinc-400">Chaos Stage</span>
                <span className="font-bold text-white tabular-nums">{formatNumber(chaosScore)}</span>
              </div>
              <div className="flex justify-between p-2.5 rounded-lg bg-[#09090b] border border-[#27272a]">
                <span className="text-zinc-400">Hell Stage</span>
                <span className="font-bold text-white tabular-nums">{formatNumber(hellScore)}</span>
              </div>
            </div>
          </div>

          {/* Total Simulated Result & Action */}
          <div className="pt-4 border-t border-[#27272a]">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-tech text-zinc-400">Estimated Boss Total</span>
              <span className="font-heading font-black text-xl sm:text-2xl text-amber-400 tabular-nums">
                {formatNumber(totalSimulatedScore)}
              </span>
            </div>

            <Button
              variant="amber"
              size="default"
              onClick={() => onOpenPpcTool('calculator')}
              className="w-full"
            >
              <span>Open Compare Calculator</span>
              <ArrowUpRight className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Right 7 Cols: 4 Boss Cards Grid (2x2) */}
        <div className="lg:col-span-7 rounded-xl bg-[#121215] p-5 sm:p-6 border border-[#27272a] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <Flame className="w-4 h-4 text-purple-400" />
                <span className="font-heading font-bold text-sm text-white">
                  Featured PPC Bosses
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {bossesData.map((boss) => (
                <div
                  key={boss.slug || boss.name}
                  onClick={() => onOpenPpcTool('bosses')}
                  className="p-3.5 rounded-xl bg-[#09090b] hover:bg-[#18181b] border border-[#27272a] hover:border-zinc-500 transition-colors cursor-pointer group flex flex-col justify-between space-y-3"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center space-x-2.5 min-w-0">
                      <div className="w-11 h-11 rounded-xl bg-black border border-[#27272a] overflow-hidden p-1 flex-shrink-0 flex items-center justify-center group-hover:border-zinc-500 transition-colors">
                        <SafeImage
                          src={boss.imageUrl || '/logo.png'}
                          alt={boss.name}
                          hideOnError
                          className="w-full h-full object-contain filter contrast-125 group-hover:scale-105 transition-transform"
                        />
                      </div>

                      <div className="min-w-0">
                        <h4 className="font-heading font-bold text-sm text-white group-hover:text-amber-300 transition-colors truncate">
                          {boss.name}
                        </h4>
                        <div className="flex items-center space-x-1 text-xs font-tech text-zinc-400 mt-0.5">
                          <Clock className="w-3 h-3 text-zinc-500" />
                          <span>Delay: <strong className="text-zinc-200">{boss.startTimeSec}s</strong></span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* HP Specs Grid (Knight / Chaos / Hell) */}
                  <div className="grid grid-cols-3 gap-1.5 p-2 rounded-lg bg-[#121215] border border-[#27272a] text-center font-tech text-xs">
                    <div>
                      <div className="text-zinc-500 text-xs">Knight</div>
                      <div className="font-bold text-zinc-200 tabular-nums">{formatHp(boss.hpKnight)}</div>
                    </div>
                    <div className="border-x border-[#27272a]">
                      <div className="text-zinc-500 text-xs">Chaos</div>
                      <div className="font-bold text-zinc-200 tabular-nums">{formatHp(boss.hpChaos)}</div>
                    </div>
                    <div>
                      <div className="text-zinc-500 text-xs">Hell</div>
                      <div className="font-bold text-amber-400 tabular-nums">{formatHp(boss.hpHell)}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom Link */}
          <div className="pt-3.5 mt-3.5 border-t border-[#27272a] flex items-center justify-between text-xs font-sans text-zinc-400">
            <span>View all 39+ boss mechanics and delay charts</span>
            <button
              type="button"
              onClick={() => onOpenPpcTool('bosses')}
              className="text-white hover:text-amber-300 font-semibold flex items-center space-x-1 transition-colors"
            >
              <span>All Bosses</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};
