import React, { useState, useEffect } from 'react';
import { getLiveOrStoredPpcBossesInfo, getLiveOrStoredPpcBossesInfoAsync, PPCBossInfo } from '@/data/static/ppcScores';
import { Skull, Search, Flame, Zap, ShieldAlert, Clock, Sparkles, Filter, ChevronRight } from 'lucide-react';

interface BossesPageProps {
  onOpenCalculator?: (bossSlug?: string) => void;
}

export const BossesPage: React.FC<BossesPageProps> = ({ onOpenCalculator }) => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedDifficulty, setSelectedDifficulty] = useState<'all' | 'ultimate' | 'advanced'>('all');
  const [bossesData, setBossesData] = useState<{ updatedAt?: string; bosses: PPCBossInfo[] }>(() =>
    getLiveOrStoredPpcBossesInfo()
  );

  useEffect(() => {
    getLiveOrStoredPpcBossesInfoAsync().then((res) => {
      if (res && res.bosses && res.bosses.length > 0) {
        setBossesData(res);
      }
    });
  }, []);

  const filteredBosses = bossesData.bosses.filter((boss: PPCBossInfo) => {
    const matchesSearch =
      boss.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      boss.weakness.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDifficulty =
      selectedDifficulty === 'all' ||
      (selectedDifficulty === 'ultimate' && boss.difficulty === 'Ultimate') ||
      (selectedDifficulty === 'advanced' && boss.difficulty === 'Advanced');
    return matchesSearch && matchesDifficulty;
  });

  return (
    <div className="space-y-6 sm:space-y-8 animate-fadeIn pb-16 md:pb-0">
      
      {/* Header Banner */}
      <div className="minimal-card p-5 sm:p-8 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-[#18181b] border border-[#27272a] text-zinc-300 text-xs font-tech font-bold uppercase tracking-wider">
              <Skull className="w-3.5 h-3.5 text-white" />
              <span>Phantom Pain Cage Database</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-heading font-bold text-white">
              PPC BOSS DIRECTORY <span className="text-zinc-500 font-normal">&amp; MECHANICS</span>
            </h1>
            <p className="text-xs font-tech text-zinc-400">
              Official 39+ PPC Boss Database with Knight / Chaos / Hell HP specs, opener delay timers &amp; elemental weaknesses
            </p>
          </div>

          {/* Difficulty Filter Tabs */}
          <div className="flex items-center bg-black p-1 rounded-xl border border-[#27272a]">
            <button
              onClick={() => setSelectedDifficulty('all')}
              className={`px-3.5 py-2 rounded-lg text-xs font-heading font-bold transition-all ${
                selectedDifficulty === 'all' ? 'bg-white text-black shadow-sm' : 'text-zinc-400 hover:text-white'
              }`}
            >
              ALL BOSSES
            </button>
            <button
              onClick={() => setSelectedDifficulty('ultimate')}
              className={`px-3.5 py-2 rounded-lg text-xs font-heading font-bold transition-all ${
                selectedDifficulty === 'ultimate' ? 'bg-white text-black shadow-sm' : 'text-zinc-400 hover:text-white'
              }`}
            >
              ULTIMATE
            </button>
            <button
              onClick={() => setSelectedDifficulty('advanced')}
              className={`px-3.5 py-2 rounded-lg text-xs font-heading font-bold transition-all ${
                selectedDifficulty === 'advanced' ? 'bg-white text-black shadow-sm' : 'text-zinc-400 hover:text-white'
              }`}
            >
              ADVANCED
            </button>
          </div>
        </div>
      </div>

      {/* Search & Stats Bar */}
      <div className="minimal-card p-4 space-y-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          
          {/* Search Input */}
          <div className="relative min-w-[260px]">
            <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search Boss Name / Elemental Weakness..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[#09090b] text-xs text-white border border-[#27272a] rounded-xl pl-9 pr-4 py-2.5 focus:outline-none focus:border-white font-sans"
            />
          </div>

          <div className="text-xs font-tech text-zinc-400">
            Showing <strong className="text-white">{filteredBosses.length}</strong> of {bossesData.bosses.length} Total Bosses
          </div>

        </div>
      </div>

      {/* Boss Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredBosses.map((boss: PPCBossInfo) => (
          <div
            key={boss.slug}
            className="minimal-card p-5 space-y-4 flex flex-col justify-between border border-[#27272a] hover:border-zinc-500 transition-all"
          >
            {/* Top Layout: Tall Left Image + Right Vertical Stat Column */}
            <div className="grid grid-cols-12 gap-4 items-stretch">
              
              {/* Left Column: Tall Boss Image */}
              <div className="col-span-5 relative rounded-2xl bg-black border border-[#27272a] overflow-hidden min-h-[160px] flex items-center justify-center">
                <img
                  src={boss.imageUrl}
                  alt={boss.name}
                  className="w-full h-full object-cover filter contrast-110"
                />
                <div className="absolute top-2 left-2">
                  <span className="bg-black/90 text-white font-tech font-bold text-[9px] px-2 py-0.5 rounded border border-[#27272a] uppercase">
                    {boss.difficulty}
                  </span>
                </div>
              </div>

              {/* Right Column: Name & HP / Timer Stack */}
              <div className="col-span-7 flex flex-col justify-between space-y-2">
                <div className="space-y-1">
                  <h3 className="font-heading font-bold text-base sm:text-lg text-white leading-tight">
                    {boss.name}
                  </h3>
                  <div className="flex items-center space-x-1.5 text-[11px] font-tech text-zinc-400">
                    <Clock className="w-3.5 h-3.5 text-white flex-shrink-0" />
                    <span>Opener Delay: <strong className="text-white">{boss.startTimeSec}s</strong></span>
                  </div>
                </div>

                {/* HP Specs List */}
                <div className="space-y-1.5 pt-2 border-t border-[#27272a]">
                  <div className="flex items-center justify-between text-xs font-tech">
                    <span className="text-zinc-400 font-bold">Knight HP:</span>
                    <span className="text-white font-bold">{boss.hpKnight ? boss.hpKnight.toLocaleString() : '-'}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs font-tech">
                    <span className="text-zinc-400 font-bold">Chaos HP:</span>
                    <span className="text-white font-bold">{boss.hpChaos ? boss.hpChaos.toLocaleString() : '-'}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs font-tech">
                    <span className="text-zinc-400 font-bold">Hell HP:</span>
                    <span className="text-white font-bold">{boss.hpHell ? boss.hpHell.toLocaleString() : '-'}</span>
                  </div>
                </div>
              </div>

            </div>

            {/* Bottom Full-Width Element Box */}
            <div className="bg-black p-3.5 rounded-xl border border-[#27272a] space-y-1">
              <span className="text-[10px] font-tech text-zinc-400 uppercase font-bold tracking-wider block">
                ELEMENTAL WEAKNESS / MECHANICS
              </span>
              <p className="text-xs font-sans text-zinc-200 leading-relaxed font-medium">
                {boss.weakness}
              </p>
            </div>

          </div>
        ))}
      </div>

    </div>
  );
};
