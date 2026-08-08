import React, { useState, useEffect } from 'react';
import { GuildMember, PlayerProfileData, PlayerCharacter } from '@/types';
import { getPlayerProfile } from '@/services/apiService';
import { getHuaxuImageUrl, getNameplateUrl, getConstructRankLabel } from '@/services/imageUtils';
import { X, Heart, Shield, Award, Sparkles, ChevronRight } from 'lucide-react';

interface PlayerDetailModalProps {
  member: GuildMember | null;
  server: string;
  onClose: () => void;
  onSelectCharacter: (character: PlayerCharacter, uid: number) => void;
}

export const PlayerDetailModal: React.FC<PlayerDetailModalProps> = ({
  member,
  server,
  onClose,
  onSelectCharacter
}) => {
  const [profileData, setProfileData] = useState<PlayerProfileData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const [selectedFrameType, setSelectedFrameType] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'priority' | 'quality' | 'level'>('priority');

  useEffect(() => {
    if (!member) return;
    setLoading(true);
    getPlayerProfile(server, member.playerId)
      .then((data) => {
        setProfileData(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to load profile', err);
        setLoading(false);
      });
  }, [member, server]);

  if (!member) return null;

  const player = profileData?.player || {
    id: member.playerId,
    name: member.name,
    level: member.level,
    sign: 'Commander of Karuhun Corps',
    portrait: member.portrait,
    frame: member.frame,
    likes: 0,
    guildId: 3638,
    guildName: 'Karuhun 夜',
    nameplate: null
  };

  const nameplateUrl = getNameplateUrl(player.nameplate);
  const characters = profileData?.characters || [];

  const filteredCharacters = characters.filter((c) => {
    const matchesFrameType = selectedFrameType === 'all' || c.frameType === selectedFrameType;
    return matchesFrameType;
  }).sort((a, b) => {
    if (sortBy === 'priority') return b.priority - a.priority;
    if (sortBy === 'quality') return b.quality - a.quality;
    if (sortBy === 'level') return b.level - a.level;
    return 0;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div 
        className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto glass-panel rounded-3xl border border-zinc-700 p-6 sm:p-8 shadow-2xl space-y-6"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full bg-zinc-900 border border-zinc-700 hover:border-white text-zinc-400 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Player Header Info */}
        <div className="flex flex-col sm:flex-row items-center sm:items-start space-y-4 sm:space-y-0 sm:space-x-6 border-b border-zinc-800 pb-6">
          {/* Avatar & Frame */}
          <div className="relative w-24 h-24 rounded-2xl bg-black p-1 flex-shrink-0 flex items-center justify-center border-2 border-zinc-600 shadow-xl">
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
              className="w-20 h-20 object-cover rounded-xl"
            />
          </div>

          {/* Commander Stats & Sign */}
          <div className="flex-1 text-center sm:text-left space-y-2">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
              <h2 className="text-2xl font-heading font-black text-white">
                {player.name}
              </h2>
              {nameplateUrl ? (
                <img
                  src={nameplateUrl}
                  alt="Nameplate"
                  className="h-7 sm:h-8 object-contain rounded-md max-w-[130px]"
                  onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }}
                />
              ) : null}
              <span className="bg-zinc-900 text-zinc-300 border border-zinc-700 text-xs font-tech font-bold px-2.5 py-0.5 rounded-full flex items-center space-x-1.5">
                <span>UID: {player.id}</span>
                <span className="text-zinc-600">•</span>
                <span className="text-amber-400 font-bold">LVL {player.level}</span>
              </span>
            </div>

            <p className="text-xs font-sans text-zinc-300 italic bg-zinc-950 px-3 py-1.5 rounded-xl border border-zinc-800 max-w-xl">
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

        {/* Character Roster Header & Controls */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-xl font-heading font-bold text-white flex items-center space-x-2">
                <Sparkles className="w-5 h-5 text-white" />
                <span>OWNED CONSTRUCTS &amp; UNIFRAMES</span>
              </h3>
              <p className="text-xs font-tech text-zinc-400">
                {filteredCharacters.length} Characters Registered • Click construct to inspect gear, weapon, harmonize &amp; memories
              </p>
            </div>

            {/* Filter controls */}
            <div className="flex flex-wrap items-center gap-2">
              <select
                value={selectedFrameType}
                onChange={(e) => setSelectedFrameType(e.target.value)}
                className="bg-zinc-900 text-xs font-tech font-bold text-white border border-zinc-700 rounded-xl px-3 py-1.5 focus:outline-none focus:border-white"
              >
                <option value="all">Frame: All Types</option>
                <option value="omniframe">Omniframes</option>
                <option value="uniframe">Uniframes</option>
              </select>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-zinc-900 text-xs font-tech font-bold text-white border border-zinc-700 rounded-xl px-3 py-1.5 focus:outline-none focus:border-white"
              >
                <option value="priority">Sort: Priority Score</option>
                <option value="quality">Sort: Rank (SSS+ to B)</option>
                <option value="level">Sort: Level</option>
              </select>
            </div>
          </div>

          {/* Character Grid */}
          {loading ? (
            <div className="text-center py-16">
              <div className="inline-block animate-spin w-8 h-8 border-4 border-white border-t-transparent rounded-full mb-2" />
              <p className="text-xs font-tech text-zinc-400">Loading Construct Database...</p>
            </div>
          ) : filteredCharacters.length === 0 ? (
            <div className="text-center py-12 bg-zinc-900/40 rounded-2xl border border-zinc-800">
              <p className="text-sm font-heading text-zinc-400">No constructs match selected filter</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
              {filteredCharacters.map((char) => {
                const rankInfo = getConstructRankLabel(char.quality);

                return (
                  <a
                    key={char.id}
                    href={`#/player/${server}/${player.id}/character/${char.id}`}
                    onClick={(e) => {
                      e.preventDefault();
                      onSelectCharacter(char, player.id);
                    }}
                    className="glass-panel glass-card rounded-2xl p-3 cursor-pointer border border-zinc-800 hover:border-white bg-zinc-950/80 relative overflow-hidden group flex flex-col items-center text-center transition-all duration-300 block"
                  >
                    {/* Top Quality Rank Badge */}
                    <div className="w-full flex items-center justify-between mb-2">
                      <span className={`text-[11px] px-2 py-0.5 rounded-md border shadow-sm ${rankInfo.classNames}`}>
                        {rankInfo.label}
                      </span>
                      <span className="text-[10px] font-tech text-zinc-300 font-bold">
                        LVL {char.level}
                      </span>
                    </div>

                    {/* Character Icon */}
                    <div className="relative w-16 h-16 rounded-xl bg-black p-1 mb-2 border border-zinc-800 group-hover:border-white transition-colors">
                      <img
                        src={getHuaxuImageUrl(char.fashionIcon || char.normalIcon)}
                        alt={char.characterName}
                        className="w-full h-full object-cover rounded-lg"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = getHuaxuImageUrl(char.normalIcon);
                        }}
                      />
                    </div>

                    {/* Character Name & Frame */}
                    <h4 className="font-heading font-bold text-xs text-white truncate w-full group-hover:text-zinc-300 transition-colors">
                      {char.characterName}
                    </h4>
                    <p className="text-[11px] font-tech text-zinc-400 truncate w-full">
                      {char.frameName}
                    </p>

                    <div className="mt-2 pt-2 border-t border-zinc-800 w-full flex items-center justify-between text-[10px] font-tech text-zinc-400">
                      <span>Code: {char.frameCode || 'BPN'}</span>
                      <ChevronRight className="w-3 h-3 text-white group-hover:translate-x-0.5 transition-transform" />
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
