import React, { useState, useEffect } from 'react';
import { PlayerProfileData, PlayerCharacter } from '../types';
import { getPlayerProfile } from '../services/apiService';
import { getHuaxuImageUrl, getConstructRankLabel } from '../services/imageUtils';
import { ArrowLeft, Heart, Shield, Award, Sparkles, ChevronRight } from 'lucide-react';

interface PlayerProfilePageProps {
  uid: number;
  server: string;
  onBack: () => void;
  onSelectCharacter: (character: PlayerCharacter) => void;
}

export const PlayerProfilePage: React.FC<PlayerProfilePageProps> = ({
  uid,
  server,
  onBack,
  onSelectCharacter
}) => {
  const [profileData, setProfileData] = useState<PlayerProfileData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const [selectedFrameType, setSelectedFrameType] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'priority' | 'quality' | 'level'>('priority');

  useEffect(() => {
    setLoading(true);
    getPlayerProfile(server, uid)
      .then((data) => {
        setProfileData(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to load profile', err);
        setLoading(false);
      });
  }, [uid, server]);

  const player = profileData?.player || {
    id: uid,
    name: `Commander ${uid}`,
    level: 120,
    sign: 'Commander of Karuhun Corps',
    portrait: 'image/roleplayersp/roleplayer01',
    frame: 'image/roleplayersp/headframe36',
    likes: 0,
    guildId: 3638,
    guildName: 'Karuhun 夜',
    nameplate: null
  };

  const characters = profileData?.characters || [];

  const filteredCharacters = characters.filter((c) => {
    const isOwned = c.acquired !== false && c.visible !== false;
    const matchesFrameType = selectedFrameType === 'all' || c.frameType === selectedFrameType;
    return isOwned && matchesFrameType;
  }).sort((a, b) => {
    if (sortBy === 'priority') return b.priority - a.priority;
    if (sortBy === 'quality') return b.quality - a.quality;
    if (sortBy === 'level') return b.level - a.level;
    return 0;
  });

  return (
    <div className="space-y-6 sm:space-y-8 animate-fadeIn pb-16 md:pb-0">
      {/* Top Back Navigation Bar */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-[#121215] hover:bg-[#18181b] border border-[#27272a] hover:border-white text-white font-heading font-bold text-xs transition-all shadow-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>KEMBALI KE MEMBERS / LEADERBOARD</span>
        </button>

        <span className="text-xs font-tech text-zinc-400 hidden sm:inline-block">
          COMMANDER PROFILE • UID {player.id}
        </span>
      </div>

      {/* Player Header Banner */}
      <div className="minimal-card p-5 sm:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row items-center sm:items-start space-y-4 sm:space-y-0 sm:space-x-6 border-b border-[#27272a] pb-6">
          {/* Avatar & Frame */}
          <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-2xl bg-black p-1 flex-shrink-0 flex items-center justify-center border border-[#27272a] shadow-md">
            {player.frame && (
              <img
                src={getHuaxuImageUrl(player.frame)}
                alt="Frame"
                className="absolute inset-0 w-full h-full object-cover z-10 pointer-events-none filter grayscale contrast-125"
                onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }}
              />
            )}
            <img
              src={getHuaxuImageUrl(player.portrait)}
              alt={player.name}
              className="w-20 h-20 sm:w-24 sm:h-24 object-cover rounded-xl"
            />
            <div className="absolute -bottom-3 bg-white text-black font-heading font-bold text-[11px] px-2.5 py-0.5 rounded-full z-20 shadow-md uppercase">
              LVL {player.level}
            </div>
          </div>

          {/* Commander Stats & Signature */}
          <div className="flex-1 text-center sm:text-left space-y-3">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
              <h1 className="text-2xl sm:text-3xl font-heading font-bold text-white">
                {player.name}
              </h1>
              <span className="bg-[#18181b] text-zinc-300 border border-[#27272a] text-xs font-tech font-bold px-2.5 py-0.5 rounded-full uppercase">
                UID: {player.id}
              </span>
            </div>

            <p className="text-xs sm:text-sm font-sans text-zinc-300 italic bg-black/80 px-3.5 py-2 rounded-xl border border-[#27272a] max-w-2xl">
              "{player.sign || 'No signature set.'}"
            </p>

            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 text-xs font-tech text-zinc-400 pt-1">
              <div className="flex items-center space-x-1.5 text-zinc-200">
                <Heart className="w-4 h-4" />
                <span>Likes: {player.likes || 0}</span>
              </div>
              <div className="flex items-center space-x-1.5 text-zinc-200">
                <Shield className="w-4 h-4" />
                <span>Guild: {player.guildName || 'Karuhun 夜'}</span>
              </div>
              <div className="flex items-center space-x-1.5 text-zinc-200">
                <Award className="w-4 h-4" />
                <span>Rating: {profileData?.characterRating ? profileData.characterRating.toLocaleString() : 'N/A'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Construct Grid Controls */}
        <div className="space-y-4 pt-2">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-lg sm:text-xl font-heading font-bold text-white flex items-center space-x-2">
                <Sparkles className="w-5 h-5 text-white" />
                <span>OWNED CONSTRUCTS ({filteredCharacters.length})</span>
              </h2>
              <p className="text-xs font-tech text-zinc-400">
                Pilih construct untuk inspect statistik detail, senjata, memory &amp; CUB
              </p>
            </div>

            {/* Filter controls */}
            <div className="flex flex-wrap items-center gap-2">
              <select
                value={selectedFrameType}
                onChange={(e) => setSelectedFrameType(e.target.value)}
                className="bg-[#09090b] text-xs font-tech font-bold text-white border border-[#27272a] rounded-xl px-3 py-2 focus:outline-none focus:border-white cursor-pointer"
              >
                <option value="all">Frame: Semua Tipe</option>
                <option value="omniframe">Omniframes</option>
                <option value="uniframe">Uniframes</option>
              </select>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-[#09090b] text-xs font-tech font-bold text-white border border-[#27272a] rounded-xl px-3 py-2 focus:outline-none focus:border-white cursor-pointer"
              >
                <option value="priority">Sort: Priority Score</option>
                <option value="quality">Sort: Rank (SSS+ to B)</option>
                <option value="level">Sort: Level</option>
              </select>
            </div>
          </div>

          {/* Construct Grid */}
          {loading ? (
            <div className="text-center py-20">
              <div className="inline-block animate-spin w-8 h-8 border-4 border-white border-t-transparent rounded-full mb-3" />
              <p className="text-xs font-tech text-zinc-400">Loading Construct Database...</p>
            </div>
          ) : filteredCharacters.length === 0 ? (
            <div className="text-center py-16 bg-[#09090b] rounded-2xl border border-[#27272a]">
              <p className="text-sm font-heading text-zinc-400">Tidak ada construct yang dimiliki pada filter ini.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
              {filteredCharacters.map((char) => {
                const rankInfo = getConstructRankLabel(char.quality, char.stars);

                return (
                  <a
                    key={char.id}
                    href={`/player/${server}/${player.id}/character/${char.id}`}
                    onClick={(e) => {
                      e.preventDefault();
                      onSelectCharacter(char);
                    }}
                    className="minimal-card-interactive p-3 sm:p-4 border border-[#27272a] bg-[#09090b] relative overflow-hidden group flex flex-col items-center text-center transition-all block"
                  >
                    {/* Rank Badge (e.g. SSS+, SS4, S5) */}
                    <div className="w-full flex items-center justify-between mb-2 sm:mb-3">
                      <span className={`text-[10px] sm:text-[11px] px-2 py-0.5 rounded-md border shadow-sm ${rankInfo.classNames}`}>
                        {rankInfo.label}
                      </span>
                      <span className="text-[10px] sm:text-[11px] font-tech text-zinc-300 font-bold">
                        LVL {char.level}
                      </span>
                    </div>

                    {/* Construct Icon */}
                    <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-xl sm:rounded-2xl bg-black p-1 mb-2 sm:mb-3 border border-[#27272a] group-hover:border-white transition-colors">
                      <img
                        src={getHuaxuImageUrl(char.fashionIcon || char.normalIcon)}
                        alt={char.characterName}
                        className="w-full h-full object-cover rounded-lg sm:rounded-xl"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = getHuaxuImageUrl(char.normalIcon);
                        }}
                      />
                    </div>

                    {/* Character Name & Frame */}
                    <h3 className="font-heading font-bold text-xs sm:text-sm text-white truncate w-full group-hover:text-zinc-200 transition-colors">
                      {char.characterName}
                    </h3>
                    <p className="text-[11px] font-tech text-zinc-400 truncate w-full mt-0.5">
                      {char.frameName}
                    </p>

                    <div className="mt-2.5 pt-2 border-t border-[#27272a] w-full flex items-center justify-between text-[10px] font-tech text-zinc-400">
                      <span>Code: {char.frameCode || 'BPN'}</span>
                      <ChevronRight className="w-3.5 h-3.5 text-white group-hover:translate-x-0.5 transition-transform" />
                    </div>
                  </a>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
