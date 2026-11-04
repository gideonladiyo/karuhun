import React, { useState, useEffect, useMemo } from 'react';
import {
  getStoredReferences,
  fetchLiveReferences,
  CATEGORIES_CONFIG,
  ReferenceItem,
  VideoPlatform
} from '@/data/static/reffsData';
import { MarkdownRenderer } from '@/components/common/MarkdownRenderer';
import { MultiPlatformVideoPlayer } from '@/components/reffs/MultiPlatformVideoPlayer';
import { BackButton } from '@/components/common/BackButton';
import { YoutubeReferenceCard, CATEGORY_STYLES } from '@/components/reffs/YoutubeReferenceCard';
import { SegmentedTabs, REFERENCE_CATEGORY_OPTIONS } from '@/components/ui/segmented-tabs';
import { PlatformBadge, PlatformIcon, PLATFORM_LABELS } from '@/components/ui/platform-icon';
import { Button } from '@/components/ui/button';
import { Empty, EmptyHeader, EmptyMedia, EmptyTitle, EmptyDescription, EmptyContent } from '@/components/ui/empty';
import { Search, Copy, Check, SearchX, X } from 'lucide-react';
import {
  MODE_TAB_OPTIONS,
  WeeklyFeaturedShowcase,
  WeeklyFeaturedGrid,
  ResetCountdown,
  useFeaturedMode,
  useWeeklyFeatured,
} from '@/components/reffs/WeeklyFeatured';

type CategoryFilter = 'all' | ReferenceItem['category'];
type PlatformFilter = 'all' | Exclude<VideoPlatform, 'other'>;

const PLATFORM_FILTERS: PlatformFilter[] = ['all', 'youtube', 'tiktok', 'bilibili'];
const RELATED_LIMIT = 4;

interface ReffsPageProps {
  initialRefId?: string;
  onNavigateRefDetail?: (refId?: string) => void;
  onBack?: () => void;
  backLabel?: string;
}

function formatDate(value?: string): string {
  if (!value) return '';
  const date = new Date(value);
  if (isNaN(date.getTime())) return '';
  return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

const CardSkeleton: React.FC = () => (
  <div className="space-y-2.5">
    <div className="aspect-video rounded-xl bg-[#121215] border border-[#27272a] animate-pulse" />
    <div className="h-3.5 w-4/5 rounded bg-[#18181b] animate-pulse" />
    <div className="h-3 w-1/2 rounded bg-[#18181b] animate-pulse" />
  </div>
);

const CopyLinkButton: React.FC<{ url: string }> = ({ url }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // Clipboard unavailable; user can still use the external link.
    }
  };

  return (
    <Button variant="secondary" size="sm" onClick={handleCopy}>
      {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
      <span>{copied ? 'Copied' : 'Copy link'}</span>
    </Button>
  );
};

export const ReffsPage: React.FC<ReffsPageProps> = ({
  initialRefId,
  onNavigateRefDetail,
  onBack,
  backLabel,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<CategoryFilter>('all');
  const [selectedSubcategory, setSelectedSubcategory] = useState<string>('all');
  const [selectedPlatform, setSelectedPlatform] = useState<PlatformFilter>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');

  const [allReferences, setAllReferences] = useState<ReferenceItem[]>(() => getStoredReferences());
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    fetchLiveReferences().then((data) => {
      setAllReferences(data);
      setLoading(false);
    });
  }, []);

  const publishedReferences = useMemo(
    () => allReferences.filter((r) => r.isPublished !== false),
    [allReferences]
  );

  const featured = useWeeklyFeatured(publishedReferences);
  const [featuredMode, setFeaturedMode] = useFeaturedMode(featured);

  const activeDetailItem = initialRefId
    ? publishedReferences.find((r) => r.id === initialRefId) ?? null
    : null;

  const filteredReferences = useMemo(() => {
    const query = searchTerm.toLowerCase().trim();
    return publishedReferences.filter((item) => {
      if (selectedCategory !== 'all' && item.category !== selectedCategory) return false;
      if (selectedSubcategory !== 'all' && item.subcategory.toLowerCase() !== selectedSubcategory.toLowerCase()) return false;
      if (selectedPlatform !== 'all' && (item.platform || 'youtube') !== selectedPlatform) return false;
      if (!query) return true;
      return [item.title, item.description, item.subcategory, item.author, CATEGORIES_CONFIG[item.category]?.label]
        .some((field) => field?.toLowerCase().includes(query));
    });
  }, [publishedReferences, selectedCategory, selectedSubcategory, selectedPlatform, searchTerm]);

  const hasActiveFilters =
    selectedCategory !== 'all' || selectedSubcategory !== 'all' || selectedPlatform !== 'all' || searchTerm.trim() !== '';

  const clearFilters = () => {
    setSelectedCategory('all');
    setSelectedSubcategory('all');
    setSelectedPlatform('all');
    setSearchTerm('');
  };

  const handleOpenDetail = (item: ReferenceItem) => onNavigateRefDetail?.(item.id);

  const handleBackToList = () => {
    if (onBack) onBack();
    else onNavigateRefDetail?.(undefined);
  };

  // Detail route requested but the item isn't in the cached list yet
  if (initialRefId && !activeDetailItem) {
    if (loading) {
      return (
        <div className="space-y-6 animate-fadeIn">
          <BackButton label={backLabel || 'BACK TO REFERENCES'} onClick={handleBackToList} />
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
            <div className="lg:col-span-8 space-y-4">
              <div className="aspect-video rounded-2xl bg-[#121215] border border-[#27272a] animate-pulse" />
              <div className="h-7 w-3/4 rounded bg-[#18181b] animate-pulse" />
              <div className="h-4 w-1/3 rounded bg-[#18181b] animate-pulse" />
            </div>
            <div className="lg:col-span-4 h-64 rounded-2xl bg-[#121215] border border-[#27272a] animate-pulse" />
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-6 animate-fadeIn">
        <BackButton label={backLabel || 'BACK TO REFERENCES'} onClick={handleBackToList} />
        <Empty className="py-16 rounded-2xl bg-[#121215] border border-[#27272a]">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <SearchX className="w-5 h-5 text-zinc-400" />
            </EmptyMedia>
            <EmptyTitle className="font-heading font-bold text-base text-zinc-100">
              Reference not found
            </EmptyTitle>
            <EmptyDescription className="text-xs text-zinc-400">
              This reference may have been removed or unpublished.
            </EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <Button size="sm" onClick={() => onNavigateRefDetail?.(undefined)}>
              Browse all references
            </Button>
          </EmptyContent>
        </Empty>
      </div>
    );
  }

  if (activeDetailItem) {
    const item = activeDetailItem;
    const platform = item.platform || 'youtube';
    const directUrl = item.videoUrl || item.youtubeUrl || '';
    const category = CATEGORY_STYLES[item.category] ?? CATEGORY_STYLES.warzone;
    const addedOn = formatDate(item.dateAdded);
    const tips = item.tips?.filter((t) => t.trim()) ?? [];

    const related = publishedReferences
      .filter((r) => r.id !== item.id && r.category === item.category)
      .sort((a, b) => Number(b.subcategory === item.subcategory) - Number(a.subcategory === item.subcategory))
      .slice(0, RELATED_LIMIT);
    const hasSidebar = tips.length > 0 || related.length > 0;

    return (
      <div className="space-y-6 animate-fadeIn">
        <BackButton label={backLabel || 'BACK TO REFERENCES'} onClick={handleBackToList} />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
          <div className={`lg:col-span-8 min-w-0 space-y-6 ${hasSidebar ? '' : 'lg:col-start-3'}`}>
            <div className={platform === 'tiktok' ? 'rounded-2xl bg-[#0d0d11] border border-[#27272a] py-5 px-3' : ''}>
              <MultiPlatformVideoPlayer
                platform={platform}
                videoId={item.videoId}
                videoUrl={directUrl}
                title={item.title}
                thumbnailUrl={item.thumbnailUrl}
              />
            </div>

            <header className="space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#18181b] border border-[#27272a] text-zinc-200 text-xs font-tech font-medium">
                  <span className={`w-1.5 h-1.5 rounded-full ${category.dot}`} />
                  {CATEGORIES_CONFIG[item.category]?.label || category.label}
                </span>
                {item.subcategory && (
                  <span className="px-2.5 py-0.5 rounded-full bg-[#18181b] border border-[#27272a] text-zinc-300 text-xs font-tech font-medium">
                    {item.subcategory}
                  </span>
                )}
                <PlatformBadge platform={platform} />
              </div>

              <h1 className="text-xl sm:text-2xl md:text-3xl font-heading font-bold text-white tracking-tight leading-snug">
                {item.title}
              </h1>

              <div className="flex flex-wrap items-center justify-between gap-4">
                <p className="text-sm text-zinc-400">
                  <span className="text-zinc-200 font-medium">{item.author || 'Karuhun Tactical'}</span>
                  {addedOn && (
                    <>
                      <span className="mx-2 text-zinc-600" aria-hidden="true">·</span>
                      <time dateTime={item.dateAdded}>{addedOn}</time>
                    </>
                  )}
                </p>

                {directUrl && (
                  <div className="flex items-center gap-2">
                    <CopyLinkButton url={directUrl} />
                    <Button asChild size="sm">
                      <a href={directUrl} target="_blank" rel="noopener noreferrer">
                        <PlatformIcon platform={platform} className="w-3.5 h-3.5 fill-current" />
                        <span>Watch on {PLATFORM_LABELS[platform]}</span>
                      </a>
                    </Button>
                  </div>
                )}
              </div>
            </header>

            {item.description.trim() && (
              <section className="pt-6 border-t border-[#27272a] space-y-3">
                <h2 className="font-heading font-bold text-sm text-zinc-300 uppercase tracking-wider">
                  Rotation notes
                </h2>
                <MarkdownRenderer content={item.description} />
              </section>
            )}
          </div>

          {hasSidebar && (
            <aside className="lg:col-span-4 space-y-6">
              {tips.length > 0 && (
                <section className="minimal-card p-5 space-y-4">
                  <h2 className="font-heading font-bold text-sm text-zinc-300 uppercase tracking-wider">
                    Key tips
                  </h2>
                  <ol className="space-y-3.5">
                    {tips.map((tip, idx) => (
                      <li key={idx} className="flex gap-3">
                        <span className="flex-shrink-0 w-6 h-6 rounded-md bg-amber-400/10 border border-amber-400/25 text-amber-300 text-xs font-tech font-bold flex items-center justify-center tabular-nums">
                          {idx + 1}
                        </span>
                        <p className="text-sm text-zinc-300 leading-relaxed pt-0.5">{tip}</p>
                      </li>
                    ))}
                  </ol>
                </section>
              )}

              {related.length > 0 && (
                <section className="space-y-4">
                  <h2 className="font-heading font-bold text-sm text-zinc-300 uppercase tracking-wider">
                    More {category.label}
                  </h2>
                  <div className="space-y-4">
                    {related.map((ref) => (
                      <YoutubeReferenceCard key={ref.id} reference={ref} onOpen={handleOpenDetail} variant="compact" />
                    ))}
                  </div>
                </section>
              )}
            </aside>
          )}
        </div>
      </div>
    );
  }

  const subcategories = selectedCategory === 'all' ? [] : CATEGORIES_CONFIG[selectedCategory].subcategories;
  const featuredForTab = selectedCategory === 'all' ? [] : featured.byCategory[selectedCategory];
  const isRefining = selectedSubcategory !== 'all' || selectedPlatform !== 'all' || searchTerm.trim() !== '';
  const showFeatured =
    !loading && !isRefining && (selectedCategory === 'all' ? featured.hasAny : featuredForTab.length > 0);
  const sectionHeading = 'font-heading font-bold text-sm text-zinc-300 uppercase tracking-wider';
  const pillClass = (active: boolean) =>
    `px-3 py-1.5 rounded-lg text-xs font-tech font-bold transition-colors whitespace-nowrap shrink-0 ${
      active ? 'bg-white text-black' : 'bg-[#18181b] text-zinc-400 hover:text-white border border-[#27272a]'
    }`;

  return (
    <div className="space-y-6 sm:space-y-8 animate-fadeIn">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-5">
        <div className="space-y-1.5">
          <h1 className="text-2xl sm:text-3xl font-heading font-bold text-white tracking-tight">
            ROTATION <span className="text-zinc-500 font-normal">REFERENCES</span>
          </h1>
          <p className="text-sm text-zinc-400 max-w-xl">
            Clear runs and rotation guides for Warzone, PPC, and Guild Challenge, collected from YouTube, TikTok, and Bilibili.
          </p>
        </div>

        <SegmentedTabs
          options={REFERENCE_CATEGORY_OPTIONS}
          value={selectedCategory}
          onChange={(cat) => {
            setSelectedCategory(cat);
            setSelectedSubcategory('all');
          }}
          fullWidthOnMobile
        />
      </div>

      {showFeatured && (
        <section className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="space-y-1">
              <h2 className={sectionHeading}>
                This week{selectedCategory !== 'all' && ` · ${CATEGORY_STYLES[selectedCategory].label}`}
              </h2>
              <ResetCountdown featured={featured} />
            </div>
            {selectedCategory === 'all' && (
              <SegmentedTabs
                options={MODE_TAB_OPTIONS}
                value={featuredMode}
                onChange={setFeaturedMode}
                size="sm"
                fullWidthOnMobile
                ariaLabel="Featured mode"
              />
            )}
          </div>
          {selectedCategory === 'all' ? (
            <WeeklyFeaturedShowcase
              references={publishedReferences}
              featured={featured}
              mode={featuredMode}
              onOpen={handleOpenDetail}
            />
          ) : (
            <WeeklyFeaturedGrid items={featuredForTab} onOpen={handleOpenDetail} />
          )}
        </section>
      )}

      {showFeatured && <h2 className={`${sectionHeading} pt-2`}>All references</h2>}

      <div className={`minimal-card p-3 sm:p-4 space-y-3 ${showFeatured ? '-mt-2 sm:-mt-4' : ''}`}>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="search"
              aria-label="Search references"
              placeholder="Search title, author, or subcategory..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[#09090b] text-sm text-white placeholder:text-zinc-500 border border-[#27272a] rounded-xl pl-9 pr-4 py-2.5 focus:outline-none focus:border-amber-400 transition-colors"
            />
          </div>

          <div className="flex items-center gap-1 bg-[#09090b] p-1 rounded-xl border border-[#27272a] overflow-x-auto no-scrollbar">
            {PLATFORM_FILTERS.map((plat) => (
              <button
                key={plat}
                type="button"
                onClick={() => setSelectedPlatform(plat)}
                aria-pressed={selectedPlatform === plat}
                className={`flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 whitespace-nowrap px-3 py-1.5 rounded-lg text-xs font-tech font-bold transition-colors ${
                  selectedPlatform === plat ? 'bg-white text-black' : 'text-zinc-400 hover:text-white'
                }`}
              >
                {plat !== 'all' && <PlatformIcon platform={plat} className="w-3 h-3 fill-current" />}
                <span>{plat === 'all' ? 'All' : PLATFORM_LABELS[plat]}</span>
              </button>
            ))}
          </div>
        </div>

        {subcategories.length > 0 && (
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pt-3 border-t border-[#27272a]">
            <button type="button" onClick={() => setSelectedSubcategory('all')} className={pillClass(selectedSubcategory === 'all')}>
              All
            </button>
            {subcategories.map((sub) => (
              <button
                key={sub}
                type="button"
                onClick={() => setSelectedSubcategory(sub)}
                className={pillClass(selectedSubcategory.toLowerCase() === sub.toLowerCase())}
              >
                {sub}
              </button>
            ))}
          </div>
        )}
      </div>

      {!loading && (
        <div className="flex items-center justify-between gap-3 -mt-2 sm:-mt-4">
          <p className="text-xs font-tech text-zinc-400">
            <strong className="text-white tabular-nums">{filteredReferences.length}</strong>{' '}
            {filteredReferences.length === 1 ? 'reference' : 'references'}
          </p>
          {hasActiveFilters && (
            <button
              type="button"
              onClick={clearFilters}
              className="inline-flex items-center gap-1 text-xs font-tech text-zinc-400 hover:text-white transition-colors"
            >
              <X className="w-3.5 h-3.5" />
              Clear filters
            </button>
          )}
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-10">
          {Array.from({ length: 6 }, (_, i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      ) : filteredReferences.length === 0 ? (
        <Empty className="py-16 rounded-2xl bg-[#121215] border border-[#27272a]">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <SearchX className="w-5 h-5 text-zinc-400" />
            </EmptyMedia>
            <EmptyTitle className="font-heading font-bold text-sm text-zinc-200">
              No references match
            </EmptyTitle>
            <EmptyDescription className="text-xs text-zinc-400">
              Try a different keyword or loosen the filters.
            </EmptyDescription>
          </EmptyHeader>
          {hasActiveFilters && (
            <EmptyContent>
              <Button variant="secondary" size="sm" onClick={clearFilters}>
                Clear filters
              </Button>
            </EmptyContent>
          )}
        </Empty>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-10">
          {filteredReferences.map((refItem) => (
            <YoutubeReferenceCard key={refItem.id} reference={refItem} onOpen={handleOpenDetail} />
          ))}
        </div>
      )}
    </div>
  );
};
