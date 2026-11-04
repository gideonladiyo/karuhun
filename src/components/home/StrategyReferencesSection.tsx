import React, { useState, useEffect } from 'react';
import { fetchLiveReferences, getStoredReferences, ReferenceItem } from '@/data/static/reffsData';
import { MainTab } from '@/pages/HomePage';
import { SectionHeader } from '@/components/ui/section-header';
import { SegmentedTabs } from '@/components/ui/segmented-tabs';
import { formatTimeLeft } from '@/services/featuredReferences';
import {
  MODE_TAB_OPTIONS,
  WeeklyFeaturedShowcase,
  useFeaturedMode,
  useWeeklyFeatured,
} from '@/components/reffs/WeeklyFeatured';

interface StrategyReferencesSectionProps {
  onNavigate: (tab: MainTab, branchId?: number) => void;
  onNavigateRefDetail: (refId: string) => void;
}

export const StrategyReferencesSection: React.FC<StrategyReferencesSectionProps> = ({
  onNavigate,
  onNavigateRefDetail,
}) => {
  const [references, setReferences] = useState<ReferenceItem[]>(() =>
    getStoredReferences().filter((r) => r.isPublished !== false)
  );

  useEffect(() => {
    fetchLiveReferences()
      .then((data) => setReferences(data.filter((r) => r.isPublished !== false)))
      .catch((err) => console.error('Failed to fetch live references', err));
  }, []);

  const featured = useWeeklyFeatured(references);
  const [mode, setMode] = useFeaturedMode(featured);

  return (
    <section className="relative w-full">
      <SectionHeader
        level="primary"
        title="PGR References"
        subtitle={
          featured.hasAny ? (
            <>
              This week's picks for Warzone, PPC, and Guild Challenge. Resets Monday 12:00 WIB ·{' '}
              <span className="text-zinc-200 tabular-nums">in {formatTimeLeft(featured.endsAt, featured.now)}</span>
            </>
          ) : (
            'Latest runs for Warzone, PPC, and Guild Challenge.'
          )
        }
        actions={
          <SegmentedTabs
            options={MODE_TAB_OPTIONS}
            value={mode}
            onChange={setMode}
            fullWidthOnMobile
            ariaLabel="Reference mode"
          />
        }
      />

      <WeeklyFeaturedShowcase
        references={references}
        featured={featured}
        mode={mode}
        onOpen={(item) => onNavigateRefDetail(item.id)}
        onViewAll={() => onNavigate('reffs')}
      />
    </section>
  );
};
