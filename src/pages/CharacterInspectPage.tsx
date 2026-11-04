import React, { useState, useEffect, useCallback } from 'react';
import { PlayerCharacter, CharacterDetailResponse, CharacterDetailInfo, MemoryData, CubSkill } from '@/types';
import { getCharacterDetail } from '@/services/apiService';
import { getHuaxuImageUrl, getConstructRankLabel } from '@/services/imageUtils';
import { BackButton } from '@/components/common/BackButton';
import { FadedPortrait } from '@/components/domain/FadedPortrait';
import { GameText } from '@/components/domain/GameText';
import { SafeImage } from '@/components/ui/safe-image';
import { AlertTriangle, ArrowRight, RotateCw } from 'lucide-react';
import { formatNumber } from '@/lib/format';
import { cn } from '@/lib/utils';

interface CharacterInspectPageProps {
  character: PlayerCharacter;
  server: string;
  uid: number;
  onBack: () => void;
  backLabel?: string;
}

type DetailData = CharacterDetailResponse['data'];
type TabId = 'overview' | 'weapon' | 'memories' | 'cub';

const TABS: { id: TabId; label: string }[] = [
  { id: 'overview', label: 'Overview' },
  { id: 'weapon', label: 'Weapon' },
  { id: 'memories', label: 'Memories' },
  { id: 'cub', label: 'CUB' },
];

const ELEMENT_DOT: Record<string, string> = {
  physical: 'bg-zinc-300',
  fire: 'bg-orange-400',
  ice: 'bg-sky-300',
  lightning: 'bg-violet-400',
  dark: 'bg-fuchsia-400',
  umbra: 'bg-fuchsia-400',
  quantum: 'bg-teal-300',
};

const capitalize = (s?: string) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : '');

/* ----------------------------------------------------------------------------
 * Small building blocks
 * ------------------------------------------------------------------------- */

const Panel: React.FC<{ className?: string; children: React.ReactNode }> = ({ className, children }) => (
  <div className={cn('rounded-2xl border border-[#27272a] bg-[#121215]', className)}>{children}</div>
);

const SectionLabel: React.FC<{ children: React.ReactNode; aside?: React.ReactNode }> = ({ children, aside }) => (
  <div className="flex items-baseline justify-between gap-3">
    <h3 className="text-sm font-heading font-semibold text-zinc-300">{children}</h3>
    {aside && <span className="text-xs text-zinc-500">{aside}</span>}
  </div>
);

const Stars: React.FC<{ count?: number }> = ({ count = 0 }) =>
  count > 0 ? (
    <span className="text-amber-400 text-xs tracking-[0.2em]" aria-label={`${count} stars`}>
      {'★'.repeat(count)}
    </span>
  ) : null;

const Chip: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <span className="inline-flex items-center gap-1.5 h-7 px-2.5 rounded-lg bg-black/40 border border-white/10 text-xs font-medium text-zinc-200 backdrop-blur-sm">
    {children}
  </span>
);

const HeroStat: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
  <div className="min-w-0 px-5 py-4 sm:px-6 bg-[#0f0f13]/90 backdrop-blur-sm">
    <div className="text-xs text-zinc-500">{label}</div>
    <div className="mt-0.5 text-lg sm:text-xl font-heading font-semibold text-white tabular-nums truncate">{children}</div>
  </div>
);

const SkeletonBlock: React.FC<{ className?: string }> = ({ className }) => (
  <div className={cn('rounded-2xl border border-[#27272a] bg-[#121215] animate-pulse', className)} />
);

/* ----------------------------------------------------------------------------
 * Tabs
 * ------------------------------------------------------------------------- */

const SummaryCard: React.FC<{ title: string; onOpen: () => void; children: React.ReactNode }> = ({ title, onOpen, children }) => (
  <button
    type="button"
    onClick={onOpen}
    className="group text-left rounded-2xl border border-[#27272a] bg-[#121215] p-5 space-y-4 hover:border-zinc-500 hover:bg-[#141418] active:scale-[0.99] transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/70"
  >
    <div className="flex items-center justify-between">
      <span className="text-sm font-heading font-semibold text-zinc-300">{title}</span>
      <ArrowRight className="w-4 h-4 text-zinc-600 group-hover:text-white group-hover:translate-x-0.5 transition-all" />
    </div>
    {children}
  </button>
);

const OverviewTab: React.FC<{ data: DetailData; info: Partial<CharacterDetailInfo>; onOpen: (tab: TabId) => void }> = ({
  data,
  info,
  onOpen,
}) => {
  const { weapon, cub, suits = [] } = data;
  const memories = data.memories ?? [];
  const equippedCount = memories.filter(Boolean).length;
  const cubSkills = (cub?.skills ?? []).filter((s) => s.equipped);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <SummaryCard title="Weapon" onOpen={() => onOpen('weapon')}>
          {weapon ? (
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 flex-shrink-0 rounded-xl bg-[#18181b] border border-[#27272a] overflow-hidden">
                <SafeImage src={getHuaxuImageUrl(weapon.icon)} alt={weapon.name} className="w-full h-full object-cover" />
              </div>
              <div className="min-w-0 space-y-0.5">
                <div className="font-heading font-semibold text-white truncate">{weapon.name}</div>
                <Stars count={weapon.quality} />
                <div className="text-xs text-zinc-500">
                  Lv {weapon.level} · {weapon.resonances?.length ?? 0} resonance
                  {(weapon.resonances?.length ?? 0) === 1 ? '' : 's'}
                </div>
              </div>
            </div>
          ) : (
            <p className="text-sm text-zinc-500">No weapon equipped.</p>
          )}
        </SummaryCard>

        <SummaryCard title="Memories" onOpen={() => onOpen('memories')}>
          <div className="grid grid-cols-6 gap-1.5">
            {Array.from({ length: 6 }, (_, i) => memories[i]).map((mem, i) => (
              <div
                key={i}
                className={cn(
                  'aspect-[3/4] rounded-md overflow-hidden bg-[#18181b]',
                  mem ? 'border border-[#27272a]' : 'border border-dashed border-[#27272a]'
                )}
              >
                {mem && (
                  <SafeImage src={getHuaxuImageUrl(mem.iconBig || mem.icon)} alt={mem.name} className="w-full h-full object-cover object-top" />
                )}
              </div>
            ))}
          </div>
          <div className="text-xs text-zinc-500">
            {suits.length > 0
              ? suits.map((s) => `${s.name} ${s.level ?? s.count ?? ''}pc`).join(' · ')
              : `${equippedCount} of 6 slots equipped`}
          </div>
        </SummaryCard>

        <SummaryCard title="CUB" onOpen={() => onOpen('cub')}>
          {cub ? (
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 flex-shrink-0 rounded-xl bg-[#18181b] border border-[#27272a] overflow-hidden">
                <SafeImage src={getHuaxuImageUrl(cub.icon)} alt={cub.name} className="w-full h-full object-cover" />
              </div>
              <div className="min-w-0 space-y-0.5">
                <div className="font-heading font-semibold text-white truncate">{cub.name}</div>
                <div className="text-xs text-zinc-500">
                  Lv {cub.level} · {cubSkills.length} skill{cubSkills.length === 1 ? '' : 's'} equipped
                </div>
              </div>
            </div>
          ) : (
            <p className="text-sm text-zinc-500">No CUB equipped.</p>
          )}
        </SummaryCard>
      </div>

      {info.specialties && info.specialties.length > 0 && (
        <Panel className="p-5 space-y-4">
          <SectionLabel>Specialties</SectionLabel>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-3">
            {info.specialties.map((sp) => (
              <div key={sp.name}>
                <div className="text-sm font-semibold text-white">{sp.name}</div>
                {sp.description && <p className="text-sm text-zinc-400">{sp.description}</p>}
              </div>
            ))}
          </div>
        </Panel>
      )}
    </div>
  );
};

const WeaponTab: React.FC<{ data: DetailData }> = ({ data }) => {
  const weapon = data.weapon;
  if (!weapon) {
    return <Panel className="py-14 text-center text-sm text-zinc-500">No weapon equipped on this construct.</Panel>;
  }

  const harmonization = weapon.harmonization || weapon.harmonize;
  const harmonizationSkill = weapon.harmonizationSkill || weapon.harmonizeSkill || harmonization?.harmonizationSkill;

  return (
    <div className="space-y-4">
      <Panel className="relative overflow-hidden [isolation:isolate]">
        <FadedPortrait
          src={getHuaxuImageUrl(weapon.iconBig || weapon.icon)}
          className="inset-y-0 right-0 w-1/2 -z-10"
          imgClassName="object-contain object-right opacity-20"
        />
        <div className="flex items-center gap-5 p-5 sm:p-6">
          <div className="w-20 h-20 flex-shrink-0 rounded-xl bg-[#18181b] border border-[#27272a] overflow-hidden">
            <SafeImage src={getHuaxuImageUrl(weapon.icon)} alt={weapon.name} className="w-full h-full object-cover" />
          </div>
          <div className="min-w-0 space-y-1">
            <h2 className="text-2xl font-heading font-bold text-white tracking-tight truncate">{weapon.name}</h2>
            <div className="flex items-center gap-3 text-sm text-zinc-400">
              <Stars count={weapon.quality} />
              <span>Lv {weapon.level}</span>
            </div>
          </div>
        </div>
        {weapon.weaponSkill && (
          <div className="border-t border-[#27272a] px-5 sm:px-6 py-4 space-y-1">
            <div className="text-sm font-semibold text-white">{weapon.weaponSkill.name}</div>
            <GameText text={weapon.weaponSkill.description} className="text-sm text-zinc-400 leading-relaxed" />
          </div>
        )}
      </Panel>

      {weapon.resonances && weapon.resonances.length > 0 && (
        <Panel className="p-5 sm:p-6 space-y-4">
          <SectionLabel aside={`${weapon.resonances.length} / 3`}>Resonance</SectionLabel>
          <ul className="divide-y divide-[#1f1f23]">
            {weapon.resonances.map((res, idx) => (
              <li key={`${res.slot}-${idx}`} className="flex items-center gap-4 py-3 first:pt-0 last:pb-0">
                <span className="w-5 text-xs font-tech font-bold text-zinc-600 tabular-nums">{res.slot ?? idx + 1}</span>
                <div className="w-10 h-10 flex-shrink-0 rounded-lg bg-[#18181b] p-1.5">
                  {res.icon && (
                    <SafeImage src={getHuaxuImageUrl(res.icon)} alt="" hideOnError className="w-full h-full object-contain" />
                  )}
                </div>
                <div className="min-w-0">
                  <div className="text-sm font-semibold text-white">{res.name}</div>
                  <div className="text-sm text-zinc-400">{res.description || res.desc}</div>
                </div>
              </li>
            ))}
          </ul>
        </Panel>
      )}

      {harmonization && (
        <Panel className="p-5 sm:p-6 space-y-4">
          <SectionLabel aside={weapon.harmonizationLevel ? `Level ${weapon.harmonizationLevel}` : undefined}>
            Harmonization
          </SectionLabel>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-[76px] flex-shrink-0 rounded-lg overflow-hidden bg-[#18181b] border border-[#27272a]">
                <SafeImage
                  src={getHuaxuImageUrl(harmonization.iconBig || harmonization.icon)}
                  alt={harmonization.name}
                  className="w-full h-full object-cover object-top"
                />
              </div>
              <div className="min-w-0 space-y-0.5">
                <div className="text-xs text-zinc-500">Memory</div>
                <div className="font-heading font-semibold text-white truncate">{harmonization.name}</div>
                <Stars count={harmonization.quality} />
              </div>
            </div>
            {harmonizationSkill && (
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 flex-shrink-0 rounded-lg bg-[#18181b] p-2">
                  {harmonizationSkill.icon && (
                    <SafeImage src={getHuaxuImageUrl(harmonizationSkill.icon)} alt="" hideOnError className="w-full h-full object-contain" />
                  )}
                </div>
                <div className="min-w-0 space-y-0.5">
                  <div className="text-xs text-zinc-500">Skill</div>
                  <div className="font-heading font-semibold text-white">{harmonizationSkill.name}</div>
                  <GameText text={harmonizationSkill.description} className="text-sm text-zinc-400" />
                </div>
              </div>
            )}
          </div>
        </Panel>
      )}
    </div>
  );
};

const MemorySlot: React.FC<{ slot: number; memory: MemoryData | null | undefined }> = ({ slot, memory }) => {
  if (!memory) {
    return (
      <div className="flex items-center gap-3 p-3 rounded-xl border border-dashed border-[#27272a] min-h-[112px]">
        <div className="w-16 h-[88px] flex-shrink-0 rounded-lg bg-[#0f0f13] grid place-items-center text-sm font-tech font-bold text-zinc-700">
          {slot}
        </div>
        <span className="text-sm text-zinc-600">Empty slot</span>
      </div>
    );
  }

  const resonances: NonNullable<MemoryData['resonances']> =
    memory.resonances ?? (memory.resonance ? [memory.resonance] : []);

  return (
    <div className="flex gap-3 p-3 rounded-xl border border-[#27272a] bg-[#0f0f13] hover:border-zinc-600 transition-colors">
      <div className="relative w-16 h-[88px] flex-shrink-0 rounded-lg overflow-hidden bg-[#18181b]">
        <SafeImage src={getHuaxuImageUrl(memory.iconBig || memory.icon)} alt={memory.name} className="w-full h-full object-cover object-top" />
        <span className="absolute top-0 left-0 px-1.5 rounded-br-md bg-black/75 text-[11px] font-tech font-bold text-white leading-5">
          {slot}
        </span>
      </div>
      <div className="min-w-0 flex-1 space-y-1.5">
        <div>
          <div className="font-heading font-semibold text-white truncate">{memory.name}</div>
          <div className="text-xs text-zinc-500">Lv {memory.level}</div>
        </div>
        <ul className="space-y-1">
          {resonances.map((res, i) => (
            <li key={i} className="flex items-center gap-2 text-xs text-zinc-300" title={res.name}>
              <span className="w-4 h-4 flex-shrink-0">
                {res.icon && (
                  <SafeImage src={getHuaxuImageUrl(res.icon)} alt="" hideOnError className="w-full h-full object-contain" />
                )}
              </span>
              <span className="truncate">{res.description || res.name}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

const MemoriesTab: React.FC<{ data: DetailData }> = ({ data }) => {
  const memories = data.memories ?? [];
  const suits = data.suits ?? [];
  const equipped = memories.filter(Boolean).length;

  return (
    <div className="space-y-4">
      <Panel className="p-5 sm:p-6 space-y-4">
        <SectionLabel aside={`${equipped} / 6 equipped`}>Memory slots</SectionLabel>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {Array.from({ length: 6 }, (_, i) => (
            <MemorySlot key={i} slot={i + 1} memory={memories[i]} />
          ))}
        </div>
      </Panel>

      {suits.length > 0 && (
        <Panel className="p-5 sm:p-6 space-y-4">
          <SectionLabel>Set bonuses</SectionLabel>
          <div className="space-y-5">
            {suits.map((suit) => (
              <div key={suit.name} className="flex gap-4">
                <div className="w-12 h-12 flex-shrink-0 rounded-lg overflow-hidden bg-[#18181b] border border-[#27272a]">
                  <SafeImage src={getHuaxuImageUrl(suit.icon || suit.iconBig)} alt="" className="w-full h-full object-cover" />
                </div>
                <div className="min-w-0 flex-1 space-y-2">
                  <div className="flex flex-wrap items-baseline gap-x-2">
                    <span className="font-heading font-semibold text-white">{suit.name}</span>
                    <span className="text-xs text-zinc-500">{suit.description}</span>
                  </div>
                  <ul className="space-y-1.5">
                    {(suit.skills ?? []).map((skill) => (
                      <li key={skill.level} className={cn('flex gap-3 text-sm', skill.active === false && 'opacity-40')}>
                        <span className="w-8 flex-shrink-0 pt-px text-xs font-tech font-bold text-amber-300/90 tabular-nums">
                          {skill.level}pc
                        </span>
                        <GameText text={skill.description} className="text-zinc-400 leading-relaxed" />
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </Panel>
      )}
    </div>
  );
};

const CubSkillRow: React.FC<{ skill: CubSkill }> = ({ skill }) => (
  <li className="flex gap-4 py-4 first:pt-0 last:pb-0">
    <div className="w-11 h-11 flex-shrink-0 rounded-lg bg-[#18181b] p-1">
      {skill.icon && <SafeImage src={getHuaxuImageUrl(skill.icon)} alt="" hideOnError className="w-full h-full object-contain" />}
    </div>
    <div className="min-w-0 flex-1 space-y-1">
      <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
        <span className="text-sm font-semibold text-white">{skill.name}</span>
        <span className="text-xs text-zinc-500">Lv {skill.level}</span>
        {skill.primary && (
          <span className="px-1.5 rounded bg-amber-400/10 border border-amber-400/25 text-[10px] font-semibold text-amber-300 leading-4">
            Active
          </span>
        )}
      </div>
      <GameText text={skill.description} className="text-sm text-zinc-400 leading-relaxed" />
    </div>
  </li>
);

const CubTab: React.FC<{ data: DetailData }> = ({ data }) => {
  const cub = data.cub;
  if (!cub) {
    return <Panel className="py-14 text-center text-sm text-zinc-500">No CUB equipped on this construct.</Panel>;
  }

  const skills = cub.skills ?? [];
  const equipped = skills.filter((s) => s.equipped).sort((a, b) => Number(!!b.primary) - Number(!!a.primary));
  const others = skills.filter((s) => !s.equipped);

  return (
    <div className="space-y-4">
      <Panel className="relative overflow-hidden [isolation:isolate]">
        <FadedPortrait src={getHuaxuImageUrl(cub.icon)} className="inset-y-0 right-0 w-1/2 -z-10" imgClassName="opacity-20" />
        <div className="flex items-center gap-5 p-5 sm:p-6">
          <div className="w-20 h-20 flex-shrink-0 rounded-xl bg-[#18181b] border border-[#27272a] overflow-hidden">
            <SafeImage src={getHuaxuImageUrl(cub.icon)} alt={cub.name} className="w-full h-full object-cover" />
          </div>
          <div className="min-w-0 space-y-1">
            <h2 className="text-2xl font-heading font-bold text-white tracking-tight truncate">{cub.name}</h2>
            <div className="text-sm text-zinc-400">Lv {cub.level}</div>
          </div>
        </div>
      </Panel>

      {equipped.length > 0 && (
        <Panel className="p-5 sm:p-6 space-y-4">
          <SectionLabel aside={`${equipped.length} equipped`}>Equipped skills</SectionLabel>
          <ul className="divide-y divide-[#1f1f23]">
            {equipped.map((skill) => (
              <CubSkillRow key={skill.id} skill={skill} />
            ))}
          </ul>
        </Panel>
      )}

      {others.length > 0 && (
        <details className="group rounded-2xl border border-[#27272a] bg-[#121215]">
          <summary className="flex items-center justify-between gap-3 px-5 sm:px-6 py-4 cursor-pointer list-none text-sm font-heading font-semibold text-zinc-400 hover:text-white transition-colors">
            Other skills ({others.length})
            <ArrowRight className="w-4 h-4 transition-transform group-open:rotate-90" />
          </summary>
          <ul className="divide-y divide-[#1f1f23] px-5 sm:px-6 pb-5 opacity-70">
            {others.map((skill) => (
              <CubSkillRow key={skill.id} skill={skill} />
            ))}
          </ul>
        </details>
      )}
    </div>
  );
};

/* ----------------------------------------------------------------------------
 * Page
 * ------------------------------------------------------------------------- */

export const CharacterInspectPage: React.FC<CharacterInspectPageProps> = ({
  character,
  server,
  uid,
  onBack,
  backLabel = 'BACK TO PROFILE',
}) => {
  const [detailData, setDetailData] = useState<DetailData | null>(null);
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const [activeTab, setActiveTab] = useState<TabId>('overview');

  const load = useCallback(() => {
    setStatus('loading');
    getCharacterDetail(server, uid, character.id)
      .then((res) => {
        // The service falls back to a bundled sample character when the API fails;
        // never show another construct's build as if it belonged to this player.
        if (res?.data?.character?.id === character.id) {
          setDetailData(res.data);
          setStatus('ready');
        } else {
          setDetailData(null);
          setStatus('error');
        }
      })
      .catch((err) => {
        console.error('Failed to load character details', err);
        setDetailData(null);
        setStatus('error');
      });
  }, [server, uid, character.id]);

  useEffect(() => {
    load();
  }, [load]);

  const info: Partial<CharacterDetailInfo> = detailData?.character || {
    id: character.id,
    characterName: character.characterName,
    frameName: character.frameName,
    frameType: character.frameType,
    frameCode: character.frameCode,
    level: character.level,
    quality: character.quality,
    stars: character.stars,
  };

  const rank = getConstructRankLabel(info.quality ?? character.quality, info.stars ?? character.stars ?? 0);
  const portraitSrc = getHuaxuImageUrl(info.icons?.normal || character.fashionIcon || character.normalIcon);
  const artSrc = info.image ? getHuaxuImageUrl(info.image) : portraitSrc;
  const elements = info.elements?.length ? info.elements : info.element ? [{ element: info.element, percentage: 100 }] : [];

  return (
    <div className="space-y-6 sm:space-y-8 animate-fadeIn pb-16 md:pb-0">
      <BackButton label={backLabel} onClick={onBack} />

      {/* Hero */}
      <section className="relative overflow-hidden rounded-2xl border border-[#27272a] bg-gradient-to-r from-[#17171d] via-[#121215] to-[#0d0d11] [isolation:isolate]">
        <FadedPortrait
          src={artSrc}
          eager
          className="inset-y-0 right-0 w-full md:w-[68%] -z-10"
          position="50% 25%"
          imgClassName={info.image ? 'opacity-50' : 'opacity-25'}
        />
        <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-[#0d0d11]/80 to-transparent -z-10 md:hidden" />

        <div className="flex items-center gap-5 sm:gap-6 p-6 sm:p-8 md:py-12">
          <div className="relative w-20 h-20 sm:w-24 sm:h-24 flex-shrink-0 rounded-2xl overflow-hidden border border-white/10 bg-[#18181b] shadow-2xl shadow-black/50">
            <SafeImage src={portraitSrc} alt={info.characterName} loading="eager" className="w-full h-full object-cover" />
          </div>

          <div className="min-w-0 space-y-2.5">
            <div className="space-y-0.5">
              <p className="text-sm text-zinc-400">
                {info.characterName}
                {info.frameCode && <span className="text-zinc-600"> · {info.frameCode}</span>}
              </p>
              <h1 className="text-3xl sm:text-5xl font-heading font-bold text-white tracking-tight leading-none">
                {info.frameName}
              </h1>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Chip>{rank.label}</Chip>
              {(info.class || info.frameType) && (
                <Chip>
                  {info.classIcon && (
                    <SafeImage src={getHuaxuImageUrl(info.classIcon)} alt="" hideOnError className="w-4 h-4 object-contain" />
                  )}
                  {capitalize(info.class || info.frameType)}
                </Chip>
              )}
              {elements.map((el) => (
                <Chip key={el.element}>
                  <span className={cn('w-2 h-2 rounded-full', ELEMENT_DOT[el.element.toLowerCase()] ?? 'bg-zinc-400')} />
                  {capitalize(el.element)}
                  {elements.length > 1 && <span className="text-zinc-500 tabular-nums">{el.percentage}%</span>}
                </Chip>
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-px border-t border-[#27272a]/80 bg-[#27272a]/80">
          <HeroStat label="Level">{info.level ?? character.level}</HeroStat>
          <HeroStat label="Battle power">{info.bp ? formatNumber(Math.round(info.bp)) : '—'}</HeroStat>
          <HeroStat label="Weapon type">{info.weaponGroup?.name ?? '—'}</HeroStat>
          <HeroStat label="Grade">{info.gradeName ?? '—'}</HeroStat>
        </div>
      </section>

      {/* Tabs */}
      <div className="border-b border-[#27272a] overflow-x-auto no-scrollbar" role="tablist" aria-label="Build sections">
        <div className="flex gap-6 min-w-max">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={activeTab === tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                'relative pb-3 text-sm font-heading font-semibold transition-colors',
                activeTab === tab.id ? 'text-white' : 'text-zinc-500 hover:text-zinc-200'
              )}
            >
              {tab.label}
              <span
                className={cn(
                  'absolute inset-x-0 -bottom-px h-0.5 rounded-full bg-amber-400 transition-opacity',
                  activeTab === tab.id ? 'opacity-100' : 'opacity-0'
                )}
              />
            </button>
          ))}
        </div>
      </div>

      {status === 'loading' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4" aria-busy="true" aria-label="Loading build">
          <SkeletonBlock className="h-40" />
          <SkeletonBlock className="h-40" />
          <SkeletonBlock className="h-40" />
        </div>
      )}

      {status === 'error' && (
        <Panel className="p-6 flex flex-col sm:flex-row sm:items-center gap-4">
          <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0" />
          <div className="flex-1 space-y-0.5">
            <p className="text-sm font-semibold text-white">Build details could not be loaded.</p>
            <p className="text-sm text-zinc-400">
              The Huaxu API did not return this construct's weapon, memories, or CUB. Try again in a moment.
            </p>
          </div>
          <button
            type="button"
            onClick={load}
            className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-white text-black text-sm font-semibold hover:bg-zinc-200 active:scale-[0.98] transition-all"
          >
            <RotateCw className="w-4 h-4" />
            Try again
          </button>
        </Panel>
      )}

      {status === 'ready' && detailData && (
        <div key={activeTab} className="animate-fadeIn" role="tabpanel">
          {activeTab === 'overview' && <OverviewTab data={detailData} info={info} onOpen={setActiveTab} />}
          {activeTab === 'weapon' && <WeaponTab data={detailData} />}
          {activeTab === 'memories' && <MemoriesTab data={detailData} />}
          {activeTab === 'cub' && <CubTab data={detailData} />}
        </div>
      )}
    </div>
  );
};
