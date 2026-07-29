import React, { useState } from 'react';
import { getPpcStageScore, getPpcTotalScore, FULL_PPC_BOSSES } from '../data/ppc_scores';
import { Calculator, Trophy, Swords, Scale, Copy, Check, Sparkles, RefreshCw, Zap, Plus, Minus } from 'lucide-react';

interface ScoreCalculatorPageProps {
  initialBossSlug?: string;
}

interface BossRunTimers {
  k: number;
  c: number;
  h: number;
}

export const ScoreCalculatorPage: React.FC<ScoreCalculatorPageProps> = () => {
  const [selectedCommand, setSelectedCommand] = useState<'ulttotal' | 'advtotal' | 'ult' | 'adv' | 'comparetotal'>('ulttotal');
  
  // State for total calculation
  const [ppcType, setPpcType] = useState<'ultimate' | 'advanced'>('ultimate');
  const [knightTime, setKnightTime] = useState<number>(5);
  const [chaosTime, setChaosTime] = useState<number>(5);
  const [hellTime, setHellTime] = useState<number>(10);

  // State for single stage calculation
  const [singleDifficulty, setSingleDifficulty] = useState<'knight' | 'chaos' | 'hell'>('hell');
  const [singleTime, setSingleTime] = useState<number>(10);

  // State for compare total calculation
  const [compareRunsCount, setCompareRunsCount] = useState<2 | 3>(2);
  const [bossesPerRunCount, setBossesPerRunCount] = useState<1 | 2 | 3>(1); // 1 Boss (3 timers), 2 Bosses (6 timers), 3 Bosses (9 timers)

  // Dynamic Boss Run Timers Arrays
  // RUN A (1 to 3 bosses)
  const [runABosses, setRunABosses] = useState<BossRunTimers[]>([
    { k: 5, c: 6, h: 10 },
    { k: 4, c: 5, h: 8 },
    { k: 3, c: 4, h: 6 },
  ]);

  // RUN B (1 to 3 bosses)
  const [runBBosses, setRunBBosses] = useState<BossRunTimers[]>([
    { k: 8, c: 9, h: 12 },
    { k: 6, c: 7, h: 11 },
    { k: 5, c: 6, h: 9 },
  ]);

  // RUN C (1 to 3 bosses)
  const [runCBosses, setRunCBosses] = useState<BossRunTimers[]>([
    { k: 10, c: 12, h: 15 },
    { k: 8, c: 10, h: 14 },
    { k: 7, c: 8, h: 12 },
  ]);

  const [copied, setCopied] = useState<boolean>(false);

  // Helper to update specific boss timer in a run
  const updateBossTimer = (
    runSetter: React.Dispatch<React.SetStateAction<BossRunTimers[]>>,
    bossIdx: number,
    field: 'k' | 'c' | 'h',
    val: number
  ) => {
    runSetter((prev) => {
      const next = [...prev];
      next[bossIdx] = { ...next[bossIdx], [field]: val };
      return next;
    });
  };

  // Helper to compute total score for a run based on active bosses count
  const computeRunTotal = (bosses: BossRunTimers[]) => {
    let sum = 0;
    for (let i = 0; i < bossesPerRunCount; i++) {
      const b = bosses[i] || { k: 0, c: 0, h: 0 };
      const score = getPpcTotalScore('ultimate', b.k, b.c, b.h);
      sum += score.total;
    }
    return sum;
  };

  // Helper to format timers string for a run
  const formatRunTimersString = (bosses: BossRunTimers[]) => {
    const parts: number[] = [];
    for (let i = 0; i < bossesPerRunCount; i++) {
      const b = bosses[i] || { k: 0, c: 0, h: 0 };
      parts.push(b.k, b.c, b.h);
    }
    return parts.join(' ');
  };

  // Preset Handlers
  const handleApplyPreset = (k: number, c: number, h: number) => {
    setKnightTime(k);
    setChaosTime(c);
    setHellTime(h);
  };

  // Total Calculations
  const totalResult = getPpcTotalScore(ppcType, knightTime, chaosTime, hellTime);
  const maxPossibleTotal = ppcType === 'ultimate' ? (92700 + 185401 + 370802) : (62420 + 112340 + 212180);
  const totalPercentage = ((totalResult.total / maxPossibleTotal) * 100).toFixed(1);

  const singleScore = getPpcStageScore(ppcType, singleDifficulty, singleTime);

  // Compare Runs Calculations
  const runATotal = computeRunTotal(runABosses);
  const runBTotal = computeRunTotal(runBBosses);
  const runCTotal = computeRunTotal(runCBosses);

  const runsList = compareRunsCount === 2
    ? [
        { name: 'RUN A', total: runATotal, timers: formatRunTimersString(runABosses) },
        { name: 'RUN B', total: runBTotal, timers: formatRunTimersString(runBBosses) }
      ]
    : [
        { name: 'RUN A', total: runATotal, timers: formatRunTimersString(runABosses) },
        { name: 'RUN B', total: runBTotal, timers: formatRunTimersString(runBBosses) },
        { name: 'RUN C', total: runCTotal, timers: formatRunTimersString(runCBosses) }
      ];

  const sortedRuns = [...runsList].sort((a, b) => b.total - a.total);

  // Discord command generator string
  const getDiscordCommand = () => {
    if (selectedCommand === 'ulttotal') return `!ulttotal ${knightTime} ${chaosTime} ${hellTime}`;
    if (selectedCommand === 'advtotal') return `!advtotal ${knightTime} ${chaosTime} ${hellTime}`;
    if (selectedCommand === 'ult') return `!ult ${singleDifficulty} ${singleTime}`;
    if (selectedCommand === 'adv') return `!adv ${singleDifficulty} ${singleTime}`;
    if (compareRunsCount === 3) {
      return `!comparetotal ${formatRunTimersString(runABosses)} vs ${formatRunTimersString(runBBosses)} vs ${formatRunTimersString(runCBosses)}`;
    }
    return `!comparetotal ${formatRunTimersString(runABosses)} vs ${formatRunTimersString(runBBosses)}`;
  };

  const handleCopyCommand = () => {
    const cmd = getDiscordCommand();
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
              <span>PPC Bot Score Calculator Simulator</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-heading font-bold text-white">
              PPC SCORE <span className="text-zinc-500 font-normal">COMMAND SIMULATOR</span>
            </h1>
            <p className="text-xs font-tech text-zinc-400">
              Kalkulator presisi skor PPC berdasarkan command Agus Bot: <code className="text-zinc-300">ulttotal</code>, <code className="text-zinc-300">advtotal</code>, <code className="text-zinc-300">comparetotal</code>
            </p>
          </div>

          {/* Quick Copy Generated Command */}
          <div className="bg-black p-3.5 rounded-2xl border border-[#27272a] flex items-center justify-between gap-4">
            <div>
              <span className="text-[10px] font-tech text-zinc-400 block uppercase font-bold">Discord Command</span>
              <code className="font-tech font-bold text-xs text-white">{getDiscordCommand()}</code>
            </div>
            <button
              onClick={handleCopyCommand}
              className="inline-flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-white hover:bg-zinc-200 text-black font-heading font-bold text-xs transition-all shadow-sm flex-shrink-0"
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'COPIED!' : 'COPY'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Interactive Tool Container */}
      <div className="minimal-card p-5 sm:p-8 space-y-8">
        
        {/* Command Selector Tabs */}
        <div className="space-y-3">
          <label className="text-xs font-heading font-bold text-zinc-300 uppercase tracking-wider block">
            PILIH COMMAND KALKULATOR
          </label>
          
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
            <button
              onClick={() => { setSelectedCommand('ulttotal'); setPpcType('ultimate'); }}
              className={`p-3.5 rounded-xl border text-left transition-all ${
                selectedCommand === 'ulttotal'
                  ? 'bg-white text-black border-white shadow-md'
                  : 'bg-[#09090b] text-zinc-400 border-[#27272a] hover:text-white hover:border-zinc-500'
              }`}
            >
              <span className="text-[10px] font-tech font-bold block uppercase opacity-70">!ulttotal</span>
              <span className="font-heading font-bold text-xs sm:text-sm">Ultimate Total</span>
            </button>

            <button
              onClick={() => { setSelectedCommand('advtotal'); setPpcType('advanced'); }}
              className={`p-3.5 rounded-xl border text-left transition-all ${
                selectedCommand === 'advtotal'
                  ? 'bg-white text-black border-white shadow-md'
                  : 'bg-[#09090b] text-zinc-400 border-[#27272a] hover:text-white hover:border-zinc-500'
              }`}
            >
              <span className="text-[10px] font-tech font-bold block uppercase opacity-70">!advtotal</span>
              <span className="font-heading font-bold text-xs sm:text-sm">Advanced Total</span>
            </button>

            <button
              onClick={() => { setSelectedCommand('ult'); setPpcType('ultimate'); }}
              className={`p-3.5 rounded-xl border text-left transition-all ${
                selectedCommand === 'ult'
                  ? 'bg-white text-black border-white shadow-md'
                  : 'bg-[#09090b] text-zinc-400 border-[#27272a] hover:text-white hover:border-zinc-500'
              }`}
            >
              <span className="text-[10px] font-tech font-bold block uppercase opacity-70">!ult</span>
              <span className="font-heading font-bold text-xs sm:text-sm">Single Ultimate</span>
            </button>

            <button
              onClick={() => { setSelectedCommand('adv'); setPpcType('advanced'); }}
              className={`p-3.5 rounded-xl border text-left transition-all ${
                selectedCommand === 'adv'
                  ? 'bg-white text-black border-white shadow-md'
                  : 'bg-[#09090b] text-zinc-400 border-[#27272a] hover:text-white hover:border-zinc-500'
              }`}
            >
              <span className="text-[10px] font-tech font-bold block uppercase opacity-70">!adv</span>
              <span className="font-heading font-bold text-xs sm:text-sm">Single Advanced</span>
            </button>

            <button
              onClick={() => setSelectedCommand('comparetotal')}
              className={`p-3.5 rounded-xl border text-left transition-all col-span-2 sm:col-span-1 ${
                selectedCommand === 'comparetotal'
                  ? 'bg-white text-black border-white shadow-md'
                  : 'bg-[#09090b] text-zinc-400 border-[#27272a] hover:text-white hover:border-zinc-500'
              }`}
            >
              <span className="text-[10px] font-tech font-bold block uppercase opacity-70">!comparetotal</span>
              <span className="font-heading font-bold text-xs sm:text-sm">Compare Runs</span>
            </button>
          </div>
        </div>

        {/* MODE 1: TOTAL SCORE CALCULATOR (!ulttotal & !advtotal) */}
        {(selectedCommand === 'ulttotal' || selectedCommand === 'advtotal') && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start animate-fadeIn">
            
            {/* Left Inputs */}
            <div className="lg:col-span-7 space-y-6">
              
              {/* Presets Bar */}
              <div className="space-y-2">
                <span className="text-xs font-tech text-zinc-400 font-bold uppercase tracking-wider block">
                  SPEEDRUN PRESETS
                </span>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => handleApplyPreset(0, 0, 0)}
                    className="px-3 py-1.5 rounded-lg bg-[#09090b] hover:bg-[#18181b] border border-[#27272a] text-xs font-tech font-bold text-zinc-300 hover:text-white"
                  >
                    ⚡ Max Speed (0s 0s 0s)
                  </button>
                  <button
                    onClick={() => handleApplyPreset(3, 4, 6)}
                    className="px-3 py-1.5 rounded-lg bg-[#09090b] hover:bg-[#18181b] border border-[#27272a] text-xs font-tech font-bold text-zinc-300 hover:text-white"
                  >
                    🔥 High Rank (3s 4s 6s)
                  </button>
                  <button
                    onClick={() => handleApplyPreset(8, 10, 15)}
                    className="px-3 py-1.5 rounded-lg bg-[#09090b] hover:bg-[#18181b] border border-[#27272a] text-xs font-tech font-bold text-zinc-300 hover:text-white"
                  >
                    🎯 Standard (8s 10s 15s)
                  </button>
                </div>
              </div>

              {/* Stage Timers Inputs */}
              <div className="space-y-5 bg-black p-5 sm:p-6 rounded-2xl border border-[#27272a]">
                <h3 className="font-heading font-bold text-base text-white uppercase tracking-wider">
                  ENTER KILL TIMES (SECONDS)
                </h3>

                {/* Knight Stage Time */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-xs font-tech">
                    <label className="text-zinc-300 font-bold uppercase">Knight Stage Kill Time</label>
                    <span className="text-white font-bold">{knightTime}s</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <input
                      type="range"
                      min="0"
                      max="60"
                      value={knightTime}
                      onChange={(e) => setKnightTime(Number(e.target.value))}
                      className="flex-1 accent-white h-2 bg-[#18181b] rounded-lg cursor-pointer"
                    />
                    <input
                      type="number"
                      min="0"
                      max="60"
                      value={knightTime}
                      onChange={(e) => setKnightTime(Math.max(0, Math.min(60, Number(e.target.value))))}
                      className="w-16 bg-[#09090b] border border-[#27272a] rounded-lg text-center font-bold text-sm text-white py-1.5 focus:outline-none focus:border-white"
                    />
                  </div>
                </div>

                {/* Chaos Stage Time */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-xs font-tech">
                    <label className="text-zinc-300 font-bold uppercase">Chaos Stage Kill Time</label>
                    <span className="text-white font-bold">{chaosTime}s</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <input
                      type="range"
                      min="0"
                      max="60"
                      value={chaosTime}
                      onChange={(e) => setChaosTime(Number(e.target.value))}
                      className="flex-1 accent-white h-2 bg-[#18181b] rounded-lg cursor-pointer"
                    />
                    <input
                      type="number"
                      min="0"
                      max="60"
                      value={chaosTime}
                      onChange={(e) => setChaosTime(Math.max(0, Math.min(60, Number(e.target.value))))}
                      className="w-16 bg-[#09090b] border border-[#27272a] rounded-lg text-center font-bold text-sm text-white py-1.5 focus:outline-none focus:border-white"
                    />
                  </div>
                </div>

                {/* Hell Stage Time */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-xs font-tech">
                    <label className="text-zinc-300 font-bold uppercase">Hell Stage Kill Time</label>
                    <span className="text-white font-bold">{hellTime}s</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <input
                      type="range"
                      min="0"
                      max="60"
                      value={hellTime}
                      onChange={(e) => setHellTime(Number(e.target.value))}
                      className="flex-1 accent-white h-2 bg-[#18181b] rounded-lg cursor-pointer"
                    />
                    <input
                      type="number"
                      min="0"
                      max="60"
                      value={hellTime}
                      onChange={(e) => setHellTime(Math.max(0, Math.min(60, Number(e.target.value))))}
                      className="w-16 bg-[#09090b] border border-[#27272a] rounded-lg text-center font-bold text-sm text-white py-1.5 focus:outline-none focus:border-white"
                    />
                  </div>
                </div>

              </div>
            </div>

            {/* Right Calculated Result Display Card */}
            <div className="lg:col-span-5 bg-black border border-[#27272a] rounded-2xl p-6 sm:p-8 space-y-6 shadow-xl text-center">
              <span className="text-xs font-tech uppercase text-zinc-400 block tracking-widest font-bold">
                CALCULATED TOTAL SCORE ({ppcType.toUpperCase()})
              </span>

              <div className="space-y-1">
                <h2 className="text-4xl sm:text-5xl font-heading font-black text-white tracking-tight">
                  {totalResult.total.toLocaleString()}
                </h2>
                <p className="text-xs font-tech text-zinc-400">
                  {totalPercentage}% dari skor maksimum ({maxPossibleTotal.toLocaleString()})
                </p>
              </div>

              {/* Score Progress Bar */}
              <div className="w-full bg-[#18181b] h-3 rounded-full overflow-hidden border border-[#27272a]">
                <div
                  className="bg-white h-full transition-all duration-300"
                  style={{ width: `${totalPercentage}%` }}
                />
              </div>

              {/* Stage Breakdown */}
              <div className="space-y-2.5 pt-2 border-t border-[#27272a] text-xs font-tech text-left">
                <div className="flex justify-between items-center">
                  <span className="text-zinc-400">Knight Stage ({knightTime}s)</span>
                  <span className="text-white font-bold">{totalResult.knight.toLocaleString()} pts</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-zinc-400">Chaos Stage ({chaosTime}s)</span>
                  <span className="text-white font-bold">{totalResult.chaos.toLocaleString()} pts</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-zinc-400">Hell Stage ({hellTime}s)</span>
                  <span className="text-white font-bold">{totalResult.hell.toLocaleString()} pts</span>
                </div>
              </div>
            </div>

          </div>
        )}

        {/* MODE 2: SINGLE STAGE SCORE (!ult & !adv) */}
        {(selectedCommand === 'ult' || selectedCommand === 'adv') && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start animate-fadeIn">
            <div className="lg:col-span-7 space-y-6">
              
              {/* Select Stage Difficulty */}
              <div className="space-y-2">
                <label className="text-xs font-tech text-zinc-400 font-bold uppercase tracking-wider block">
                  PILIH DIFFICULTY STAGE
                </label>
                <div className="flex gap-3">
                  <button
                    onClick={() => setSingleDifficulty('knight')}
                    className={`flex-1 py-3 rounded-xl border font-heading font-bold text-xs uppercase ${
                      singleDifficulty === 'knight' ? 'bg-white text-black border-white' : 'bg-black text-zinc-400 border-[#27272a]'
                    }`}
                  >
                    Knight
                  </button>
                  <button
                    onClick={() => setSingleDifficulty('chaos')}
                    className={`flex-1 py-3 rounded-xl border font-heading font-bold text-xs uppercase ${
                      singleDifficulty === 'chaos' ? 'bg-white text-black border-white' : 'bg-black text-zinc-400 border-[#27272a]'
                    }`}
                  >
                    Chaos
                  </button>
                  <button
                    onClick={() => setSingleDifficulty('hell')}
                    className={`flex-1 py-3 rounded-xl border font-heading font-bold text-xs uppercase ${
                      singleDifficulty === 'hell' ? 'bg-white text-black border-white' : 'bg-black text-zinc-400 border-[#27272a]'
                    }`}
                  >
                    Hell
                  </button>
                </div>
              </div>

              {/* Single Time Input */}
              <div className="bg-black p-6 rounded-2xl border border-[#27272a] space-y-3">
                <div className="flex justify-between items-center text-xs font-tech">
                  <label className="text-zinc-300 font-bold uppercase">Kill Time (Seconds)</label>
                  <span className="text-white font-bold">{singleTime}s</span>
                </div>
                <div className="flex items-center space-x-3">
                  <input
                    type="range"
                    min="0"
                    max="60"
                    value={singleTime}
                    onChange={(e) => setSingleTime(Number(e.target.value))}
                    className="flex-1 accent-white h-2 bg-[#18181b] rounded-lg cursor-pointer"
                  />
                  <input
                    type="number"
                    min="0"
                    max="60"
                    value={singleTime}
                    onChange={(e) => setSingleTime(Math.max(0, Math.min(60, Number(e.target.value))))}
                    className="w-16 bg-[#09090b] border border-[#27272a] rounded-lg text-center font-bold text-sm text-white py-1.5 focus:outline-none"
                  />
                </div>
              </div>

            </div>

            {/* Single Stage Result Display Card */}
            <div className="lg:col-span-5 bg-black border border-[#27272a] rounded-2xl p-6 sm:p-8 space-y-4 text-center">
              <span className="text-xs font-tech uppercase text-zinc-400 block tracking-widest font-bold">
                {singleDifficulty.toUpperCase()} STAGE SCORE ({singleTime}s)
              </span>
              <h2 className="text-4xl sm:text-5xl font-heading font-black text-white">
                {singleScore.toLocaleString()}
              </h2>
              <p className="text-xs font-tech text-zinc-400">
                Mode: {ppcType.toUpperCase()}
              </p>
            </div>
          </div>
        )}

        {/* MODE 3: SCORE COMPARISON TOOL (!comparetotal - Supports 3 vs 3, 6 vs 6, 9 vs 9!) */}
        {selectedCommand === 'comparetotal' && (
          <div className="space-y-6 animate-fadeIn">
            
            {/* Controls Bar: Compare Runs Count & Bosses Count (3, 6, or 9 stages!) */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#27272a] pb-4">
              <div>
                <h3 className="font-heading font-bold text-base text-white">KOMPARASI HASIL RUN</h3>
                <p className="text-xs font-tech text-zinc-400">Pilih jumlah run (2 vs 3) dan jumlah boss (3, 6, atau 9 timer skor)</p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                {/* Boss Count Selector (3 vs 3, 6 vs 6, 9 vs 9) */}
                <div className="flex items-center space-x-1.5 bg-black p-1 rounded-xl border border-[#27272a]">
                  <button
                    onClick={() => setBossesPerRunCount(1)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-tech font-bold transition-all ${
                      bossesPerRunCount === 1 ? 'bg-white text-black' : 'text-zinc-400 hover:text-white'
                    }`}
                  >
                    1 Boss (3 Timers)
                  </button>
                  <button
                    onClick={() => setBossesPerRunCount(2)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-tech font-bold transition-all ${
                      bossesPerRunCount === 2 ? 'bg-white text-black' : 'text-zinc-400 hover:text-white'
                    }`}
                  >
                    2 Bosses (6 vs 6)
                  </button>
                  <button
                    onClick={() => setBossesPerRunCount(3)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-tech font-bold transition-all ${
                      bossesPerRunCount === 3 ? 'bg-white text-black' : 'text-zinc-400 hover:text-white'
                    }`}
                  >
                    3 Bosses (9 vs 9)
                  </button>
                </div>

                {/* Runs Count Selector (2 vs 3) */}
                <div className="flex items-center space-x-1.5 bg-black p-1 rounded-xl border border-[#27272a]">
                  <button
                    onClick={() => setCompareRunsCount(2)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-tech font-bold transition-all ${
                      compareRunsCount === 2 ? 'bg-white text-black' : 'text-zinc-400 hover:text-white'
                    }`}
                  >
                    2 Runs
                  </button>
                  <button
                    onClick={() => setCompareRunsCount(3)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-tech font-bold transition-all ${
                      compareRunsCount === 3 ? 'bg-white text-black' : 'text-zinc-400 hover:text-white'
                    }`}
                  >
                    3 Runs
                  </button>
                </div>
              </div>
            </div>

            {/* Dynamic Runs Input Grid */}
            <div className={`grid grid-cols-1 ${compareRunsCount === 3 ? 'lg:grid-cols-3' : 'md:grid-cols-2'} gap-6`}>
              
              {/* RUN A */}
              <div className="bg-black border border-[#27272a] rounded-2xl p-5 space-y-4 shadow-sm">
                <div className="flex justify-between items-center border-b border-[#27272a] pb-3">
                  <h3 className="font-heading font-bold text-base text-white">RUN A</h3>
                  <span className="font-heading font-bold text-base text-white">{runATotal.toLocaleString()} pts</span>
                </div>

                <div className="space-y-4">
                  {Array.from({ length: bossesPerRunCount }).map((_, bIdx) => (
                    <div key={bIdx} className="bg-[#121215] p-3.5 rounded-xl border border-[#27272a] space-y-2.5">
                      <span className="text-[11px] font-heading font-bold text-zinc-300 uppercase block">
                        Boss #{bIdx + 1} Timers
                      </span>
                      <div className="space-y-2 text-xs font-tech">
                        <div>
                          <label className="text-zinc-400 flex justify-between">
                            <span>Knight Time</span>
                            <span className="text-white font-bold">{runABosses[bIdx]?.k || 0}s</span>
                          </label>
                          <input
                            type="range"
                            min="0"
                            max="60"
                            value={runABosses[bIdx]?.k || 0}
                            onChange={(e) => updateBossTimer(setRunABosses, bIdx, 'k', Number(e.target.value))}
                            className="w-full accent-white h-2 bg-[#18181b] rounded-lg cursor-pointer mt-1"
                          />
                        </div>
                        <div>
                          <label className="text-zinc-400 flex justify-between">
                            <span>Chaos Time</span>
                            <span className="text-white font-bold">{runABosses[bIdx]?.c || 0}s</span>
                          </label>
                          <input
                            type="range"
                            min="0"
                            max="60"
                            value={runABosses[bIdx]?.c || 0}
                            onChange={(e) => updateBossTimer(setRunABosses, bIdx, 'c', Number(e.target.value))}
                            className="w-full accent-white h-2 bg-[#18181b] rounded-lg cursor-pointer mt-1"
                          />
                        </div>
                        <div>
                          <label className="text-zinc-400 flex justify-between">
                            <span>Hell Time</span>
                            <span className="text-white font-bold">{runABosses[bIdx]?.h || 0}s</span>
                          </label>
                          <input
                            type="range"
                            min="0"
                            max="60"
                            value={runABosses[bIdx]?.h || 0}
                            onChange={(e) => updateBossTimer(setRunABosses, bIdx, 'h', Number(e.target.value))}
                            className="w-full accent-white h-2 bg-[#18181b] rounded-lg cursor-pointer mt-1"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* RUN B */}
              <div className="bg-black border border-[#27272a] rounded-2xl p-5 space-y-4 shadow-sm">
                <div className="flex justify-between items-center border-b border-[#27272a] pb-3">
                  <h3 className="font-heading font-bold text-base text-white">RUN B</h3>
                  <span className="font-heading font-bold text-base text-white">{runBTotal.toLocaleString()} pts</span>
                </div>

                <div className="space-y-4">
                  {Array.from({ length: bossesPerRunCount }).map((_, bIdx) => (
                    <div key={bIdx} className="bg-[#121215] p-3.5 rounded-xl border border-[#27272a] space-y-2.5">
                      <span className="text-[11px] font-heading font-bold text-zinc-300 uppercase block">
                        Boss #{bIdx + 1} Timers
                      </span>
                      <div className="space-y-2 text-xs font-tech">
                        <div>
                          <label className="text-zinc-400 flex justify-between">
                            <span>Knight Time</span>
                            <span className="text-white font-bold">{runBBosses[bIdx]?.k || 0}s</span>
                          </label>
                          <input
                            type="range"
                            min="0"
                            max="60"
                            value={runBBosses[bIdx]?.k || 0}
                            onChange={(e) => updateBossTimer(setRunBBosses, bIdx, 'k', Number(e.target.value))}
                            className="w-full accent-white h-2 bg-[#18181b] rounded-lg cursor-pointer mt-1"
                          />
                        </div>
                        <div>
                          <label className="text-zinc-400 flex justify-between">
                            <span>Chaos Time</span>
                            <span className="text-white font-bold">{runBBosses[bIdx]?.c || 0}s</span>
                          </label>
                          <input
                            type="range"
                            min="0"
                            max="60"
                            value={runBBosses[bIdx]?.c || 0}
                            onChange={(e) => updateBossTimer(setRunBBosses, bIdx, 'c', Number(e.target.value))}
                            className="w-full accent-white h-2 bg-[#18181b] rounded-lg cursor-pointer mt-1"
                          />
                        </div>
                        <div>
                          <label className="text-zinc-400 flex justify-between">
                            <span>Hell Time</span>
                            <span className="text-white font-bold">{runBBosses[bIdx]?.h || 0}s</span>
                          </label>
                          <input
                            type="range"
                            min="0"
                            max="60"
                            value={runBBosses[bIdx]?.h || 0}
                            onChange={(e) => updateBossTimer(setRunBBosses, bIdx, 'h', Number(e.target.value))}
                            className="w-full accent-white h-2 bg-[#18181b] rounded-lg cursor-pointer mt-1"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* RUN C */}
              {compareRunsCount === 3 && (
                <div className="bg-black border border-[#27272a] rounded-2xl p-5 space-y-4 shadow-sm animate-fadeIn">
                  <div className="flex justify-between items-center border-b border-[#27272a] pb-3">
                    <h3 className="font-heading font-bold text-base text-white">RUN C</h3>
                    <span className="font-heading font-bold text-base text-white">{runCTotal.toLocaleString()} pts</span>
                  </div>

                  <div className="space-y-4">
                    {Array.from({ length: bossesPerRunCount }).map((_, bIdx) => (
                      <div key={bIdx} className="bg-[#121215] p-3.5 rounded-xl border border-[#27272a] space-y-2.5">
                        <span className="text-[11px] font-heading font-bold text-zinc-300 uppercase block">
                          Boss #{bIdx + 1} Timers
                        </span>
                        <div className="space-y-2 text-xs font-tech">
                          <div>
                            <label className="text-zinc-400 flex justify-between">
                              <span>Knight Time</span>
                              <span className="text-white font-bold">{runCBosses[bIdx]?.k || 0}s</span>
                            </label>
                            <input
                              type="range"
                              min="0"
                              max="60"
                              value={runCBosses[bIdx]?.k || 0}
                              onChange={(e) => updateBossTimer(setRunCBosses, bIdx, 'k', Number(e.target.value))}
                              className="w-full accent-white h-2 bg-[#18181b] rounded-lg cursor-pointer mt-1"
                            />
                          </div>
                          <div>
                            <label className="text-zinc-400 flex justify-between">
                              <span>Chaos Time</span>
                              <span className="text-white font-bold">{runCBosses[bIdx]?.c || 0}s</span>
                            </label>
                            <input
                              type="range"
                              min="0"
                              max="60"
                              value={runCBosses[bIdx]?.c || 0}
                              onChange={(e) => updateBossTimer(setRunCBosses, bIdx, 'c', Number(e.target.value))}
                              className="w-full accent-white h-2 bg-[#18181b] rounded-lg cursor-pointer mt-1"
                            />
                          </div>
                          <div>
                            <label className="text-zinc-400 flex justify-between">
                              <span>Hell Time</span>
                              <span className="text-white font-bold">{runCBosses[bIdx]?.h || 0}s</span>
                            </label>
                            <input
                              type="range"
                              min="0"
                              max="60"
                              value={runCBosses[bIdx]?.h || 0}
                              onChange={(e) => updateBossTimer(setRunCBosses, bIdx, 'h', Number(e.target.value))}
                              className="w-full accent-white h-2 bg-[#18181b] rounded-lg cursor-pointer mt-1"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>

            {/* COMPARISON OUTCOME RESULT DISPLAY CARD */}
            <div className="bg-[#121215] border border-white rounded-2xl p-6 text-center space-y-3 shadow-xl">
              <span className="text-xs font-tech uppercase text-zinc-400 tracking-wider block font-bold">
                COMPARISON OUTCOME RANKING ({bossesPerRunCount * 3} VS {bossesPerRunCount * 3} STAGES)
              </span>

              {/* Winner Title */}
              <h3 className="text-2xl sm:text-3xl font-heading font-bold text-white">
                🏆 WINNER: <span className="text-white">{sortedRuns[0].name}</span> WITH {sortedRuns[0].total.toLocaleString()} PTS
              </h3>

              {/* Leaderboard Delta Breakdown */}
              <div className="flex flex-wrap justify-center gap-3 pt-2">
                {sortedRuns.map((r, rIdx) => {
                  const leadDiff = sortedRuns[0].total - r.total;
                  return (
                    <div
                      key={r.name}
                      className={`px-4 py-2 rounded-xl text-xs font-tech font-bold border ${
                        rIdx === 0
                          ? 'bg-white text-black border-white'
                          : 'bg-black text-zinc-300 border-[#27272a]'
                      }`}
                    >
                      #{rIdx + 1} {r.name}: {r.total.toLocaleString()} pts {rIdx > 0 && `(-${leadDiff.toLocaleString()})`}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
