import React from 'react';
import { GuildBranchConfig } from '@/services/imageUtils';

export interface GuildBranchCardProps {
  branch: GuildBranchConfig;
  isActive?: boolean;
  iconUrl?: string;
  onClick?: (e: React.MouseEvent<HTMLDivElement>) => void;
  className?: string;
  style?: React.CSSProperties;
}

const fallbackLogo = '/logo.png';

export const GuildBranchCard: React.FC<GuildBranchCardProps> = ({
  branch,
  isActive = false,
  iconUrl,
  onClick,
  className = '',
  style,
}) => {
  const isCompetitive = branch.tag === 'Competitive';
  const isSubCompetitive = branch.tag === 'Sub-Competitive';

  const tagColorClass = isCompetitive
    ? 'text-amber-400'
    : isSubCompetitive
    ? 'text-sky-400'
    : 'text-zinc-400';

  const finalIcon = iconUrl || fallbackLogo;

  return (
    <div
      onClick={onClick}
      style={style}
      className={`relative w-full h-full p-4 sm:p-5 rounded-2xl sm:rounded-3xl flex flex-col justify-between cursor-pointer select-none transition-all duration-300 ${
        isActive
          ? 'bg-gradient-to-br from-[#1e1a12] via-[#141418] to-[#09090b] border-2 border-amber-400 shadow-[0_0_35px_rgba(245,158,11,0.3)] ring-1 ring-amber-400/50 hover:border-amber-300'
          : 'bg-[#0d0d11]/95 hover:bg-[#15151a] border border-[#27272a] hover:border-zinc-500 backdrop-blur-md'
      } ${className}`}
    >
      {/* Main Content Area (Left 3 Rows + Right Watermark Logo) */}
      <div className="flex items-center justify-between gap-3 flex-1">
        
        {/* 3 ROWS OF TEXT */}
        <div className="space-y-0.5 sm:space-y-1 min-w-0 flex-1 z-20">
          {/* Row 1: Nama Guild */}
          <h3
            className={`font-heading font-black text-base sm:text-xl lg:text-2xl tracking-tight truncate ${
              isActive ? 'text-white drop-shadow-sm' : 'text-zinc-300'
            }`}
          >
            {branch.name}
          </h3>

          {/* Row 2: ID Guild */}
          <p className="text-[10px] sm:text-xs font-tech text-zinc-400">
            ID: <strong className="text-white font-mono font-bold">{String(branch.id).padStart(8, '0')}</strong>
          </p>

          {/* Row 3: Server (Region) */}
          <p className="text-[10px] sm:text-xs font-tech text-zinc-400 truncate">
            Server: <strong className="text-zinc-200 font-semibold">{branch.region}</strong>
          </p>
        </div>

        {/* RIGHT SIDE: Guild Logo Watermark from API */}
        <div className="relative z-10 w-14 h-14 sm:w-20 sm:h-20 flex-shrink-0 flex items-center justify-center pointer-events-none select-none rounded-xl sm:rounded-2xl overflow-hidden">
          <img
            src={finalIcon}
            alt={`${branch.name} Crest`}
            className={`w-full h-full object-contain filter contrast-125 transition-opacity duration-300 rounded-xl sm:rounded-2xl ${
              isActive ? 'opacity-30 grayscale-0' : 'opacity-15 grayscale'
            }`}
          />
          {isActive && (
            <div className="absolute inset-0 bg-amber-500/15 rounded-xl sm:rounded-2xl blur-lg pointer-events-none" />
          )}
        </div>

      </div>

      {/* BOTTOM SECTION: Line + Tag Label (Competitive / Sub-Competitive / Casual) */}
      <div className="mt-2 pt-1.5 border-t border-[#27272a]/80 flex items-center justify-between z-20">
        <h4 className={`font-heading font-bold text-[10px] sm:text-xs tracking-widest uppercase ${tagColorClass}`}>
          {branch.tag} DIVISION
        </h4>
      </div>

    </div>
  );
};
