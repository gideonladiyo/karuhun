import React, { useState, useEffect } from 'react';
import { getHuaxuImageUrl, GUILD_BRANCHES } from '@/services/imageUtils';
import { 
  fetchCompositeAllianceLeaderboard, 
  sortAllianceMembers, 
  MemberCompetitiveAchievement 
} from '@/services/rankingUtils';
import { Trophy, Swords, Skull, Globe, Search, ArrowUpDown, ChevronRight, Award, Shield } from 'lucide-react';

interface CompetitiveLeaderboardProps {
  onSelectPlayer: (playerId: number, server: string) => void;
}

export const CompetitiveLeaderboard: React.FC<CompetitiveLeaderboardProps> = ({ onSelectPlayer }) => {
  const [selectedServer, setSelectedServer] = useState<'all' | 'na' | 'ap'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'rank' | 'warzone' | 'ppc'>('rank');
  const [loading, setLoading] = useState<boolean>(true);
  const [memberRankings, setMemberRankings] = useState<MemberCompetitiveAchievement[]>([]);

  useEffect(() => {
    setLoading(true);
    fetchCompositeAllianceLeaderboard()
      .then((list) => {
        setMemberRankings(list);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to load composite leaderboard', err);
        setLoading(false);
      });
  }, []);

  const filteredAndSortedMembers = sortAllianceMembers(
    memberRankings.filter((m) => {
      const matchesServer = selectedServer === 'all' || m.server.toLowerCase() === selectedServer.toLowerCase();
      const matchesSearch =
        m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.id.toString().includes(searchTerm) ||
        m.guildName.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesServer && matchesSearch;
    }),
    sortBy === 'rank' ? 'composite' : sortBy,
    'all'
  );

  return (
    <div className="space-y-6 sm:space-y-8 animate-fadeIn pb-16 md:pb-0">
      
      {/* Header Banner */}
      <div className="minimal-card p-5 sm:p-8 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-[#18181b] border border-[#27272a] text-zinc-300 text-xs font-tech font-bold uppercase tracking-wider">
              <Trophy className="w-3.5 h-3.5 text-white" />
              <span>Karuhun Guild Competitive Standings</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-heading font-bold text-white">
              GUILD MEMBER <span className="text-zinc-500 font-normal">COMPETITIVE LEADERBOARD</span>
            </h1>
            <p className="text-xs font-tech text-zinc-400">
              Standing rank of Karuhun members on Warzone &amp; Phantom Pain Cage (PPC)
            </p>
          </div>

          {/* Server & Search Controls */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <div className="relative min-w-[200px]">
              <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search Commander / ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-[#09090b] text-sm text-white border border-[#27272a] rounded-xl pl-9 pr-4 py-2.5 focus:outline-none focus:border-white font-sans"
              />
            </div>

            <select
              value={selectedServer}
              onChange={(e) => setSelectedServer(e.target.value as any)}
              className="bg-[#09090b] text-xs font-tech font-bold text-white border border-[#27272a] rounded-xl px-3 py-2.5 focus:outline-none cursor-pointer"
            >
              <option value="all">Server: All (AP &amp; NA)</option>
              <option value="na">Server NA</option>
              <option value="ap">Server AP</option>
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-[#09090b] text-xs font-tech font-bold text-white border border-[#27272a] rounded-xl px-3 py-2.5 focus:outline-none cursor-pointer"
            >
              <option value="rank">Sort: Highest Achievement</option>
              <option value="warzone">Sort: Warzone Rank</option>
              <option value="ppc">Sort: PPC Rank</option>
            </select>
          </div>
        </div>
      </div>

      {/* Member Competitive Leaderboard List */}
      <div className="minimal-card p-4 sm:p-6 space-y-4">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-lg sm:text-xl font-heading font-bold text-white flex items-center space-x-2">
            <Award className="w-5 h-5 text-white" />
            <span>MEMBER RANKINGS HALL OF FAME</span>
          </h2>
          <span className="text-xs font-tech text-zinc-400">
            {filteredAndSortedMembers.length} Members Listed
          </span>
        </div>

        {loading ? (
          <div className="text-center py-20">
            <div className="inline-block animate-spin w-8 h-8 border-4 border-white border-t-transparent rounded-full mb-3" />
            <p className="text-xs font-tech text-zinc-400">Aggregating Member Competitive Achievements...</p>
          </div>
        ) : filteredAndSortedMembers.length === 0 ? (
          <div className="text-center py-16 text-zinc-400 font-tech text-sm">
            No Karuhun members recorded on current leaderboard.
          </div>
        ) : (
          <div className="space-y-3 sm:space-y-4">
            {filteredAndSortedMembers.map((member, idx) => (
              <div
                key={member.id}
                onClick={() => onSelectPlayer(member.id, member.server)}
                className="minimal-card-interactive p-4 sm:p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4 cursor-pointer group"
              >
                {/* Left - Rank # & Member Info */}
                <div className="flex items-center space-x-3 sm:space-x-4 min-w-0">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-heading font-bold text-xs flex-shrink-0 ${
                    idx === 0 ? 'bg-white text-black' : idx === 1 ? 'bg-zinc-200 text-black' : idx === 2 ? 'bg-zinc-700 text-white' : 'bg-[#09090b] text-zinc-400 border border-[#27272a]'
                  }`}>
                    #{idx + 1}
                  </div>

                  {/* Member Avatar */}
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
                      <span className="bg-white text-black text-[10px] font-heading font-bold px-2.5 py-0.5 rounded-full uppercase">
                        {member.guildName}
                      </span>
                    </div>
                    <p className="text-xs font-tech text-zinc-400 mt-0.5">
                      ID: {member.id} • {member.server.toUpperCase()}
                    </p>
                  </div>
                </div>

                {/* Right - Competitive Achievement Cards */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                  
                  {/* Warzone Achievement Card */}
                  {member.warzone ? (
                    <div className="bg-black border border-[#27272a] rounded-xl px-4 py-2.5 flex items-center space-x-3.5 shadow-sm min-w-[200px]">
                      <Swords className="w-5 h-5 text-white flex-shrink-0" />
                      <div>
                        <span className="text-[10px] font-tech text-zinc-400 block uppercase font-bold tracking-wider">WARZONE ACHIEVEMENT</span>
                        <span className="font-heading font-bold text-xs text-white block">
                          Top {member.warzone.rank} {member.warzone.division}
                        </span>
                        <span className="text-xs font-heading font-bold text-white block mt-0.5">
                          {member.warzone.score.toLocaleString()} <span className="text-[10px] font-tech text-zinc-400 font-normal uppercase">pts</span>
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-black/50 border border-[#27272a] rounded-xl px-4 py-2.5 text-xs font-tech text-zinc-500 min-w-[200px] text-center font-heading font-bold uppercase">
                      Warzone Unranked
                    </div>
                  )}

                  {/* PPC Achievement Card */}
                  {member.ppc ? (
                    <div className="bg-black border border-[#27272a] rounded-xl px-4 py-2.5 flex items-center space-x-3.5 shadow-sm min-w-[200px]">
                      <Skull className="w-5 h-5 text-white flex-shrink-0" />
                      <div>
                        <span className="text-[10px] font-tech text-zinc-400 block uppercase font-bold tracking-wider">PPC ACHIEVEMENT</span>
                        <span className="font-heading font-bold text-xs text-white block">
                          Top {member.ppc.rank} {member.ppc.level}
                        </span>
                        <span className="text-xs font-heading font-bold text-white block mt-0.5">
                          {member.ppc.score.toLocaleString()} <span className="text-[10px] font-tech text-zinc-400 font-normal uppercase">pts</span>
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-black/50 border border-[#27272a] rounded-xl px-4 py-2.5 text-xs font-tech text-zinc-500 min-w-[200px] text-center font-heading font-bold uppercase">
                      PPC Unranked
                    </div>
                  )}

                  <div className="hidden sm:flex items-center text-zinc-400 group-hover:text-white group-hover:translate-x-1 transition-all">
                    <ChevronRight className="w-5 h-5" />
                  </div>

                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
};
