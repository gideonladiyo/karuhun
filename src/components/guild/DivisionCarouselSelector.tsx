import React, { useState, useEffect } from 'react';
import { GUILD_BRANCHES } from '@/services/imageUtils';
import { getAllGuildBranchIcons } from '@/services/apiService';
import { CoverflowCarousel } from '@/components/ui/coverflow-carousel';
import { GuildBranchCard } from '@/components/common/GuildBranchCard';

interface DivisionCarouselSelectorProps {
  selectedBranchId: number;
  onSelectBranch: (branchId: number) => void;
}

const fallbackLogo = '/logo.png';

export const DivisionCarouselSelector: React.FC<DivisionCarouselSelectorProps> = ({
  selectedBranchId,
  onSelectBranch
}) => {
  const [branchIcons, setBranchIcons] = useState<Record<number, string>>({});

  useEffect(() => {
    getAllGuildBranchIcons()
      .then((icons) => {
        setBranchIcons(icons);
      })
      .catch((err) => {
        console.warn('Failed to load guild branch icons in DivisionCarouselSelector', err);
      });
  }, []);

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
    src: branchIcons[branch.id] || fallbackLogo,
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
          const iconSrc = branchIcons[branch.id] || fallbackLogo;

          return (
            <GuildBranchCard
              branch={branch}
              isActive={isActive}
              iconUrl={iconSrc}
              onClick={() => handleSelectIndex(index)}
            />
          );
        }}
      />

    </div>
  );
};
