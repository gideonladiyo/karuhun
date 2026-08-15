import React, { useState, useEffect } from 'react';
import { Shield, Users, ChevronRight, Layers, CheckCircle2, Activity, UserCheck, UserX } from 'lucide-react';
import { SIEGE_BRANCH_DATA, SiegeBranchData } from '@/data/siegeBranchData';
import { getAllianceLiveActivity } from '@/services/apiService';
import { AllianceActivitySummary, GuildActivityStats } from '@/types';
import { MainTab } from '@/pages/HomePage';

interface BranchSiegeSectionProps {
  onNavigate: (tab: MainTab, branchId?: number) => void;
}

export const BranchSiegeSection: React.FC<BranchSiegeSectionProps> = ({ onNavigate }) => {
  const [selectedRegion, setSelectedRegion] = useState<'all' | 'ap' | 'na'>('all');
  const [liveActivity, setLiveActivity] = useState<AllianceActivitySummary | null>(null);
  const [loadingActivity, setLoadingActivity] = useState<boolean>(true);

  useEffect(() => {
    getAllianceLiveActivity()
      .then((data) => {
        setLiveActivity(data);
        setLoadingActivity(false);
      })
      .catch((err) => {
        console.error('Failed to load branch activity', err);
        setLoadingActivity(false);
      });
  }, []);

  const filteredBranches = SIEGE_BRANCH_DATA.filter((b) => {
    if (selectedRegion === 'all') return true;
    return b.server === selectedRegion;
  });

  return (
    <section className="relative w-full mb-14 sm:mb-20 animate-fadeIn">
      
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6 sm:mb-8 pb-4 border-b border-[#27272a]">
        <div>
          <div className="text-[10px] sm:text-xs font-tech text-amber-500 uppercase tracking-widest mb-1 flex items-center space-x-1.5">
            <Layers className="w-3.5 h-3.5" />
            <span>02 // SECTOR TELEMETRY</span>
          </div>
          <h2 className="font-heading font-bold text-lg sm:text-xl text-white tracking-wider">
            UNION BRANCHES & SIEGE STATUS
          </h2>
          <p className="text-zinc-400 text-xs sm:text-sm font-sans mt-1">
            Status operasional, keaktifan member harian (&le;7 hari), dan akses cepat seluruh divisi KARUHUN.
          </p>
        </div>

        {/* Region Filter Buttons */}
        <div className="flex items-center space-x-1 bg-[#121215] p-1 rounded-xl border border-[#27272a] self-start sm:self-auto">
          <button
            onClick={() => setSelectedRegion('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-tech transition-all focus-tactical ${
              selectedRegion === 'all'
                ? 'bg-white text-black font-bold shadow-sm'
                : 'text-zinc-400 hover:text-white hover:bg-[#18181b]'
            }`}
          >
            ALL ({SIEGE_BRANCH_DATA.length})
          </button>
          <button
            onClick={() => setSelectedRegion('ap')}
            className={`px-3 py-1.5 rounded-lg text-xs font-tech transition-all focus-tactical ${
              selectedRegion === 'ap'
                ? 'bg-white text-black font-bold shadow-sm'
                : 'text-zinc-400 hover:text-white hover:bg-[#18181b]'
            }`}
          >
            AP (3)
          </button>
          <button
            onClick={() => setSelectedRegion('na')}
            className={`px-3 py-1.5 rounded-lg text-xs font-tech transition-all focus-tactical ${
              selectedRegion === 'na'
                ? 'bg-white text-black font-bold shadow-sm'
                : 'text-zinc-400 hover:text-white hover:bg-[#18181b]'
            }`}
          >
            NA (1)
          </button>
        </div>
      </div>

      {/* Branch Cards Grid (Double-Bezel Asymmetric Grid) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
        {filteredBranches.map((branch: SiegeBranchData) => {
          const stats: GuildActivityStats | undefined = liveActivity?.branches[branch.id];

          const totalMembers = stats?.totalMembers ?? 80;
          const activeMembers = stats?.activeMembers ?? totalMembers;
          const inactiveMembers = stats?.inactiveMembers ?? 0;
          const activePct = stats?.activePercentage ?? 100;

          return (
            <div
              key={`${branch.server}-${branch.id}`}
              className="p-1 rounded-2xl bg-[#18181b]/40 border border-[#27272a] hover:border-zinc-500/80 transition-all group"
            >
              <div className="rounded-xl bg-[#0d0d11] p-5 sm:p-6 border border-[#27272a]/60 bracket-corner flex flex-col justify-between h-full">
                
                {/* Header: Division Code & Tier Badge */}
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="text-[10px] font-tech text-zinc-500 uppercase tracking-widest">
                      {branch.divisionCode}
                    </span>
                    
                    <div className="flex items-center space-x-1.5">
                      <span className="text-[10px] font-tech font-bold uppercase px-2 py-0.5 rounded bg-[#18181b] border border-[#27272a] text-zinc-300">
                        {branch.server.toUpperCase()}
                      </span>
                      <span className={`text-[10px] font-tech font-bold uppercase px-2.5 py-0.5 rounded border ${branch.badgeColor.border} ${branch.badgeColor.bg} ${branch.badgeColor.text}`}>
                        {branch.tier}
                      </span>
                    </div>
                  </div>

                  {/* Branch Name & Reference Target */}
                  <div className="mb-4">
                    <h3 className="font-heading font-black text-xl sm:text-2xl text-white tracking-tight group-hover:text-amber-400 transition-colors">
                      {branch.name}
                    </h3>
                    <div className="text-xs font-tech text-zinc-400 mt-0.5 flex items-center space-x-2">
                      <span className="text-zinc-500">TARGET:</span>
                      <span className="text-zinc-200 font-semibold">{branch.targetRef}</span>
                    </div>
                  </div>

                  {/* Member Activity Telemetry Strip */}
                  <div className="grid grid-cols-2 gap-2 mb-4 p-2.5 rounded-xl bg-[#121215] border border-[#27272a] text-xs font-tech">
                    <div className="flex items-center space-x-2">
                      <UserCheck className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                      <div>
                        <div className="text-[10px] text-zinc-500 uppercase">Aktif (&le;7 Hari)</div>
                        <div className="font-bold text-white tabular-nums">
                          {loadingActivity ? '...' : `${activeMembers} Member (${activePct}%)`}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 border-l border-[#27272a] pl-2.5">
                      <UserX className="w-3.5 h-3.5 text-zinc-500 flex-shrink-0" />
                      <div>
                        <div className="text-[10px] text-zinc-500 uppercase">Offline (&gt;7 Hari)</div>
                        <div className="font-bold text-zinc-400 tabular-nums">
                          {loadingActivity ? '...' : `${inactiveMembers} Member`}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Clearance Telemetry Gauge */}
                  <div className="bg-[#121215] border border-[#27272a] rounded-xl p-3.5 mb-5 space-y-2">
                    <div className="flex items-center justify-between text-xs font-tech">
                      <span className="text-zinc-400 uppercase tracking-wider flex items-center space-x-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                        <span>CLEARANCE PROGRESS</span>
                      </span>
                      <span className="font-bold text-white tabular-nums">{branch.clearanceRate}%</span>
                    </div>

                    {/* Progress Bar Track */}
                    <div className="w-full h-2 rounded-full bg-[#18181b] border border-[#27272a] overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${branch.badgeColor.accent}`}
                        style={{ width: `${branch.clearanceRate}%` }}
                      />
                    </div>

                    {/* Milestone Info */}
                    <div className="text-[11px] font-tech text-zinc-400 leading-tight pt-1 flex items-start space-x-1.5">
                      <span className="text-zinc-600 font-bold">»</span>
                      <span className="text-zinc-300">{branch.currentMilestone}</span>
                    </div>
                  </div>
                </div>

                {/* Footer: Roster & Direct Navigation CTAs */}
                <div className="pt-4 border-t border-[#27272a]/70 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center space-x-2 text-xs font-tech text-zinc-400">
                    <Users className="w-3.5 h-3.5 text-zinc-500" />
                    <span>CAPACITY: <strong className="text-zinc-200 tabular-nums">{loadingActivity ? '80/80' : `${totalMembers}/80`}</strong></span>
                  </div>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => onNavigate('members', branch.id)}
                      className="flex-1 sm:flex-initial px-3 py-1.5 rounded-lg bg-[#18181b] hover:bg-[#222228] text-zinc-300 hover:text-white border border-[#27272a] text-xs font-heading font-bold transition-all focus-tactical"
                    >
                      ROSTER
                    </button>

                    <button
                      onClick={() => onNavigate('hub', branch.id)}
                      className="flex-1 sm:flex-initial flex items-center justify-center space-x-1.5 px-3.5 py-1.5 rounded-lg bg-white hover:bg-zinc-200 text-black text-xs font-heading font-bold transition-all focus-tactical shadow-sm"
                    >
                      <span>ENTER HUB</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

              </div>
            </div>
          );
        })}
      </div>

    </section>
  );
};
