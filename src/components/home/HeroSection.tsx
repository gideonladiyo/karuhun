import React, { useState } from 'react';
import { Trophy, Shield, ChevronRight } from 'lucide-react';
import { GUILD_BRANCHES, GuildBranchConfig } from '@/services/imageUtils';
import { MainTab } from '@/pages/HomePage';
import { BranchLogoCarousel } from './BranchLogoCarousel';
import { HeroCategoryGrid } from './HeroCategoryGrid';
import { useHeroVariant } from '@/hooks/useHeroVariant';

interface HeroSectionProps {
  onNavigate: (tab: MainTab, branchId?: number) => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ onNavigate }) => {
  const [selectedBranchIndex, setSelectedBranchIndex] = useState<number>(0);
  const heroVariant = useHeroVariant();

  const activeBranch: GuildBranchConfig = GUILD_BRANCHES[selectedBranchIndex] || GUILD_BRANCHES[0];

  return (
    <section className="relative w-full mb-10 sm:mb-16 animate-fadeIn">
      
      {/* Main Double-Bezel Tactical Hero Container */}
      <div className="p-1 sm:p-1.5 rounded-2xl sm:rounded-3xl bg-[#18181b]/50 border border-[#27272a] relative overflow-hidden">
        
        {/* Inner Core Content */}
        <div className="relative rounded-xl sm:rounded-2xl bg-[#0d0d11] p-6 sm:p-8 lg:p-10 border border-[#27272a]/80 bracket-corner flex flex-col justify-between overflow-hidden">
          
          {/* TOP AREA: 2 Columns (Left: Hero Text & Buttons, Right: Guild Card Switcher) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center">
            
            {/* LEFT COLUMN: Macro Title, Dual CTA Buttons (7 cols on desktop) */}
            <div className="lg:col-span-7 space-y-5 sm:space-y-6">

              {/* Macro Title */}
              <div className="space-y-1">
                <h1 className="font-heading font-black text-3xl sm:text-5xl lg:text-6xl text-white tracking-tight leading-[1.08]">
                  KARUHUN <span className="text-zinc-500 font-normal">夜</span>
                </h1>
                <p className="font-heading font-bold text-base sm:text-xl lg:text-2xl text-zinc-400 tracking-normal">
                  TOP 1 SIMULATED SIEGE GUILD
                </p>
              </div>

              {/* R4 Experiment: Category Grid ( ?hero=categories ) OR Control: Dual CTAs */}
              {heroVariant === 'categories' ? (
                <HeroCategoryGrid onNavigate={onNavigate} />
              ) : (
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">

                  {/* Primary CTA: Open Active Guild Branch */}
                  <button
                    onClick={() => onNavigate('hub', activeBranch.id)}
                    className="group relative flex items-center justify-between sm:justify-center space-x-3 px-5 py-3.5 rounded-xl bg-white hover:bg-zinc-200 text-black font-heading font-bold text-xs sm:text-sm transition-all active:scale-[0.98] shadow-lg shadow-white/5 focus-tactical"
                  >
                    <div className="flex items-center space-x-2.5">
                      <Shield className="w-4 h-4 text-black" />
                      <span>OPEN GUILD DETAILS</span>
                    </div>
                    <div className="w-6 h-6 rounded-lg bg-black/10 flex items-center justify-center group-hover:translate-x-0.5 transition-transform">
                      <ChevronRight className="w-3.5 h-3.5 text-black" />
                    </div>
                  </button>

                  {/* Secondary CTA: Member Rankings */}
                  <button
                    onClick={() => onNavigate('leaderboards')}
                    className="group flex items-center justify-between sm:justify-center space-x-3 px-5 py-3.5 rounded-xl bg-[#18181b] hover:bg-[#202025] text-zinc-200 hover:text-white border border-[#27272a] hover:border-zinc-500 font-heading font-bold text-xs sm:text-sm transition-all active:scale-[0.98] focus-tactical"
                  >
                    <div className="flex items-center space-x-2.5">
                      <Trophy className="w-4 h-4 text-amber-400" />
                      <span>VIEW RANKINGS</span>
                    </div>
                    <div className="w-6 h-6 rounded-lg bg-white/10 flex items-center justify-center group-hover:translate-x-0.5 transition-transform">
                      <ChevronRight className="w-3.5 h-3.5 text-white" />
                    </div>
                  </button>

                </div>
              )}

            </div>

            {/* RIGHT COLUMN: Flat Landscape Branch Logo Carousel */}
            <div className="lg:col-span-5 flex flex-col items-center justify-center relative">
              <BranchLogoCarousel
                selectedIndex={selectedBranchIndex}
                onSelectIndex={setSelectedBranchIndex}
                onNavigate={onNavigate}
              />
            </div>

          </div>

        </div>

      </div>

    </section>
  );
};
