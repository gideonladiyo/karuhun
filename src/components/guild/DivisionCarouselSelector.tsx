import React from 'react';
import { GUILD_BRANCHES } from '@/services/imageUtils';
import { CoverflowCarousel } from '@/components/ui/coverflow-carousel';

interface DivisionCarouselSelectorProps {
  selectedBranchId: number;
  onSelectBranch: (branchId: number) => void;
}

const karuhunLogo = '/logo.png';

export const DivisionCarouselSelector: React.FC<DivisionCarouselSelectorProps> = ({
  selectedBranchId,
  onSelectBranch
}) => {
  const currentIndex = GUILD_BRANCHES.findIndex((b) => b.id === selectedBranchId);
  const safeIndex = currentIndex >= 0 ? currentIndex : 0;

  const handleSelectIndex = (index: number) => {
    const branch = GUILD_BRANCHES[index];
    if (branch && branch.id !== selectedBranchId) {
      onSelectBranch(branch.id);
    }
  };

  const slides = GUILD_BRANCHES.map((branch) => ({
    ...branch,
    src: karuhunLogo,
    alt: branch.name,
    title: branch.name,
    subtitle: `${branch.region} • ID: ${String(branch.id).padStart(8, '0')}`
  }));

  return (
    <div className="w-full relative select-none">
      
      {/* Header Banner - Extra Large Centered KARUHUN UNION */}
      <div className="flex flex-col items-center justify-center text-center mb-5 sm:mb-8">
        <h2 className="font-heading font-black text-3xl sm:text-4xl md:text-5xl lg:text-6xl text-white tracking-widest uppercase">
          KARUHUN UNION
        </h2>
      </div>

      {/* 3D Rectangular Coverflow Carousel */}
      <CoverflowCarousel
        slides={slides}
        selectedIndex={safeIndex}
        onSelectIndex={handleSelectIndex}
        rotate={24}
        depth={0.34}
        perspective={3.8}
        falloff={0.65}
        fade={0.15}
        gap={0.12}
        cardWidth="clamp(280px, 32vw, 420px)"
        cardHeight="clamp(200px, 23vw, 240px)"
        showNavigation={true}
        showPagination={true}
        className="py-1"
        renderCard={(_, index, isActive) => {
          const branch = GUILD_BRANCHES[index];
          const isCompetitive = branch.tag === 'Competitive';
          const isSubCompetitive = branch.tag === 'Sub-Competitive';

          // Color for the bottom label
          const tagColorClass = isCompetitive
            ? 'text-amber-400'
            : isSubCompetitive
            ? 'text-sky-400'
            : 'text-zinc-400';

          return (
            <div
              className={`w-full h-full relative p-5 sm:p-6 flex flex-col justify-between overflow-hidden rounded-2xl sm:rounded-3xl transition-all duration-300 ${
                isActive
                  ? 'bg-gradient-to-br from-[#1e1a12] via-[#141418] to-[#09090b] border-2 border-amber-400 shadow-[0_0_35px_rgba(245,158,11,0.25)] ring-1 ring-amber-400/50'
                  : 'bg-[#0d0d11] hover:bg-[#121215] border border-[#27272a] hover:border-zinc-500'
              }`}
            >

              {/* Main Content Area (Left 3 Rows + Right Watermark Logo) */}
              <div className="flex items-center justify-between gap-3 flex-1">
                
                {/* 3 ROWS OF TEXT */}
                <div className="space-y-1 min-w-0 flex-1 z-20">
                  {/* Row 1: Nama Guild (Large) */}
                  <h3 className={`font-heading font-black text-xl sm:text-2xl lg:text-3xl tracking-tight truncate ${
                    isActive ? 'text-white drop-shadow-sm' : 'text-zinc-200'
                  }`}>
                    {branch.name}
                  </h3>

                  {/* Row 2: ID Guild */}
                  <p className="text-xs sm:text-sm font-tech text-zinc-400">
                    ID: <strong className="text-white font-mono font-bold">{String(branch.id).padStart(8, '0')}</strong>
                  </p>

                  {/* Row 3: Server (Full Region Name) */}
                  <p className="text-xs sm:text-sm font-tech text-zinc-400 truncate">
                    Server: <strong className="text-zinc-200 font-semibold">{branch.region}</strong>
                  </p>
                </div>

                {/* RIGHT SIDE: Guild Logo Watermark */}
                <div className="relative z-10 w-20 h-20 sm:w-28 sm:h-28 flex-shrink-0 flex items-center justify-center pointer-events-none select-none">
                  <img
                    src={karuhunLogo}
                    alt="Guild Logo"
                    className={`w-full h-full object-contain filter contrast-125 transition-opacity duration-300 ${
                      isActive ? 'opacity-25 grayscale-0' : 'opacity-15 grayscale'
                    }`}
                  />
                  {isActive && (
                    <div className="absolute inset-0 bg-amber-500/10 rounded-full blur-xl pointer-events-none" />
                  )}
                </div>

              </div>

              {/* BOTTOM SECTION: Line + Tag Label (Competitive / Sub-Competitive / Casual) */}
              <div className="pt-2.5 border-t border-[#27272a]/80 flex items-center justify-between z-20">
                <h4 className={`font-heading font-bold text-xs sm:text-sm tracking-widest uppercase ${tagColorClass}`}>
                  {branch.tag} BRANCH
                </h4>
              </div>

            </div>
          );
        }}
      />

    </div>
  );
};
