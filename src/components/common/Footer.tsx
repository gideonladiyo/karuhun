import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer className="border-t border-[#27272a] bg-[#09090b] py-8 text-center text-xs font-tech text-zinc-400 space-y-3">
      <p className="font-heading font-bold text-zinc-200 tracking-wider">
        KARUHUN (夜) GUILD • PUNISHING: GRAY RAVEN GLOBAL
      </p>
      <div className="flex flex-wrap items-center justify-center gap-3 text-xs pt-1">
        <a
          href="https://discord.gg/Cz9bzjcdV"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-[#18181b] border border-[#27272a] hover:border-white text-zinc-300 hover:text-white transition-all"
        >
          <span>JOIN DISCORD (Cz9bzjcdV)</span>
        </a>
        <span className="text-zinc-600">•</span>
        <a
          href="https://huaxu.app"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-[#18181b] border border-[#27272a] hover:border-white text-zinc-300 hover:text-white transition-all"
        >
          <span>Data &amp; Assets Powered by Huaxu App</span>
        </a>
      </div>
      <p className="text-[11px] text-zinc-500 pt-1 font-mono">
        © 2026 KARUHUN
      </p>
    </footer>
  );
};
