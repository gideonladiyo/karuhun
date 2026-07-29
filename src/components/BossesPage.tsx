import React, { useState } from 'react';
import { FULL_PPC_BOSSES, PpcBossDetail } from '../data/ppc_scores';
import { Skull, Search, Flame, Snowflake, Zap, Moon, Shield, Clock, HeartPulse } from 'lucide-react';

interface BossesPageProps {
  onOpenCalculator?: (bossSlug?: string) => void;
}

export const BossesPage: React.FC<BossesPageProps> = () => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedWeaknessFilter, setSelectedWeaknessFilter] = useState<string>('all');

  const filteredBosses = FULL_PPC_BOSSES.filter((b) => {
    const matchesSearch =
      b.boss.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.slug.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.weakness.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesWeakness =
      selectedWeaknessFilter === 'all' ||
      b.weakness.toLowerCase().includes(selectedWeaknessFilter.toLowerCase());
    return matchesSearch && matchesWeakness;
  });

  return (
    <div className="space-y-6 sm:space-y-8 animate-fadeIn pb-16 md:pb-0">
      
      {/* Header Banner */}
      <div className="minimal-card p-5 sm:p-8 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-[#18181b] border border-[#27272a] text-zinc-300 text-xs font-tech font-bold uppercase tracking-wider">
              <Skull className="w-3.5 h-3.5 text-white" />
              <span>Official Google Sheets PPC Boss Database ({FULL_PPC_BOSSES.length} Bosses)</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-heading font-bold text-white">
              PGR PPC BOSS <span className="text-zinc-500 font-normal">DIRECTORY &amp; STATS</span>
            </h1>
            <p className="text-xs font-tech text-zinc-400">
              Menampilkan seluruh boss PPC lengkap dengan gambar, HP Knight/Chaos/Hell, start time delay, dan weakness
            </p>
          </div>

          {/* Search & Element Filter */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <div className="relative min-w-[220px]">
              <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Cari Boss / Weakness..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-[#09090b] text-sm text-white border border-[#27272a] rounded-xl pl-9 pr-4 py-2.5 focus:outline-none focus:border-white font-sans"
              />
            </div>

            <select
              value={selectedWeaknessFilter}
              onChange={(e) => setSelectedWeaknessFilter(e.target.value)}
              className="bg-[#09090b] text-xs font-tech font-bold text-white border border-[#27272a] rounded-xl px-3 py-2.5 focus:outline-none cursor-pointer"
            >
              <option value="all">Semua Weakness Boss</option>
              <option value="fire">Fire Damage</option>
              <option value="ice">Ice Damage</option>
              <option value="lightning">Lightning Damage</option>
              <option value="dark">Dark Damage</option>
              <option value="physical">Physical Damage</option>
            </select>
          </div>
        </div>
      </div>

      {/* Full Bosses Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between px-1">
          <span className="text-xs font-tech font-bold text-zinc-400 uppercase tracking-wider">
            DAFTAR SELURUH BOSS ({filteredBosses.length} / {FULL_PPC_BOSSES.length})
          </span>
          <span className="text-[11px] font-tech text-zinc-500">Live Data via Google Sheets API</span>
        </div>

        {filteredBosses.length === 0 ? (
          <div className="text-center py-16 bg-[#121215] rounded-2xl border border-[#27272a] text-zinc-400 font-tech text-sm">
            Tidak ada boss yang sesuai dengan pencarian Anda.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredBosses.map((boss) => (
              <div
                key={boss.slug}
                className="minimal-card p-4 sm:p-5 flex flex-col justify-between hover:border-white transition-all shadow-md group"
              >
                {/* Top Section: Left Img + Right Details Column (Matches User Diagram) */}
                <div className="flex items-start space-x-4">
                  
                  {/* Left Large Img Container */}
                  <div className="relative w-28 h-36 sm:w-32 sm:h-40 rounded-2xl bg-black p-1 flex-shrink-0 border border-[#27272a] group-hover:border-white transition-colors overflow-hidden">
                    <img
                      src={boss.img_url}
                      alt={boss.boss}
                      className="w-full h-full object-cover rounded-xl filter contrast-110 group-hover:scale-105 transition-transform duration-300"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://assets.huaxu.app/glb/image/uifubenbosssingle/bosssingletab53.webp';
                      }}
                    />
                  </div>

                  {/* Right Details Column (Name, Knight, Chaos, Hell, Start time) */}
                  <div className="flex-1 min-w-0 space-y-1.5 font-tech text-xs">
                    <h3 className="font-heading font-bold text-lg sm:text-xl text-white truncate leading-tight">
                      {boss.boss}
                    </h3>

                    <div className="space-y-1 pt-1">
                      <div className="flex justify-between items-center bg-[#09090b] px-2 py-1 rounded-md border border-[#27272a]">
                        <span className="text-zinc-400 text-[10px] uppercase font-bold">Knight</span>
                        <strong className="text-white text-xs">{boss.knight || '-'}</strong>
                      </div>

                      <div className="flex justify-between items-center bg-[#09090b] px-2 py-1 rounded-md border border-[#27272a]">
                        <span className="text-zinc-400 text-[10px] uppercase font-bold">Chaos</span>
                        <strong className="text-white text-xs">{boss.chaos || '-'}</strong>
                      </div>

                      <div className="flex justify-between items-center bg-[#09090b] px-2 py-1 rounded-md border border-[#27272a]">
                        <span className="text-zinc-400 text-[10px] uppercase font-bold">Hell</span>
                        <strong className="text-white text-xs">{boss.hell || '-'}</strong>
                      </div>

                      <div className="flex justify-between items-center bg-[#09090b] px-2 py-1 rounded-md border border-[#27272a]">
                        <span className="text-zinc-400 text-[10px] uppercase font-bold">Start Time</span>
                        <strong className="text-white text-xs">{boss.start_time || 'N/A'}</strong>
                      </div>
                    </div>
                  </div>

                </div>

                {/* Bottom Full Width Weakness Section (Matches User Diagram) */}
                <div className="mt-4 pt-3 border-t border-[#27272a] space-y-1">
                  <span className="text-[10px] font-tech font-bold text-zinc-400 uppercase tracking-wider block">
                    WEAKNESS
                  </span>
                  <p className="text-xs font-sans text-zinc-200 leading-relaxed bg-black/60 p-3 rounded-xl border border-[#27272a] italic">
                    "{boss.weakness}"
                  </p>
                </div>

              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
};
