import React from 'react';
import { GuildInfo, GuildMember } from '../types';
import { GUILD_BRANCHES, getHuaxuImageUrl } from '../services/imageUtils';
import { Shield, Users, Trophy, ChevronRight, Globe, Award, Sparkles, CheckCircle } from 'lucide-react';
import karuhunLogo from '../Logo__4_-removebg-preview.png';

interface GuildHubProps {
  currentGuild: GuildInfo | null;
  members?: GuildMember[];
  loading: boolean;
  selectedBranchId: number;
  onSelectBranch: (branchId: number) => void;
  onViewMembers: () => void;
}

export const GuildHub: React.FC<GuildHubProps> = ({
  currentGuild,
  members = [],
  loading,
  selectedBranchId,
  onSelectBranch,
  onViewMembers
}) => {
  const activeBranch = GUILD_BRANCHES.find((b) => b.id === selectedBranchId) || GUILD_BRANCHES[0];

  // Calculate Guild Metrics safely
  const memberCount = members.length > 0 ? members.length : (currentGuild?.memberCount || 80);
  const maxMemberCount = currentGuild?.maxMemberCount || 80;

  const weeklyContrib =
    currentGuild?.contributionWeek ||
    (members.length > 0 ? members.reduce((acc, m) => acc + (m.contributeWeek || 0), 0) : 422565);

  const totalContrib =
    currentGuild?.sumContribute ||
    (members.length > 0 ? members.reduce((acc, m) => acc + (m.contributeTotal || (m as any).approximateScore || 0), 0) : 186542000);

  return (
    <div className="space-y-8 animate-fadeIn pb-16 md:pb-0">
      
      {/* Alliance Division Branch Selector */}
      <div className="minimal-card p-4 space-y-3">
        <div className="flex items-center justify-between px-1">
          <span className="text-xs font-tech font-bold text-zinc-400 uppercase tracking-wider flex items-center space-x-1.5">
            <Globe className="w-3.5 h-3.5 text-white" />
            <span>KARUHUN ALLIANCE DIVISIONS</span>
          </span>
          <span className="text-[11px] font-tech text-zinc-500 hidden sm:inline-block">
            Asia-Pacific (AP) &amp; North America (NA)
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {GUILD_BRANCHES.map((b) => {
            const isActive = b.id === selectedBranchId;
            return (
              <button
                key={b.id}
                onClick={() => onSelectBranch(b.id)}
                className={`p-3 rounded-xl border text-left transition-all ${
                  isActive
                    ? 'bg-white text-black border-white shadow-md'
                    : 'bg-[#09090b] text-zinc-400 border-[#27272a] hover:text-white hover:border-zinc-500'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-tech font-bold uppercase opacity-75">{b.region}</span>
                  <span className={`text-[9px] font-tech font-bold px-1.5 py-0.2 rounded uppercase ${
                    isActive ? 'bg-black text-white' : 'bg-[#18181b] text-zinc-300 border border-[#27272a]'
                  }`}>
                    {b.tag}
                  </span>
                </div>
                <span className="font-heading font-bold text-xs sm:text-sm block mt-1 truncate">
                  {b.name}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Guild Hub Hero Banner */}
      <div className="minimal-card p-6 sm:p-8 space-y-6 relative overflow-hidden">
        {loading ? (
          <div className="text-center py-16">
            <div className="inline-block animate-spin w-8 h-8 border-4 border-white border-t-transparent rounded-full mb-3" />
            <p className="text-xs font-tech text-zinc-400">Loading Guild Information...</p>
          </div>
        ) : (
          <>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              
              {/* Guild Header Info */}
              <div className="flex items-center space-x-4 sm:space-x-5">
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-black border border-[#27272a] p-2 flex items-center justify-center flex-shrink-0 shadow-lg">
                  <img
                    src={karuhunLogo}
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
                  <span>VIEW MEMBERS ROSTER</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

            </div>

            {/* Guild Declaration Quote */}
            {currentGuild?.declaration && (
              <div className="bg-black p-4 rounded-xl border border-[#27272a] space-y-1">
                <span className="text-[10px] font-tech text-zinc-400 uppercase tracking-widest block font-bold">
                  Guild Declaration &amp; Mission Statement
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
                <span className="text-[10px] font-tech uppercase text-zinc-400 block">Total Members</span>
                <span className="font-heading font-bold text-lg text-white">
                  {memberCount} / {maxMemberCount}
                </span>
              </div>

              <div className="bg-black/60 border border-[#27272a] rounded-xl p-4 text-center">
                <Trophy className="w-4 h-4 text-zinc-400 mx-auto mb-1" />
                <span className="text-[10px] font-tech uppercase text-zinc-400 block">Guild Level</span>
                <span className="font-heading font-bold text-lg text-white">
                  LVL {currentGuild?.level || 10}
                </span>
              </div>

              <div className="bg-black/60 border border-[#27272a] rounded-xl p-4 text-center">
                <Award className="w-4 h-4 text-zinc-400 mx-auto mb-1" />
                <span className="text-[10px] font-tech uppercase text-zinc-400 block">Weekly Contrib</span>
                <span className="font-heading font-bold text-lg text-white">
                  {weeklyContrib > 0 ? weeklyContrib.toLocaleString() : '-'}
                </span>
              </div>

              <div className="bg-black/60 border border-[#27272a] rounded-xl p-4 text-center">
                <Shield className="w-4 h-4 text-zinc-400 mx-auto mb-1" />
                <span className="text-[10px] font-tech uppercase text-zinc-400 block">Total Contrib</span>
                <span className="font-heading font-bold text-lg text-white">
                  {totalContrib > 0 ? totalContrib.toLocaleString() : '-'}
                </span>
              </div>
            </div>
          </>
        )}
      </div>

    </div>
  );
};
