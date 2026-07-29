export interface GuildBranchConfig {
  id: number;
  server: string;
  name: string;
  tag: string;
  region: string;
}

export const GUILD_BRANCHES: GuildBranchConfig[] = [
  { id: 3638, server: 'ap', name: 'KARUHUN 夜', tag: 'Competitive', region: 'Asia-Pacific (AP)' },
  { id: 1164, server: 'ap', name: 'IZANAMI 夜', tag: 'Sub-Competitive', region: 'Asia-Pacific (AP)' },
  { id: 7641, server: 'ap', name: 'ASTRELUME 夜', tag: 'Casual', region: 'Asia-Pacific (AP)' },
  { id: 2013, server: 'na', name: 'KARUHUN 夜’', tag: 'Casual', region: 'North America (NA)' },
];

const HUAXU_ASSETS_BASE = import.meta.env.VITE_HUAXU_ASSETS_URL || 'https://assets.huaxu.app/glb';

export const getHuaxuImageUrl = (imagePath?: string): string => {
  if (!imagePath) return '';
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }
  const cleanPath = imagePath.replace(/^\//, '');
  return `${HUAXU_ASSETS_BASE}/${cleanPath}.webp`;
};

// Formats Construct Rank Label based on quality and stars:
// quality 6 -> SSS+
// quality 4, stars 4 -> SS4
// quality 3, stars 5 -> S5
export const getConstructRankLabel = (quality: number, stars: number = 0) => {
  if (quality === 6) {
    return { label: 'SSS+', classNames: 'bg-white text-black font-bold border-white' };
  }

  let baseLabel = 'B';
  let classNames = 'bg-[#18181b] text-zinc-500 border-[#27272a]';

  switch (quality) {
    case 5:
      baseLabel = 'SSS';
      classNames = 'bg-zinc-200 text-black font-bold border-zinc-200';
      break;
    case 4:
      baseLabel = 'SS';
      classNames = 'bg-zinc-800 text-zinc-200 border-zinc-700';
      break;
    case 3:
      baseLabel = 'S';
      classNames = 'bg-[#18181b] text-zinc-300 border-[#27272a]';
      break;
    case 2:
      baseLabel = 'A';
      classNames = 'bg-[#18181b] text-zinc-400 border-[#27272a]';
      break;
    case 1:
    default:
      baseLabel = 'B';
      classNames = 'bg-[#18181b] text-zinc-500 border-[#27272a]';
      break;
  }

  const finalLabel = stars && stars > 0 ? `${baseLabel}${stars}` : baseLabel;

  return {
    label: finalLabel,
    classNames
  };
};
