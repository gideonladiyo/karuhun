import React, { useState, useEffect, useMemo } from 'react';
import { PlayerProfileData, PlayerCharacter } from '@/types';
import { getPlayerProfile } from '@/services/apiService';
import { getHuaxuImageUrl, getNameplateUrl, getConstructRankLabel } from '@/services/imageUtils';
import { BackButton } from '@/components/common/BackButton';
import { Search, Shield, X } from 'lucide-react';
import { NotFound } from '@/components/ui/not-found-2';
import { PlayerAvatar } from '@/components/domain/PlayerAvatar';
import { FadedPortrait } from '@/components/domain/FadedPortrait';
import { SafeImage } from '@/components/ui/safe-image';
import { formatNumber } from '@/lib/format';
import { cn } from '@/lib/utils';

interface PlayerProfilePageProps {
  uid: number;
  server: string;
  onBack: () => void;
  backLabel?: string;
  onSelectCharacter: (character: PlayerCharacter) => void;
}

type SortKey = 'default' | 'rank' | 'level' | 'name';

const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: 'default', label: 'Newest' },
  { value: 'rank', label: 'Rank' },
  { value: 'level', label: 'Level' },
  { value: 'name', label: 'Name' },
];

const rankScore = (c: PlayerCharacter) => (c.quality || 0) * 10 + (c.stars || 0);

const SORTERS: Record<SortKey, ((a: PlayerCharacter, b: PlayerCharacter) => number) | null> = {
  default: null,
  rank: (a, b) => rankScore(b) - rankScore(a) || b.level - a.level,
  level: (a, b) => b.level - a.level || rankScore(b) - rankScore(a),
  name: (a, b) => a.characterName.localeCompare(b.characterName),
};

const HeroStat: React.FC<{ label: string; value: React.ReactNode }> = ({ label, value }) => (
  <div className="min-w-0 px-5 py-4 sm:px-6 bg-[#0f0f13]/90 backdrop-blur-sm">
    <div className="text-xs text-zinc-500">{label}</div>
    <div className="mt-0.5 text-xl sm:text-2xl font-heading font-semibold text-white tabular-nums truncate">{value}</div>
  </div>
);

const ProfileSkeleton: React.FC = () => (
  <div className="space-y-8" aria-busy="true" aria-label="Loading profile">
    <div className="rounded-2xl border border-[#27272a] bg-[#121215] overflow-hidden">
      <div className="flex items-center gap-5 p-6 sm:p-8">
        <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-[#18181b] animate-pulse" />
        <div className="flex-1 space-y-3">
          <div className="h-7 w-48 rounded-md bg-[#18181b] animate-pulse" />
          <div className="h-3.5 w-72 max-w-full rounded bg-[#18181b] animate-pulse" />
          <div className="h-3.5 w-40 rounded bg-[#18181b] animate-pulse" />
        </div>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-px border-t border-[#27272a] bg-[#27272a]">
        {Array.from({ length: 4 }, (_, i) => (
          <div key={i} className="px-6 py-4 space-y-2 bg-[#121215]">
            <div className="h-3 w-16 rounded bg-[#18181b] animate-pulse" />
            <div className="h-6 w-20 rounded bg-[#18181b] animate-pulse" />
          </div>
        ))}
      </div>
    </div>
    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3">
      {Array.from({ length: 16 }, (_, i) => (
        <div key={i} className="space-y-2">
          <div className="aspect-square rounded-xl bg-[#121215] border border-[#27272a] animate-pulse" />
          <div className="h-3 w-3/4 rounded bg-[#18181b] animate-pulse" />
        </div>
      ))}
    </div>
  </div>
);

const ConstructTile: React.FC<{ char: PlayerCharacter; onSelect: () => void }> = ({ char, onSelect }) => {
  const rank = getConstructRankLabel(char.quality, char.stars || 0);
  return (
    <button
      type="button"
      onClick={onSelect}
      className="group text-left rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/70 focus-visible:ring-offset-2 focus-visible:ring-offset-[#09090b] active:scale-[0.98] transition-transform"
    >
      <div className="relative aspect-square rounded-xl overflow-hidden bg-[#18181b] border border-[#27272a] group-hover:border-zinc-400 transition-colors">
        <SafeImage
          src={getHuaxuImageUrl(char.fashionIcon || char.normalIcon)}
          alt={char.characterName}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
        <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/80 to-transparent" />
        <span className="absolute bottom-1 left-1 px-1.5 rounded bg-black/75 text-[11px] font-semibold text-white leading-5">
          {rank.label}
        </span>
        <span className="absolute bottom-1.5 right-1.5 text-[10px] font-tech font-semibold text-zinc-200 tabular-nums">
          Lv {char.level}
        </span>
      </div>
      <div className="pt-2 px-0.5">
        <div className="text-xs font-heading font-semibold text-white truncate group-hover:text-amber-300 transition-colors">
          {char.characterName}
        </div>
        <div className="text-[11px] text-zinc-500 truncate">{char.frameName}</div>
      </div>
    </button>
  );
};

export const PlayerProfilePage: React.FC<PlayerProfilePageProps> = ({
  uid,
  server,
  onBack,
  backLabel = 'BACK TO GUILD',
  onSelectCharacter,
}) => {
  const [profileData, setProfileData] = useState<PlayerProfileData | null>(null);
  const [errorInfo, setErrorInfo] = useState<{ code: string | number; message: string } | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [sortBy, setSortBy] = useState<SortKey>('default');

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

  const owned = useMemo(
    () => (profileData?.characters ?? []).filter((c) => c.acquired !== false && c.visible !== false),
    [profileData]
  );

  const visibleCharacters = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    const matches = query
      ? owned.filter((c) =>
          [c.characterName, c.frameName, c.frameCode].some((v) => v?.toLowerCase().includes(query))
        )
      : owned;
    const sorter = SORTERS[sortBy];
    return sorter ? [...matches].sort(sorter) : matches;
  }, [owned, searchTerm, sortBy]);

  if (loading) {
    return (
      <div className="space-y-6 sm:space-y-8 animate-fadeIn pb-16 md:pb-0">
        <BackButton label={backLabel} onClick={onBack} />
        <ProfileSkeleton />
      </div>
    );
  }

  if (!profileData || !profileData.player) {
    return (
      <div className="space-y-6 sm:space-y-8 animate-fadeIn pb-16 md:pb-0">
        <BackButton label={backLabel} onClick={onBack} />
        <NotFound
          errorCode={errorInfo?.code ?? 404}
          title="Profile unavailable"
          message={errorInfo?.message ?? 'Failed to get player'}
          subMessage={`UID ${uid} · ${server.toUpperCase()}. The profile may be private in-game, or the Huaxu API is down.`}
          primaryActionLabel="Try again"
          onPrimaryAction={fetchProfile}
          secondaryActionLabel={backLabel}
          onSecondaryAction={onBack}
        />
      </div>
    );
  }

  const { player, characterRating } = profileData;
  const nameplateUrl = getNameplateUrl(player.nameplate);
  const guildName = player.guildName || player.guild?.name;
  const sssPlusCount = owned.filter((c) => (c.quality || 0) >= 6).length;

  return (
    <div className="space-y-8 sm:space-y-10 animate-fadeIn pb-16 md:pb-0">
      <BackButton label={backLabel} onClick={onBack} />

      {/* Profile hero */}
      <section className="relative overflow-hidden rounded-2xl border border-[#27272a] bg-gradient-to-r from-[#17171d] via-[#121215] to-[#0d0d11] [isolation:isolate]">
        <FadedPortrait
          src={getHuaxuImageUrl(player.portrait)}
          eager
          className="inset-y-0 right-0 w-full sm:w-3/5 -z-10"
          imgClassName="opacity-25"
        />

        <div className="flex flex-col sm:flex-row items-center sm:items-center gap-5 sm:gap-6 p-6 sm:p-8">
          <PlayerAvatar portrait={player.portrait} frame={player.frame} alt={player.name} size="xl" shape="circle" />

          <div className="min-w-0 flex-1 space-y-2 text-center sm:text-left">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-x-3 gap-y-2">
              <h1 className="text-3xl sm:text-4xl font-heading font-bold text-white tracking-tight break-words">
                {player.name}
              </h1>
              {nameplateUrl ? (
                <SafeImage src={nameplateUrl} alt="Nameplate" hideOnError className="h-7 sm:h-8 max-w-[160px] object-contain" />
              ) : null}
            </div>

            {player.sign && (
              <p className="text-sm text-zinc-400 italic max-w-xl [text-wrap:pretty]">“{player.sign}”</p>
            )}

            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-x-3 gap-y-1 pt-1 text-sm text-zinc-400">
              {guildName && (
                <span className="inline-flex items-center gap-1.5 text-zinc-200">
                  <Shield className="w-3.5 h-3.5 text-amber-400" />
                  {guildName}
                </span>
              )}
              {guildName && <span className="text-zinc-700">·</span>}
              <span className="uppercase">{server}</span>
              <span className="text-zinc-700">·</span>
              <span className="font-mono text-xs text-zinc-500">UID {player.id}</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-px border-t border-[#27272a]/80 bg-[#27272a]/80">
          <HeroStat label="Commander level" value={player.level} />
          <HeroStat label="Constructs" value={owned.length} />
          <HeroStat label="SSS+ constructs" value={sssPlusCount} />
          <HeroStat
            label={characterRating ? 'Character rating' : 'Likes'}
            value={characterRating ? formatNumber(characterRating) : formatNumber(player.likes ?? 0)}
          />
        </div>
      </section>

      {/* Constructs */}
      <section className="space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <h2 className="font-heading font-bold text-xl text-white tracking-tight">Constructs</h2>
            <p className="text-sm text-zinc-500">
              {visibleCharacters.length === owned.length
                ? `${owned.length} owned`
                : `${visibleCharacters.length} of ${owned.length} shown`}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-2.5">
            <div className="flex p-1 rounded-xl bg-[#09090b] border border-[#27272a]" role="group" aria-label="Sort constructs">
              {SORT_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  aria-pressed={sortBy === opt.value}
                  onClick={() => setSortBy(opt.value)}
                  className={cn(
                    'flex-1 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors',
                    sortBy === opt.value ? 'bg-white text-black' : 'text-zinc-400 hover:text-white'
                  )}
                >
                  {opt.label}
                </button>
              ))}
            </div>

            <div className="relative sm:w-60">
              <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search construct or frame"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-[#09090b] text-sm text-white placeholder:text-zinc-500 border border-[#27272a] rounded-xl pl-9 pr-9 py-2 outline-none focus:border-amber-400/70 transition-colors"
              />
              {searchTerm && (
                <button
                  type="button"
                  aria-label="Clear search"
                  onClick={() => setSearchTerm('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>

        {visibleCharacters.length === 0 ? (
          <div className="py-16 text-center rounded-2xl border border-dashed border-[#27272a] space-y-3">
            <p className="text-sm text-zinc-400">
              {owned.length === 0
                ? profileData.privacySettings?.charactersHidden
                  ? 'This player keeps their constructs private.'
                  : 'This player has no public constructs.' : `No constructs match "${searchTerm}".`}
            </p>
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm('')}
                className="text-xs font-semibold text-white hover:text-amber-300 transition-colors"
              >
                Clear search
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-x-3 gap-y-5">
            {visibleCharacters.map((char) => (
              <ConstructTile key={char.id} char={char} onSelect={() => onSelectCharacter(char)} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
};
