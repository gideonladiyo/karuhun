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

  // Automatically clean outer ```markdown ... ``` wrapper if pasted by user
  let cleanContent = content.trim();
  if (cleanContent.startsWith('```markdown') && cleanContent.endsWith('```')) {
    cleanContent = cleanContent.slice(11, -3).trim();
  } else if (cleanContent.startsWith('```md') && cleanContent.endsWith('```')) {
    cleanContent = cleanContent.slice(5, -3).trim();
  }

  const lines = cleanContent.split('\n');
  const elements: React.ReactNode[] = [];

  let inCodeBlock = false;
  let codeBlockLines: string[] = [];

  const parseInline = (text: string): React.ReactNode[] => {
    const parts: React.ReactNode[] = [];
    let currentIndex = 0;

    // Pattern for bold (**text**), italic (*text* or _text_), and inline code (`code`)
    const regex = /(\*\*(.*?)\*\*|\*(.*?)\*|`(.*?)`)/g;
    let match: RegExpExecArray | null;

    while ((match = regex.exec(text)) !== null) {
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

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Handle Code Blocks (```)
    if (line.trim().startsWith('```')) {
      if (inCodeBlock) {
        // Closing code block
        elements.push(
          <div key={`code-${i}`} className="my-3 bg-[#09090b] p-4 rounded-xl border border-[#27272a] font-mono text-xs text-zinc-200 overflow-x-auto shadow-inner">
            <pre className="whitespace-pre-wrap leading-relaxed">{codeBlockLines.join('\n')}</pre>
          </div>
        );
        inCodeBlock = false;
        codeBlockLines = [];
      } else {
        // Opening code block
        inCodeBlock = true;
        codeBlockLines = [];
      }
      continue;
    }

    if (inCodeBlock) {
      codeBlockLines.push(line);
      continue;
    }

    // Horizontal Rule (---)
    if (line.trim() === '---' || line.trim() === '***') {
      elements.push(<hr key={`hr-${i}`} className="border-[#27272a] my-4" />);
      continue;
    }

    // Process Headers
    if (line.startsWith('#### ')) {
      elements.push(<h5 key={`h4-${i}`} className="text-xs font-heading font-bold text-zinc-200 uppercase tracking-wider mt-3 mb-1">{parseInline(line.slice(5))}</h5>);
      continue;
    }
    if (line.startsWith('### ')) {
      elements.push(<h4 key={`h3-${i}`} className="text-sm font-heading font-bold text-white mt-4 mb-1.5">{parseInline(line.slice(4))}</h4>);
      continue;
    }
    if (line.startsWith('## ')) {
      elements.push(<h3 key={`h2-${i}`} className="text-base font-heading font-bold text-white mt-5 mb-2">{parseInline(line.slice(3))}</h3>);
      continue;
    }
    if (line.startsWith('# ')) {
      elements.push(<h2 key={`h1-${i}`} className="text-lg font-heading font-bold text-white mt-6 mb-2.5">{parseInline(line.slice(2))}</h2>);
      continue;
    }

    // Process Blockquotes
    if (line.startsWith('> ')) {
      const quoteText = line.slice(2);
      if (quoteText.startsWith('[!NOTE]') || quoteText.startsWith('[!IMPORTANT]') || quoteText.startsWith('[!WARNING]')) {
        const cleanText = quoteText.replace(/\[!(NOTE|IMPORTANT|WARNING)\]/g, '').trim();
        elements.push(
          <blockquote key={`bq-${i}`} className="border-l-2 border-amber-400/80 pl-3 py-2 my-2 text-zinc-200 bg-amber-950/20 rounded-r-lg font-sans text-xs sm:text-sm">
            {parseInline(cleanText)}
          </blockquote>
        );
      } else {
        elements.push(
          <blockquote key={`bq-${i}`} className="border-l-2 border-white/60 pl-3 py-1 my-2 text-zinc-300 italic bg-[#121215] rounded-r-lg font-sans text-xs sm:text-sm">
            {parseInline(quoteText)}
          </blockquote>
        );
      }
      continue;
    }

    // Process Numbered Lists (1. item)
    const numMatch = line.match(/^(\d+)\.\s+(.*)/);
    if (numMatch) {
      elements.push(
        <div key={`num-${i}`} className="ml-2 text-zinc-300 text-xs sm:text-sm my-1 leading-relaxed flex items-start space-x-2">
          <span className="font-tech font-bold text-zinc-400 min-w-[18px]">{numMatch[1]}.</span>
          <div>{parseInline(numMatch[2])}</div>
        </div>
      );
      continue;
    }

    // Process Bullet Lists (- item or * item)
    if (line.startsWith('- ') || line.startsWith('* ')) {
      elements.push(
        <li key={`li-${i}`} className="ml-4 list-disc text-zinc-300 text-xs sm:text-sm my-1 leading-relaxed">
          {parseInline(line.slice(2))}
        </li>
      );
      continue;
    }

    // Normal Paragraph Line
    if (line.trim() === '') {
      elements.push(<div key={`blank-${i}`} className="h-1.5" />);
      continue;
    }

    elements.push(<p key={`p-${i}`} className="text-xs sm:text-sm font-sans text-zinc-300 leading-relaxed my-1">{parseInline(line)}</p>);
  }

  return <div className={`space-y-1 ${className}`}>{elements}</div>;
};
