import React, { useState, useEffect } from 'react';
import { Trophy, Shield, ChevronRight, ChevronLeft, Layers, Users, CheckCircle2, Award } from 'lucide-react';
import { getAllianceLiveActivity } from '@/services/apiService';
import { AllianceActivitySummary } from '@/types';
import { GUILD_BRANCHES, GuildBranchConfig } from '@/services/imageUtils';
import { MainTab } from '@/pages/HomePage';
import { Hero3DCardStack } from './Hero3DCardStack';

interface HeroSectionProps {
  onNavigate: (tab: MainTab, branchId?: number) => void;
}

const karuhunLogo = '/logo.png';

export const HeroSection: React.FC<HeroSectionProps> = ({ onNavigate }) => {
  const [activity, setActivity] = useState<AllianceActivitySummary | null>(null);
  const [loadingActivity, setLoadingActivity] = useState<boolean>(true);
  const [selectedBranchIndex, setSelectedBranchIndex] = useState<number>(0);

  useEffect(() => {
    getAllianceLiveActivity()
      .then((data) => {
        setActivity(data);
        setLoadingActivity(false);
      })
      .catch((err) => {
        console.error('Failed to load alliance live activity', err);
        setLoadingActivity(false);
      });
  }, []);

  const activeBranch: GuildBranchConfig = GUILD_BRANCHES[selectedBranchIndex] || GUILD_BRANCHES[0];

  const handlePrevBranch = () => {
    setSelectedBranchIndex((prev) => (prev - 1 + GUILD_BRANCHES.length) % GUILD_BRANCHES.length);
  };

  const handleNextBranch = () => {
    setSelectedBranchIndex((prev) => (prev + 1) % GUILD_BRANCHES.length);
  };

  return (
    <section className="relative w-full mb-10 sm:mb-16 animate-fadeIn">
      
      {/* Main Double-Bezel Tactical Hero Container */}
      <div className="p-1 sm:p-1.5 rounded-2xl sm:rounded-3xl bg-[#18181b]/50 border border-[#27272a] relative overflow-hidden">
        
        {/* Inner Core Content */}
        <div className="relative rounded-[calc(1rem+0.25rem)] sm:rounded-[calc(1.5rem-0.25rem)] bg-[#0d0d11] p-6 sm:p-8 lg:p-10 border border-[#27272a]/80 bracket-corner flex flex-col justify-between overflow-hidden">
          
          {/* TOP AREA: 2 Columns (Left: Hero Text & Buttons, Right: Guild Card Switcher) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center">
            
            {/* LEFT COLUMN: Macro Title, Mission Copy, Dual CTA Buttons (7 cols on desktop) */}
            <div className="lg:col-span-7 space-y-5 sm:space-y-6">

              {/* Macro Title */}
              <div className="space-y-1">
                <h1 className="font-heading font-black text-3xl sm:text-5xl lg:text-6xl text-white tracking-tight leading-[1.08]">
                  KARUHUN <span className="text-zinc-500 font-normal">夜</span>
                </h1>
                <p className="font-heading font-bold text-base sm:text-xl lg:text-2xl text-zinc-400 tracking-normal">
                  SIMULATED SIEGE COMPETITIVE GUILD
                </p>
              </div>

              {/* Mission Description Copy */}
              <p className="text-zinc-400 text-xs sm:text-sm lg:text-base leading-relaxed font-sans max-w-xl">
                Premier Punishing: Gray Raven union commanding multi-tier divisions across Asia-Pacific and North America. Dedicated to endgame optimization, Simulated Siege dominance, and competitive Warzone excellence.
              </p>

              {/* Action Buttons (Dual CTA Architecture) */}
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

            </div>

            {/* RIGHT COLUMN: 3D Animated Card Stack (X, Y, Z Position & Rotation Animation) */}
            <div className="lg:col-span-5 flex flex-col items-center justify-center relative">
              <Hero3DCardStack
                selectedIndex={selectedBranchIndex}
                onSelectIndex={setSelectedBranchIndex}
                onNavigate={onNavigate}
              />
            </div>

          </div>

          {/* BOTTOM FULL-WIDTH AREA: Horizontal Line + 3 Operational Telemetry Metrics */}
          <div className="mt-8 pt-6 border-t border-[#27272a]/80 grid grid-cols-1 sm:grid-cols-3 gap-5 text-zinc-300">
            
            {/* Metric 1: Active Branch Count */}
            <div className="space-y-1">
              <div className="text-[10px] sm:text-xs font-tech text-zinc-400 uppercase tracking-wider font-bold flex items-center space-x-1.5">
                <Layers className="w-3.5 h-3.5 text-zinc-400" />
                <span>Active Alliance Divisions</span>
              </div>
              <div className="font-heading font-black text-xl sm:text-2xl text-white tabular-nums">
                04 DIVISIONS
              </div>
              <div className="text-[11px] font-tech text-zinc-500">
                3 Asia-Pacific (AP) + 1 North America (NA)
              </div>
            </div>

            {/* Metric 2: Total Alliance Members */}
            <div className="space-y-1">
              <div className="text-[10px] sm:text-xs font-tech text-zinc-400 uppercase tracking-wider font-bold flex items-center space-x-1.5">
                <Users className="w-3.5 h-3.5 text-zinc-400" />
                <span>Current Total Members</span>
              </div>
              <div className="font-heading font-black text-xl sm:text-2xl text-white tabular-nums">
                {loadingActivity ? (
                  <span className="animate-pulse text-zinc-500 text-lg">Loading...</span>
                ) : (
                  `${activity?.totalMembers || 289} MEMBERS`
                )}
              </div>
              <div className="text-[11px] font-tech text-zinc-500">
                {loadingActivity ? 'Checking...' : `${activity?.totalActive || 265} Active (≤7d)`}
              </div>
            </div>

            {/* Metric 3: Alliance Active Rate */}
            <div className="space-y-1">
              <div className="text-[10px] sm:text-xs font-tech text-emerald-400 uppercase tracking-wider font-bold flex items-center space-x-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Alliance Active Rate (≤7d)</span>
              </div>
              <div className="font-heading font-black text-xl sm:text-2xl text-emerald-400 tabular-nums">
                {loadingActivity ? (
                  <span className="animate-pulse text-zinc-500 text-lg">Calculating...</span>
                ) : (
                  `${activity?.overallActivePercentage || 91.7}% ACTIVE`
                )}
              </div>
              <div className="text-[11px] font-tech text-zinc-500">
                {loadingActivity ? 'Realtime sync' : `${activity?.totalInactive || 24} Offline (>7d)`}
              </div>
            </div>

          </div>

        </div>

      </div>

    </section>
  );
};
