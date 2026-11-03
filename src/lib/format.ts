/**
 * Shared number and metric formatting utilities across Karuhun Portal.
 */

export function formatNumber(num?: number | null): string {
  if (num === undefined || num === null || Number.isNaN(num)) return '—';
  return num.toLocaleString();
}

export function formatHp(num?: number | null): string {
  if (!num || Number.isNaN(num)) return '—';
  if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(1)}M`;
  if (num >= 1_000) return `${(num / 1_000).toFixed(0)}k`;
  return num.toString();
}

export function formatCompact(num?: number | null): string {
  if (num === undefined || num === null || Number.isNaN(num)) return '—';
  if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(1).replace(/\.0$/, '')}M`;
  if (num >= 1_000) return `${(num / 1_000).toFixed(1).replace(/\.0$/, '')}K`;
  return num.toString();
}
