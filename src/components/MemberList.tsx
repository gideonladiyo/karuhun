import React, { useState } from 'react';
import { GuildMember, GuildInfo } from '../types';
import { getHuaxuImageUrl, GUILD_BRANCHES } from '../services/imageUtils';
import { Users, Search, ArrowUpDown, Shield, ChevronRight, Award, Globe } from 'lucide-react';

interface MemberListProps {
  members: GuildMember[];
  guildInfo: GuildInfo | null;
  selectedBranchId: number;
  onSelectBranch?: (branchId: number) => void;
  onSelectMember: (member: GuildMember) => void;
  loading: boolean;
}

export const MemberList: React.FC<MemberListProps> = ({
  members,
  guildInfo,
  selectedBranchId,
  onSelectBranch,
  onSelectMember,
  loading
}) => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [sortBy, setSortBy] = useState<'rank' | 'level' | 'contribute' | 'name'>('rank');

  const activeBranch = GUILD_BRANCHES.find((b) => b.id === selectedBranchId) || GUILD_BRANCHES[0];

  const getRankBadge = (rankLevel: number) => {
    switch (rankLevel) {
      case 1:
        return { label: 'Guild Leader', classNames: 'bg-white text-black font-bold' };
      case 2:
        return { label: 'Vice Leader', classNames: 'bg-zinc-200 text-black font-bold' };
      case 3:
        return { label: 'Senior Member', classNames: 'bg-zinc-800 text-zinc-200' };
      default:
        return { label: 'Member', classNames: 'bg-[#18181b] text-zinc-400 border border-[#27272a]' };
    }
  };

  const filteredMembers = members
    .filter((m) => {
      const matchesSearch =
        m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.playerId.toString().includes(searchTerm);
      return matchesSearch;
    })
    .sort((a, b) => {
      if (sortBy === 'rank') {
        const rankPriority = (r: number) => (r === 1 ? 1 : r === 2 ? 2 : r === 3 ? 3 : 4);
        const rankDiff = rankPriority(a.rankLevel || 4) - rankPriority(b.rankLevel || 4);
        if (rankDiff !== 0) return rankDiff;
        return b.level - a.level;
      }
      if (sortBy === 'level') return b.level - a.level;
      if (sortBy === 'contribute') return (b.contributeWeek || 0) - (a.contributeWeek || 0);
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      return 0;
    });

  return (
    <div className="space-y-6 animate-fadeIn pb-16 md:pb-0">
      
      {/* Branch Selection Bar */}
      <div className="minimal-card p-4 space-y-3">
        <div className="flex items-center justify-between px-1">
          <span className="text-xs font-tech font-bold text-zinc-400 uppercase tracking-wider flex items-center space-x-1.5">
            <Globe className="w-3.5 h-3.5 text-white" />
            <span>SELECT GUILD ALLIANCE DIVISION</span>
          </span>
          <span className="text-[11px] font-tech text-zinc-500 hidden sm:inline-block">
            4 Official Guild Divisions (AP &amp; NA)
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {GUILD_BRANCHES.map((b) => {
            const isActive = b.id === selectedBranchId;
            return (
              <button
                key={b.id}
                onClick={() => {
                  if (onSelectBranch) onSelectBranch(b.id);
                }}
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

      {/* Header Banner & Search Controls */}
      <div className="minimal-card p-5 sm:p-6 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-[#18181b] border border-[#27272a] text-zinc-300 text-xs font-tech font-bold uppercase tracking-wider mb-2">
              <Users className="w-3.5 h-3.5 text-white" />
              <span>{activeBranch.name} Members</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-heading font-bold text-white">
              GUILD MEMBERS &amp; ROLES
            </h1>
            <p className="text-xs font-tech text-zinc-400">
              Active member roster for {activeBranch.name} ({activeBranch.region}) sorted by role &amp; contribution
            </p>
          </div>

          {/* Search & Sort Controls */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            {/* Search Input */}
            <div className="relative min-w-[200px]">
              <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search Name / Player ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-[#09090b] text-sm text-white border border-[#27272a] rounded-xl pl-9 pr-4 py-2.5 focus:outline-none focus:border-white font-sans"
              />
            </div>

            {/* Sort Select */}
            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="w-full bg-[#09090b] text-xs font-tech font-bold text-white border border-[#27272a] rounded-xl px-3 py-2.5 focus:outline-none cursor-pointer"
              >
                <option value="rank">Sort: Role Priority</option>
                <option value="level">Sort: Player Level</option>
                <option value="contribute">Sort: Weekly Contribution</option>
                <option value="name">Sort: Name A-Z</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Member Cards List */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1 text-xs font-tech text-zinc-400">
          <span className="font-bold uppercase tracking-wider">
            REGISTERED MEMBERS ({filteredMembers.length})
          </span>
          <span>Click card to inspect profile</span>
        </div>

        {loading ? (
          <div className="text-center py-20 bg-[#121215] rounded-2xl border border-[#27272a]">
            <div className="inline-block animate-spin w-8 h-8 border-4 border-white border-t-transparent rounded-full mb-3" />
            <p className="text-xs font-tech text-zinc-400">Loading Members Roster...</p>
          </div>
        ) : filteredMembers.length === 0 ? (
          <div className="text-center py-16 bg-[#121215] rounded-2xl border border-[#27272a] text-zinc-400 font-tech text-sm">
            No members match search criteria.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3">
            {filteredMembers.map((member) => {
              const rankBadge = getRankBadge(member.rankLevel || 4);

              return (
                <div
                  key={member.playerId}
                  onClick={() => onSelectMember(member)}
                  className="minimal-card-interactive p-4 flex items-center justify-between cursor-pointer group"
                >
                  <div className="flex items-center space-x-4">
                    {/* Member Avatar */}
                    <div className="relative w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-black p-1 flex-shrink-0 border border-[#27272a] group-hover:border-white transition-colors overflow-hidden">
                      {member.frame && (
                        <img
                          src={getHuaxuImageUrl(member.frame)}
                          alt="Frame"
                          className="absolute inset-0 w-full h-full object-cover z-10 pointer-events-none filter grayscale contrast-125"
                          onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }}
                        />
                      )}
                      <img
                        src={getHuaxuImageUrl(member.portrait)}
                        alt={member.name}
                        className="w-full h-full object-cover rounded-xl"
                      />
                    </div>

                    {/* Member Info */}
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <h3 className="font-heading font-bold text-base sm:text-lg text-white group-hover:text-zinc-200 transition-colors truncate max-w-[200px] sm:max-w-xs">
                          {member.name}
                        </h3>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wider ${rankBadge.classNames}`}>
                          {rankBadge.label}
                        </span>
                      </div>

                      <div className="flex items-center space-x-3 text-xs font-tech text-zinc-400">
                        <span>ID: <code className="text-zinc-300 font-bold">{member.playerId}</code></span>
                        <span>•</span>
                        <span>LVL <strong className="text-white">{member.level}</strong></span>
                      </div>
                    </div>
                  </div>

                  {/* Right Contribution & Action Arrow */}
                  <div className="flex items-center space-x-4">
                    <div className="text-right hidden sm:block">
                      <span className="text-[10px] font-tech text-zinc-400 uppercase font-bold block">WEEKLY CONTRIB</span>
                      <span className="font-heading font-bold text-sm text-white">
                        {member.contributeWeek ? member.contributeWeek.toLocaleString() : '-'}
                      </span>
                    </div>

                    <div className="w-9 h-9 rounded-xl bg-[#09090b] border border-[#27272a] group-hover:border-white group-hover:bg-white text-zinc-400 group-hover:text-black flex items-center justify-center transition-all shadow-sm">
                      <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
};
