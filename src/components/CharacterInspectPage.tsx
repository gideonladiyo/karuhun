import React, { useState, useEffect } from 'react';
import { PlayerCharacter, CharacterDetailInfo } from '../types';
import { getCharacterDetail } from '../services/apiService';
import { getHuaxuImageUrl, getConstructRankLabel } from '../services/imageUtils';
import { ArrowLeft, Shield, Sword, Award, Sparkles, CheckCircle2, ChevronRight, AlertCircle, Info } from 'lucide-react';

interface CharacterInspectPageProps {
  character: PlayerCharacter;
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
  const [detailData, setDetailData] = useState<CharacterDetailInfo | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'weapon' | 'equipments' | 'partner'>('overview');

  useEffect(() => {
    setLoading(true);
    getCharacterDetail(server, uid, character.id)
      .then((res) => {
        if (res && res.data && res.data.character) {
          setDetailData(res.data.character);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to load character details', err);
        setLoading(false);
      });
  }, [server, uid, character.id]);

  const rankBadge = getConstructRankLabel(character.quality, character.stars || 0);

  return (
    <div className="space-y-6 sm:space-y-8 animate-fadeIn pb-16 md:pb-0">
      
      {/* Back Button & Breadcrumbs */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-[#121215] hover:bg-[#18181b] border border-[#27272a] hover:border-white text-white font-heading font-bold text-xs transition-all shadow-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>BACK TO PROFILE</span>
        </button>

        <span className="text-xs font-tech text-zinc-400 uppercase tracking-wider">
          INSPECTING: <strong className="text-white font-bold">{character.characterName}</strong> ({character.frameName})
        </span>
      </div>

      {/* Main Construct Hero Card */}
      <div className="minimal-card p-6 sm:p-8 space-y-6 relative overflow-hidden">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          
          <div className="flex items-center space-x-5">
            {/* Construct Portrait */}
            <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-3xl bg-black border border-[#27272a] p-1 flex-shrink-0 overflow-hidden shadow-xl">
              <img
                src={getHuaxuImageUrl(character.fashionIcon || character.normalIcon)}
                alt={character.characterName}
                className="w-full h-full object-cover rounded-2xl"
              />
            </div>

            {/* Construct Information */}
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl sm:text-3xl font-heading font-bold text-white tracking-tight">
                  {character.characterName}
                </h1>
                <span className={`text-xs font-heading font-bold px-3 py-0.5 rounded-full uppercase ${rankBadge.classNames}`}>
                  {rankBadge.label}
                </span>
                <span className="bg-[#18181b] text-zinc-300 border border-[#27272a] text-xs font-tech font-bold px-2.5 py-0.5 rounded-md uppercase">
                  {character.frameCode || 'BPN'}
                </span>
              </div>

              <p className="text-sm font-heading text-zinc-300">
                Frame: <span className="text-white font-bold">{character.frameName}</span>
              </p>

              <div className="flex items-center space-x-3 text-xs font-tech text-zinc-400 pt-1">
                <span>LVL <strong className="text-white">{character.level}</strong></span>
                <span>•</span>
                <span>Class: <strong className="text-white uppercase">{character.frameType || 'Omniframe'}</strong></span>
              </div>
            </div>
          </div>

          {/* Construct Stats Pills */}
          <div className="grid grid-cols-2 gap-3 w-full md:w-auto">
            <div className="bg-black/60 border border-[#27272a] rounded-2xl p-4 text-center min-w-[120px]">
              <span className="text-[10px] font-tech uppercase text-zinc-400 block font-bold">LEVEL</span>
              <span className="font-heading font-bold text-xl text-white">
                {character.level} / 80
              </span>
            </div>

            <div className="bg-black/60 border border-[#27272a] rounded-2xl p-4 text-center min-w-[120px]">
              <span className="text-[10px] font-tech uppercase text-zinc-400 block font-bold">AWAKENING</span>
              <span className="font-heading font-bold text-xl text-white">
                LVL {character.awakeningLevel || 3}
              </span>
            </div>
          </div>

        </div>

        {/* Sub-Navigation Tabs */}
        <div className="flex items-center space-x-2 border-t border-[#27272a] pt-4 overflow-x-auto">
          {[
            { id: 'overview', label: 'OVERVIEW' },
            { id: 'weapon', label: 'SIGNATURE WEAPON' },
            { id: 'equipments', label: 'MEMORIES' },
            { id: 'partner', label: 'CUB COMPANION' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-2 rounded-xl text-xs font-heading font-bold transition-all whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-white text-black shadow-sm'
                  : 'text-zinc-400 hover:text-white hover:bg-[#18181b]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content Display */}
      {loading ? (
        <div className="text-center py-20 bg-[#121215] rounded-3xl border border-[#27272a]">
          <div className="inline-block animate-spin w-8 h-8 border-4 border-white border-t-transparent rounded-full mb-3" />
          <p className="text-xs font-tech text-zinc-400">Loading Equipment &amp; Resonance Data...</p>
        </div>
      ) : (
        <div className="space-y-6">
          
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Equipped Weapon Summary Card */}
              <div className="minimal-card p-6 space-y-4">
                <div className="flex items-center justify-between border-b border-[#27272a] pb-3">
                  <div className="flex items-center space-x-2">
                    <Sword className="w-4 h-4 text-white" />
                    <h3 className="font-heading font-bold text-base text-white">EQUIPPED WEAPON</h3>
                  </div>
                  {detailData?.equipments?.weapon && (
                    <span className="bg-[#18181b] text-zinc-300 border border-[#27272a] text-xs font-tech font-bold px-2.5 py-0.5 rounded uppercase">
                      {detailData.equipments.weapon.quality || 6}★ WEAPON
                    </span>
                  )}
                </div>

                {detailData?.equipments?.weapon ? (
                  <div className="flex items-center space-x-4">
                    <div className="w-16 h-16 rounded-2xl bg-black border border-[#27272a] p-1 flex-shrink-0">
                      <img
                        src={getHuaxuImageUrl(detailData.equipments.weapon.icon)}
                        alt={detailData.equipments.weapon.name}
                        className="w-full h-full object-cover rounded-xl"
                      />
                    </div>
                    <div className="space-y-1">
                      <h4 className="font-heading font-bold text-base text-white">
                        {detailData.equipments.weapon.name}
                      </h4>
                      <p className="text-xs font-tech text-zinc-400">
                        Level: <strong className="text-white">{detailData.equipments.weapon.level}</strong> • Resonance Slots: <strong className="text-white">{detailData.equipments.weapon.resonances?.length || 0}</strong>
                      </p>
                    </div>
                  </div>
                ) : (
                  <p className="text-xs font-tech text-zinc-400 py-4">No weapon equipped.</p>
                )}
              </div>

              {/* Equipped CUB Summary Card */}
              <div className="minimal-card p-6 space-y-4">
                <div className="flex items-center justify-between border-b border-[#27272a] pb-3">
                  <div className="flex items-center space-x-2">
                    <Sparkles className="w-4 h-4 text-white" />
                    <h3 className="font-heading font-bold text-base text-white">CUB COMPANION</h3>
                  </div>
                  {detailData?.partner && (
                    <span className="bg-[#18181b] text-zinc-300 border border-[#27272a] text-xs font-tech font-bold px-2.5 py-0.5 rounded uppercase">
                      {detailData.partner.quality || 6}★ CUB
                    </span>
                  )}
                </div>

                {detailData?.partner ? (
                  <div className="flex items-center space-x-4">
                    <div className="w-16 h-16 rounded-2xl bg-black border border-[#27272a] p-1 flex-shrink-0">
                      <img
                        src={getHuaxuImageUrl(detailData.partner.icon)}
                        alt={detailData.partner.name}
                        className="w-full h-full object-cover rounded-xl"
                      />
                    </div>
                    <div className="space-y-1">
                      <h4 className="font-heading font-bold text-base text-white">
                        {detailData.partner.name}
                      </h4>
                      <p className="text-xs font-tech text-zinc-400">
                        Level: <strong className="text-white">{detailData.partner.level}</strong> • Star Rank: <strong className="text-white">{detailData.partner.star}★</strong>
                      </p>
                    </div>
                  </div>
                ) : (
                  <p className="text-xs font-tech text-zinc-400 py-4">No CUB companion equipped.</p>
                )}
              </div>

            </div>
          )}

          {/* TAB 2: SIGNATURE WEAPON DETAILED */}
          {activeTab === 'weapon' && (
            <div className="minimal-card p-6 sm:p-8 space-y-6">
              {detailData?.equipments?.weapon ? (
                <div className="space-y-6">
                  <div className="flex items-center space-x-4">
                    <div className="w-20 h-20 rounded-2xl bg-black border border-[#27272a] p-1 flex-shrink-0">
                      <img
                        src={getHuaxuImageUrl(detailData.equipments.weapon.icon)}
                        alt={detailData.equipments.weapon.name}
                        className="w-full h-full object-cover rounded-xl"
                      />
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <h3 className="font-heading font-bold text-xl text-white">
                          {detailData.equipments.weapon.name}
                        </h3>
                        <span className="bg-white text-black text-xs font-heading font-bold px-2.5 py-0.5 rounded-full uppercase">
                          {detailData.equipments.weapon.quality}★ WEAPON
                        </span>
                      </div>
                      <p className="text-xs font-tech text-zinc-400">
                        Level: <strong className="text-white">{detailData.equipments.weapon.level} / 45</strong>
                      </p>
                    </div>
                  </div>

                  {/* Weapon Resonance Slots */}
                  <div className="space-y-3 pt-4 border-t border-[#27272a]">
                    <h4 className="text-xs font-heading font-bold text-white uppercase tracking-wider">
                      WEAPON RESONANCE SLOTS ({detailData.equipments.weapon.resonances?.length || 0})
                    </h4>

                    {detailData.equipments.weapon.resonances && detailData.equipments.weapon.resonances.length > 0 ? (
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        {detailData.equipments.weapon.resonances.map((res, idx) => (
                          <div key={idx} className="bg-black p-4 rounded-xl border border-[#27272a] space-y-1">
                            <span className="text-[10px] font-tech text-zinc-400 uppercase font-bold block">
                              SLOT {idx + 1}
                            </span>
                            <h5 className="font-heading font-bold text-sm text-white">{res.name || `Resonance ${idx + 1}`}</h5>
                            {res.desc && <p className="text-xs font-sans text-zinc-400">{res.desc}</p>}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs font-tech text-zinc-400">No weapon resonances active.</p>
                    )}
                  </div>

                  {/* Weapon Harmonization Memory Slot */}
                  {detailData.equipments.weapon.harmonize && (
                    <div className="space-y-3 pt-4 border-t border-[#27272a]">
                      <h4 className="text-xs font-heading font-bold text-white uppercase tracking-wider">
                        WEAPON HARMONIZATION MEMORY
                      </h4>
                      <div className="bg-black p-4 rounded-xl border border-[#27272a] flex items-center space-x-3">
                        <div className="w-12 h-12 rounded-xl bg-[#121215] p-1 border border-[#27272a]">
                          <img
                            src={getHuaxuImageUrl(detailData.equipments.weapon.harmonize.icon)}
                            alt={detailData.equipments.weapon.harmonize.name}
                            className="w-full h-full object-cover rounded-lg"
                          />
                        </div>
                        <div>
                          <h5 className="font-heading font-bold text-sm text-white">
                            {detailData.equipments.weapon.harmonize.name}
                          </h5>
                          <p className="text-xs font-tech text-zinc-400">Harmonized Memory Skill</p>
                        </div>
                      </div>
                    </div>
                  )}

                </div>
              ) : (
                <p className="text-xs font-tech text-zinc-400">No weapon equipped.</p>
              )}
            </div>
          )}

          {/* TAB 3: EQUIPPED MEMORIES */}
          {activeTab === 'equipments' && (
            <div className="minimal-card p-6 sm:p-8 space-y-6">
              <h3 className="font-heading font-bold text-lg text-white uppercase tracking-wider">
                EQUIPPED MEMORIES ROSTER
              </h3>

              {detailData?.equipments?.suits && detailData.equipments.suits.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
                  {detailData.equipments.suits.map((suit, idx) => (
                    <div key={idx} className="bg-black p-3 rounded-2xl border border-[#27272a] text-center space-y-2">
                      <div className="w-16 h-16 mx-auto rounded-xl bg-[#121215] border border-[#27272a] p-1">
                        <img
                          src={getHuaxuImageUrl(suit.icon)}
                          alt={suit.name}
                          className="w-full h-full object-cover rounded-lg"
                        />
                      </div>
                      <span className="text-[10px] font-tech text-zinc-400 uppercase font-bold block">
                        SLOT {suit.position || idx + 1}
                      </span>
                      <h4 className="font-heading font-bold text-xs text-white truncate">{suit.name}</h4>
                      {suit.level && <p className="text-[10px] font-tech text-zinc-400">LVL {suit.level}</p>}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs font-tech text-zinc-400">No memory items equipped.</p>
              )}
            </div>
          )}

          {/* TAB 4: CUB COMPANION */}
          {activeTab === 'partner' && (
            <div className="minimal-card p-6 sm:p-8 space-y-6">
              {detailData?.partner ? (
                <div className="flex items-center space-x-5">
                  <div className="w-20 h-20 rounded-2xl bg-black border border-[#27272a] p-1 flex-shrink-0">
                    <img
                      src={getHuaxuImageUrl(detailData.partner.icon)}
                      alt={detailData.partner.name}
                      className="w-full h-full object-cover rounded-xl"
                    />
                  </div>
                  <div className="space-y-1">
                    <h3 className="font-heading font-bold text-xl text-white">
                      {detailData.partner.name}
                    </h3>
                    <p className="text-xs font-tech text-zinc-400">
                      Level: <strong className="text-white">{detailData.partner.level}</strong> • Star Rank: <strong className="text-white">{detailData.partner.star}★</strong>
                    </p>
                  </div>
                </div>
              ) : (
                <p className="text-xs font-tech text-zinc-400">No CUB companion equipped.</p>
              )}
            </div>
          )}

        </div>
      )}

    </div>
  );
};
