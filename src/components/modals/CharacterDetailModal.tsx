import React, { useState, useEffect } from 'react';
import { PlayerCharacter, CharacterDetailResponse } from '@/types';
import { getCharacterDetail } from '@/services/apiService';
import { getHuaxuImageUrl, getConstructRankLabel } from '@/services/imageUtils';
import { X, Zap, Info, Shirt, Crosshair, Cpu, Layers, Disc } from 'lucide-react';

interface CharacterDetailModalProps {
  character: PlayerCharacter | null;
  server: string;
  uid: number;
  onClose: () => void;
}

export const CharacterDetailModal: React.FC<CharacterDetailModalProps> = ({
  character,
  server,
  uid,
  onClose
}) => {
  const [detailData, setDetailData] = useState<CharacterDetailResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'weapon' | 'memories' | 'cub' | 'fashion'>('overview');

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
    affix: {
      id: 2,
      name: 'Ignition / Matrix Fusion',
      description: 'Optimized chemical reaction process dealing heavy elemental damage.',
      icon: 'image/icontype/icontypeburnskill01b'
    }
  };

  const rankInfo = getConstructRankLabel(charInfo.quality);
  const weapon = detailData?.data?.weapon;
  const cub = detailData?.data?.cub;
  const memories = detailData?.data?.memories || [];
  const suits = detailData?.data?.suits || [];
  const fashionList = detailData?.data?.fashion || [];

  // Parse weapon harmonization (from API `weapon.harmonization` or `weapon.harmonize`)
  const harmonization = weapon?.harmonization || weapon?.harmonize;
  const harmonizationLevel = weapon?.harmonizationLevel || 1;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-lg animate-fadeIn">
      <div 
        className="relative w-full max-w-5xl max-h-[92vh] overflow-y-auto glass-panel rounded-3xl border border-zinc-700 p-6 sm:p-8 shadow-2xl space-y-6"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full bg-zinc-900 border border-zinc-700 hover:border-white text-zinc-400 hover:text-white transition-colors z-20"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Character Main Visual & Identity Header */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column - Character Splash & Rank Badge */}
          <div className="lg:col-span-5 flex flex-col items-center">
            <div className="relative w-full aspect-[3/4] max-w-sm rounded-2xl bg-black border-2 border-zinc-700 overflow-hidden shadow-2xl p-2 flex items-center justify-center group">
              <img
                src={getHuaxuImageUrl(charInfo.image)}
                alt={charInfo.characterName}
                className="w-full h-full object-cover rounded-xl filter contrast-110 transition-transform duration-500 group-hover:scale-105"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = getHuaxuImageUrl(charInfo.icons.normal);
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-80" />

              {/* Construct Rank Badge Overlay */}
              <div className="absolute top-4 left-4">
                <span className={`inline-block px-3 py-1 rounded-md text-xs border uppercase tracking-wider shadow-md ${rankInfo.classNames}`}>
                  Rank {rankInfo.label}
                </span>
              </div>

              <div className="absolute bottom-4 left-4 right-4 text-center">
                <div className="inline-block bg-black/90 border border-zinc-700 px-3 py-1 rounded-full text-xs font-tech font-bold text-zinc-300 uppercase tracking-widest mb-1 shadow-lg">
                  {charInfo.frameCode || 'BPN-01'} • {charInfo.frameType.toUpperCase()}
                </div>
                <h3 className="text-2xl font-heading font-black text-white">
                  {charInfo.characterName}
                </h3>
                <p className="text-sm font-tech font-bold text-zinc-300">
                  {charInfo.frameName}
                </p>
              </div>
            </div>
          </div>

          {/* Right Column - Navigation Tabs & Detail Screens */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Tabs Navigation */}
            <div className="flex flex-wrap gap-2 border-b border-zinc-800 pb-3">
              <button
                onClick={() => setActiveTab('overview')}
                className={`flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-heading font-bold transition-all ${
                  activeTab === 'overview'
                    ? 'bg-white text-black border border-white shadow-sm'
                    : 'text-zinc-400 hover:text-white bg-zinc-900'
                }`}
              >
                <Info className="w-3.5 h-3.5" />
                <span>OVERVIEW</span>
              </button>

              <button
                onClick={() => setActiveTab('weapon')}
                className={`flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-heading font-bold transition-all ${
                  activeTab === 'weapon'
                    ? 'bg-white text-black border border-white shadow-sm'
                    : 'text-zinc-400 hover:text-white bg-zinc-900'
                }`}
              >
                <Crosshair className="w-3.5 h-3.5" />
                <span>WEAPON &amp; HARMONIZATION</span>
              </button>

              <button
                onClick={() => setActiveTab('memories')}
                className={`flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-heading font-bold transition-all ${
                  activeTab === 'memories'
                    ? 'bg-white text-black border border-white shadow-sm'
                    : 'text-zinc-400 hover:text-white bg-zinc-900'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>MEMORIES</span>
              </button>

              <button
                onClick={() => setActiveTab('cub')}
                className={`flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-heading font-bold transition-all ${
                  activeTab === 'cub'
                    ? 'bg-white text-black border border-white shadow-sm'
                    : 'text-zinc-400 hover:text-white bg-zinc-900'
                }`}
              >
                <Cpu className="w-3.5 h-3.5" />
                <span>CUB PET</span>
              </button>

              <button
                onClick={() => setActiveTab('fashion')}
                className={`flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-heading font-bold transition-all ${
                  activeTab === 'fashion'
                    ? 'bg-white text-black border border-white shadow-sm'
                    : 'text-zinc-400 hover:text-white bg-zinc-900'
                }`}
              >
                <Shirt className="w-3.5 h-3.5" />
                <span>COATINGS ({fashionList.length || 0})</span>
              </button>
            </div>

            {/* TAB 1: OVERVIEW */}
            {activeTab === 'overview' && (
              <div className="space-y-5 animate-fadeIn">
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-3 text-center">
                    <span className="text-[10px] font-tech uppercase text-zinc-400">Construct Rank</span>
                    <h5 className="font-heading font-black text-sm text-white mt-0.5">Rank {rankInfo.label}</h5>
                  </div>
                  <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-3 text-center">
                    <span className="text-[10px] font-tech uppercase text-zinc-400">Class Role</span>
                    <h5 className="font-heading font-bold text-sm text-zinc-200 mt-0.5">{charInfo.class || 'Attacker'}</h5>
                  </div>
                  <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-3 text-center">
                    <span className="text-[10px] font-tech uppercase text-zinc-400">Priority Score</span>
                    <h5 className="font-heading font-bold text-sm text-zinc-200 mt-0.5">{charInfo.priority || 2400}</h5>
                  </div>
                </div>

                <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-4 space-y-1">
                  <h5 className="text-xs font-heading font-bold text-zinc-300 uppercase tracking-wider">Frame Profile</h5>
                  <p className="text-xs font-sans text-zinc-300 leading-relaxed">
                    {charInfo.intro}
                  </p>
                </div>

                {charInfo.elements && charInfo.elements.length > 0 && (
                  <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-4 space-y-2">
                    <h5 className="text-xs font-heading font-bold text-zinc-300 uppercase tracking-wider">Elemental Affinity</h5>
                    <div className="space-y-2">
                      {charInfo.elements.map((el, idx) => (
                        <div key={idx} className="space-y-1">
                          <div className="flex justify-between text-xs font-tech text-zinc-300 uppercase">
                            <span>{el.element} DMG</span>
                            <span className="font-bold text-white">{el.percentage}%</span>
                          </div>
                          <div className="w-full h-2 bg-black rounded-full overflow-hidden border border-zinc-800">
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
                  <div className="bg-zinc-900/80 border border-zinc-700 rounded-2xl p-4 space-y-2">
                    <div className="flex items-center space-x-2">
                      <Zap className="w-4 h-4 text-white" />
                      <h5 className="text-xs font-heading font-bold text-white uppercase tracking-wider">
                        Special Affix: {charInfo.affix.name}
                      </h5>
                    </div>
                    <p className="text-xs font-sans text-zinc-300 leading-relaxed">
                      {charInfo.affix.description}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* TAB 2: WEAPON & HARMONIZATION */}
            {activeTab === 'weapon' && (
              <div className="space-y-4 animate-fadeIn">
                {!weapon ? (
                  <div className="text-center py-12 bg-zinc-900/50 rounded-2xl border border-zinc-800">
                    <p className="text-xs font-tech text-zinc-400">Default Construct Weapon Equipped.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* Weapon Top Header */}
                    <div className="bg-zinc-900 border border-zinc-700 rounded-2xl p-5 space-y-4">
                      <div className="flex items-center space-x-4">
                        <div className="w-16 h-16 rounded-xl bg-black p-1 flex-shrink-0 border-2 border-zinc-700">
                          <img
                            src={getHuaxuImageUrl(weapon.iconBig || weapon.icon)}
                            alt={weapon.name}
                            className="w-full h-full object-contain rounded-lg"
                          />
                        </div>
                        <div>
                          <div className="flex items-center space-x-2">
                            <h4 className="font-heading font-bold text-lg text-white">{weapon.name}</h4>
                            <span className="bg-white text-black text-[10px] font-heading font-black px-2 py-0.5 rounded-full uppercase">
                              {weapon.quality || 6}★ Signature
                            </span>
                          </div>
                          <p className="text-xs font-tech text-zinc-400 mt-0.5">
                            Level {weapon.level || 45} • Breakthrough {weapon.breakthrough || 4}
                          </p>
                        </div>
                      </div>

                      {/* Weapon Skill */}
                      {weapon.weaponSkill && (
                        <div className="bg-black/70 border border-zinc-800 rounded-xl p-3.5 space-y-1">
                          <h5 className="font-heading font-bold text-xs text-white">
                            Signature Skill: {weapon.weaponSkill.name}
                          </h5>
                          <p className="text-xs font-sans text-zinc-300 leading-relaxed">
                            {weapon.weaponSkill.description}
                          </p>
                        </div>
                      )}

                      {/* Weapon Resonances */}
                      {weapon.resonances && weapon.resonances.length > 0 && (
                        <div className="space-y-2 border-t border-zinc-800 pt-3">
                          <h5 className="text-xs font-heading font-bold text-zinc-300 uppercase tracking-wider">
                            Weapon Resonances ({weapon.resonances.length})
                          </h5>
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                            {weapon.resonances.map((res: any, rIdx: number) => (
                              <div key={rIdx} className="bg-black border border-zinc-800 rounded-xl p-2.5 text-xs">
                                <span className="font-heading font-bold text-white block text-[11px]">
                                  Slot {res.slot}: {res.name}
                                </span>
                                <span className="text-[10px] font-sans text-zinc-400 block mt-0.5">
                                  {res.description}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* WEAPON HARMONIZATION MEMORY SLOT */}
                    <div className="bg-zinc-900 border border-zinc-700 rounded-2xl p-5 space-y-3">
                      <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
                        <div className="flex items-center space-x-2">
                          <Disc className="w-4 h-4 text-white" />
                          <h5 className="text-xs font-heading font-bold text-white uppercase tracking-wider">
                            WEAPON HARMONIZATION
                          </h5>
                        </div>
                        <span className="bg-white text-black text-[10px] font-tech font-bold px-2 py-0.5 rounded uppercase">
                          Harmonization LVL {harmonizationLevel}
                        </span>
                      </div>

                      {harmonization ? (
                        <div className="flex items-center space-x-4 bg-black p-4 rounded-xl border border-zinc-700">
                          <div className="w-14 h-14 rounded-xl bg-zinc-900 p-1 flex-shrink-0 border-2 border-white shadow-md">
                            <img
                              src={getHuaxuImageUrl(harmonization.iconBig || harmonization.icon)}
                              alt={harmonization.name || 'Harmonization Memory'}
                              className="w-full h-full object-cover rounded-lg"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center space-x-2">
                              <h6 className="font-heading font-bold text-base text-white truncate">
                                {harmonization.name}
                              </h6>
                              <span className="bg-zinc-800 text-zinc-200 border border-zinc-600 text-[10px] font-tech font-bold px-2 py-0.5 rounded">
                                {harmonization.quality || 6}★ Memory
                              </span>
                            </div>
                            <p className="text-xs font-tech text-zinc-400 mt-1">
                              Suit Set #{harmonization.suit || 1641} • Extra Memory Harmonized on Signature Weapon
                            </p>
                          </div>
                        </div>
                      ) : (
                        <div className="text-center py-6 bg-black/50 rounded-xl border border-zinc-800 text-xs font-tech text-zinc-500">
                          No Harmonization Memory Attached to Weapon
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* TAB 3: MEMORIES */}
            {activeTab === 'memories' && (
              <div className="space-y-5 animate-fadeIn">
                <div className="space-y-2">
                  <h5 className="text-xs font-heading font-bold text-zinc-300 uppercase tracking-wider">
                    Equipped Memory Grid (Slots 1 - 6)
                  </h5>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
                    {[1, 2, 3, 4, 5, 6].map((slotNum) => {
                      const mem = memories[slotNum - 1];
                      return (
                        <div
                          key={slotNum}
                          className={`rounded-2xl p-2.5 border text-center flex flex-col items-center justify-between min-h-[110px] ${
                            mem
                              ? 'bg-zinc-900 border-zinc-600'
                              : 'bg-black/60 border-zinc-800'
                          }`}
                        >
                          <span className="text-[10px] font-heading font-bold text-zinc-400">Slot {slotNum}</span>
                          {mem ? (
                            <>
                              <div className="w-10 h-10 rounded-lg bg-black p-0.5 border border-zinc-800 my-1">
                                <img
                                  src={getHuaxuImageUrl(mem.icon)}
                                  alt={mem.name}
                                  className="w-full h-full object-cover rounded"
                                />
                              </div>
                              <span className="text-[10px] font-heading font-bold text-white truncate w-full">
                                {mem.name}
                              </span>
                            </>
                          ) : (
                            <div className="my-auto text-zinc-600 font-tech text-xs italic">Empty</div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {suits && suits.length > 0 && (
                  <div className="space-y-2 border-t border-zinc-800 pt-4">
                    <h5 className="text-xs font-heading font-bold text-white uppercase tracking-wider">
                      Active Suit Set Bonuses
                    </h5>
                    <div className="space-y-2">
                      {suits.map((suit: any, sIdx: number) => (
                        <div key={sIdx} className="bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-xs space-y-1">
                          <div className="flex justify-between items-center">
                            <span className="font-heading font-bold text-white">{suit.name}</span>
                            <span className="bg-white text-black text-[10px] font-tech font-bold px-2 py-0.5 rounded">
                              {suit.count}-Piece Set
                            </span>
                          </div>
                          <p className="text-[11px] font-sans text-zinc-300 leading-relaxed">
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
              <div className="space-y-4 animate-fadeIn">
                {!cub ? (
                  <div className="text-center py-12 bg-zinc-900/50 rounded-2xl border border-zinc-800 space-y-2">
                    <Cpu className="w-8 h-8 text-zinc-600 mx-auto" />
                    <p className="text-xs font-tech text-zinc-400">No CUB Companion Unit Equipped on this Construct.</p>
                  </div>
                ) : (
                  <div className="bg-zinc-900 border border-zinc-700 rounded-2xl p-5 space-y-4">
                    <div className="flex items-center space-x-4">
                      <div className="w-16 h-16 rounded-xl bg-black p-1 flex-shrink-0 border-2 border-zinc-700">
                        <img
                          src={getHuaxuImageUrl(cub.icon)}
                          alt={cub.name}
                          className="w-full h-full object-cover rounded-lg"
                        />
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <h4 className="font-heading font-bold text-lg text-white">{cub.name}</h4>
                          <span className="bg-white text-black text-[10px] font-heading font-black px-2 py-0.5 rounded-full uppercase">
                            {cub.quality || 6}★ CUB
                          </span>
                        </div>
                        <p className="text-xs font-tech text-zinc-400 mt-0.5">
                          Level {cub.level || 80} Companion Unit
                        </p>
                      </div>
                    </div>

                    {cub.skills && cub.skills.length > 0 && (
                      <div className="space-y-2 border-t border-zinc-800 pt-3">
                        <h5 className="text-xs font-heading font-bold text-white uppercase tracking-wider">
                          Active CUB Skills
                        </h5>
                        {cub.skills.map((cSk: any, csIdx: number) => (
                          <div key={csIdx} className="bg-black border border-zinc-800 rounded-xl p-3 text-xs space-y-1">
                            <span className="font-heading font-bold text-white block">{cSk.name}</span>
                            <span className="text-[11px] font-sans text-zinc-300 block">{cSk.description}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* TAB 5: FASHION / COATINGS */}
            {activeTab === 'fashion' && (
              <div className="space-y-4 animate-fadeIn max-h-[350px] overflow-y-auto pr-2">
                {fashionList.length === 0 ? (
                  <div className="text-center py-10 bg-zinc-900/50 rounded-2xl border border-zinc-800">
                    <p className="text-xs font-tech text-zinc-400">Default frame coating equipped.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {fashionList.map((f: any) => (
                      <div
                        key={f.id}
                        className={`p-3 rounded-2xl border flex items-center space-x-3 ${
                          f.acquired
                            ? 'bg-zinc-900 border-white'
                            : 'bg-black border-zinc-800 opacity-60'
                        }`}
                      >
                        <div className="w-12 h-12 rounded-xl bg-black p-1 flex-shrink-0 border border-zinc-800">
                          <img
                            src={getHuaxuImageUrl(f.icon)}
                            alt={f.name}
                            className="w-full h-full object-cover rounded-lg"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h5 className="font-heading font-bold text-xs text-white truncate">{f.name}</h5>
                          <span className="text-[10px] font-tech text-zinc-300 font-bold">
                            {f.acquired ? 'UNLOCKED / ACQUIRED' : 'LOCKED'}
                          </span>
                        </div>
                      </div>
                    ))}
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
