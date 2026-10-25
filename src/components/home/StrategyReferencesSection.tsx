import React, { useState, useEffect } from 'react';
import { BookOpen, Swords, Skull, Shield, ChevronRight, Sparkles } from 'lucide-react';
import { 
  fetchLiveReferences, 
  getStoredReferences, 
  ReferenceItem 
} from '@/data/static/reffsData';
import { YoutubeReferenceCard } from '@/components/reffs/YoutubeReferenceCard';
import { MainTab } from '@/pages/HomePage';

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
  const recentGuides = filteredReferences.slice(1, 4);

  return (
    <section className="relative w-full mb-14 sm:mb-20 animate-fadeIn">
      
      {/* Section Top Header & Filters */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6 sm:mb-8 pb-4 border-b border-[#27272a]">
        <div>
          <div className="inline-flex items-center space-x-2 px-2.5 py-1 rounded-full bg-red-600/10 border border-red-500/20 text-red-400 text-[11px] font-tech font-bold uppercase tracking-wider mb-2">
            <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
              <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
            </svg>
            <span>TACTICAL VIDEO THEATER</span>
          </div>
          <h2 className="font-heading font-black text-2xl sm:text-4xl text-white tracking-tight">
            PGR REFERENCES
          </h2>
          <p className="text-zinc-400 text-xs sm:text-sm font-sans mt-1">
            Curated combat rotations, high-score reference runs, and tactical gameplay guides compiled by union veterans and dalaos.
          </p>
        </div>

        {/* Controls: Filter Pills */}
        <div className="flex flex-wrap items-center gap-2.5 self-stretch md:self-auto">
          <div className="flex items-center space-x-1 bg-[#121215] p-1 rounded-xl border border-[#27272a]">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-tech font-bold transition-all ${
                selectedCategory === 'all'
                  ? 'bg-white text-black shadow-sm'
                  : 'text-zinc-400 hover:text-white hover:bg-[#18181b]'
              }`}
            >
              ALL
            </button>
            <button
              onClick={() => setSelectedCategory('warzone')}
              className={`px-3 py-1.5 rounded-lg text-xs font-tech font-bold transition-all flex items-center space-x-1 ${
                selectedCategory === 'warzone'
                  ? 'bg-white text-black shadow-sm'
                  : 'text-zinc-400 hover:text-white hover:bg-[#18181b]'
              }`}
            >
              <Swords className="w-3 h-3" />
              <span>WARZONE</span>
            </button>
            <button
              onClick={() => setSelectedCategory('ppc')}
              className={`px-3 py-1.5 rounded-lg text-xs font-tech font-bold transition-all flex items-center space-x-1 ${
                selectedCategory === 'ppc'
                  ? 'bg-white text-black shadow-sm'
                  : 'text-zinc-400 hover:text-white hover:bg-[#18181b]'
              }`}
            >
              <Skull className="w-3 h-3" />
              <span>PPC</span>
            </button>
            <button
              onClick={() => setSelectedCategory('guild_challenge')}
              className={`px-3 py-1.5 rounded-lg text-xs font-tech font-bold transition-all flex items-center space-x-1 ${
                selectedCategory === 'guild_challenge'
                  ? 'bg-white text-black shadow-sm'
                  : 'text-zinc-400 hover:text-white hover:bg-[#18181b]'
              }`}
            >
              <Shield className="w-3 h-3" />
              <span>SIEGE</span>
            </button>
          </div>
        </div>
      </div>

      {/* Loading Skeleton */}
      {loading && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-7 h-96 rounded-3xl bg-[#121215] border border-[#27272a] animate-pulse" />
          <div className="lg:col-span-5 space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-32 rounded-2xl bg-[#121215] border border-[#27272a] animate-pulse" />
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {!loading && filteredReferences.length === 0 && (
        <div className="py-16 text-center text-zinc-500 space-y-2 rounded-2xl bg-[#121215] border border-[#27272a]">
          <BookOpen className="w-8 h-8 mx-auto text-zinc-600 opacity-50" />
          <div className="font-heading font-bold text-sm text-zinc-300">No references yet</div>
          <div className="text-xs font-sans">No reference guides found in this category.</div>
        </div>
      )}

      {/* Grid: 1 Large YouTube Featured Spotlight (Left 7 cols) + 3 Recent YouTube Guides (Right 5 cols) */}
      {!loading && featuredGuide && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          
          {/* LEFT 7 COLS: YouTube Style Featured Spotlight */}
          <div className="lg:col-span-7 flex flex-col">
            <YoutubeReferenceCard
              reference={featuredGuide}
              onOpen={(item) => onNavigateRefDetail(item.id)}
              variant="featured"
              className="h-full"
            />
          </div>

          {/* RIGHT 5 COLS: YouTube Style Recent Guides Stack */}
          <div className="lg:col-span-5 flex flex-col justify-between space-y-3.5">
            
            <div className="flex items-center justify-between pb-0.5 px-1">
              <span className="font-heading font-bold text-xs uppercase tracking-wider text-zinc-300 flex items-center space-x-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>RECENT OPERATOR RUNS</span>
              </span>
              <span className="text-[10px] font-tech text-zinc-500">
                {recentGuides.length} reference{recentGuides.length > 1 ? 's' : ''}
              </span>
            </div>

            {/* List of YouTube Cards (Kotak thumbnail di atas, Title/views di bawahnya, bg-transparent) */}
            <div className="space-y-6 flex-1">
              {recentGuides.slice(0, 2).map((guide) => (
                <YoutubeReferenceCard
                  key={guide.id}
                  reference={guide}
                  onOpen={(item) => onNavigateRefDetail(item.id)}
                  variant="grid"
                />
              ))}

              {recentGuides.length === 0 && (
                <div className="py-10 text-center text-zinc-500 bg-[#121215] rounded-2xl border border-[#27272a] text-xs font-tech">
                  No additional runs in this category yet.
                </div>
              )}
            </div>

            {/* Bottom Catalog Action Link */}
            <div className="p-3.5 rounded-2xl bg-[#0d0d11] border border-[#27272a] flex items-center justify-between text-xs font-tech text-zinc-400 hover:border-zinc-500 transition-colors">
              <span className="text-[11px] sm:text-xs">Explore all Warzone, PPC &amp; Siege references</span>
              <button
                onClick={() => onNavigate('reffs')}
                className="text-red-400 hover:text-red-300 font-bold flex items-center space-x-1 ml-2 flex-shrink-0"
              >
                <span>Full Library</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

          </div>

        </div>
      )}

    </section>
  );
};
