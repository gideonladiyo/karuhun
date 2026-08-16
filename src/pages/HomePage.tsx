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
    <div className="space-y-12 sm:space-y-20">
      {/* SECTION 1: COMMAND HERO (SPRING FADE-UP) */}
      <ScrollReveal variant="bouncy" direction="scale" delayMs={50}>
        <HeroSection onNavigate={onNavigate} />
      </ScrollReveal>

      {/* SECTION 2: UNIFIED GUILD LEADERBOARD (SPRING FADE-UP ON SCROLL) */}
      <ScrollReveal variant="bouncy" direction="up" delayMs={100} threshold={0.05}>
        <GuildLeaderboardSection onNavigate={onNavigate} />
      </ScrollReveal>

      {/* SECTION 3: TOP COMPETITIVE OPERATORS (SPRING FADE-UP ON SCROLL) */}
      <ScrollReveal variant="bouncy" direction="up" delayMs={100} threshold={0.05}>
        <TopOperatorsSection 
          onNavigate={onNavigate} 
          onSelectPlayer={onSelectPlayer} 
        />
      </ScrollReveal>

      {/* SECTION 4: PPC TACTICAL SUITE (SPRING FADE-UP ON SCROLL) */}
      <ScrollReveal variant="bouncy" direction="up" delayMs={100} threshold={0.05}>
        <PpcTacticalSuite 
          onOpenPpcTool={onOpenPpcTool} 
        />
      </ScrollReveal>

      {/* SECTION 5: STRATEGY REFERENCES (SPRING FADE-UP ON SCROLL) */}
      <ScrollReveal variant="bouncy" direction="up" delayMs={100} threshold={0.05}>
        <StrategyReferencesSection 
          onNavigate={onNavigate}
          onNavigateRefDetail={onNavigateRefDetail}
        />
      </ScrollReveal>

      {/* SECTION 6: ALLIANCE TELEMETRY MATRIX (SPRING FADE-UP ON SCROLL) */}
      <ScrollReveal variant="bouncy" direction="up" delayMs={100} threshold={0.05}>
        <AllianceTelemetrySection />
      </ScrollReveal>

      {/* SECTION 7: RECRUITMENT FLOW (SPRING FADE-UP ON SCROLL) */}
      <ScrollReveal variant="bouncy" direction="up" delayMs={100} threshold={0.05}>
        <RecruitmentSection onNavigate={onNavigate} />
      </ScrollReveal>
    </div>
  );
};
