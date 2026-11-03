import React, { useState } from 'react';
import { Trophy, Shield, ChevronRight } from 'lucide-react';
import { GUILD_BRANCHES, GuildBranchConfig } from '@/services/imageUtils';
import { MainTab } from '@/pages/HomePage';
import { BranchLogoCarousel } from './BranchLogoCarousel';
import { Button } from '@/components/ui/button';

interface HeroSectionProps {
  onNavigate: (tab: MainTab, branchId?: number) => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ onNavigate }) => {
  const [selectedBranchIndex, setSelectedBranchIndex] = useState<number>(0);

  const activeBranch: GuildBranchConfig = GUILD_BRANCHES[selectedBranchIndex] || GUILD_BRANCHES[0];

  const actionBlock = (
    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
      <Button
        variant="default"
        size="lg"
        onClick={() => onNavigate('hub', activeBranch.id)}
        className="justify-between sm:justify-center gap-3"
      >
        <span className="flex items-center gap-2">
          <Shield className="w-4 h-4 text-black" />
          <span>Open Guild Details</span>
        </span>
        <ChevronRight className="w-4 h-4 text-black/70" />
      </Button>

      <Button
        variant="secondary"
        size="lg"
        onClick={() => onNavigate('leaderboards')}
        className="justify-between sm:justify-center gap-3"
      >
        <span className="flex items-center gap-2">
          <Trophy className="w-4 h-4 text-amber-400" />
          <span>View Rankings</span>
        </span>
        <ChevronRight className="w-4 h-4 text-zinc-400" />
      </Button>
    </div>
  );

  return (
    <section className="relative w-full">
      <div className="relative rounded-xl sm:rounded-2xl bg-[#121215] p-5 sm:p-8 lg:p-10 border border-[#27272a] flex flex-col justify-between overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 lg:gap-10 items-center">
          {/* LEFT COLUMN: Title & Desktop CTAs */}
          <div className="lg:col-span-7 space-y-5 sm:space-y-6">
            <div className="space-y-1.5">
              <h1 className="font-heading font-black text-3xl sm:text-5xl lg:text-6xl text-white tracking-tight leading-[1.08]">
                KARUHUN <span className="text-zinc-500 font-normal">夜</span>
              </h1>
              <p className="font-heading font-bold text-base sm:text-xl lg:text-2xl text-zinc-400 tracking-normal">
                Top 1 Simulated Siege Guild
              </p>
            </div>

            <div className="hidden lg:block">
              {actionBlock}
            </div>
          </div>

          {/* RIGHT COLUMN: Branch Logo Carousel + Mobile CTAs */}
          <div className="lg:col-span-5 flex flex-col items-center justify-center relative w-full">
            <BranchLogoCarousel
              selectedIndex={selectedBranchIndex}
              onSelectIndex={setSelectedBranchIndex}
              onNavigate={onNavigate}
            />

            <div className="w-full mt-5 sm:mt-6 lg:hidden">
              {actionBlock}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
