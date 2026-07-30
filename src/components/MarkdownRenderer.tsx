import React from 'react';

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

/**
 * Lightweight, secure Markdown renderer for description fields.
 * Supports headers (#, ##, ###), bold (**text**), italics (*text*),
 * bullet lists (- item), inline code (`code`), and blockquotes (> text).
 */
export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content, className = '' }) => {
  if (!content) return null;

  const renderFormattedLine = (line: string) => {
    // Process Headers
    if (line.startsWith('### ')) {
      return <h4 className="text-sm font-heading font-bold text-white mt-3 mb-1.5">{parseInline(line.slice(4))}</h4>;
    }
    if (line.startsWith('## ')) {
      return <h3 className="text-base font-heading font-bold text-white mt-4 mb-2">{parseInline(line.slice(3))}</h3>;
    }
    if (line.startsWith('# ')) {
      return <h2 className="text-lg font-heading font-bold text-white mt-5 mb-2.5">{parseInline(line.slice(2))}</h2>;
    }

    // Process Blockquotes
    if (line.startsWith('> ')) {
      return (
        <blockquote className="border-l-2 border-white/60 pl-3 py-1 my-2 text-zinc-300 italic bg-[#121215] rounded-r-lg font-sans text-xs sm:text-sm">
          {parseInline(line.slice(2))}
        </blockquote>
      );
    }

    // Process Bullet Lists
    if (line.startsWith('- ') || line.startsWith('* ')) {
      return (
        <li className="ml-4 list-disc text-zinc-300 text-xs sm:text-sm my-1 leading-relaxed">
          {parseInline(line.slice(2))}
        </li>
      );
    }

    // Normal Paragraph Line
    if (line.trim() === '') {
      return <div className="h-2" />;
    }

    return <p className="text-xs sm:text-sm font-sans text-zinc-300 leading-relaxed my-1">{parseInline(line)}</p>;
  };

  const parseInline = (text: string): React.ReactNode[] => {
    const parts: React.ReactNode[] = [];
    let currentIndex = 0;

    // Pattern for bold (**text**), italic (*text* or _text_), and inline code (`code`)
    const regex = /(\*\*(.*?)\*\*|\*(.*?)\*|`(.*?)`)/g;
    let match: RegExpExecArray | null;

    while ((match = regex.exec(text)) !== null) {
      // Push preceding normal text
      if (match.index > currentIndex) {
        parts.push(text.slice(currentIndex, match.index));
      }

      if (match[2] !== undefined) {
        // Bold
        parts.push(
          <strong key={match.index} className="font-bold text-white">
            {match[2]}
          </strong>
        );
      } else if (match[3] !== undefined) {
        // Italic
        parts.push(
          <em key={match.index} className="italic text-zinc-200">
            {match[3]}
          </em>
        );
      } else if (match[4] !== undefined) {
        // Inline Code
        parts.push(
          <code key={match.index} className="bg-[#18181b] text-white px-1.5 py-0.5 rounded border border-[#27272a] font-tech text-xs">
            {match[4]}
          </code>
        );
      }

      currentIndex = match.index + match[0].length;
    }

    if (currentIndex < text.length) {
      parts.push(text.slice(currentIndex));
    }

    return parts;
  };

  const lines = content.split('\n');

  return (
    <div className={`space-y-1 ${className}`}>
      {lines.map((line, idx) => (
        <React.Fragment key={idx}>{renderFormattedLine(line)}</React.Fragment>
      ))}
    </div>
  );
};
