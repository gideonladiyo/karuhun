import React, { useState, useEffect } from 'react';
import { PlayerCharacter, CharacterDetailResponse } from '../types';
import { getCharacterDetail } from '../services/apiService';
import { getHuaxuImageUrl, getConstructRankLabel } from '../services/imageUtils';
import { ArrowLeft, Zap, Info, Crosshair, Cpu, Layers, Disc } from 'lucide-react';

interface CharacterInspectPageProps {
  character: PlayerCharacter | null;
  server: string;
  uid: number;
  onBack: () => void;
}

export const CharacterInspectPage: React.FC<CharacterInspectPageProps> = ({
  character,
  server,
  uid,
  onBack
}) => {
  const [detailData, setDetailData] = useState<CharacterDetailResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'weapon' | 'memories' | 'cub'>('overview');

  useEffect(() => {
    if (!character) return;
    setLoading(true);
    getCharacterDetail(server, uid, character.id)
      .then((data) => {
        setDetailData(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to load character detail', err);
        setLoading(false);
      });
  }, [character, server, uid]);

  if (!character) return null;

  const charInfo = detailData?.data?.character || {
    id: character.id,
    slug: character.characterName.toLowerCase(),
    characterName: character.characterName,
    frameName: character.frameName,
    frameType: character.frameType,
    frameCode: character.frameCode,
    frameGender: 1,
    priority: character.priority,
    intro: 'Command construct deployed in elite Karuhun combat operations.',
    image: 'image/rolestory/v3300jtwnormal02',
    icons: {
      normal: character.normalIcon,
      ultima: character.fashionIcon,
      round: character.normalIcon
    },
    class: 'Attacker',
    classIcon: 'image/icontype/iconcharacter3',
    element: 'dark',
    elements: [{ element: 'dark', percentage: 100 }],
    quality: character.quality,
    stars: character.stars || 0,
    affix: {
      id: 2,
      name: 'Ignition / Matrix Fusion',
      description: 'Optimized chemical reaction process dealing heavy elemental damage.',
      icon: 'image/icontype/icontypeburnskill01b'
    }
  };

  const rankInfo = getConstructRankLabel(charInfo.quality, charInfo.stars || character.stars || 0);
  const weapon = detailData?.data?.weapon;
  const cub = detailData?.data?.cub;
  const memories = detailData?.data?.memories || [];
  const suits = detailData?.data?.suits || [];

  const harmonization = weapon?.harmonization || weapon?.harmonize;
  const harmonizationLevel = weapon?.harmonizationLevel || 1;

  return (
    <div className="space-y-6 sm:space-y-8 animate-fadeIn pb-16 md:pb-0">
      {/* Top Back Navigation Bar */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-[#121215] hover:bg-[#18181b] border border-[#27272a] hover:border-white text-white font-heading font-bold text-xs transition-all shadow-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>KEMBALI KE PLAYER PROFILE</span>
        </button>

        <span className="text-xs font-tech text-zinc-400 hidden sm:inline-block">
          CONSTRUCT INSPECTION PAGE • {charInfo.characterName} ({charInfo.frameName})
        </span>
      </div>

      {/* Main Full-Page Inspection Container */}
      <div className="minimal-card p-5 sm:p-8 space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column - Character Splash & Rank Badge */}
          <div className="lg:col-span-5 flex flex-col items-center">
            <div className="relative w-full aspect-[3/4] max-w-md rounded-2xl sm:rounded-3xl bg-black border border-[#27272a] overflow-hidden shadow-2xl p-2 flex items-center justify-center group">
              <img
                src={getHuaxuImageUrl(charInfo.image)}
                alt={charInfo.characterName}
                className="w-full h-full object-cover rounded-xl sm:rounded-2xl filter contrast-110 transition-transform duration-500 group-hover:scale-105"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = getHuaxuImageUrl(charInfo.icons.normal);
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-80" />

              {/* Construct Rank Badge Overlay */}
              <div className="absolute top-4 left-4 sm:top-5 sm:left-5">
                <span className={`inline-block px-3 py-1 rounded-lg text-xs border uppercase tracking-wider shadow-lg ${rankInfo.classNames}`}>
                  Rank {rankInfo.label}
                </span>
              </div>

              <div className="absolute bottom-4 left-4 right-4 sm:bottom-5 sm:left-5 sm:right-5 text-center space-y-1">
                <div className="inline-block bg-black/90 border border-[#27272a] px-3 py-1 rounded-full text-xs font-tech font-bold text-zinc-300 uppercase tracking-widest shadow-lg">
                  {charInfo.frameCode || 'BPN-01'} • {charInfo.frameType.toUpperCase()}
                </div>
                <h1 className="text-2xl sm:text-3xl font-heading font-bold text-white">
                  {charInfo.characterName}
                </h1>
                <p className="text-sm sm:text-base font-tech font-bold text-zinc-300">
                  {charInfo.frameName}
                </p>
              </div>
            </div>
          </div>

          {/* Right Column - Navigation Tabs & Detailed Content */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Tabs Navigation */}
            <div className="flex flex-wrap gap-2 border-b border-[#27272a] pb-3">
              <button
                onClick={() => setActiveTab('overview')}
                className={`flex items-center space-x-2 px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-xl text-xs font-heading font-bold transition-all ${
                  activeTab === 'overview'
                    ? 'bg-white text-black shadow-sm'
                    : 'text-zinc-400 hover:text-white bg-[#121215]'
                }`}
              >
                <Info className="w-4 h-4" />
                <span>OVERVIEW</span>
              </button>

              <button
                onClick={() => setActiveTab('weapon')}
                className={`flex items-center space-x-2 px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-xl text-xs font-heading font-bold transition-all ${
                  activeTab === 'weapon'
                    ? 'bg-white text-black shadow-sm'
                    : 'text-zinc-400 hover:text-white bg-[#121215]'
                }`}
              >
                <Crosshair className="w-4 h-4" />
                <span>WEAPON &amp; HARMONIZATION</span>
              </button>

              <button
                onClick={() => setActiveTab('memories')}
                className={`flex items-center space-x-2 px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-xl text-xs font-heading font-bold transition-all ${
                  activeTab === 'memories'
                    ? 'bg-white text-black shadow-sm'
                    : 'text-zinc-400 hover:text-white bg-[#121215]'
                }`}
              >
                <Layers className="w-4 h-4" />
                <span>MEMORIES</span>
              </button>

              <button
                onClick={() => setActiveTab('cub')}
                className={`flex items-center space-x-2 px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-xl text-xs font-heading font-bold transition-all ${
                  activeTab === 'cub'
                    ? 'bg-white text-black shadow-sm'
                    : 'text-zinc-400 hover:text-white bg-[#121215]'
                }`}
              >
                <Cpu className="w-4 h-4" />
                <span>CUB PET</span>
              </button>
            </div>

            {/* TAB 1: OVERVIEW */}
            {activeTab === 'overview' && (
              <div className="space-y-6 animate-fadeIn">
                <div className="grid grid-cols-2 gap-3 sm:gap-4">
                  <div className="bg-black border border-[#27272a] rounded-2xl p-4 text-center">
                    <span className="text-xs font-tech uppercase text-zinc-400">Construct Rank</span>
                    <h5 className="font-heading font-bold text-base text-white mt-0.5">Rank {rankInfo.label}</h5>
                  </div>
                  <div className="bg-black border border-[#27272a] rounded-2xl p-4 text-center">
                    <span className="text-xs font-tech uppercase text-zinc-400">Class Role</span>
                    <h5 className="font-heading font-bold text-base text-zinc-200 mt-0.5">{charInfo.class || 'Attacker'}</h5>
                  </div>
                </div>

                {charInfo.elements && charInfo.elements.length > 0 && (
                  <div className="bg-black p-5 rounded-2xl border border-[#27272a] space-y-3">
                    <h5 className="text-xs font-heading font-bold text-white uppercase tracking-wider">Elemental Affinity</h5>
                    <div className="space-y-3">
                      {charInfo.elements.map((el, idx) => (
                        <div key={idx} className="space-y-1.5">
                          <div className="flex justify-between text-xs font-tech text-zinc-300 uppercase">
                            <span>{el.element} DMG</span>
                            <span className="font-bold text-white">{el.percentage}%</span>
                          </div>
                          <div className="w-full h-2.5 bg-[#121215] rounded-full overflow-hidden border border-[#27272a]">
                            <div
                              className="h-full bg-white"
                              style={{ width: `${el.percentage}%` }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {charInfo.affix && (
                  <div className="bg-black p-5 rounded-2xl border border-[#27272a] space-y-2">
                    <div className="flex items-center space-x-2">
                      <Zap className="w-4 h-4 text-white" />
                      <h5 className="text-xs font-heading font-bold text-white uppercase tracking-wider">
                        Special Affix: {charInfo.affix.name}
                      </h5>
                    </div>
                    <p className="text-xs sm:text-sm font-sans text-zinc-300 leading-relaxed">
                      {charInfo.affix.description}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* TAB 2: WEAPON & HARMONIZATION */}
            {activeTab === 'weapon' && (
              <div className="space-y-5 animate-fadeIn">
                {!weapon ? (
                  <div className="text-center py-16 bg-[#121215] rounded-2xl border border-[#27272a]">
                    <p className="text-sm font-tech text-zinc-400">Default Construct Weapon Equipped.</p>
                  </div>
                ) : (
                  <div className="space-y-5">
                    {/* Weapon Top Header */}
                    <div className="bg-black border border-[#27272a] rounded-2xl p-5 sm:p-6 space-y-4 shadow-sm">
                      <div className="flex items-center space-x-4 sm:space-x-5">
                        <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-[#121215] p-1.5 flex-shrink-0 border border-[#27272a]">
                          <img
                            src={getHuaxuImageUrl(weapon.iconBig || weapon.icon)}
                            alt={weapon.name}
                            className="w-full h-full object-contain rounded-xl"
                          />
                        </div>
                        <div>
                          <div className="flex items-center space-x-3">
                            <h3 className="font-heading font-bold text-lg sm:text-xl text-white">{weapon.name}</h3>
                            <span className="bg-white text-black text-[10px] sm:text-xs font-heading font-bold px-2.5 py-0.5 rounded-full uppercase">
                              {weapon.quality || 6}★ Signature
                            </span>
                          </div>
                          <p className="text-xs font-tech text-zinc-400 mt-1">
                            Level {weapon.level || 45} • Breakthrough {weapon.breakthrough || 4}
                          </p>
                        </div>
                      </div>

                      {/* Weapon Skill */}
                      {weapon.weaponSkill && (
                        <div className="bg-[#121215] border border-[#27272a] rounded-xl p-4 space-y-1">
                          <h4 className="font-heading font-bold text-xs text-white">
                            Signature Skill: {weapon.weaponSkill.name}
                          </h4>
                          <p className="text-xs font-sans text-zinc-300 leading-relaxed">
                            {weapon.weaponSkill.description}
                          </p>
                        </div>
                      )}

                      {/* Weapon Resonances (Full Names, Never Truncated) */}
                      {weapon.resonances && weapon.resonances.length > 0 && (
                        <div className="space-y-3 border-t border-[#27272a] pt-5">
                          <h4 className="text-xs font-heading font-bold text-zinc-300 uppercase tracking-wider">
                            WEAPON RESONANCES ({weapon.resonances.length})
                          </h4>
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                            {weapon.resonances.map((res: any, rIdx: number) => (
                              <div
                                key={rIdx}
                                className="bg-[#121215] border border-[#27272a] hover:border-white rounded-2xl p-3.5 flex items-center space-x-3.5 shadow-sm transition-colors group"
                              >
                                {/* Resonance Skill Icon */}
                                <div className="w-12 h-12 rounded-xl bg-black p-1 flex-shrink-0 border border-[#27272a] group-hover:border-white transition-colors">
                                  <img
                                    src={getHuaxuImageUrl(res.icon)}
                                    alt={res.name}
                                    className="w-full h-full object-contain filter grayscale contrast-125"
                                    onError={(e) => {
                                      (e.target as HTMLImageElement).src = getHuaxuImageUrl('image/iconskill/iconskillequipshuchuguozaiqinxie');
                                    }}
                                  />
                                </div>

                                {/* Slot # & Full Resonance Name */}
                                <div className="flex-1 min-w-0">
                                  <span className="text-[10px] font-tech text-zinc-400 block uppercase font-bold tracking-wider">
                                    Slot {res.slot || rIdx + 1}
                                  </span>
                                  <h5 className="font-heading font-bold text-xs sm:text-sm text-white leading-snug whitespace-normal break-words group-hover:text-zinc-200 transition-colors">
                                    {res.name}
                                  </h5>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* WEAPON HARMONIZATION MEMORY SLOT */}
                    <div className="bg-black border border-[#27272a] rounded-2xl p-5 sm:p-6 space-y-4 shadow-sm">
                      <div className="flex items-center justify-between border-b border-[#27272a] pb-3">
                        <div className="flex items-center space-x-2">
                          <Disc className="w-5 h-5 text-white" />
                          <h4 className="text-sm font-heading font-bold text-white uppercase tracking-wider">
                            WEAPON HARMONIZATION
                          </h4>
                        </div>
                        <span className="bg-white text-black text-xs font-tech font-bold px-2.5 py-0.5 rounded uppercase">
                          Harmonization LVL {harmonizationLevel}
                        </span>
                      </div>

                      {harmonization ? (
                        <div className="flex items-center space-x-4 sm:space-x-5 bg-[#121215] p-4 rounded-2xl border border-[#27272a]">
                          <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl bg-black p-1 flex-shrink-0 border border-white shadow-md">
                            <img
                              src={getHuaxuImageUrl(harmonization.iconBig || harmonization.icon)}
                              alt={harmonization.name || 'Harmonization Memory'}
                              className="w-full h-full object-cover rounded-lg"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center space-x-2">
                              <h5 className="font-heading font-bold text-base sm:text-lg text-white truncate">
                                {harmonization.name}
                              </h5>
                              <span className="bg-zinc-800 text-zinc-200 border border-zinc-600 text-xs font-tech font-bold px-2 py-0.5 rounded">
                                {harmonization.quality || 6}★ Memory
                              </span>
                            </div>
                            <p className="text-xs font-tech text-zinc-400 mt-1">
                              Suit Set #{harmonization.suit || 1641} • Extra Memory Harmonized on Signature Weapon
                            </p>
                          </div>
                        </div>
                      ) : (
                        <div className="text-center py-8 bg-[#121215] rounded-xl border border-[#27272a] text-xs font-tech text-zinc-500">
                          No Harmonization Memory Attached to Weapon
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* TAB 3: MEMORIES (3 Columns x 2 Rows Direct Memory Icon Grid) */}
            {activeTab === 'memories' && (
              <div className="space-y-6 animate-fadeIn">
                <div className="space-y-3">
                  <h4 className="text-xs font-heading font-bold text-zinc-300 uppercase tracking-wider">
                    EQUIPPED MEMORIES (SLOTS 1 - 6)
                  </h4>
                  
                  {/* 3 Columns x 2 Rows Grid */}
                  <div className="grid grid-cols-3 gap-3.5 max-w-md">
                    {[1, 2, 3, 4, 5, 6].map((slotNum) => {
                      const mem = memories[slotNum - 1];
                      return (
                        <div
                          key={slotNum}
                          className={`aspect-square rounded-2xl p-1.5 border flex items-center justify-center relative overflow-hidden group shadow-md transition-all ${
                            mem
                              ? 'bg-[#09090b] border-[#27272a] hover:border-white'
                              : 'bg-black border-[#27272a]'
                          }`}
                          title={mem ? `Slot ${slotNum}: ${mem.name}` : `Slot ${slotNum}: Empty`}
                        >
                          {mem ? (
                            <img
                              src={getHuaxuImageUrl(mem.icon)}
                              alt={mem.name}
                              className="w-full h-full object-cover rounded-xl filter contrast-110 group-hover:scale-105 transition-transform duration-300"
                            />
                          ) : (
                            <span className="text-zinc-600 font-tech text-xs font-bold">Slot {slotNum}</span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {suits && suits.length > 0 && (
                  <div className="space-y-3 border-t border-[#27272a] pt-5">
                    <h4 className="text-xs font-heading font-bold text-white uppercase tracking-wider">
                      Active Suit Set Bonuses
                    </h4>
                    <div className="space-y-3">
                      {suits.map((suit: any, sIdx: number) => (
                        <div key={sIdx} className="bg-black border border-[#27272a] rounded-xl p-4 text-xs space-y-1">
                          <div className="flex justify-between items-center">
                            <span className="font-heading font-bold text-white text-sm">{suit.name}</span>
                            <span className="bg-white text-black text-xs font-tech font-bold px-2.5 py-0.5 rounded">
                              {suit.count}-Piece Set
                            </span>
                          </div>
                          <p className="text-xs font-sans text-zinc-300 leading-relaxed">
                            {suit.description}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* TAB 4: CUB COMPANION */}
            {activeTab === 'cub' && (
              <div className="space-y-6 animate-fadeIn">
                {!cub ? (
                  <div className="text-center py-16 bg-[#121215] rounded-2xl border border-[#27272a] space-y-2">
                    <Cpu className="w-8 h-8 text-zinc-600 mx-auto" />
                    <p className="text-xs font-tech text-zinc-400">No CUB Companion Unit Equipped on this Construct.</p>
                  </div>
                ) : (
                  <div className="bg-black border border-[#27272a] rounded-2xl p-5 sm:p-8 space-y-6 shadow-md max-w-xl">
                    {/* Top CUB Header */}
                    <div className="flex items-center space-x-4 sm:space-x-5 border-b border-[#27272a] pb-5">
                      <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-[#121215] p-1 flex-shrink-0 border border-[#27272a]">
                        <img
                          src={getHuaxuImageUrl(cub.icon)}
                          alt={cub.name}
                          className="w-full h-full object-cover rounded-xl"
                        />
                      </div>
                      <div>
                        <h3 className="font-heading font-bold text-xl sm:text-2xl text-white">{cub.name}</h3>
                        <div className="flex items-center space-x-3 mt-1 text-xs font-tech">
                          <span className="text-zinc-400">
                            Rank <span className="font-bold text-white uppercase">{getConstructRankLabel(cub.quality || 4).label}</span>
                          </span>
                          <span className="text-zinc-400">
                            Level <span className="font-bold text-white">{cub.level || 30}</span>
                            {cub.breakthrough && <span className="text-zinc-300 ml-1">✦{cub.breakthrough}</span>}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Equipped Skills List */}
                    <div className="space-y-3">
                      {cub.skills && cub.skills.filter((sk: any) => sk.equipped !== false).length > 0 ? (
                        cub.skills
                          .filter((sk: any) => sk.equipped !== false)
                          .map((cSk: any, csIdx: number) => (
                            <div
                              key={csIdx}
                              className="bg-[#121215] border border-[#27272a] hover:border-zinc-500 rounded-2xl p-3.5 flex items-center space-x-4 transition-colors"
                            >
                              {/* Skill Icon */}
                              <div className="w-12 h-12 rounded-xl bg-black p-1 flex-shrink-0 border border-[#27272a]">
                                <img
                                  src={getHuaxuImageUrl(cSk.icon)}
                                  alt={cSk.name}
                                  className="w-full h-full object-contain filter grayscale contrast-125"
                                  onError={(e) => {
                                    (e.target as HTMLImageElement).src = getHuaxuImageUrl('image/iconpetskill/pet3dragonskillzhudong06');
                                  }}
                                />
                              </div>

                              {/* Skill Name & Level */}
                              <div className="flex-1 min-w-0">
                                <h4 className="font-heading font-bold text-sm text-white truncate">
                                  {cSk.name}
                                </h4>
                                <p className="text-xs font-tech text-zinc-300 font-bold mt-0.5">
                                  Level <span className="text-white">{cSk.level || 1}</span>
                                </p>
                              </div>
                            </div>
                          ))
                      ) : (
                        <div className="text-center py-6 text-xs font-tech text-zinc-500">
                          No equipped skills available.
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

          </div>
        </div>

      </div>
    </div>
  );
};
