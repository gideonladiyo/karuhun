import React, { useState, useEffect } from 'react';
import { Skull, Calculator, Flame, Zap, ShieldAlert, Sparkles, ChevronRight, Sliders, Timer, ArrowUpRight, Clock, Swords } from 'lucide-react';
import { 
  ADVANCED_PPC_SCORES, 
  ULTIMATE_PPC_SCORES, 
  getLiveOrStoredPpcBossesInfoAsync, 
  getLiveOrStoredPpcBossesInfo,
  PPCBossInfo 
} from '@/data/static/ppcScores';
import { MainTab } from '@/pages/HomePage';

interface PpcTacticalSuiteProps {
  onOpenPpcTool: (subTab: 'bosses' | 'calculator') => void;
}

export const PpcTacticalSuite: React.FC<PpcTacticalSuiteProps> = ({ onOpenPpcTool }) => {
  // Score Simulator State
  const [tier, setTier] = useState<'ultimate' | 'advanced'>('ultimate');
  const [clearSec, setClearSec] = useState<number>(10); // Clear seconds per stage slider

  // Boss Preview State (Fixed 4 square boss cards)
  const [bossesData, setBossesData] = useState<PPCBossInfo[]>(() => {
    return getLiveOrStoredPpcBossesInfo().bosses.slice(0, 4);
  });
  const [loadingBosses, setLoadingBosses] = useState<boolean>(true);

  useEffect(() => {
    getLiveOrStoredPpcBossesInfoAsync().then((res) => {
      if (res && res.bosses && res.bosses.length > 0) {
        setBossesData(res.bosses.slice(0, 4));
      }
      setLoadingBosses(false);
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

  const getWeaknessBadgeColor = (weakness: string) => {
    const lower = weakness.toLowerCase();
    if (lower.includes('fire')) return 'bg-orange-950/50 text-orange-400 border-orange-500/40';
    if (lower.includes('light') || lower.includes('lightning')) return 'bg-amber-950/50 text-amber-300 border-amber-500/40';
    if (lower.includes('dark')) return 'bg-purple-950/50 text-purple-300 border-purple-500/40';
    if (lower.includes('ice') || lower.includes('frost')) return 'bg-sky-950/50 text-sky-300 border-sky-500/40';
    if (lower.includes('phys')) return 'bg-zinc-800 text-zinc-300 border-zinc-600';
    return 'bg-emerald-950/50 text-emerald-300 border-emerald-500/40';
  };

  // Helper to shorten HP display (e.g. 19200000 -> 19.2M)
  const formatHp = (num?: number) => {
    if (!num) return '-';
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(0)}k`;
    return num.toString();
  };

  return (
    <section className="relative w-full mb-14 sm:mb-20 animate-fadeIn">
      
      {/* Section Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6 sm:mb-8 pb-4 border-b border-[#27272a]">
        <div>
          <h2 className="font-heading font-black text-2xl sm:text-4xl text-white tracking-tight">
            PPC CALCULATION & BOSS DATA
          </h2>
          <p className="text-zinc-400 text-xs sm:text-sm font-sans mt-1">
            Interactive clear time score simulator and real-time boss telemetry directory with HP pools and elemental weaknesses.
          </p>
        </div>

        {/* Global PPC CTAs */}
        <div className="flex items-center space-x-2">
          <button
            onClick={() => onOpenPpcTool('calculator')}
            className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-[#18181b] hover:bg-zinc-800 text-zinc-200 hover:text-white border border-[#27272a] text-xs font-heading font-bold transition-all focus-tactical"
          >
            <Calculator className="w-3.5 h-3.5 text-amber-400" />
            <span>CALCULATOR</span>
          </button>

          <button
            onClick={() => onOpenPpcTool('bosses')}
            className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-white hover:bg-zinc-200 text-black text-xs font-heading font-bold transition-all focus-tactical shadow-sm"
          >
            <span>BOSS DIRECTORY</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Grid: Simulator (Left) + 4 Square Boss Cards (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        
        {/* Left 5 Cols: Quick Score Simulator */}
        <div className="lg:col-span-5 p-1 rounded-2xl sm:rounded-3xl bg-[#18181b]/50 border border-[#27272a] flex flex-col">
          <div className="h-full rounded-xl sm:rounded-2xl bg-[#0d0d11] p-5 sm:p-6 border border-[#27272a]/60 bracket-corner flex flex-col justify-between">
            
            <div>
              {/* Header */}
              <div className="flex items-center justify-between gap-2 mb-4">
                <div className="flex items-center space-x-2">
                  <Sliders className="w-4 h-4 text-amber-500" />
                  <span className="font-heading font-bold text-sm text-white">
                    QUICK SCORE SIMULATOR
                  </span>
                </div>

                {/* Tier Switcher */}
                <div className="flex items-center bg-[#121215] p-0.5 rounded-lg border border-[#27272a]">
                  <button
                    onClick={() => setTier('ultimate')}
                    className={`px-2.5 py-1 rounded-md text-[10px] font-tech font-bold transition-all ${
                      tier === 'ultimate'
                        ? 'bg-amber-400 text-black shadow-sm'
                        : 'text-zinc-400 hover:text-white'
                    }`}
                  >
                    ULTIMATE
                  </button>
                  <button
                    onClick={() => setTier('advanced')}
                    className={`px-2.5 py-1 rounded-md text-[10px] font-tech font-bold transition-all ${
                      tier === 'advanced'
                        ? 'bg-amber-400 text-black shadow-sm'
                        : 'text-zinc-400 hover:text-white'
                    }`}
                  >
                    ADVANCED
                  </button>
                </div>
              </div>

              {/* Slider Control */}
              <div className="bg-[#121215] border border-[#27272a] rounded-xl p-4 mb-4 space-y-3">
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
                  className="w-full h-2 bg-[#18181b] rounded-lg appearance-none cursor-pointer accent-amber-400"
                />

                <div className="flex justify-between text-[10px] font-tech text-zinc-600">
                  <span>0s (Max Score)</span>
                  <span>30s</span>
                  <span>60s (Base)</span>
                </div>
              </div>

              {/* Breakdown Rows */}
              <div className="space-y-2 mb-4 text-xs font-tech">
                <div className="flex justify-between p-2.5 rounded-lg bg-[#121215] border border-[#27272a]/70">
                  <span className="text-zinc-400">Knight Stage:</span>
                  <span className="font-bold text-white tabular-nums">{knightScore.toLocaleString()}</span>
                </div>
                <div className="flex justify-between p-2.5 rounded-lg bg-[#121215] border border-[#27272a]/70">
                  <span className="text-zinc-400">Chaos Stage:</span>
                  <span className="font-bold text-white tabular-nums">{chaosScore.toLocaleString()}</span>
                </div>
                <div className="flex justify-between p-2.5 rounded-lg bg-[#121215] border border-[#27272a]/70">
                  <span className="text-zinc-400">Hell Stage:</span>
                  <span className="font-bold text-white tabular-nums">{hellScore.toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* Total Simulated Result & Action */}
            <div className="pt-4 border-t border-[#27272a]/70">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-tech text-zinc-400 uppercase">Estimated Boss Total:</span>
                <span className="font-heading font-black text-xl sm:text-2xl text-amber-400 tabular-nums">
                  {totalSimulatedScore.toLocaleString()}
                </span>
              </div>

              <button
                onClick={() => onOpenPpcTool('calculator')}
                className="w-full flex items-center justify-center space-x-2 p-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-black font-heading font-bold text-xs transition-all focus-tactical shadow-sm"
              >
                <span>OPEN FULL COMPARE CALCULATOR</span>
                <ArrowUpRight className="w-4 h-4" />
              </button>
            </div>

          </div>
        </div>

        {/* Right 7 Cols: 4 Square Boss Cards Grid (2x2) */}
        <div className="lg:col-span-7 p-1 rounded-2xl sm:rounded-3xl bg-[#18181b]/50 border border-[#27272a] flex flex-col">
          <div className="h-full rounded-xl sm:rounded-2xl bg-[#0d0d11] p-5 sm:p-6 border border-[#27272a]/60 bracket-corner flex flex-col justify-between">
            
            <div>
              {/* Header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <Flame className="w-4 h-4 text-purple-400" />
                  <span className="font-heading font-bold text-sm text-white">
                    LATEST PPC BOSSES
                  </span>
                </div>
              </div>

              {/* 4 Square Cards (2x2 Grid) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {bossesData.map((boss) => (
                  <div
                    key={boss.slug || boss.name}
                    onClick={() => onOpenPpcTool('bosses')}
                    className="p-3.5 rounded-xl bg-[#121215] hover:bg-[#18181b] border border-[#27272a] hover:border-zinc-500 transition-all cursor-pointer group flex flex-col justify-between space-y-3"
                  >
                    {/* Top: Image, Difficulty & Weakness */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center space-x-2.5 min-w-0">
                        {/* Boss Icon */}
                        <div className="w-11 h-11 rounded-xl bg-black border border-[#27272a] overflow-hidden p-1 flex-shrink-0 flex items-center justify-center group-hover:border-amber-500/50 transition-colors">
                          <img
                            src={boss.imageUrl || '/logo.png'}
                            alt={boss.name}
                            onError={(e) => {
                              (e.target as HTMLElement).style.display = 'none';
                            }}
                            className="w-full h-full object-contain filter contrast-125 group-hover:scale-105 transition-transform"
                          />
                        </div>

                        <div className="min-w-0">
                          <h4 className="font-heading font-black text-sm text-white group-hover:text-amber-300 transition-colors truncate">
                            {boss.name}
                          </h4>
                          <div className="flex items-center space-x-1 text-[10px] font-tech text-zinc-500 mt-0.5">
                            <Clock className="w-3 h-3 text-zinc-400" />
                            <span>Delay: <strong className="text-zinc-300">{boss.startTimeSec}s</strong></span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Middle / Bottom: HP Specs Grid (Knight / Chaos / Hell) */}
                    <div className="grid grid-cols-3 gap-1.5 p-2 rounded-lg bg-[#09090b] border border-[#27272a]/70 text-center font-tech text-[10px]">
                      <div>
                        <div className="text-zinc-500 text-[9px]">KNIGHT</div>
                        <div className="font-bold text-zinc-200 tabular-nums">{formatHp(boss.hpKnight)}</div>
                      </div>
                      <div className="border-x border-[#27272a]/70">
                        <div className="text-zinc-500 text-[9px]">CHAOS</div>
                        <div className="font-bold text-zinc-200 tabular-nums">{formatHp(boss.hpChaos)}</div>
                      </div>
                      <div>
                        <div className="text-zinc-500 text-[9px]">HELL</div>
                        <div className="font-bold text-amber-400 tabular-nums">{formatHp(boss.hpHell)}</div>
                      </div>
                    </div>

                    {/* Hover Footer */}
                    <div className="flex items-center justify-between text-[10px] font-tech text-zinc-500 group-hover:text-zinc-300 transition-colors pt-1 border-t border-[#27272a]/40">
                      <span>Full Boss Statistic</span>
                      <ChevronRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                    </div>

                  </div>
                ))}
              </div>
            </div>

            {/* Bottom Link */}
            <div className="pt-3.5 mt-3.5 border-t border-[#27272a]/70 flex items-center justify-between text-xs font-tech text-zinc-400">
              <span>Looking for all 39+ boss mechanics &amp; delay charts?</span>
              <button
                onClick={() => onOpenPpcTool('bosses')}
                className="text-amber-400 hover:text-amber-300 font-bold flex items-center space-x-1"
              >
                <span>VIEW ALL 39+ BOSSES</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

          </div>
        </div>

      </div>

    </section>
  );
};
