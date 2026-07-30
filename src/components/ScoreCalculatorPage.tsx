import React, { useState, useEffect } from 'react';
import { ADVANCED_PPC_SCORES, ULTIMATE_PPC_SCORES, PPC_BOSSES, PPCBossInfo } from '../data/ppc_scores';
import { Calculator, Copy, Check, Clock, Trophy, Flame, Sparkles, Sliders, ArrowRight } from 'lucide-react';

interface ScoreCalculatorPageProps {
  initialBossSlug?: string;
}

export const ScoreCalculatorPage: React.FC<ScoreCalculatorPageProps> = ({ initialBossSlug }) => {
  const [calcMode, setCalcMode] = useState<'single' | 'compare'>('compare');
  const [tier, setTier] = useState<'ultimate' | 'advanced'>('ultimate');
  
  // Single mode state
  const [knightSec, setKnightSec] = useState<number>(5);
  const [chaosSec, setChaosSec] = useState<number>(10);
  const [hellSec, setHellSec] = useState<number>(15);

  // Compare mode state (Run A, Run B, Run C)
  const [compareRunsCount, setCompareRunsCount] = useState<2 | 3>(2);
  const [bossesCount, setBossesCount] = useState<1 | 2 | 3>(1); // 1 Boss (3 timers), 2 Bosses (6 timers), 3 Bosses (9 timers)

  // Timers array for Run A, Run B, Run C (max 9 timers per run)
  const [runATimers, setRunATimers] = useState<number[]>([5, 10, 15, 5, 10, 15, 5, 10, 15]);
  const [runBTimers, setRunBTimers] = useState<number[]>([8, 12, 18, 8, 12, 18, 8, 12, 18]);
  const [runCTimers, setRunCTimers] = useState<number[]>([10, 15, 20, 10, 15, 20, 10, 15, 20]);

  const [copied, setCopied] = useState<boolean>(false);

  const scoresTable = tier === 'ultimate' ? ULTIMATE_PPC_SCORES : ADVANCED_PPC_SCORES;

  const getScoreForSec = (sec: number, diff: 'knight' | 'chaos' | 'hell') => {
    const clamped = Math.max(0, Math.min(60, sec));
    const entry = scoresTable[clamped];
    if (!entry) return 0;
    return entry[diff] || 0;
  };

  // Compute total for an array of timers based on bossesCount
  const calculateRunTotal = (timers: number[]) => {
    const totalTimersNeeded = bossesCount * 3;
    let total = 0;

    for (let i = 0; i < totalTimersNeeded; i += 3) {
      const k = getScoreForSec(timers[i] || 0, 'knight');
      const c = getScoreForSec(timers[i + 1] || 0, 'chaos');
      const h = getScoreForSec(timers[i + 2] || 0, 'hell');
      total += k + c + h;
    }

    return total;
  };

  const handleUpdateTimer = (run: 'A' | 'B' | 'C', index: number, value: number) => {
    const clamped = Math.max(0, Math.min(60, value));
    if (run === 'A') {
      const next = [...runATimers];
      next[index] = clamped;
      setRunATimers(next);
    } else if (run === 'B') {
      const next = [...runBTimers];
      next[index] = clamped;
      setRunBTimers(next);
    } else if (run === 'C') {
      const next = [...runCTimers];
      next[index] = clamped;
      setRunCTimers(next);
    }
  };

  // Single mode calculation
  const singleKnightScore = getScoreForSec(knightSec, 'knight');
  const singleChaosScore = getScoreForSec(chaosSec, 'chaos');
  const singleHellScore = getScoreForSec(hellSec, 'hell');
  const singleTotalScore = singleKnightScore + singleChaosScore + singleHellScore;

  // Compare mode calculations
  const totalA = calculateRunTotal(runATimers);
  const totalB = calculateRunTotal(runBTimers);
  const totalC = calculateRunTotal(runCTimers);

  // Formatted Discord Agus Bot Command String Generator
  const generateDiscordCommand = () => {
    const botPrefix = tier === 'ultimate' ? '!ult' : '!adv';
    
    if (calcMode === 'single') {
      return `${botPrefix}total ${knightSec} ${chaosSec} ${hellSec}`;
    }

    const totalTimersNeeded = bossesCount * 3;
    const timersAStr = runATimers.slice(0, totalTimersNeeded).join(' ');
    const timersBStr = runBTimers.slice(0, totalTimersNeeded).join(' ');
    
    if (compareRunsCount === 2) {
      return `!comparetotal ${timersAStr} vs ${timersBStr}`;
    } else {
      const timersCStr = runCTimers.slice(0, totalTimersNeeded).join(' ');
      return `!comparetotal ${timersAStr} vs ${timersBStr} vs ${timersCStr}`;
    }
  };

  const handleCopyCommand = () => {
    const cmd = generateDiscordCommand();
    navigator.clipboard.writeText(cmd);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6 sm:space-y-8 animate-fadeIn pb-16 md:pb-0">
      
      {/* Header Banner */}
      <div className="minimal-card p-5 sm:p-8 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-[#18181b] border border-[#27272a] text-zinc-300 text-xs font-tech font-bold uppercase tracking-wider">
              <Calculator className="w-3.5 h-3.5 text-white" />
              <span>Agus Bot Command Simulator Engine</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-heading font-bold text-white">
              PPC SCORE <span className="text-zinc-500 font-normal">SIMULATOR &amp; COMPARE</span>
            </h1>
            <p className="text-xs font-tech text-zinc-400">
              Calculate PPC total scores and compare multi-run outcomes (3, 6, or 9 timers) for Discord bot commands
            </p>
          </div>

          {/* Mode Switcher Tabs */}
          <div className="flex items-center bg-black p-1 rounded-xl border border-[#27272a]">
            <button
              onClick={() => setCalcMode('compare')}
              className={`px-4 py-2 rounded-lg text-xs font-heading font-bold transition-all ${
                calcMode === 'compare' ? 'bg-white text-black shadow-sm' : 'text-zinc-400 hover:text-white'
              }`}
            >
              COMPARE RUNS
            </button>
            <button
              onClick={() => setCalcMode('single')}
              className={`px-4 py-2 rounded-lg text-xs font-heading font-bold transition-all ${
                calcMode === 'single' ? 'bg-white text-black shadow-sm' : 'text-zinc-400 hover:text-white'
              }`}
            >
              SINGLE RUN
            </button>
          </div>
        </div>
      </div>

      {/* Calculator Configuration Controls */}
      <div className="minimal-card p-5 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          
          {/* Tier Select */}
          <div className="space-y-1.5">
            <label className="text-xs font-tech text-zinc-300 font-bold uppercase block">
              PPC DIFFICULTY TIER
            </label>
            <select
              value={tier}
              onChange={(e) => setTier(e.target.value as any)}
              className="w-full bg-[#09090b] text-xs font-tech font-bold text-white border border-[#27272a] rounded-xl px-3 py-2.5 focus:outline-none cursor-pointer"
            >
              <option value="ultimate">Ultimate PPC (High Score Cap)</option>
              <option value="advanced">Advanced PPC</option>
            </select>
          </div>

          {calcMode === 'compare' && (
            <>
              {/* Number of Runs Compare Select */}
              <div className="space-y-1.5">
                <label className="text-xs font-tech text-zinc-300 font-bold uppercase block">
                  COMPARE RUNS COUNT
                </label>
                <select
                  value={compareRunsCount}
                  onChange={(e) => setCompareRunsCount(Number(e.target.value) as any)}
                  className="w-full bg-[#09090b] text-xs font-tech font-bold text-white border border-[#27272a] rounded-xl px-3 py-2.5 focus:outline-none cursor-pointer"
                >
                  <option value={2}>2 Runs (Run A vs Run B)</option>
                  <option value={3}>3 Runs (Run A vs Run B vs Run C)</option>
                </select>
              </div>

              {/* Number of Bosses (3, 6, 9 Timers) Select */}
              <div className="space-y-1.5">
                <label className="text-xs font-tech text-zinc-300 font-bold uppercase block">
                  STAGE STACK / BOSS COUNT
                </label>
                <select
                  value={bossesCount}
                  onChange={(e) => setBossesCount(Number(e.target.value) as any)}
                  className="w-full bg-[#09090b] text-xs font-tech font-bold text-white border border-[#27272a] rounded-xl px-3 py-2.5 focus:outline-none cursor-pointer"
                >
                  <option value={1}>1 Boss (3 Timers - K / C / H)</option>
                  <option value={2}>2 Bosses (6 Timers - 2 Bosses Clearance)</option>
                  <option value={3}>3 Bosses (9 Timers - Full PPC Season)</option>
                </select>
              </div>
            </>
          )}

        </div>
      </div>

      {/* MODE 1: COMPARE RUNS SIMULATOR */}
      {calcMode === 'compare' && (
        <div className="space-y-6">
          
          {/* Comparison Cards Grid */}
          <div className={`grid grid-cols-1 ${compareRunsCount === 3 ? 'lg:grid-cols-3' : 'md:grid-cols-2'} gap-5`}>
            
            {/* RUN A CARD */}
            <div className="minimal-card p-5 space-y-4 border border-[#27272a]">
              <div className="flex items-center justify-between border-b border-[#27272a] pb-3">
                <h3 className="font-heading font-bold text-lg text-white">RUN A</h3>
                <span className="font-heading font-bold text-xl text-white">
                  {totalA.toLocaleString()} <span className="text-xs font-tech text-zinc-400 font-normal">PTS</span>
                </span>
              </div>

              {/* Sliders Grid */}
              <div className="space-y-3">
                {Array.from({ length: bossesCount }).map((_, bIdx) => (
                  <div key={bIdx} className="bg-black p-3.5 rounded-xl border border-[#27272a] space-y-2">
                    <span className="text-[10px] font-tech text-zinc-400 uppercase font-bold block">
                      BOSS #{bIdx + 1} TIMERS
                    </span>
                    <div className="grid grid-cols-3 gap-2">
                      {['Knight', 'Chaos', 'Hell'].map((diffName, dIdx) => {
                        const timerIndex = bIdx * 3 + dIdx;
                        const currentSec = runATimers[timerIndex] || 0;
                        return (
                          <div key={dIdx} className="space-y-1">
                            <span className="text-[9px] font-tech text-zinc-500 uppercase block">{diffName} (s)</span>
                            <input
                              type="number"
                              min={0}
                              max={60}
                              value={currentSec}
                              onChange={(e) => handleUpdateTimer('A', timerIndex, Number(e.target.value))}
                              className="w-full bg-[#121215] text-xs font-tech text-white border border-[#27272a] rounded-lg px-2 py-1.5 text-center focus:outline-none focus:border-white"
                            />
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* RUN B CARD */}
            <div className="minimal-card p-5 space-y-4 border border-[#27272a]">
              <div className="flex items-center justify-between border-b border-[#27272a] pb-3">
                <h3 className="font-heading font-bold text-lg text-white">RUN B</h3>
                <span className="font-heading font-bold text-xl text-white">
                  {totalB.toLocaleString()} <span className="text-xs font-tech text-zinc-400 font-normal">PTS</span>
                </span>
              </div>

              <div className="space-y-3">
                {Array.from({ length: bossesCount }).map((_, bIdx) => (
                  <div key={bIdx} className="bg-black p-3.5 rounded-xl border border-[#27272a] space-y-2">
                    <span className="text-[10px] font-tech text-zinc-400 uppercase font-bold block">
                      BOSS #{bIdx + 1} TIMERS
                    </span>
                    <div className="grid grid-cols-3 gap-2">
                      {['Knight', 'Chaos', 'Hell'].map((diffName, dIdx) => {
                        const timerIndex = bIdx * 3 + dIdx;
                        const currentSec = runBTimers[timerIndex] || 0;
                        return (
                          <div key={dIdx} className="space-y-1">
                            <span className="text-[9px] font-tech text-zinc-500 uppercase block">{diffName} (s)</span>
                            <input
                              type="number"
                              min={0}
                              max={60}
                              value={currentSec}
                              onChange={(e) => handleUpdateTimer('B', timerIndex, Number(e.target.value))}
                              className="w-full bg-[#121215] text-xs font-tech text-white border border-[#27272a] rounded-lg px-2 py-1.5 text-center focus:outline-none focus:border-white"
                            />
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* RUN C CARD (If compareRunsCount === 3) */}
            {compareRunsCount === 3 && (
              <div className="minimal-card p-5 space-y-4 border border-[#27272a]">
                <div className="flex items-center justify-between border-b border-[#27272a] pb-3">
                  <h3 className="font-heading font-bold text-lg text-white">RUN C</h3>
                  <span className="font-heading font-bold text-xl text-white">
                    {totalC.toLocaleString()} <span className="text-xs font-tech text-zinc-400 font-normal">PTS</span>
                  </span>
                </div>

                <div className="space-y-3">
                  {Array.from({ length: bossesCount }).map((_, bIdx) => (
                    <div key={bIdx} className="bg-black p-3.5 rounded-xl border border-[#27272a] space-y-2">
                      <span className="text-[10px] font-tech text-zinc-400 uppercase font-bold block">
                        BOSS #{bIdx + 1} TIMERS
                      </span>
                      <div className="grid grid-cols-3 gap-2">
                        {['Knight', 'Chaos', 'Hell'].map((diffName, dIdx) => {
                          const timerIndex = bIdx * 3 + dIdx;
                          const currentSec = runCTimers[timerIndex] || 0;
                          return (
                            <div key={dIdx} className="space-y-1">
                              <span className="text-[9px] font-tech text-zinc-500 uppercase block">{diffName} (s)</span>
                              <input
                                type="number"
                                min={0}
                                max={60}
                                value={currentSec}
                                onChange={(e) => handleUpdateTimer('C', timerIndex, Number(e.target.value))}
                                className="w-full bg-[#121215] text-xs font-tech text-white border border-[#27272a] rounded-lg px-2 py-1.5 text-center focus:outline-none focus:border-white"
                              />
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>

        </div>
      )}

      {/* MODE 2: SINGLE RUN CALCULATOR */}
      {calcMode === 'single' && (
        <div className="minimal-card p-6 space-y-6">
          <div className="flex items-center justify-between border-b border-[#27272a] pb-4">
            <h3 className="font-heading font-bold text-xl text-white">SINGLE RUN SCORE CALCULATOR</h3>
            <span className="font-heading font-bold text-2xl text-white">
              {singleTotalScore.toLocaleString()} <span className="text-xs font-tech text-zinc-400 font-normal">PTS</span>
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <div className="bg-black p-4 rounded-2xl border border-[#27272a] space-y-3">
              <span className="text-xs font-tech text-zinc-400 font-bold uppercase block">KNIGHT STAGE</span>
              <input
                type="range"
                min={0}
                max={60}
                value={knightSec}
                onChange={(e) => setKnightSec(Number(e.target.value))}
                className="w-full accent-white cursor-pointer"
              />
              <div className="flex justify-between text-xs font-tech">
                <span>Time: <strong>{knightSec}s</strong></span>
                <span>Score: <strong className="text-white">{singleKnightScore.toLocaleString()}</strong></span>
              </div>
            </div>

            <div className="bg-black p-4 rounded-2xl border border-[#27272a] space-y-3">
              <span className="text-xs font-tech text-zinc-400 font-bold uppercase block">CHAOS STAGE</span>
              <input
                type="range"
                min={0}
                max={60}
                value={chaosSec}
                onChange={(e) => setChaosSec(Number(e.target.value))}
                className="w-full accent-white cursor-pointer"
              />
              <div className="flex justify-between text-xs font-tech">
                <span>Time: <strong>{chaosSec}s</strong></span>
                <span>Score: <strong className="text-white">{singleChaosScore.toLocaleString()}</strong></span>
              </div>
            </div>

            <div className="bg-black p-4 rounded-2xl border border-[#27272a] space-y-3">
              <span className="text-xs font-tech text-zinc-400 font-bold uppercase block">HELL STAGE</span>
              <input
                type="range"
                min={0}
                max={60}
                value={hellSec}
                onChange={(e) => setHellSec(Number(e.target.value))}
                className="w-full accent-white cursor-pointer"
              />
              <div className="flex justify-between text-xs font-tech">
                <span>Time: <strong>{hellSec}s</strong></span>
                <span>Score: <strong className="text-white">{singleHellScore.toLocaleString()}</strong></span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* DISCORD AGUS BOT COMMAND OUTPUT BAR */}
      <div className="minimal-card p-5 space-y-3 bg-[#121215] border border-white/40">
        <div className="flex items-center justify-between">
          <span className="text-xs font-tech text-zinc-300 font-bold uppercase tracking-wider flex items-center space-x-2">
            <Sparkles className="w-4 h-4 text-white" />
            <span>GENERATED AGUS BOT DISCORD COMMAND</span>
          </span>
          <button
            onClick={handleCopyCommand}
            className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl bg-white hover:bg-zinc-200 text-black font-heading font-bold text-xs transition-all shadow-sm"
          >
            {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'COPIED!' : 'COPY COMMAND'}</span>
          </button>
        </div>

        <div className="bg-black p-3.5 rounded-xl border border-[#27272a] font-mono text-xs text-zinc-200 overflow-x-auto">
          <code>{generateDiscordCommand()}</code>
        </div>
      </div>

    </div>
  );
};
