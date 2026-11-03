export interface DivisionTheme {
  label: string;
  textClass: string;
  dotClass: string;
  fallbackRank: number;
}

/**
 * Single source of truth for division tag styling and rank fallbacks.
 */
export function getDivisionTheme(tag?: string): DivisionTheme {
  if (tag === 'Competitive') {
    return {
      label: 'Competitive Division',
      textClass: 'text-amber-400',
      dotClass: 'bg-amber-400',
      fallbackRank: 1,
    };
  }
  if (tag === 'Sub-Competitive') {
    return {
      label: 'Sub-Competitive Division',
      textClass: 'text-zinc-200',
      dotClass: 'bg-sky-400',
      fallbackRank: 2,
    };
  }
  return {
    label: tag ? `${tag} Division` : 'Casual Division',
    textClass: 'text-zinc-400',
    dotClass: 'bg-zinc-500',
    fallbackRank: 4,
  };
}
