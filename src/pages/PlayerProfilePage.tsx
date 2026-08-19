import React, { useState, useEffect } from 'react';
import { PlayerProfileData, PlayerCharacter } from '@/types';
import { getPlayerProfile } from '@/services/apiService';
import { getHuaxuImageUrl, getNameplateUrl, getConstructRankLabel } from '@/services/imageUtils';
import { BackButton } from '@/components/common/BackButton';
import { ArrowLeft, Shield, Users } from 'lucide-react';
import { NotFound } from '@/components/ui/not-found-2';

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
  const [errorInfo, setErrorInfo] = useState<{ code: string | number; message: string } | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>('');

  const fetchProfile = () => {
    setLoading(true);
    setErrorInfo(null);
    getPlayerProfile(server, uid)
      .then((res) => {
        if (res.data) {
          setProfileData(res.data);
          setErrorInfo(null);
        } else {
          setProfileData(null);
          setErrorInfo(res.error || { code: 404, message: 'Failed to get player' });
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to load profile', err);
        setProfileData(null);
        setErrorInfo({ code: 500, message: err?.message || 'Failed to connect to API' });
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchProfile();
  }, [server, uid]);

  if (loading) {
    return (
      <div className="space-y-6 sm:space-y-8 animate-fadeIn pb-16 md:pb-0">
        <div className="flex items-center justify-between">
          <BackButton label="BACK TO GUILD" onClick={onBack} />
          <span className="text-xs font-tech text-zinc-400 uppercase tracking-wider">
            SERVER: <strong className="text-white uppercase">{server}</strong> • ID: <strong className="text-white">{uid}</strong>
          </span>
        </div>
        <div className="text-center py-24 bg-[#121215] rounded-3xl border border-[#27272a]">
          <div className="inline-block animate-spin w-10 h-10 border-4 border-amber-400 border-t-transparent rounded-full mb-4" />
          <p className="text-xs font-tech text-zinc-300">Retrieving Commander Profile from Huaxu API...</p>
          <p className="text-[11px] font-tech text-zinc-500 mt-1">Target UID: {uid} • Server: {server.toUpperCase()}</p>
        </div>
      </div>
    );
  }

  if (!profileData || !profileData.player) {
    return (
      <div className="space-y-6 sm:space-y-8 animate-fadeIn pb-16 md:pb-0">
        {/* Top Back Navigation Bar */}
        <div className="flex items-center justify-between">
          <BackButton label="BACK TO GUILD" onClick={onBack} />
          <span className="text-xs font-tech text-zinc-400 uppercase tracking-wider">
            SERVER: <strong className="text-white uppercase">{server}</strong> • ID: <strong className="text-white">{uid}</strong>
          </span>
        </div>

        {/* Dynamic Not Found / Error UI Component with API Error Code & Message */}
        <NotFound
          errorCode={errorInfo?.code ?? 404}
          title="Commander Profile Unavailable"
          message={errorInfo?.message ?? "Failed to get player"}
          subMessage={`Target UID: ${uid} • Server: ${server.toUpperCase()} • Player telemetry might be private in-game or Huaxu API server is experiencing downtime.`}
          primaryActionLabel="Try Again"
          onPrimaryAction={fetchProfile}
          secondaryActionLabel="Back to Guild"
          onSecondaryAction={onBack}
        />
      </div>
    );
  }

  const { player, characters = [] } = profileData;
  const nameplateUrl = getNameplateUrl(player.nameplate);

  const filteredCharacters = characters.filter(
    (c) => {
      // Exclude unowned or hidden constructs
      if (c.acquired === false || c.visible === false) {
        return false;
      }
      return (
        c.characterName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.frameName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.frameCode?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
  );

  return (
    <div className="space-y-6 sm:space-y-8 animate-fadeIn pb-16 md:pb-0">
      
      {/* Top Back Navigation */}
      <div className="flex items-center justify-between">
        <BackButton label="BACK TO GUILD" onClick={onBack} />

        <span className="text-xs font-tech text-zinc-400 uppercase tracking-wider">
          SERVER: <strong className="text-white uppercase">{server}</strong> • ID: <strong className="text-white">{player.id}</strong> • LVL: <strong className="text-white">{player.level}</strong>
        </span>
      </div>

      {/* Commander Profile Banner */}
      <div className="minimal-card p-6 sm:p-8 space-y-6 relative overflow-hidden">
        <div className="flex flex-col sm:flex-row items-center sm:items-start space-y-4 sm:space-y-0 sm:space-x-6">
          
          {/* Avatar & Frame */}
          <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-3xl bg-black border border-[#27272a] p-1 flex-shrink-0 overflow-hidden shadow-xl">
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
              className="w-full h-full object-cover rounded-2xl"
            />
          </div>

          {/* Commander Information */}
          <div className="space-y-2 text-center sm:text-left flex-1">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5">
              <h1 className="text-2xl sm:text-3xl font-heading font-bold text-white tracking-tight">
                {player.name}
              </h1>
              {nameplateUrl ? (
                <img
                  src={nameplateUrl}
                  alt="Nameplate"
                  className="h-7 sm:h-8 object-contain rounded-md max-w-[140px]"
                  onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }}
                />
              ) : player.nameplate && typeof player.nameplate === 'string' && !player.nameplate.includes('/') ? (
                <span className="bg-amber-500/20 text-amber-300 border border-amber-500/40 text-xs font-tech font-bold px-2.5 py-0.5 rounded-md uppercase">
                  {player.nameplate}
                </span>
              ) : null}
            </div>

            <p className="text-xs font-sans text-zinc-400 italic max-w-2xl leading-relaxed">
              "{player.sign || 'No commander signature set.'}"
            </p>

            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 pt-2 text-xs font-tech text-zinc-300">
              <span className="bg-[#18181b] border border-[#27272a] px-3 py-1 rounded-xl flex items-center space-x-2">
                <span>Player ID: <code className="text-white font-bold">{player.id}</code></span>
                <span className="text-zinc-600">•</span>
                <span className="bg-white text-black text-[10px] font-heading font-bold px-2 py-0.5 rounded-md uppercase shadow-sm">
                  LVL {player.level}
                </span>
              </span>
              {player.guild && (
                <span className="bg-[#18181b] border border-[#27272a] px-3 py-1 rounded-xl flex items-center space-x-1.5">
                  <Shield className="w-3.5 h-3.5 text-white" />
                  <span>Guild: <strong className="text-white">{player.guild.name}</strong></span>
                </span>
              )}
            </div>
          </div>

        </div>
      </div>

      {/* Compact Constructs Roster Grid */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-1">
          <div className="flex items-center space-x-2">
            <Users className="w-4 h-4 text-white" />
            <h2 className="font-heading font-bold text-lg text-white uppercase tracking-wider">
              CONSTRUCTS ({filteredCharacters.length})
            </h2>
          </div>

          {/* Search Filter */}
          <div className="relative min-w-[220px]">
            <input
              type="text"
              placeholder="Search Construct / Frame..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[#09090b] text-xs text-white border border-[#27272a] rounded-xl pl-3 pr-4 py-2 focus:outline-none focus:border-white font-sans"
            />
          </div>
        </div>

        {/* Compact Columns Grid (3 to 8 columns per row) */}
        {filteredCharacters.length === 0 ? (
          <div className="text-center py-16 bg-[#121215] rounded-2xl border border-[#27272a] text-zinc-400 font-tech text-sm">
            No constructs match search criteria.
          </div>
        ) : (
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3">
            {filteredCharacters.map((char) => {
              const rankInfo = getConstructRankLabel(char.quality, char.stars || 0);

              return (
                <div
                  key={char.id}
                  onClick={() => onSelectCharacter(char)}
                  className="minimal-card-interactive p-2.5 flex flex-col items-center justify-between text-center cursor-pointer group space-y-2 rounded-2xl border border-[#27272a] hover:border-white transition-all"
                >
                  {/* Construct Square Portrait Container */}
                  <div className="relative w-full aspect-square rounded-xl bg-black border border-[#27272a] overflow-hidden group-hover:border-white transition-colors">
                    <img
                      src={getHuaxuImageUrl(char.fashionIcon || char.normalIcon)}
                      alt={char.characterName}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />

                    {/* Rank Badge Overlay */}
                    <div className="absolute top-1.5 left-1.5">
                      <span className={`text-[9px] font-tech font-bold px-1.5 py-0.2 rounded uppercase border shadow-md ${rankInfo.classNames}`}>
                        {rankInfo.label}
                      </span>
                    </div>

                    {/* Level Badge Overlay */}
                    <div className="absolute bottom-1.5 right-1.5">
                      <span className="bg-black/90 text-white text-[9px] font-tech font-bold px-1.5 py-0.2 rounded border border-[#27272a]">
                        LV{char.level}
                      </span>
                    </div>
                  </div>

                  {/* Compact Text Labels */}
                  <div className="space-y-0.5 w-full">
                    <h3 className="font-heading font-bold text-xs text-white truncate w-full group-hover:text-zinc-200">
                      {char.characterName}
                    </h3>
                    <p className="text-[10px] font-tech text-zinc-400 truncate w-full">
                      {char.frameName}
                    </p>
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

function UsersIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}
