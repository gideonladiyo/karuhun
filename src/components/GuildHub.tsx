import React from 'react';
import { GuildInfo } from '../types';
import { GUILD_BRANCHES, getHuaxuImageUrl } from '../services/imageUtils';
import { Users, Shield, Award, Calendar, ChevronRight, Sparkles, Globe } from 'lucide-react';
import karuhunLogo from '../Logo__4_-removebg-preview.png';

interface GuildHubProps {
  currentGuild: GuildInfo | null;
  selectedBranchId: number;
  onSelectBranch: (branchId: number) => void;
  onViewMembers: () => void;
  loading: boolean;
}

export const GuildHub: React.FC<GuildHubProps> = ({
  currentGuild,
  selectedBranchId,
  onSelectBranch,
  onViewMembers,
  loading
}) => {
  const activeBranch = GUILD_BRANCHES.find((b) => b.id === selectedBranchId) || GUILD_BRANCHES[0];

  return (
    <div className="space-y-8 animate-fadeIn pb-16 md:pb-0">
      
      {/* Alliance Division Branch Selector Grid */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Globe className="w-4 h-4 text-white" />
            <h2 className="text-xs font-heading font-bold text-white uppercase tracking-wider">
              ALLIANCE DIVISIONS (4 BRANCHES)
            </h2>
          </div>
          <span className="text-[11px] font-tech text-zinc-400">Pilih cabang guild</span>
        </div>

        {/* 1 column on mobile, 2 on tablet, 4 on desktop */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {GUILD_BRANCHES.map((branch) => {
            const isSelected = branch.id === selectedBranchId;

            return (
              <button
                key={branch.id}
                onClick={() => onSelectBranch(branch.id)}
                className={`minimal-card-interactive p-4 sm:p-5 text-left flex flex-col justify-between min-h-[120px] relative cursor-pointer ${
                  isSelected
                    ? 'border-white bg-[#18181b] shadow-lg'
                    : 'border-[#27272a] bg-[#121215]'
                }`}
              >
                <div className="flex items-start justify-between">
                  <span className="text-[10px] font-tech font-bold text-zinc-400 uppercase tracking-wider">
                    {branch.region}
                  </span>
                  <span className={`text-[10px] font-heading font-bold px-2 py-0.5 rounded-full uppercase ${
                    branch.tag === 'Competitive'
                      ? 'bg-white text-black'
                      : branch.tag === 'Sub-Competitive'
                      ? 'bg-zinc-200 text-black'
                      : 'bg-zinc-800 text-zinc-300'
                  }`}>
                    {branch.tag}
                  </span>
                </div>

                <div className="mt-2">
                  <h3 className="font-heading font-bold text-base sm:text-lg text-white">
                    {branch.name}
                  </h3>
                  <p className="text-xs font-tech text-zinc-400">
                    Guild ID: <span className="text-white font-bold">{branch.id}</span>
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Selected Branch Overview Card */}
      <div className="minimal-card p-6 sm:p-8 space-y-6">
        {loading ? (
          <div className="text-center py-16">
            <div className="inline-block animate-spin w-8 h-8 border-4 border-white border-t-transparent rounded-full mb-3" />
            <p className="text-xs font-tech text-zinc-400">Loading Guild Data...</p>
          </div>
        ) : (
          <>
            {/* Header info */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-[#27272a] pb-6">
              
              <div className="flex items-center space-x-4 sm:space-x-5">
                {/* Logo Box */}
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-black p-1.5 border border-[#27272a] flex-shrink-0 flex items-center justify-center shadow-md">
                  <img
                    src={currentGuild?.icon ? getHuaxuImageUrl(currentGuild.icon) : karuhunLogo}
                    alt={activeBranch.name}
                    className="w-full h-full object-contain filter contrast-125"
                  />
                </div>

                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h1 className="text-2xl sm:text-3xl font-heading font-bold text-white">
                      {currentGuild?.name || activeBranch.name}
                    </h1>
                    <span className="bg-white text-black text-xs font-heading font-bold px-2.5 py-0.5 rounded-full uppercase">
                      {activeBranch.tag}
                    </span>
                  </div>

                  <p className="text-xs font-tech text-zinc-400">
                    Region: <span className="text-white">{activeBranch.region}</span> • Guild ID: <span className="text-white">{activeBranch.id}</span>
                  </p>
                </div>
              </div>

              {/* Action Button */}
              <div>
                <button
                  onClick={onViewMembers}
                  className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-5 py-3 rounded-xl bg-white hover:bg-zinc-200 text-black font-heading font-bold text-xs transition-all shadow-md uppercase tracking-wider"
                >
                  <span>LIHAT DAFTAR MEMBER</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

            </div>

            {/* Guild Declaration Quote */}
            {currentGuild?.declaration && (
              <div className="bg-black p-4 rounded-xl border border-[#27272a] space-y-1">
                <span className="text-[10px] font-tech text-zinc-400 uppercase tracking-widest block font-bold">
                  Guild Declaration / Visi Ops
                </span>
                <p className="text-xs sm:text-sm font-sans text-zinc-300 italic leading-relaxed">
                  "{currentGuild.declaration}"
                </p>
              </div>
            )}

            {/* Guild Metrics Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 pt-2">
              <div className="bg-black/60 border border-[#27272a] rounded-xl p-4 text-center">
                <Users className="w-4 h-4 text-zinc-400 mx-auto mb-1" />
                <span className="text-[10px] font-tech uppercase text-zinc-400 block">Total Member</span>
                <h4 className="font-heading font-bold text-lg sm:text-xl text-white mt-0.5">
                  {currentGuild?.memberCount || 75} / {currentGuild?.maxMemberCount || 80}
                </h4>
              </div>

              <div className="bg-black/60 border border-[#27272a] rounded-xl p-4 text-center">
                <Shield className="w-4 h-4 text-zinc-400 mx-auto mb-1" />
                <span className="text-[10px] font-tech uppercase text-zinc-400 block">Guild Level</span>
                <h4 className="font-heading font-bold text-lg sm:text-xl text-white mt-0.5">
                  Level {currentGuild?.level || 10}
                </h4>
              </div>

              <div className="bg-black/60 border border-[#27272a] rounded-xl p-4 text-center">
                <Award className="w-4 h-4 text-zinc-400 mx-auto mb-1" />
                <span className="text-[10px] font-tech uppercase text-zinc-400 block">Weekly Contrib</span>
                <h4 className="font-heading font-bold text-lg sm:text-xl text-white mt-0.5">
                  {currentGuild?.contributionWeek ? currentGuild.contributionWeek.toLocaleString() : '1,250,000'}
                </h4>
              </div>

              <div className="bg-black/60 border border-[#27272a] rounded-xl p-4 text-center">
                <Sparkles className="w-4 h-4 text-zinc-400 mx-auto mb-1" />
                <span className="text-[10px] font-tech uppercase text-zinc-400 block">Guild Leader</span>
                <h4 className="font-heading font-bold text-sm sm:text-base text-white mt-1 truncate">
                  {currentGuild?.leaderName || 'Karuhun Leader'}
                </h4>
              </div>
            </div>
          </>
        )}
      </div>

    </div>
  );
};
