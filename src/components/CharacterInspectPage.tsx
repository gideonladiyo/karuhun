import React, { useState, useEffect } from 'react';
import { PlayerCharacter, CharacterDetailResponse, CharacterDetailInfo } from '../types';
import { getCharacterDetail } from '../services/apiService';
import { getHuaxuImageUrl, getConstructRankLabel } from '../services/imageUtils';
import { ArrowLeft, Shield, Sword, Award, Sparkles, CheckCircle2, ChevronRight, AlertCircle, Info, Zap } from 'lucide-react';

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
  const [detailData, setDetailData] = useState<CharacterDetailResponse['data'] | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'weapon' | 'equipments' | 'partner'>('overview');

  useEffect(() => {
    setLoading(true);
    getCharacterDetail(server, uid, character.id)
      .then((res) => {
        if (res && res.data) {
          setDetailData(res.data);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to load character details', err);
        setLoading(false);
      });
  }, [server, uid, character.id]);

  const charInfo: Partial<CharacterDetailInfo> = detailData?.character || {
    id: character.id,
    characterName: character.characterName || 'Construct',
    frameName: character.frameName || 'Frame',
    frameCode: character.frameCode || 'BPN',
    frameType: character.frameType || 'Omniframe',
    level: character.level || 80,
    quality: character.quality || 6,
    awakeningLevel: character.awakeningLevel || 3,
    icons: {
      normal: character.normalIcon || character.fashionIcon || '',
      ultima: '',
      round: ''
    }
  };

  const rankBadge = getConstructRankLabel(charInfo.quality || character.quality || 6, charInfo.stars || character.stars || 0);

  const portraitSrc = getHuaxuImageUrl(
    charInfo.icons?.normal ||
    charInfo.image ||
    character.fashionIcon ||
    character.normalIcon
  );

  const weapon = detailData?.weapon;
  const cub = detailData?.cub;
  const rawMemories = detailData?.memories || [];
  const suits = detailData?.suits || [];

  // Default sample memory templates with icon assets and descriptions
  const defaultMemoryTemplates = [
    {
      name: 'Gloria',
      level: 45,
      quality: 6,
      icon: 'image/icontools/e3globiya1',
      slot1: { desc: 'HP +50, ATK +10', icon: 'image/iconskill/iconskillequipshuxinghp' },
      slot2: { desc: 'HP +50, ATK +10', icon: 'image/iconskill/iconskillequipshuxinghp' }
    },
    {
      name: 'Gloria',
      level: 45,
      quality: 6,
      icon: 'image/icontools/e3globiya2',
      slot1: { desc: 'ATK +10, CRIT +10', icon: 'image/iconskill/iconskillequipshuxingjingzhungongji' },
      slot2: { desc: 'ATK +10, CRIT +10', icon: 'image/iconskill/iconskillequipshuxingjingzhungongji' }
    },
    {
      name: 'Chen Jiyuan',
      level: 45,
      quality: 6,
      icon: 'image/icontools/e3chenjiyuan3',
      slot1: { desc: 'HP +75, ATK +15', icon: 'image/iconskill/iconskillequipshuxinghp' },
      slot2: { desc: 'QTE Level +1', icon: 'image/iconskill/iconskillequipqte' }
    },
    {
      name: 'Chen Jiyuan',
      level: 45,
      quality: 6,
      icon: 'image/icontools/e3chenjiyuan4',
      slot1: { desc: 'HP +75, ATK +15', icon: 'image/iconskill/iconskillequipshuxinghp' },
      slot2: { desc: 'QTE Level +1', icon: 'image/iconskill/iconskillequipqte' }
    },
    {
      name: 'Cottie',
      level: 45,
      quality: 6,
      icon: 'image/icontools/e3kedi5',
      slot1: { desc: 'ATK +15, CRIT +15', icon: 'image/iconskill/iconskillequipshuxingjingzhungongji' },
      slot2: { desc: 'QTE Level +1', icon: 'image/iconskill/iconskillequipqte' }
    },
    {
      name: 'Cottie',
      level: 45,
      quality: 6,
      icon: 'image/icontools/e3kedi6',
      slot1: { desc: 'ATK +15, CRIT +15', icon: 'image/iconskill/iconskillequipshuxingjingzhungongji' },
      slot2: { desc: 'QTE Level +1', icon: 'image/iconskill/iconskillequipqte' }
    }
  ];

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
          INSPECTING: <strong className="text-white font-bold">{charInfo.characterName}</strong> ({charInfo.frameName})
        </span>
      </div>

      {/* Main Construct Hero Card */}
      <div className="minimal-card p-6 sm:p-8 space-y-6 relative overflow-hidden">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          
          <div className="flex items-center space-x-5">
            {/* Construct Portrait */}
            <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-3xl bg-black border border-[#27272a] p-1 flex-shrink-0 overflow-hidden shadow-xl">
              <img
                src={portraitSrc}
                alt={charInfo.characterName}
                className="w-full h-full object-cover rounded-2xl"
              />
            </div>

            {/* Construct Information */}
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl sm:text-3xl font-heading font-bold text-white tracking-tight">
                  {charInfo.characterName}
                </h1>
                <span className={`text-xs font-heading font-bold px-3 py-0.5 rounded-full uppercase ${rankBadge.classNames}`}>
                  {charInfo.gradeName || rankBadge.label}
                </span>
                <span className="bg-[#18181b] text-zinc-300 border border-[#27272a] text-xs font-tech font-bold px-2.5 py-0.5 rounded-md uppercase">
                  {charInfo.frameCode || 'BPN'}
                </span>
              </div>

              <p className="text-sm font-heading text-zinc-300">
                Frame: <span className="text-white font-bold">{charInfo.frameName}</span>
              </p>

              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs font-tech text-zinc-400 pt-1">
                <span>LVL <strong className="text-white">{charInfo.level || 80}</strong></span>
                <span>•</span>
                <span>Class: <strong className="text-white uppercase">{charInfo.class || charInfo.frameType || 'Omniframe'}</strong></span>
                {charInfo.element && (
                  <>
                    <span>•</span>
                    <span>Element: <strong className="text-white uppercase">{charInfo.element}</strong></span>
                  </>
                )}
                {charInfo.bp && (
                  <>
                    <span>•</span>
                    <span>BP: <strong className="text-white">{Math.round(charInfo.bp).toLocaleString()}</strong></span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Construct Stats Pills */}
          <div className="grid grid-cols-2 gap-3 w-full md:w-auto">
            <div className="bg-black/60 border border-[#27272a] rounded-2xl p-4 text-center min-w-[120px]">
              <span className="text-[10px] font-tech uppercase text-zinc-400 block font-bold">LEVEL</span>
              <span className="font-heading font-bold text-xl text-white">
                {charInfo.level || 80} / 80
              </span>
            </div>

            <div className="bg-black/60 border border-[#27272a] rounded-2xl p-4 text-center min-w-[120px]">
              <span className="text-[10px] font-tech uppercase text-zinc-400 block font-bold">AWAKENING</span>
              <span className="font-heading font-bold text-xl text-white">
                LVL {charInfo.awakeningLevel || 3}
              </span>
            </div>
          </div>

        </div>

        {/* Sub-Navigation Tabs */}
        <div className="flex items-center space-x-2 border-t border-[#27272a] pt-4 overflow-x-auto">
          {[
            { id: 'overview', label: 'OVERVIEW' },
            { id: 'weapon', label: 'SIGNATURE WEAPON' },
            { id: 'equipments', label: 'MEMORIES (6 SLOTS)' },
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
                  {weapon && (
                    <span className="bg-[#18181b] text-zinc-300 border border-[#27272a] text-xs font-tech font-bold px-2.5 py-0.5 rounded uppercase">
                      {weapon.quality}★ WEAPON
                    </span>
                  )}
                </div>

                {weapon ? (
                  <div className="flex items-center space-x-4">
                    <div className="w-16 h-16 rounded-2xl bg-black border border-[#27272a] p-1 flex-shrink-0">
                      <img
                        src={getHuaxuImageUrl(weapon.icon)}
                        alt={weapon.name}
                        className="w-full h-full object-cover rounded-xl"
                      />
                    </div>
                    <div className="space-y-1">
                      <h4 className="font-heading font-bold text-base text-white">
                        {weapon.name}
                      </h4>
                      <p className="text-xs font-tech text-zinc-400">
                        Level: <strong className="text-white">{weapon.level}</strong> • Resonances: <strong className="text-white">{weapon.resonances?.length || 0}</strong>
                      </p>
                      {weapon.weaponSkill && (
                        <p className="text-xs font-sans text-zinc-300 pt-1 italic">
                          "{weapon.weaponSkill.name} - {weapon.weaponSkill.description}"
                        </p>
                      )}
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
                  {cub && (
                    <span className="bg-[#18181b] text-zinc-300 border border-[#27272a] text-xs font-tech font-bold px-2.5 py-0.5 rounded uppercase">
                      {cub.quality || 6}★ CUB
                    </span>
                  )}
                </div>

                {cub ? (
                  <div className="flex items-center space-x-4">
                    <div className="w-16 h-16 rounded-2xl bg-black border border-[#27272a] p-1 flex-shrink-0">
                      <img
                        src={getHuaxuImageUrl(cub.icon)}
                        alt={cub.name}
                        className="w-full h-full object-cover rounded-xl"
                      />
                    </div>
                    <div className="space-y-1">
                      <h4 className="font-heading font-bold text-base text-white">
                        {cub.name}
                      </h4>
                      <p className="text-xs font-tech text-zinc-400">
                        Level: <strong className="text-white">{cub.level || 80}</strong> • Star Rank: <strong className="text-white">{cub.star || 6}★</strong>
                      </p>
                    </div>
                  </div>
                ) : (
                  <p className="text-xs font-tech text-zinc-400 py-4">No CUB companion equipped.</p>
                )}
              </div>

            </div>
          )}

          {/* TAB 2: SIGNATURE WEAPON (EXACT REFERENCE IMAGE 1 LAYOUT WITH ASSET ICONS) */}
          {activeTab === 'weapon' && (
            <div className="minimal-card p-6 sm:p-8 space-y-6">
              {weapon ? (
                <div className="space-y-6">
                  {/* Top Weapon Header & Portrait Card */}
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 border-b border-[#27272a] pb-6">
                    <div className="flex items-center space-x-4">
                      <div className="w-20 h-20 rounded-2xl bg-black border-2 border-amber-500/60 p-1 flex-shrink-0 shadow-lg">
                        <img
                          src={getHuaxuImageUrl(weapon.icon)}
                          alt={weapon.name}
                          className="w-full h-full object-cover rounded-xl"
                        />
                      </div>
                      <div className="space-y-1">
                        <h3 className="font-heading font-bold text-2xl text-white tracking-tight">
                          {weapon.name}
                        </h3>
                        <div className="flex items-center space-x-1 text-amber-400 text-sm font-bold">
                          {'★'.repeat(weapon.quality || 6)}
                        </div>
                        <p className="text-xs font-tech text-zinc-400 pt-0.5">
                          Level <strong className="text-white">{weapon.level}</strong>
                        </p>
                      </div>
                    </div>

                    {/* Character Portrait Right Box */}
                    <div className="w-20 h-28 sm:w-24 sm:h-32 rounded-xl bg-black border border-[#27272a] overflow-hidden shadow-md flex-shrink-0">
                      <img
                        src={portraitSrc}
                        alt={charInfo.characterName}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>

                  {/* Passive Skill Section */}
                  {weapon.weaponSkill && (
                    <div className="space-y-1.5 bg-[#09090b] p-4 sm:p-5 rounded-2xl border border-[#27272a]">
                      <h4 className="font-heading font-bold text-base text-white">
                        {weapon.weaponSkill.name}
                      </h4>
                      <p className="text-xs font-sans text-zinc-300 leading-relaxed">
                        {weapon.weaponSkill.description}
                      </p>
                    </div>
                  )}

                  {/* Weapon Resonances Vertical List with Asset Icons */}
                  {weapon.resonances && weapon.resonances.length > 0 && (
                    <div className="space-y-3 pt-2">
                      <h4 className="font-heading font-bold text-xs font-tech text-zinc-400 uppercase tracking-wider">
                        WEAPON RESONANCE SKILLS
                      </h4>
                      <div className="space-y-3">
                        {weapon.resonances.map((res: any, idx: number) => {
                          const iconUrl = res.icon ? getHuaxuImageUrl(res.icon) : '';

                          return (
                            <div key={idx} className="bg-[#09090b] p-4 rounded-2xl border border-[#27272a] flex items-center space-x-4">
                              {/* Resonance Asset Icon */}
                              <div className="w-12 h-12 rounded-xl bg-black border border-[#27272a] p-1.5 flex-shrink-0 flex items-center justify-center overflow-hidden">
                                {iconUrl ? (
                                  <img
                                    src={iconUrl}
                                    alt={res.name}
                                    className="w-full h-full object-contain filter contrast-125"
                                    onError={(e) => {
                                      (e.target as HTMLElement).style.display = 'none';
                                    }}
                                  />
                                ) : (
                                  <Sword className="w-5 h-5 text-white" />
                                )}
                              </div>

                              <div className="space-y-0.5">
                                <h5 className="font-heading font-bold text-sm text-white">
                                  {res.name}
                                </h5>
                                <p className="text-xs font-sans text-zinc-300 leading-relaxed">
                                  {res.description || res.desc || 'Increases weapon stats and damage performance.'}
                                </p>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-12 text-zinc-400 font-tech text-sm">
                  No weapon equipped on this construct.
                </div>
              )}
            </div>
          )}

          {/* TAB 3: MEMORIES (EXACT REFERENCE IMAGE 3 LAYOUT: 1 FRAME CONTAINER, 2 ROWS x 3 COLUMNS, ICON + DESCRIPTION FOR SLOT 1 AND SLOT 2) */}
          {activeTab === 'equipments' && (
            <div className="minimal-card p-6 sm:p-8 space-y-6">
              
              {/* Single Frame Memories Container Header */}
              <div className="space-y-4">
                <h3 className="font-heading font-bold text-lg text-white uppercase tracking-wider">
                  MEMORIES (6 SLOTS)
                </h3>

                {/* 2 ROWS x 3 COLUMNS GRID CONTAINER */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 border border-amber-600/40 rounded-3xl p-4 sm:p-5 bg-black/60 shadow-2xl">
                  {[1, 2, 3, 4, 5, 6].map((slotNum) => {
                    const mem = rawMemories[slotNum - 1];
                    const template = defaultMemoryTemplates[slotNum - 1];

                    const memName = mem?.name || template.name;
                    const memLevel = mem?.level || template.level;
                    const memIcon = mem?.icon ? getHuaxuImageUrl(mem.icon) : getHuaxuImageUrl(template.icon);

                    // Slot 1 & Slot 2 Resonance Details (Icon + Description)
                    const slot1Desc = (mem as any)?.resonance?.description || (mem as any)?.resonances?.[0]?.description || (mem as any)?.resonances?.[0]?.name || template.slot1.desc;
                    const slot1Icon = (mem as any)?.resonance?.icon || (mem as any)?.resonances?.[0]?.icon || template.slot1.icon;
                    const slot1IconUrl = slot1Icon ? getHuaxuImageUrl(slot1Icon) : '';

                    const slot2Desc = (mem as any)?.resonance?.description || (mem as any)?.resonances?.[1]?.description || (mem as any)?.resonances?.[1]?.name || template.slot2.desc;
                    const slot2Icon = (mem as any)?.resonance?.icon || (mem as any)?.resonances?.[1]?.icon || template.slot2.icon;
                    const slot2IconUrl = slot2Icon ? getHuaxuImageUrl(slot2Icon) : '';

                    return (
                      <div
                        key={slotNum}
                        className="bg-[#09090b] p-3.5 rounded-2xl border border-amber-600/50 hover:border-amber-400 transition-all flex items-start space-x-3 shadow-md"
                      >
                        {/* Memory Rectangular Image Container with Slot Badge */}
                        <div className="relative w-16 h-24 rounded-xl bg-black border border-[#27272a] overflow-hidden flex-shrink-0">
                          {/* Slot Number Badge Top-Left */}
                          <div className="absolute top-0 left-0 bg-white/90 text-black font-heading font-black text-[11px] px-2 py-0.5 rounded-br-lg z-10">
                            {slotNum}
                          </div>

                          <img
                            src={memIcon}
                            alt={memName}
                            className="w-full h-full object-cover"
                          />

                          {/* 6-Star Rating Bottom */}
                          <div className="absolute bottom-0 inset-x-0 bg-black/80 text-amber-400 text-[8px] font-bold text-center py-0.5 tracking-tighter">
                            ★★★★★★
                          </div>
                        </div>

                        {/* Memory Info & Slot 1 / Slot 2 Resonance Details (Icon Asset + Description) */}
                        <div className="space-y-1.5 flex-1 min-w-0">
                          <div>
                            <h4 className="font-heading font-bold text-xs sm:text-sm text-white truncate">
                              {memName}
                            </h4>
                            <p className="text-[11px] font-tech text-zinc-400">
                              Level <strong className="text-white">{memLevel}</strong>
                            </p>
                          </div>

                          {/* Slot 1 & Slot 2 Resonance Entries (Icon Asset + Description) */}
                          <div className="space-y-1.5 pt-1 border-t border-[#27272a]">
                            {/* Slot 1 */}
                            <div className="flex items-center space-x-2 text-[11px] font-sans text-amber-300">
                              <div className="w-5 h-5 rounded-md bg-black border border-amber-800/80 p-0.5 flex-shrink-0 flex items-center justify-center overflow-hidden">
                                {slot1IconUrl ? (
                                  <img src={slot1IconUrl} alt="Slot 1" className="w-full h-full object-contain" onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }} />
                                ) : (
                                  <span className="text-[9px] font-bold text-amber-300">1</span>
                                )}
                              </div>
                              <span className="truncate leading-tight">{slot1Desc}</span>
                            </div>

                            {/* Slot 2 */}
                            <div className="flex items-center space-x-2 text-[11px] font-sans text-amber-300">
                              <div className="w-5 h-5 rounded-md bg-black border border-amber-800/80 p-0.5 flex-shrink-0 flex items-center justify-center overflow-hidden">
                                {slot2IconUrl ? (
                                  <img src={slot2IconUrl} alt="Slot 2" className="w-full h-full object-contain" onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }} />
                                ) : (
                                  <span className="text-[9px] font-bold text-amber-300">2</span>
                                )}
                              </div>
                              <span className="truncate leading-tight">{slot2Desc}</span>
                            </div>
                          </div>

                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

            </div>
          )}

          {/* TAB 4: CUB COMPANION (EXACT REFERENCE IMAGE 2 LAYOUT WITH ASSET ICONS) */}
          {activeTab === 'partner' && (
            <div className="minimal-card p-6 sm:p-8 space-y-6">
              {cub ? (
                <div className="space-y-6">
                  {/* CUB Header Card */}
                  <div className="flex items-center space-x-5 border-b border-[#27272a] pb-6">
                    <div className="w-20 h-20 rounded-2xl bg-black border border-[#27272a] p-1 flex-shrink-0 overflow-hidden">
                      <img
                        src={getHuaxuImageUrl(cub.icon)}
                        alt={cub.name}
                        className="w-full h-full object-cover rounded-xl"
                      />
                    </div>
                    <div className="space-y-1">
                      <h3 className="font-heading font-bold text-2xl text-white tracking-tight">
                        {cub.name}
                      </h3>
                      <div className="flex items-center space-x-2 text-xs font-tech">
                        <span className="text-zinc-400">Rank <strong className="text-sky-400 font-bold">{
                          (cub.star || cub.quality) === 6 ? 'SSS+' :
                          (cub.star || cub.quality) === 5 ? 'SSS' :
                          (cub.star || cub.quality) === 4 ? 'SS' :
                          (cub.star || cub.quality) === 3 ? 'S' : 'SS'
                        }</strong></span>
                        <span>•</span>
                        <span className="text-zinc-400">Level: <strong className="text-white font-bold">{cub.level || 30}</strong></span>
                      </div>
                    </div>
                  </div>

                  {/* CUB Active & Passive Skills Vertical List with Asset Icons */}
                  <div className="space-y-3">
                    <h4 className="font-heading font-bold text-xs font-tech text-zinc-400 uppercase tracking-wider">
                      CUB COMPANION SKILLS
                    </h4>
                    <div className="space-y-2.5">
                      {(cub.skills && cub.skills.length > 0 ? cub.skills : [
                        { name: 'Abyssal Breath: Nihil', level: 5, icon: 'image/iconskill/r2jetavies1' },
                        { name: 'Dominating Calamity', level: 5, icon: 'image/iconskill/r2jetaviess1' },
                        { name: 'Crimson Ember', level: 5, icon: 'image/iconskill/r2jetaviesss1' },
                        { name: 'Dark Nihility', level: 5, icon: 'image/iconskill/jiefang1' },
                        { name: 'Retribution of Eclipse', level: 5, icon: 'image/iconskill/iconcharacter3' }
                      ]).map((skill: any, idx: number) => {
                        const skillIconUrl = skill.icon ? getHuaxuImageUrl(skill.icon) : '';

                        return (
                          <div key={idx} className="bg-[#09090b] p-3.5 rounded-2xl border border-[#27272a] flex items-center space-x-4">
                            {/* CUB Skill Icon Asset */}
                            <div className="w-12 h-12 rounded-xl bg-black border border-[#27272a] p-1.5 flex-shrink-0 flex items-center justify-center overflow-hidden">
                              {skillIconUrl ? (
                                <img
                                  src={skillIconUrl}
                                  alt={skill.name}
                                  className="w-full h-full object-contain filter contrast-125"
                                  onError={(e) => {
                                    (e.target as HTMLElement).style.display = 'none';
                                  }}
                                />
                              ) : (
                                <Sparkles className="w-5 h-5 text-white" />
                              )}
                            </div>

                            <div className="space-y-0.5">
                              <h5 className="font-heading font-bold text-sm text-white">
                                {skill.name}
                              </h5>
                              <p className="text-xs font-tech text-zinc-400">
                                Level <strong className="text-white">{skill.level || 5}</strong>
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12 text-zinc-400 font-tech text-sm">
                  No CUB companion equipped on this construct.
                </div>
              )}
            </div>
          )}

        </div>
      )}

    </div>
  );
};
