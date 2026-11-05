import React from 'react';
import { HeroSection } from '@/components/home/HeroSection';
import { GuildLeaderboardSection } from '@/components/home/GuildLeaderboardSection';
import { TopOperatorsSection } from '@/components/home/TopOperatorsSection';
import { PpcTacticalSuite } from '@/components/home/PpcTacticalSuite';
import { StrategyReferencesSection } from '@/components/home/StrategyReferencesSection';
import { AllianceTelemetrySection } from '@/components/home/AllianceTelemetrySection';
import { RecruitmentSection } from '@/components/home/RecruitmentSection';
import { ScrollReveal } from '@/components/common/ScrollReveal';

export type MainTab = 'home' | 'hub' | 'reffs' | 'leaderboards' | 'ppc' | 'admin' | 'contact';

export interface HomePageProps {
  onNavigate: (tab: MainTab, branchId?: number) => void;
  onSelectPlayer: (uid: number, server: string) => void;
  onOpenPpcTool: (subTab: 'bosses' | 'calculator') => void;
  onNavigateRefDetail: (refId: string) => void;
}

export const HomePage: React.FC<HomePageProps> = ({
  onNavigate,
  onSelectPlayer,
  onOpenPpcTool,
  onNavigateRefDetail
}) => {
  return (
    <div className="flex flex-col">
      {/* SECTION 1: HERO */}
      <div className="pb-10 sm:pb-14">
        <ScrollReveal variant="smooth" direction="up">
          <HeroSection onNavigate={onNavigate} />
        </ScrollReveal>
      </div>

      {/* SECTION 2: PGR REFERENCES (Primary Spotlight) */}
      <div className="py-10 sm:py-14 border-t border-[#27272a]/60">
        <ScrollReveal variant="smooth" direction="up" threshold={0.05}>
          <StrategyReferencesSection
            onNavigate={onNavigate}
            onNavigateRefDetail={onNavigateRefDetail}
          />
        </ScrollReveal>
      </div>

      {/* SECTION 3: PPC SCORE CALCULATOR (Secondary Utility) */}
      <div className="py-8 sm:py-11 border-t border-[#27272a]/50">
        <ScrollReveal variant="smooth" direction="up" threshold={0.05}>
          <PpcTacticalSuite
            onOpenPpcTool={onOpenPpcTool}
          />
        </ScrollReveal>
      </div>

      {/* SECTION 4: GUILD RANKING (Primary Spotlight) */}
      <div className="py-10 sm:py-14 border-t border-[#27272a]/60">
        <ScrollReveal variant="smooth" direction="up" threshold={0.05}>
          <GuildLeaderboardSection
            onNavigate={onNavigate}
            onSelectPlayer={onSelectPlayer}
          />
        </ScrollReveal>
      </div>

      {/* SECTION 5: TOP PLAYERS (Secondary Utility) */}
      <div className="py-8 sm:py-11 border-t border-[#27272a]/50">
        <ScrollReveal variant="smooth" direction="up" threshold={0.05}>
          <TopOperatorsSection
            onNavigate={onNavigate}
            onSelectPlayer={onSelectPlayer}
          />
        </ScrollReveal>
      </div>

      {/* SECTION 6: UNION OVERVIEW (Compact Summary Band) */}
      <div className="py-7 sm:py-10 border-t border-[#27272a]/50">
        <ScrollReveal variant="smooth" direction="up" threshold={0.05}>
          <AllianceTelemetrySection />
        </ScrollReveal>
      </div>

      {/* SECTION 7: JOIN KARUHUN (Closing CTA Section) */}
      <div className="pt-8 sm:pt-11 pb-4 border-t border-[#27272a]/50">
        <ScrollReveal variant="smooth" direction="up" threshold={0.05}>
          <RecruitmentSection onNavigate={onNavigate} />
        </ScrollReveal>
      </div>
    </div>
  );
};
