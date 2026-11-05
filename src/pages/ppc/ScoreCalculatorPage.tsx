import React, { useState } from 'react';
import { Check, Copy } from 'lucide-react';
import { getPpcStageScore, PpcStage, PpcTier, PPC_MAX_SEC } from '@/data/static/ppcScores';
import { SegmentedTabs, SegmentedTabOption } from '@/components/ui/segmented-tabs';
import { Button } from '@/components/ui/button';
import { formatNumber } from '@/lib/format';
import { cn } from '@/lib/utils';

type Mode = 'compare' | 'single';

const MODE_OPTIONS: SegmentedTabOption<Mode>[] = [
  { value: 'compare', label: 'Compare runs' },
  { value: 'single', label: 'Single run' },
];
const TIER_OPTIONS: SegmentedTabOption<PpcTier>[] = [
  { value: 'ultimate', label: 'Ultimate' },
  { value: 'advanced', label: 'Advanced' },
];
const RUN_COUNT_OPTIONS: SegmentedTabOption<'2' | '3'>[] = [
  { value: '2', label: '2' },
  { value: '3', label: '3' },
];
const BOSS_COUNT_OPTIONS: SegmentedTabOption<'1' | '2' | '3'>[] = [
  { value: '1', label: '1' },
  { value: '2', label: '2' },
  { value: '3', label: '3' },
];

const STAGES: { key: PpcStage; label: string }[] = [
  { key: 'knight', label: 'Knight' },
  { key: 'chaos', label: 'Chaos' },
  { key: 'hell', label: 'Hell' },
];
const RUN_NAMES = ['A', 'B', 'C'];
const MAX_TIMERS = 9; // 3 bosses × 3 stages
const repeat = (pattern: number[]) => Array.from({ length: MAX_TIMERS }, (_, i) => pattern[i % pattern.length]);
const DEFAULT_RUNS = [repeat([5, 10, 15]), repeat([8, 12, 18]), repeat([10, 15, 20])];

const clampSec = (value: number) => Math.max(0, Math.min(PPC_MAX_SEC, Math.round(value) || 0));
const labelClass = 'block text-[11px] font-tech font-semibold text-zinc-500 uppercase tracking-wider';

const ControlGroup: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
  <div className="space-y-1.5">
    <span className={labelClass}>{label}</span>
    {children}
  </div>
);

const SecondsInput: React.FC<{ value: number; onChange: (value: number) => void; label: string; className?: string }> = ({
  value,
  onChange,
  label,
  className,
}) => (
  <div className={cn('relative', className)}>
    <input
      type="number"
      inputMode="numeric"
      min={0}
      max={PPC_MAX_SEC}
      value={value}
      aria-label={label}
      onChange={(e) => onChange(clampSec(Number(e.target.value)))}
      onFocus={(e) => e.target.select()}
      className="w-full bg-[#09090b] border border-[#27272a] rounded-lg pl-3 pr-6 py-2 text-sm font-tech font-bold text-white text-right tabular-nums focus:outline-none focus:border-amber-400 transition-colors [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
    />
    <span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-zinc-500">s</span>
  </div>
);

export const ScoreCalculatorPage: React.FC = () => {
  const [mode, setMode] = useState<Mode>('compare');
  const [tier, setTier] = useState<PpcTier>('ultimate');
  const [runCount, setRunCount] = useState<2 | 3>(2);
  const [bossCount, setBossCount] = useState<1 | 2 | 3>(1);
  const [runs, setRuns] = useState<number[][]>(DEFAULT_RUNS);
  const [single, setSingle] = useState<number[]>([5, 10, 15]);
  const [copied, setCopied] = useState(false);

  const timerCount = bossCount * 3;
  const scoreAt = (timerIndex: number, sec: number) => getPpcStageScore(tier, STAGES[timerIndex % 3].key, sec);

  const activeRuns = runs.slice(0, runCount).map((timers) => timers.slice(0, timerCount));
  const totals = activeRuns.map((timers) => timers.reduce((sum, sec, i) => sum + scoreAt(i, sec), 0));
  const best = Math.max(...totals);
  const leader = totals.indexOf(best);
  const isTie = totals.every((t) => t === best);
  const runnerUp = totals.reduce((acc, t, i) => (i !== leader && (acc === -1 || t > totals[acc]) ? i : acc), -1);

  const singleScores = single.map((sec, i) => scoreAt(i, sec));
  const singleTotal = singleScores.reduce((sum, n) => sum + n, 0);

  const updateRun = (run: number, index: number, value: number) =>
    setRuns((prev) => prev.map((t, r) => (r === run ? t.map((s, i) => (i === index ? value : s)) : t)));
  const updateSingle = (index: number, value: number) =>
    setSingle((prev) => prev.map((s, i) => (i === index ? value : s)));

  const command =
    mode === 'single'
      ? `${tier === 'ultimate' ? '!ult' : '!adv'}total ${single.join(' ')}`
      : `!comparetotal ${activeRuns.map((t) => t.join(' ')).join(' vs ')}`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(command);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // Clipboard unavailable; the command is still selectable.
    }
  };

  const context = `${tier === 'ultimate' ? 'Ultimate' : 'Advanced'} · ${
    mode === 'single' ? '1 boss' : `${bossCount} ${bossCount === 1 ? 'boss' : 'bosses'}`
  }`;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end gap-x-6 gap-y-4 pb-6 border-b border-[#27272a]">
        <ControlGroup label="Mode">
          <SegmentedTabs options={MODE_OPTIONS} value={mode} onChange={setMode} size="sm" ariaLabel="Calculator mode" />
        </ControlGroup>
        <ControlGroup label="Tier">
          <SegmentedTabs options={TIER_OPTIONS} value={tier} onChange={setTier} size="sm" ariaLabel="PPC tier" />
        </ControlGroup>
        {mode === 'compare' && (
          <>
            <ControlGroup label="Runs">
              <SegmentedTabs
                options={RUN_COUNT_OPTIONS}
                value={String(runCount) as '2' | '3'}
                onChange={(v) => setRunCount(Number(v) as 2 | 3)}
                size="sm"
                ariaLabel="Number of runs"
              />
            </ControlGroup>
            <ControlGroup label="Bosses">
              <SegmentedTabs
                options={BOSS_COUNT_OPTIONS}
                value={String(bossCount) as '1' | '2' | '3'}
                onChange={(v) => setBossCount(Number(v) as 1 | 2 | 3)}
                size="sm"
                ariaLabel="Number of bosses"
              />
            </ControlGroup>
          </>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className="lg:col-span-8 min-w-0">
          {mode === 'compare' ? (
            <div className="rounded-xl border border-[#27272a] bg-[#121215] overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[#27272a]">
                    <th scope="col" className={cn(labelClass, 'text-left px-4 py-3 w-24 sm:w-32')}>
                      Clear time
                    </th>
                    {activeRuns.map((_, r) => (
                      <th key={r} scope="col" className="px-3 py-3 text-right font-heading font-bold text-white">
                        Run {RUN_NAMES[r]}
                      </th>
                    ))}
                  </tr>
                </thead>
                {Array.from({ length: bossCount }, (_, b) => (
                  <tbody key={b} className={b > 0 ? 'border-t border-[#27272a]' : undefined}>
                    {bossCount > 1 && (
                      <tr>
                        <th scope="rowgroup" colSpan={runCount + 1} className={cn(labelClass, 'text-left px-4 pt-4 pb-1')}>
                          Boss {b + 1}
                        </th>
                      </tr>
                    )}
                    {STAGES.map((stage, s) => {
                      const i = b * 3 + s;
                      return (
                        <tr key={stage.key}>
                          <th scope="row" className="text-left px-4 py-2 font-normal text-zinc-300 align-top pt-4">
                            {stage.label}
                          </th>
                          {activeRuns.map((timers, r) => (
                            <td key={r} className="px-3 py-2">
                              <SecondsInput
                                value={timers[i]}
                                onChange={(v) => updateRun(r, i, v)}
                                label={`Run ${RUN_NAMES[r]}, boss ${b + 1}, ${stage.label} clear time`}
                              />
                              <div className="mt-1 text-right text-[11px] font-tech text-zinc-500 tabular-nums">
                                {formatNumber(scoreAt(i, timers[i]))}
                              </div>
                            </td>
                          ))}
                        </tr>
                      );
                    })}
                  </tbody>
                ))}
                <tfoot>
                  <tr className="border-t border-[#27272a] bg-[#0d0d10]">
                    <th scope="row" className={cn(labelClass, 'text-left px-4 py-3')}>
                      Total
                    </th>
                    {totals.map((total, r) => (
                      <td key={r} className="px-3 py-3 text-right">
                        <div
                          className={cn(
                            'font-heading font-bold text-base tabular-nums',
                            !isTie && r === leader ? 'text-amber-400' : 'text-white'
                          )}
                        >
                          {formatNumber(total)}
                        </div>
                        <div className="text-[11px] font-tech text-zinc-500 tabular-nums">
                          {isTie ? 'Tied' : r === leader ? 'Best' : `−${formatNumber(best - total)}`}
                        </div>
                      </td>
                    ))}
                  </tr>
                </tfoot>
              </table>
            </div>
          ) : (
            <div className="rounded-xl border border-[#27272a] bg-[#121215] divide-y divide-[#27272a]">
              {STAGES.map((stage, i) => (
                <div
                  key={stage.key}
                  className="px-4 py-4 space-y-3 sm:space-y-0 sm:grid sm:grid-cols-[4.5rem_1fr_5.5rem_7rem] sm:items-center sm:gap-4"
                >
                  <div className="flex items-baseline justify-between sm:contents">
                    <span className="text-sm text-zinc-300 sm:col-start-1 sm:row-start-1">{stage.label}</span>
                    <span className="font-tech font-bold text-zinc-100 tabular-nums text-right sm:col-start-4 sm:row-start-1">
                      {formatNumber(singleScores[i])}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 sm:contents">
                    <input
                      type="range"
                      min={0}
                      max={PPC_MAX_SEC}
                      value={single[i]}
                      onChange={(e) => updateSingle(i, Number(e.target.value))}
                      aria-label={`${stage.label} clear time slider`}
                      className="flex-1 w-full cursor-pointer accent-amber-400 sm:col-start-2 sm:row-start-1"
                    />
                    <SecondsInput
                      value={single[i]}
                      onChange={(v) => updateSingle(i, v)}
                      label={`${stage.label} clear time`}
                      className="w-20 sm:w-auto sm:col-start-3 sm:row-start-1"
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
          <p className="mt-3 text-xs text-zinc-500">
            Clear time in seconds, 0–{PPC_MAX_SEC}. Faster clears score higher.
          </p>
        </div>

        <aside className="lg:col-span-4 space-y-4 lg:sticky lg:top-24">
          <div className="rounded-xl border border-[#27272a] bg-[#121215] p-5 space-y-2">
            <p className={labelClass}>{context}</p>
            {mode === 'single' ? (
              <>
                <p className="font-heading font-black text-4xl text-amber-400 tabular-nums leading-none pt-1">
                  {formatNumber(singleTotal)}
                </p>
                <p className="text-sm text-zinc-400">Boss total</p>
              </>
            ) : isTie ? (
              <>
                <p className="font-heading font-bold text-2xl text-white pt-1">Dead even</p>
                <p className="text-sm text-zinc-400">
                  Every run lands on <span className="text-zinc-200 tabular-nums">{formatNumber(best)}</span>.
                </p>
              </>
            ) : (
              <>
                <p className="font-heading font-bold text-2xl text-white pt-1">
                  Run <span className="text-amber-400">{RUN_NAMES[leader]}</span> wins
                </p>
                <p className="text-sm text-zinc-400">
                  <span className="text-zinc-200 tabular-nums">+{formatNumber(best - totals[runnerUp])}</span> over Run{' '}
                  {RUN_NAMES[runnerUp]}
                </p>
              </>
            )}
          </div>

          <div className="rounded-xl border border-[#27272a] bg-[#121215] p-5 space-y-3">
            <div className="flex items-center justify-between gap-3">
              <p className="font-heading font-bold text-sm text-white">Agus bot command</p>
              <Button variant="secondary" size="sm" onClick={handleCopy}>
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </Button>
            </div>
            <code className="block bg-[#09090b] border border-[#27272a] rounded-lg px-3 py-2.5 font-mono text-xs text-zinc-200 break-all select-all">
              {command}
            </code>
            <p className="text-xs text-zinc-500">Paste it in Discord to check the same numbers with the bot.</p>
          </div>
        </aside>
      </div>
    </div>
  );
};
