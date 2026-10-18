import { useEffect, useState } from 'react';

export type HeroVariant = 'control' | 'categories';

/**
 * PRD R4 experiment toggle.
 * Append `?hero=categories` to the homepage URL to enable the category card grid.
 * Anything else (including no query param) renders the control variant with the original CTAs.
 */
export const useHeroVariant = (): HeroVariant => {
  const [variant, setVariant] = useState<HeroVariant>('control');

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    setVariant(params.get('hero') === 'categories' ? 'categories' : 'control');
  }, []);

  return variant;
};