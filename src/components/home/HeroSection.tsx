import React, { useState, useEffect } from 'react';
import { Trophy, Shield, Activity, ChevronRight, Server, Compass, Users } from 'lucide-react';
import { getAllianceLiveActivity } from '@/services/apiService';
import { AllianceActivitySummary } from '@/types';
import { MainTab } from '@/pages/HomePage';

interface HeroSectionProps {
  onNavigate: (tab: MainTab, branchId?: number) => void;
}

const karuhunLogo = '/logo.png';

export const HeroSection: React.FC<HeroSectionProps> = ({ onNavigate }) => {
  const [activity, setActivity] = useState<AllianceActivitySummary | null>(null);
  const [loadingActivity, setLoadingActivity] = useState<boolean>(true);

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

  return (
    <section className="relative w-full mb-10 sm:mb-14 animate-fadeIn">

      {/* 2. Main Double-Bezel Hero Card */}
      <div className="p-1 sm:p-1.5 rounded-2xl sm:rounded-3xl bg-[#18181b]/50 border border-[#27272a] relative overflow-hidden">
        
        {/* Inner Core Container */}
        <div className="relative rounded-[calc(1rem+0.25rem)] sm:rounded-[calc(1.5rem-0.25rem)] bg-[#0d0d11] p-6 sm:p-10 lg:p-12 border border-[#27272a]/80 bracket-corner">
          
          {/* Subtle Karuhun Logo Background Watermark */}
          <div className="absolute right-4 top-4 sm:right-8 sm:top-8 select-none pointer-events-none opacity-[0.08] hidden sm:block w-48 h-48 sm:w-60 sm:h-60 lg:w-72 lg:h-72 overflow-hidden">
            <img 
              src={karuhunLogo} 
              alt="Karuhun Watermark" 
              className="w-full h-full object-contain filter contrast-125 grayscale"
            />
          </div>

          <div className="relative z-10 max-w-4xl">

            {/* Macro Title */}
            <h1 className="font-heading font-black text-3xl sm:text-5xl lg:text-6xl text-white tracking-tight leading-[1.1] mb-4 sm:mb-6">
              KARUHUN <span className="text-zinc-500 font-normal">夜</span>
              <span className="block text-xl sm:text-2xl lg:text-3xl text-zinc-400 font-bold mt-1 tracking-normal">
                SIMULATED SIEGE COMPETITIVE GUILD
              </span>
            </h1>

            {/* Mission Copy */}
            <p className="text-zinc-400 text-sm sm:text-base lg:text-lg max-w-2xl leading-relaxed mb-8 font-sans">
              Premier Punishing: Gray Raven union commanding multi-tier divisions across Asia-Pacific and North America. Dedicated to endgame optimization, Simulated Siege dominance, and competitive Warzone excellence.
            </p>

            {/* Action Buttons (Dual Nested Architecture) */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4 mb-10">

              {/* Primary CTA: Open Guild Details (White) */}
              <button
                onClick={() => onNavigate('hub', 3638)}
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
              
              {/* Secondary CTA: Member Rankings (Dark) */}
              <button
                onClick={() => onNavigate('leaderboards')}
                className="group flex items-center justify-between sm:justify-center space-x-3 px-5 py-3.5 rounded-xl bg-[#18181b] hover:bg-[#202025] text-zinc-200 hover:text-white border border-[#27272a] hover:border-zinc-500 font-heading font-bold text-xs sm:text-sm transition-all active:scale-[0.98] focus-tactical"
              >
                <div className="flex items-center space-x-2.5">
                  <Trophy className="w-4 h-4 " />
                  <span>VIEW MEMBER RANKINGS</span>
                </div>
                <div className="w-6 h-6 rounded-lg bg-white/10 flex items-center justify-center group-hover:translate-x-0.5 transition-transform">
                  <ChevronRight className="w-3.5 h-3.5 text-white" />
                </div>
              </button>
            </div>

            {/* Operational Readout Metrics Strip (Real-time Live Activity from API) */}
            <div className="pt-6 border-t border-[#27272a] grid grid-cols-2 sm:grid-cols-3 gap-4 text-zinc-300">
              
              <div className="space-y-1">
                <div className="text-[10px] sm:text-xs font-tech text-zinc-500 uppercase tracking-wider">Active Branch</div>
                <div className="font-heading font-bold text-lg sm:text-xl text-white tabular-nums">04 BRANCH</div>
                <div className="text-[11px] font-tech text-zinc-400">3 AP + 1 NA</div>
              </div>

              <div className="space-y-1">
                <div className="text-[10px] sm:text-xs font-tech text-zinc-500 uppercase tracking-wider">Current Total Members</div>
                <div className="font-heading font-bold text-lg sm:text-xl text-white tabular-nums">
                  {loadingActivity ? (
                    <span className="animate-pulse text-zinc-500 text-base">Loading...</span>
                  ) : (
                    `${activity?.totalMembers || 289} MEMBERS`
                  )}
                </div>
                <div className="text-[11px] font-tech text-zinc-400">
                  {loadingActivity ? 'Checking...' : `${activity?.totalActive || 265} Active (≤7d)`}
                </div>
              </div>

              <div className="col-span-2 sm:col-span-1 space-y-1 border-t sm:border-t-0 border-[#27272a] pt-3 sm:pt-0">
                <div className="text-[10px] sm:text-xs font-tech text-zinc-500 uppercase tracking-wider">Member Activity Rate</div>
                <div className="font-heading font-bold text-lg sm:text-xl text-emerald-400 tabular-nums">
                  {loadingActivity ? (
                    <span className="animate-pulse text-zinc-500 text-base">Calculating...</span>
                  ) : (
                    `${activity?.overallActivePercentage || 91.7}% ACTIVE`
                  )}
                </div>
                <div className="text-[11px] font-tech text-zinc-400">
                  {loadingActivity ? 'Realtime check' : `${activity?.totalInactive || 24} Offline >7d`}
                </div>
              </div>

            </div>

          </div>

        </div>

      </div>

    </section>
  );
};
