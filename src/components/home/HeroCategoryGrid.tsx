import React from 'react';
import { Shield, Trophy, Users, UserPlus } from 'lucide-react';
import { MainTab } from '@/pages/HomePage';

interface HeroCategoryGridProps {
  onNavigate: (tab: MainTab, branchId?: number) => void;
}

const RECRUITMENT_ANCHOR = 'recruitment';

const scrollBehavior = (): ScrollBehavior =>
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches
    ? 'auto'
    : 'smooth';

export const HeroCategoryGrid: React.FC<HeroCategoryGridProps> = ({ onNavigate }) => {
  const handleJoin = () => {
    document.getElementById(RECRUITMENT_ANCHOR)?.scrollIntoView({
      behavior: scrollBehavior(),
      block: 'start'
    });
  };

  const cards = [
    {
      key: 'details',
      label: 'Guild Details',
      sub: 'Overview & roster',
      icon: Shield,
      gradient: 'from-[#2a2313] via-[#17171b] to-[#0d0d11] hover:from-[#3a2f18]',
      iconTone: 'text-amber-300',
      onClick: () => onNavigate('hub')
    },
    {
      key: 'rankings',
      label: 'Rankings',
      sub: 'Guild & member standings',
      icon: Trophy,
      gradient: 'from-[#2a2313] via-[#17171b] to-[#0d0d11] hover:from-[#3a2f18]',
      iconTone: 'text-amber-300',
      onClick: () => onNavigate('leaderboards')
    },
    {
      key: 'divisions',
      label: 'Divisions',
      sub: 'Browse all branches',
      icon: Users,
      gradient: 'from-[#1c1f26] via-[#17171b] to-[#0d0d11] hover:from-[#252a33]',
      iconTone: 'text-zinc-200',
      onClick: () => onNavigate('hub')
    },
    {
      key: 'join',
      label: 'Join',
      sub: 'Apply to the union',
      icon: UserPlus,
      gradient: 'from-[#2a1f13] via-[#1a171b] to-[#0d0d11] hover:from-[#3a2a18]',
      iconTone: 'text-amber-200',
      onClick: handleJoin
    }
  ];

  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-4 pt-2">
      {cards.map((card) => {
        const IconComp = card.icon;
        return (
          <button
            key={card.key}
            onClick={card.onClick}
            aria-label={`${card.label} - ${card.sub}`}
            className={`group relative min-h-[104px] sm:min-h-[116px] p-4 sm:p-5 rounded-2xl bg-gradient-to-br ${card.gradient} border border-[#27272a] hover:border-amber-400/50 text-left overflow-hidden transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl focus-tactical`}
          >
            <div className="flex items-start justify-between gap-2 h-full">
              <div className="flex flex-col justify-end gap-0.5 min-w-0">
                <span className="font-heading font-black text-sm sm:text-base text-white tracking-tight leading-tight">
                  {card.label}
                </span>
                <span className="text-[10px] sm:text-[11px] font-tech text-zinc-500 leading-tight">
                  {card.sub}
                </span>
              </div>
              <span
                className={`shrink-0 w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-black/40 border border-[#27272a]/70 flex items-center justify-center transition-transform duration-300 group-hover:scale-110 ${card.iconTone}`}
              >
                <IconComp className="w-4 h-4 sm:w-5 sm:h-5" />
              </span>
            </div>
          </button>
        );
      })}
    </div>
  );
};