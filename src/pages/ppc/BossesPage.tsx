import React, { useState, useEffect } from 'react';
import { getLiveOrStoredPpcBossesInfo, getLiveOrStoredPpcBossesInfoAsync, PPCBossInfo } from '@/data/static/ppcScores';
import { Search, SearchX } from 'lucide-react';
import { formatNumber } from '@/lib/format';
import { SafeImage } from '@/components/ui/safe-image';
import { Empty, EmptyHeader, EmptyMedia, EmptyTitle, EmptyDescription } from '@/components/ui/empty';

const NO_WEAKNESS = 'No elemental weakness spec.';

function formatUpdated(value?: string): string {
  if (!value) return '';
  const date = new Date(value);
  if (isNaN(date.getTime())) return '';
  return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

const Weakness: React.FC<{ text: string }> = ({ text }) =>
  text && text !== NO_WEAKNESS ? (
    <span className="text-zinc-300">{text}</span>
  ) : (
    <span className="text-zinc-600">—</span>
  );

const BossThumb: React.FC<{ boss: PPCBossInfo; className: string }> = ({ boss, className }) => (
  <div className={`${className} shrink-0 rounded-lg bg-black border border-[#27272a] overflow-hidden`}>
    <SafeImage src={boss.imageUrl} alt="" hideOnError className="w-full h-full object-cover" />
  </div>
);

export const BossesPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [bossesData, setBossesData] = useState<{ updatedAt?: string; bosses: PPCBossInfo[] }>(() =>
    getLiveOrStoredPpcBossesInfo()
  );

  useEffect(() => {
    getLiveOrStoredPpcBossesInfoAsync().then((res) => {
      if (res && res.bosses && res.bosses.length > 0) {
        setBossesData(res);
      }
    });
  }, []);

  const query = searchTerm.toLowerCase().trim();
  const filteredBosses = bossesData.bosses.filter(
    (boss) => !query || boss.name.toLowerCase().includes(query) || boss.weakness.toLowerCase().includes(query)
  );
  const updated = formatUpdated(bossesData.updatedAt);

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative sm:w-80">
          <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="search"
            aria-label="Search bosses"
            placeholder="Search boss or weakness..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[#09090b] text-sm text-white placeholder:text-zinc-500 border border-[#27272a] rounded-xl pl-9 pr-4 py-2.5 focus:outline-none focus:border-amber-400 transition-colors"
          />
        </div>
        <p className="text-xs font-tech text-zinc-400">
          <strong className="text-white tabular-nums">{filteredBosses.length}</strong>
          {filteredBosses.length !== bossesData.bosses.length && ` of ${bossesData.bosses.length}`} bosses
          {updated && <span className="text-zinc-500"> · updated {updated}</span>}
        </p>
      </div>

      {filteredBosses.length === 0 ? (
        <Empty className="py-16 rounded-xl bg-[#121215] border border-[#27272a]">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <SearchX className="w-5 h-5 text-zinc-400" />
            </EmptyMedia>
            <EmptyTitle className="font-heading font-bold text-sm text-zinc-200">No bosses match</EmptyTitle>
            <EmptyDescription className="text-xs text-zinc-400">Try a different name or element.</EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <>
          {/* md and up: one scannable table so HP values line up across bosses */}
          <div className="hidden md:block rounded-xl border border-[#27272a] bg-[#121215] overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#27272a] text-[11px] font-tech font-semibold text-zinc-500 uppercase tracking-wider">
                  <th scope="col" className="text-left px-4 py-3">Boss</th>
                  <th scope="col" className="text-right px-3 py-3">Delay</th>
                  <th scope="col" className="text-right px-3 py-3">Knight HP</th>
                  <th scope="col" className="text-right px-3 py-3">Chaos HP</th>
                  <th scope="col" className="text-right px-3 py-3">Hell HP</th>
                  <th scope="col" className="text-left px-4 py-3">Weakness</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#27272a]">
                {filteredBosses.map((boss) => (
                  <tr key={boss.slug || boss.name} className="hover:bg-[#18181b]/60 transition-colors">
                    <th scope="row" className="text-left px-4 py-3 font-normal">
                      <div className="flex items-center gap-3">
                        <BossThumb boss={boss} className="w-10 h-10" />
                        <span className="font-heading font-bold text-white">{boss.name}</span>
                      </div>
                    </th>
                    <td className="px-3 py-3 text-right font-tech text-zinc-300 tabular-nums">{boss.startTimeSec}s</td>
                    <td className="px-3 py-3 text-right font-tech text-zinc-300 tabular-nums">{formatNumber(boss.hpKnight)}</td>
                    <td className="px-3 py-3 text-right font-tech text-zinc-300 tabular-nums">{formatNumber(boss.hpChaos)}</td>
                    <td className="px-3 py-3 text-right font-tech font-bold text-white tabular-nums">{formatNumber(boss.hpHell)}</td>
                    <td className="px-4 py-3 text-xs leading-relaxed max-w-xs">
                      <Weakness text={boss.weakness} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Below md: stacked rows */}
          <ul className="md:hidden rounded-xl border border-[#27272a] bg-[#121215] divide-y divide-[#27272a]">
            {filteredBosses.map((boss) => (
              <li key={boss.slug || boss.name} className="p-4 space-y-3">
                <div className="flex items-center gap-3">
                  <BossThumb boss={boss} className="w-12 h-12" />
                  <div className="min-w-0">
                    <p className="font-heading font-bold text-white truncate">{boss.name}</p>
                    <p className="text-xs font-tech text-zinc-400">
                      Delay <span className="text-zinc-200 tabular-nums">{boss.startTimeSec}s</span>
                    </p>
                  </div>
                </div>
                <dl className="grid grid-cols-3 gap-2 text-xs font-tech">
                  {(
                    [
                      ['Knight', boss.hpKnight],
                      ['Chaos', boss.hpChaos],
                      ['Hell', boss.hpHell],
                    ] as const
                  ).map(([label, hp]) => (
                    <div key={label}>
                      <dt className="text-zinc-500">{label}</dt>
                      <dd className={`tabular-nums ${label === 'Hell' ? 'font-bold text-white' : 'text-zinc-300'}`}>
                        {formatNumber(hp)}
                      </dd>
                    </div>
                  ))}
                </dl>
                <p className="text-xs leading-relaxed">
                  <span className="text-zinc-500">Weakness </span>
                  <Weakness text={boss.weakness} />
                </p>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
};
