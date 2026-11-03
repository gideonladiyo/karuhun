import React, { useState, useEffect } from 'react';
import { BookOpen, ChevronRight } from 'lucide-react';
import {
  fetchLiveReferences,
  getStoredReferences,
  ReferenceItem
} from '@/data/static/reffsData';
import { YoutubeReferenceCard } from '@/components/reffs/YoutubeReferenceCard';
import { MainTab } from '@/pages/HomePage';
import { SectionHeader } from '@/components/ui/section-header';
import { SegmentedTabs, REFERENCE_CATEGORY_OPTIONS } from '@/components/ui/segmented-tabs';
import { Empty, EmptyHeader, EmptyMedia, EmptyTitle, EmptyDescription } from '@/components/ui/empty';

interface StrategyReferencesSectionProps {
  onNavigate: (tab: MainTab, branchId?: number) => void;
  onNavigateRefDetail: (refId: string) => void;
}

export const StrategyReferencesSection: React.FC<StrategyReferencesSectionProps> = ({
  onNavigate,
  onNavigateRefDetail
}) => {
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'warzone' | 'ppc' | 'guild_challenge'>('all');
  const [references, setReferences] = useState<ReferenceItem[]>(() => getStoredReferences());
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    fetchLiveReferences()
      .then((data) => {
        if (data && data.length > 0) {
          setReferences(data.filter((r) => r.isPublished !== false));
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to fetch live references', err);
        setLoading(false);
      });
  }, []);

  const filteredReferences = references.filter((item) => {
    if (selectedCategory === 'all') return true;
    return item.category === selectedCategory;
  });

  const featuredGuide = filteredReferences[0];
  const recentGuides = filteredReferences.slice(1, 3);

  return (
    <section className="relative w-full">
      <SectionHeader
        level="primary"
        title="PGR References"
        subtitle="Combat rotations and top-score runs from the union."
        actions={
          <SegmentedTabs
            options={REFERENCE_CATEGORY_OPTIONS}
            value={selectedCategory}
            onChange={setSelectedCategory}
            fullWidthOnMobile
          />
        }
      />

      {/* Loading Skeleton */}
      {loading && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-7 h-96 rounded-xl bg-[#121215] border border-[#27272a] animate-pulse" />
          <div className="lg:col-span-5 space-y-4">
            {[1, 2].map((i) => (
              <div key={i} className="h-44 rounded-xl bg-[#121215] border border-[#27272a] animate-pulse" />
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {!loading && filteredReferences.length === 0 && (
        <Empty className="py-14 rounded-xl bg-[#121215] border border-[#27272a]">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <BookOpen className="w-5 h-5 text-zinc-400" />
            </EmptyMedia>
            <EmptyTitle className="font-heading font-bold text-sm text-zinc-200">
              No references yet
            </EmptyTitle>
            <EmptyDescription className="text-xs text-zinc-400">
              No reference guides found in this category.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      )}

      {/* Grid: 1 Large Featured Spotlight (Left 7 cols) + 2 Recent Guides (Right 5 cols) */}
      {!loading && featuredGuide && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          <div className="lg:col-span-7 flex flex-col">
            <YoutubeReferenceCard
              reference={featuredGuide}
              onOpen={(item) => onNavigateRefDetail(item.id)}
              variant="featured"
              className="h-full"
            />
          </div>

          <div className="lg:col-span-5 flex flex-col justify-between space-y-4">
            <div className="space-y-6 flex-1">
              {recentGuides.map((guide) => (
                <YoutubeReferenceCard
                  key={guide.id}
                  reference={guide}
                  onOpen={(item) => onNavigateRefDetail(item.id)}
                  variant="grid"
                />
              ))}

              {recentGuides.length === 0 && (
                <div className="py-10 text-center text-zinc-400 bg-[#121215] rounded-xl border border-[#27272a] text-xs font-sans">
                  No additional runs in this category yet.
                </div>
              )}
            </div>

            <div className="p-3.5 rounded-xl bg-[#121215] border border-[#27272a] flex items-center justify-between text-xs font-sans text-zinc-400 hover:border-zinc-500 transition-colors">
              <span>Browse all Warzone, PPC &amp; Siege guides</span>
              <button
                type="button"
                onClick={() => onNavigate('reffs')}
                className="text-white hover:text-amber-300 font-semibold flex items-center space-x-1 ml-2 flex-shrink-0 transition-colors"
              >
                <span>View All</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
