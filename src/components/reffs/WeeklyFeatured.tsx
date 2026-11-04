import React, { useEffect, useMemo, useState } from 'react';
import { ReferenceItem } from '@/data/static/reffsData';
import {
  fetchFeaturedIds,
  formatTimeLeft,
  getFeaturedWeekRange,
  getFeaturedWeekStart,
} from '@/services/featuredReferences';
import { YoutubeReferenceCard, CATEGORY_STYLES } from '@/components/reffs/YoutubeReferenceCard';
import { REFERENCE_CATEGORY_OPTIONS } from '@/components/ui/segmented-tabs';
import { ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

type Category = ReferenceItem['category'];

export const FEATURED_MODES: Category[] = ['warzone', 'ppc', 'guild_challenge'];
const FALLBACK_COUNT = 3;
export const MODE_TAB_OPTIONS = REFERENCE_CATEGORY_OPTIONS.filter(
  (o): o is Extract<(typeof REFERENCE_CATEGORY_OPTIONS)[number], { value: Category }> => o.value !== 'all'
);

export interface WeeklyFeaturedState {
  weekStart: string;
  endsAt: Date;
  now: Date;
  byCategory: Record<Category, ReferenceItem[]>;
  hasAny: boolean;
  loading: boolean;
}

/**
 * Featured picks for the current week, matched against the published references the page
 * already loaded. Re-checks every minute so an open tab rolls over at the Monday reset.
 */
export function useWeeklyFeatured(references: ReferenceItem[]): WeeklyFeaturedState {
  const [now, setNow] = useState(() => new Date());
  const [ids, setIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(timer);
  }, []);

  const weekStart = getFeaturedWeekStart(now);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetchFeaturedIds(weekStart).then((result) => {
      if (cancelled) return;
      setIds(result);
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [weekStart]);

  // `ids` already arrive in the order the superadmin set, so keep that order per mode.
  const byCategory = useMemo(() => {
    const byId = new Map(references.map((r) => [r.id, r]));
    const groups: Record<Category, ReferenceItem[]> = { warzone: [], ppc: [], guild_challenge: [] };
    ids
      .map((id) => byId.get(id))
      .filter((r): r is ReferenceItem => !!r && r.isPublished !== false)
      .forEach((r) => groups[r.category]?.push(r));
    return groups;
  }, [ids, references]);

  return {
    weekStart,
    endsAt: getFeaturedWeekRange(weekStart).end,
    now,
    byCategory,
    hasAny: FEATURED_MODES.some((m) => byCategory[m].length > 0),
    loading,
  };
}

export const ResetCountdown: React.FC<{ featured: WeeklyFeaturedState; className?: string }> = ({
  featured,
  className,
}) => (
  <p className={cn('text-xs font-tech text-zinc-400', className)}>
    Resets Monday 12:00 WIB ·{' '}
    <span className="text-zinc-200 tabular-nums">in {formatTimeLeft(featured.endsAt, featured.now)}</span>
  </p>
);

/** Selected mode for the showcase; defaults to the first mode that has picks this week. */
export function useFeaturedMode(featured: WeeklyFeaturedState): [Category, (mode: Category) => void] {
  const [picked, setPicked] = useState<Category | null>(null);
  const fallback = FEATURED_MODES.find((m) => featured.byCategory[m].length > 0) ?? 'warzone';
  return [picked ?? fallback, setPicked];
}

interface ShowcaseProps {
  references: ReferenceItem[];
  featured: WeeklyFeaturedState;
  mode: Category;
  onOpen: (item: ReferenceItem) => void;
  onViewAll?: () => void;
}

/**
 * One mode at a time: a large spotlight for the first slot and the remaining slots beside it.
 * Below lg the spotlight collapses into the list so mobile stays a compact slot list.
 */
export const WeeklyFeaturedShowcase: React.FC<ShowcaseProps> = ({ references, featured, mode, onOpen, onViewAll }) => {
  const picks = featured.byCategory[mode];
  const isFeatured = picks.length > 0;
  const items = isFeatured
    ? picks
    : references.filter((r) => r.category === mode && r.isPublished !== false).slice(0, FALLBACK_COUNT);
  const [lead, ...rest] = items;
  const label = CATEGORY_STYLES[mode].label;
  // A lone pick would leave the side column empty, so back it up with other recent runs.
  const extras =
    rest.length === 0
      ? references
          .filter((r) => r.category === mode && r.isPublished !== false && !items.includes(r))
          .slice(0, FALLBACK_COUNT)
      : [];

  if (featured.loading && !isFeatured) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="hidden lg:block lg:col-span-7 aspect-video rounded-xl bg-[#121215] border border-[#27272a] animate-pulse" />
        <div className="lg:col-span-5 space-y-4">
          {Array.from({ length: FALLBACK_COUNT }, (_, i) => (
            <div key={i} className="flex gap-3">
              <div className="w-32 sm:w-36 aspect-video rounded-xl bg-[#121215] border border-[#27272a] animate-pulse" />
              <div className="flex-1 space-y-2 py-1">
                <div className="h-3 w-1/3 rounded bg-[#18181b] animate-pulse" />
                <div className="h-3.5 w-4/5 rounded bg-[#18181b] animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!lead) {
    return (
      <div className="py-14 text-center rounded-xl bg-[#121215] border border-[#27272a] text-xs text-zinc-400">
        No {label} references yet.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
      <div className="hidden lg:block lg:col-span-7">
        <YoutubeReferenceCard reference={lead} onOpen={onOpen} variant="spotlight" slotLabel={lead.subcategory} />
      </div>

      <div className="lg:col-span-5 flex flex-col gap-4">
        <div className="flex items-center justify-between gap-2 pb-3 border-b border-[#27272a]">
          <span className="inline-flex items-center gap-2 font-heading font-bold text-xs text-zinc-300 uppercase tracking-wider">
            <span className={cn('w-2 h-2 rounded-full', CATEGORY_STYLES[mode].dot)} />
            {label}
          </span>
          <span
            className={cn(
              'px-2 py-0.5 rounded-md text-[11px] font-tech font-bold uppercase tracking-wide',
              isFeatured
                ? 'bg-amber-400/10 text-amber-300 border border-amber-400/25'
                : 'bg-[#18181b] text-zinc-400 border border-[#27272a]'
            )}
          >
            {isFeatured ? `This week · ${items.length} ${items.length === 1 ? 'pick' : 'picks'}` : 'Latest'}
          </span>
        </div>

        <div className="flex-1 space-y-4">
          {/* The lead item only appears in the list on small screens; on lg it is the spotlight. */}
          <div className="lg:hidden">
            <YoutubeReferenceCard reference={lead} onOpen={onOpen} variant="compact" slotLabel={lead.subcategory} />
          </div>
          {rest.map((item) => (
            <YoutubeReferenceCard
              key={item.id}
              reference={item}
              onOpen={onOpen}
              variant="compact"
              slotLabel={item.subcategory}
            />
          ))}
          {extras.length > 0 && (
            <div className="space-y-4 pt-1">
              <p className="text-[11px] font-tech font-bold text-zinc-500 uppercase tracking-wider">Latest</p>
              {extras.map((item) => (
                <YoutubeReferenceCard key={item.id} reference={item} onOpen={onOpen} variant="compact" />
              ))}
            </div>
          )}
          {rest.length === 0 && extras.length === 0 && (
            <p className="hidden lg:block py-6 text-center text-xs text-zinc-500">
              {isFeatured ? `Only one ${label} pick this week.` : `No other ${label} references yet.`}
            </p>
          )}
        </div>

        {onViewAll && (
          <div className="p-3.5 rounded-xl bg-[#121215] border border-[#27272a] flex items-center justify-between gap-2 text-xs text-zinc-400 hover:border-zinc-500 transition-colors">
            <span>Browse all {label} references</span>
            <button
              type="button"
              onClick={onViewAll}
              className="inline-flex items-center gap-1 text-white hover:text-amber-300 font-semibold flex-shrink-0 transition-colors"
            >
              View all
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

/** Larger grid for a single mode (used on /reffs when a category tab is selected). */
export const WeeklyFeaturedGrid: React.FC<{ items: ReferenceItem[]; onOpen: (item: ReferenceItem) => void }> = ({
  items,
  onOpen,
}) => (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-8">
    {items.map((item) => (
      <YoutubeReferenceCard key={item.id} reference={item} onOpen={onOpen} slotLabel={item.subcategory} />
    ))}
  </div>
);
