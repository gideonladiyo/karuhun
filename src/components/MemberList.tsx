import React, { useState } from 'react';
import { GuildMember, GuildInfo } from '../types';
import { getHuaxuImageUrl, GUILD_BRANCHES } from '../services/imageUtils';
import { Users, Search, ArrowUpDown, Shield, ChevronRight, Award } from 'lucide-react';

interface MemberListProps {
  members: GuildMember[];
  guildInfo: GuildInfo | null;
  selectedBranchId: number;
  onSelectMember: (member: GuildMember) => void;
  loading: boolean;
}

export const MemberList: React.FC<MemberListProps> = ({
  members,
  guildInfo,
  selectedBranchId,
  onSelectMember,
  loading
}) => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [sortBy, setSortBy] = useState<'rank' | 'level' | 'contribute' | 'name'>('rank');

  const activeBranch = GUILD_BRANCHES.find((b) => b.id === selectedBranchId) || GUILD_BRANCHES[0];

  const getRankBadge = (rankLevel: number) => {
    switch (rankLevel) {
      case 1:
        return { label: 'Ketua Guild', classNames: 'bg-white text-black font-bold' };
      case 2:
        return { label: 'Wakil Ketua', classNames: 'bg-zinc-200 text-black font-bold' };
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
      
      {/* Header Banner & Controls */}
      <div className="minimal-card p-5 sm:p-6 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-[#18181b] border border-[#27272a] text-zinc-300 text-xs font-tech font-bold uppercase tracking-wider mb-2">
              <Users className="w-3.5 h-3.5 text-white" />
              <span>{activeBranch.name} Members</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-heading font-bold text-white">
              DAFTAR MEMBER &amp; JABATAN
            </h1>
            <p className="text-xs font-tech text-zinc-400">
              Daftar seluruh anggota {activeBranch.name} diurutkan berdasarkan jabatan &amp; kontribusi
            </p>
          </div>

          {/* Search & Sort Controls */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            {/* Search Input */}
            <div className="relative min-w-[200px]">
              <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Cari Nama / ID Player..."
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
                <option value="rank">Urutan: Jabatan (Role)</option>
                <option value="level">Urutan: Level Player</option>
                <option value="contribute">Urutan: Kontribusi Mingguan</option>
                <option value="name">Urutan: Nama Player</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Member Feed */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <span className="text-xs font-tech font-bold text-zinc-400 uppercase tracking-wider">
            ANGGOTA TERDAFTAR ({filteredMembers.length})
          </span>
          <span className="text-[11px] font-tech text-zinc-500">Klik card untuk inspect profile</span>
        </div>

        {loading ? (
          <div className="text-center py-20">
            <div className="inline-block animate-spin w-8 h-8 border-4 border-white border-t-transparent rounded-full mb-3" />
            <p className="text-xs font-tech text-zinc-400">Loading Member List...</p>
          </div>
        ) : filteredMembers.length === 0 ? (
          <div className="text-center py-16 bg-[#121215] rounded-2xl border border-[#27272a] text-zinc-400 font-tech text-sm">
            Tidak ada member yang sesuai kriteria pencarian.
          </div>
        ) : (
          <div className="space-y-3">
            {filteredMembers.map((member) => {
              const roleBadge = getRankBadge(member.rankLevel);

              return (
                <a
                  key={member.playerId}
                  href={`#/player/${activeBranch.server}/${member.playerId}`}
                  onClick={(e) => {
                    e.preventDefault();
                    onSelectMember(member);
                  }}
                  className="minimal-card-interactive p-4 sm:p-5 flex items-center justify-between gap-4 block cursor-pointer group"
                >
                  {/* Left: Avatar & Info */}
                  <div className="flex items-center space-x-3 sm:space-x-4 min-w-0">
                    <div className="relative w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-black p-1 flex-shrink-0 border border-[#27272a] group-hover:border-white transition-colors">
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
                        className="w-full h-full object-cover rounded-lg"
                      />
                    </div>

                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-heading font-bold text-base sm:text-lg text-white truncate group-hover:text-zinc-200 transition-colors">
                          {member.name}
                        </h3>
                        <span className={`text-[10px] font-heading font-bold px-2 py-0.5 rounded-full uppercase ${roleBadge.classNames}`}>
                          {roleBadge.label}
                        </span>
                      </div>
                      <p className="text-xs font-tech text-zinc-400 mt-0.5 truncate">
                        ID: {member.playerId} • LVL <span className="text-white font-bold">{member.level}</span>
                      </p>
                    </div>
                  </div>

                  {/* Right: Contribution & Arrow */}
                  <div className="flex items-center space-x-3 sm:space-x-4 flex-shrink-0">
                    <div className="text-right hidden sm:block">
                      <span className="text-[10px] font-tech text-zinc-400 uppercase block">Weekly Contrib</span>
                      <span className="font-heading font-bold text-sm text-white">
                        {member.contributeWeek ? member.contributeWeek.toLocaleString() : 0}
                      </span>
                    </div>

                    <div className="p-2 rounded-xl bg-[#09090b] border border-[#27272a] text-zinc-400 group-hover:text-white group-hover:border-white transition-colors">
                      <ChevronRight className="w-4 h-4" />
                    </div>
                  </div>
                </a>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
};
