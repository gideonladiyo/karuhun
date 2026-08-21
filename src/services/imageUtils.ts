import guildBranchesData from '@/data/config/guildBranches.json';

export interface GuildBranchConfig {
  id: number;
  server: string;
  name: string;
  tag: string;
  region: string;
  shortRegion: string;
  defaultMembers?: number;
}

export const GUILD_BRANCHES: GuildBranchConfig[] = guildBranchesData;

const HUAXU_ASSETS_BASE = import.meta.env.VITE_HUAXU_ASSETS_URL || 'https://assets.huaxu.app/glb';

export const getHuaxuImageUrl = (imagePath?: string): string => {
  if (!imagePath) return '';
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }
  const cleanPath = imagePath.replace(/^\//, '');
  return `${HUAXU_ASSETS_BASE}/${cleanPath}.webp`;
};

export const getNameplateUrl = (
  nameplate?: string | { icon?: string; image?: string; url?: string; iconUrl?: string; path?: string } | null
): string => {
  if (!nameplate) return '';
  if (typeof nameplate === 'string') {
    return getHuaxuImageUrl(nameplate);
  }
  if (typeof nameplate === 'object') {
    const iconPath = nameplate.icon || nameplate.image || nameplate.url || nameplate.iconUrl || nameplate.path;
    if (iconPath) return getHuaxuImageUrl(iconPath);
  }
  return '';
};

// Formats Construct Rank Label based on quality and stars:
// quality 6 -> SSS+
// quality 5, stars 3 -> SSS3
// quality 4, stars 3 -> SS3
// quality 3, stars 5 -> S5
export const getConstructRankLabel = (quality: number, stars: number = 0) => {
  const q = Number(quality) || 6;
  const s = Number(stars) || 0;

  if (q >= 6) {
    return {
      label: 'SSS+',
      classNames: 'bg-gradient-to-r from-amber-400 via-amber-300 to-yellow-500 text-black font-extrabold border-amber-300 shadow-md'
    };
  }

  let baseLabel = 'B';
  let classNames = 'bg-[#18181b] text-zinc-500 border-[#27272a]';

  switch (q) {
    case 5:
      baseLabel = 'SSS';
      classNames = 'bg-rose-950/90 text-rose-300 border-rose-500/80 font-bold shadow-md';
      break;
    case 4:
      baseLabel = 'SS';
      classNames = 'bg-purple-950/90 text-purple-300 border-purple-500/80 font-bold shadow-md';
      break;
    case 3:
      baseLabel = 'S';
      classNames = 'bg-sky-950/90 text-sky-300 border-sky-500/80 font-bold shadow-md';
      break;
    case 2:
      baseLabel = 'A';
      classNames = 'bg-emerald-950/90 text-emerald-300 border-emerald-500/80 font-bold shadow-md';
      break;
    case 1:
    default:
      baseLabel = 'B';
      classNames = 'bg-[#18181b] text-zinc-400 border-[#27272a] font-bold shadow-md';
      break;
  }

  const finalLabel = s > 0 ? `${baseLabel}${s}` : baseLabel;

  return {
    label: finalLabel,
    classNames
  };
};
