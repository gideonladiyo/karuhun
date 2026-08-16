import React from 'react';
import { GuildInfo, GuildMember } from '@/types';
import { GUILD_BRANCHES } from '@/services/imageUtils';
import { DivisionCarouselSelector } from '@/components/guild/DivisionCarouselSelector';
import { GuildOverviewTelemetry } from '@/components/guild/GuildOverviewTelemetry';
import { GuildMembersRoster } from '@/components/guild/GuildMembersRoster';
import { ScrollReveal } from '@/components/common/ScrollReveal';

interface GuildHubProps {
  currentGuild: GuildInfo | null;
  members?: GuildMember[];
  loading: boolean;
  selectedBranchId: number;
  onSelectBranch: (branchId: number) => void;
  onSelectPlayer?: (playerId: number, server: string) => void;
  onViewMembers?: () => void;
}

export const GuildHub: React.FC<GuildHubProps> = ({
  currentGuild,
  members = [],
  loading,
  selectedBranchId,
  onSelectBranch,
  onSelectPlayer = () => {}
}) => {
  const activeBranch = GUILD_BRANCHES.find((b) => b.id === selectedBranchId) || GUILD_BRANCHES[0];

  return (
    <div className="space-y-10 sm:space-y-14 animate-fadeIn pb-16 md:pb-8">
      
      {/* SECTION 1: TACTICAL DIVISION 3D CAROUSEL */}
      <ScrollReveal variant="bouncy" direction="scale" delayMs={50}>
        <DivisionCarouselSelector
          selectedBranchId={selectedBranchId}
          onSelectBranch={onSelectBranch}
        />
      </ScrollReveal>

      {/* SECTION 2: GUILD OVERVIEW & SECTOR TELEMETRY */}
      <ScrollReveal variant="bouncy" direction="up" delayMs={100} threshold={0.05}>
        <GuildOverviewTelemetry
          currentGuild={currentGuild}
          members={members}
          activeBranch={activeBranch}
          loading={loading}
        />
      </ScrollReveal>

      {/* SECTION 3: INTEGRATED GUILD ROSTER & MEMBER CONSOLE */}
      <ScrollReveal variant="bouncy" direction="up" delayMs={120} threshold={0.05}>
        <GuildMembersRoster
          members={members}
          server={activeBranch.server}
          loading={loading}
          onSelectPlayer={onSelectPlayer}
        />
      </ScrollReveal>

    </div>
  );
};
