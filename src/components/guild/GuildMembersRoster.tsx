import React, { useState, useMemo } from 'react';
import { GuildMember } from '@/types';
import { MemberTacticalCard } from './MemberTacticalCard';
import { Search, Users, ShieldAlert } from 'lucide-react';

interface GuildMembersRosterProps {
  members: GuildMember[];
  server: string;
  loading: boolean;
  onSelectPlayer: (uid: number, server: string) => void;
}

interface RankSectionConfig {
  rankLevel: number;
  rankTitle: string;
  roleLabel?: string;
  accentColor: string;
}

const RANK_SECTIONS: RankSectionConfig[] = [
  { rankLevel: 1, rankTitle: 'RANK 1', roleLabel: 'LEADER', accentColor: 'text-amber-400' },
  { rankLevel: 2, rankTitle: 'RANK 2', roleLabel: 'VICE', accentColor: 'text-sky-400' },
  { rankLevel: 3, rankTitle: 'RANK 3', accentColor: 'text-rose-400' },
  { rankLevel: 4, rankTitle: 'RANK 4', accentColor: 'text-zinc-400' },
];

export const GuildMembersRoster: React.FC<GuildMembersRosterProps> = ({
  members = [],
  server,
  loading,
  onSelectPlayer
}) => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [sortBy, setSortBy] = useState<'level' | 'contrib' | 'activity' | 'name'>('level');

  // Filter members by search
  const filteredMembers = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();

    return members.filter((m) => {
      if (!query) return true;
      const matchesName = m.name.toLowerCase().includes(query);
      const matchesId = m.playerId.toString().includes(query);
      return matchesName || matchesId;
    });
  }, [members, searchTerm]);

  // Group filtered members by rank sections and sort within each group
  const groupedSections = useMemo(() => {
    return RANK_SECTIONS.map((section) => {
      const sectionMembers = filteredMembers
        .filter((m) => (m.rankLevel || 4) === section.rankLevel)
        .sort((a, b) => {
          if (sortBy === 'level') {
            return b.level - a.level;
          }
          if (sortBy === 'contrib') {
            return (b.contributeWeek || 0) - (a.contributeWeek || 0);
          }
          if (sortBy === 'activity') {
            const timeA = a.lastLoginTime ? new Date(a.lastLoginTime).getTime() : 0;
            const timeB = b.lastLoginTime ? new Date(b.lastLoginTime).getTime() : 0;
            return timeB - timeA;
          }
          if (sortBy === 'name') {
            return a.name.localeCompare(b.name);
          }
          return 0;
        });

      return {
        ...section,
        members: sectionMembers,
      };
    }).filter((section) => section.members.length > 0);
  }, [filteredMembers, sortBy]);

  return (
    <div className="w-full space-y-8">
      
      {/* Control Bar: Title + Search + Sort Filter */}
      <div className="minimal-card p-5 sm:p-6 bg-[#121215] border border-[#27272a] space-y-4">
        
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          
          {/* Section Heading & Counter */}
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <Users className="w-4 h-4 text-amber-400" />
              <h2 className="font-heading font-black text-xl sm:text-2xl text-white tracking-tight">
                GUILD MEMBERS
              </h2>
            </div>
            <p className="text-xs font-tech text-zinc-400">
              Showing <span className="text-white font-bold">{filteredMembers.length}</span> of <span className="text-white font-bold">{members.length}</span> Members
            </p>
          </div>

          {/* Search & Sort Controls */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            
            {/* Search Input Box */}
            <div className="relative min-w-[240px] flex-1 sm:flex-initial">
              <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search Name / Player ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-[#09090b] text-xs sm:text-sm text-white placeholder:text-zinc-500 border border-[#27272a] focus:border-amber-400 rounded-xl pl-10 pr-4 py-2.5 outline-none font-sans transition-colors"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-tech text-zinc-500 hover:text-white"
                >
                  CLEAR
                </button>
              )}
            </div>

            {/* Sort Select Dropdown */}
            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="w-full sm:w-auto bg-[#09090b] text-xs font-tech font-bold text-white border border-[#27272a] focus:border-amber-400 rounded-xl px-4 py-2.5 outline-none cursor-pointer uppercase tracking-wider transition-colors"
              >
                <option value="level">Sort: Commander Level</option>
                <option value="contrib">Sort: Weekly Contribution</option>
                <option value="activity">Sort: Last Login (Active)</option>
                <option value="name">Sort: Player Name (A-Z)</option>
              </select>
            </div>

          </div>

        </div>

      </div>

      {/* Roster Sections Grouped by Rank */}
      {loading ? (
        <div className="text-center py-20 bg-[#121215] rounded-3xl border border-[#27272a]">
          <div className="inline-block animate-spin w-8 h-8 border-3 border-amber-400 border-t-transparent rounded-full mb-3" />
          <p className="text-xs font-tech text-zinc-400">Loading Division Roster...</p>
        </div>
      ) : groupedSections.length === 0 ? (
        <div className="minimal-card p-12 text-center space-y-3 bg-[#121215] border border-[#27272a]">
          <ShieldAlert className="w-10 h-10 text-zinc-500 mx-auto opacity-60" />
          <h3 className="font-heading font-bold text-base text-white">No Members Found</h3>
          <p className="text-xs font-tech text-zinc-400 max-w-sm mx-auto">
            No member matched "{searchTerm}". Try clearing your search query.
          </p>
          <button
            onClick={() => setSearchTerm('')}
            className="px-4 py-2 rounded-xl bg-white text-black font-heading font-bold text-xs uppercase hover:bg-zinc-200 transition-colors"
          >
            Reset Filter
          </button>
        </div>
      ) : (
        <div className="space-y-10">
          {groupedSections.map((section) => (
            <div key={section.rankLevel} className="space-y-4">
              
              {/* Section Header: e.g. "RANK 1 • LEADER", "RANK 2 • VICE", or just "RANK 3", "RANK 4" */}
              <div className="flex items-center space-x-3 pb-2 border-b border-[#27272a]/80">
                <span className={`font-heading font-black text-lg sm:text-xl tracking-tight ${section.accentColor}`}>
                  {section.rankTitle}
                </span>
                {section.roleLabel && (
                  <>
                    <span className="text-zinc-600 font-bold">•</span>
                    <span className="font-heading font-bold text-sm sm:text-base text-zinc-200 tracking-wider uppercase">
                      {section.roleLabel}
                    </span>
                  </>
                )}
              </div>

              {/* Member Cards Grid for this Rank */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3.5 sm:gap-4">
                {section.members.map((member) => (
                  <MemberTacticalCard
                    key={`${server}-${member.playerId}`}
                    member={member}
                    server={server}
                    onSelectPlayer={onSelectPlayer}
                  />
                ))}
              </div>

            </div>
          ))}
        </div>
      )}

    </div>
  );
};
