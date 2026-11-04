import React, { useState, useMemo } from 'react';
import { GuildMember } from '@/types';
import { MemberTacticalCard } from './MemberTacticalCard';
import { Search, X } from 'lucide-react';

interface GuildMembersRosterProps {
  members: GuildMember[];
  server: string;
  loading: boolean;
  onSelectPlayer: (uid: number, server: string) => void;
}

interface RankSectionConfig {
  rankLevel: number;
  rankTitle: string;
  /** Tailwind background class for the section dot. */
  accentColor: string;
}

const RANK_SECTIONS: RankSectionConfig[] = [
  { rankLevel: 1, rankTitle: 'Leader', accentColor: 'bg-amber-400' },
  { rankLevel: 2, rankTitle: 'Vice leader', accentColor: 'bg-sky-400' },
  { rankLevel: 3, rankTitle: 'Senior', accentColor: 'bg-rose-400' },
  { rankLevel: 4, rankTitle: 'Member', accentColor: 'bg-zinc-500' },
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
      <div className="space-y-4">

        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 pb-5 border-b border-[#27272a]">

          {/* Section Heading & Counter */}
          <div className="space-y-1">
            <h2 className="font-heading font-bold text-2xl sm:text-3xl text-white tracking-tight">Members</h2>
            <p className="text-sm text-zinc-500">
              {filteredMembers.length === members.length
                ? `${members.length} commanders`
                : `${filteredMembers.length} of ${members.length} commanders`}
            </p>
          </div>

          {/* Search & Sort Controls */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">

            {/* Search Input Box */}
            <div className="relative min-w-[240px] flex-1 sm:flex-initial">
              <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search name or player ID"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-[#09090b] text-xs sm:text-sm text-white placeholder:text-zinc-500 border border-[#27272a] focus:border-amber-400 rounded-xl pl-10 pr-4 py-2.5 outline-none font-sans transition-colors"
              />
              {searchTerm && (
                <button
                  type="button"
                  aria-label="Clear search"
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Sort Select Dropdown */}
            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                aria-label="Sort members"
                className="w-full sm:w-auto bg-[#09090b] text-xs sm:text-sm text-white border border-[#27272a] focus:border-amber-400 rounded-xl px-4 py-2.5 outline-none cursor-pointer transition-colors"
              >
                <option value="level">Sort by level</option>
                <option value="contrib">Sort by weekly contribution</option>
                <option value="activity">Sort by last login</option>
                <option value="name">Sort by name</option>
              </select>
            </div>

          </div>

        </div>

      </div>

      {/* Roster Sections Grouped by Rank */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3.5 sm:gap-4" aria-busy="true" aria-label="Loading members">
          {Array.from({ length: 8 }, (_, i) => (
            <div key={i} className="flex items-center gap-3.5 p-4 rounded-2xl border border-[#27272a] bg-[#121215]">
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-[#18181b] animate-pulse" />
              <div className="flex-1 space-y-2">
                <div className="h-3.5 w-2/3 rounded bg-[#18181b] animate-pulse" />
                <div className="h-3 w-1/2 rounded bg-[#18181b] animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      ) : groupedSections.length === 0 ? (
        <div className="py-14 text-center space-y-3 rounded-2xl border border-dashed border-[#27272a]">
          <p className="text-sm text-zinc-400">
            {searchTerm ? `No member matches "${searchTerm}".` : 'No members to show.'}
          </p>
          {searchTerm && (
            <button
              type="button"
              onClick={() => setSearchTerm('')}
              className="text-xs font-semibold text-white hover:text-amber-300 transition-colors"
            >
              Clear search
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-10">
          {groupedSections.map((section) => (
            <div key={section.rankLevel} className="space-y-4">

              <div className="flex items-center gap-2.5">
                <span className={`w-2 h-2 rounded-full ${section.accentColor}`} />
                <h3 className="font-heading font-semibold text-base sm:text-lg text-white">{section.rankTitle}</h3>
                <span className="text-sm text-zinc-500 tabular-nums">{section.members.length}</span>
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
