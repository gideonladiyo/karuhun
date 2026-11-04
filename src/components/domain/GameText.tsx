import React from 'react';
import { cn } from '@/lib/utils';

const COLOR_TAG = /<color=[^>]*>(.*?)<\/color>/gi;

/**
 * Renders in-game rich text from the Huaxu API: `<color=#hex>…</color>` becomes a
 * highlighted span and literal "\n" sequences become line breaks.
 */
export const GameText: React.FC<{ text?: string | null; className?: string }> = ({ text, className }) => {
  if (!text) return null;
  const normalized = text.replace(/\n/g, '\n');
  const parts: React.ReactNode[] = [];
  let last = 0;
  for (const match of normalized.matchAll(COLOR_TAG)) {
    const index = match.index ?? 0;
    if (index > last) parts.push(normalized.slice(last, index));
    parts.push(
      <span key={index} className="font-semibold text-amber-200">
        {match[1]}
      </span>
    );
    last = index + match[0].length;
  }
  if (last < normalized.length) parts.push(normalized.slice(last));
  return <p className={cn('whitespace-pre-line', className)}>{parts}</p>;
};
