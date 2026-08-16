import React from 'react';
import { Shield, ArrowUp, ExternalLink, ChevronRight } from 'lucide-react';
import { MainTab } from '@/pages/HomePage';

interface HomepageFooterProps {
  onNavigate: (tab: MainTab, branchId?: number) => void;
}

export const HomepageFooter: React.FC<HomepageFooterProps> = ({ onNavigate }) => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="relative z-10 w-full pt-12 sm:pt-16 pb-16 sm:pb-20 border-t border-[#27272a] bg-[#09090b]/95 backdrop-blur-md text-zinc-400 font-sans mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Top Status Strip */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pb-8 mb-8 border-b border-[#27272a]/60 text-xs font-tech">
          <div className="flex items-center space-x-2 text-emerald-400">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="tracking-wider uppercase font-bold">SYSTEM ALLIANCE ONLINE // CYCLE 2026</span>
          </div>

          <button
            onClick={scrollToTop}
            className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg bg-[#18181b] hover:bg-zinc-800 text-zinc-300 hover:text-white border border-[#27272a] text-xs font-tech transition-all focus-tactical shadow-sm"
          >
            <ArrowUp className="w-3.5 h-3.5" />
            <span>BACK TO TOP</span>
          </button>
        </div>

        {/* Main Grid: 3 Main Columns */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 sm:gap-10 mb-12">
          
          {/* Col 1: Guild Identity & Mission (5 of 12) */}
          <div className="lg:col-span-5 space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-amber-400 text-black flex items-center justify-center font-heading font-black text-xl shadow-lg">
                夜
              </div>
              <div>
                <div className="font-heading font-black text-lg text-white tracking-wider">
                  KARUHUN UNION
                </div>
                <div className="text-[10px] font-tech text-amber-400 tracking-widest uppercase">
                  PUNISHING: GRAY RAVEN GLOBAL
                </div>
              </div>
            </div>

            <p className="text-xs text-zinc-400 leading-relaxed max-w-sm font-sans">
              Official competitive Punishing: Gray Raven guild union across Asia-Pacific and North America servers. Uniting passionate commanders through high-score optimization, tactical strategy guides, and dedicated Simulated Siege teamwork.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <a
                href="https://discord.gg/Cz9bzjcdV"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl bg-[#18181b] hover:bg-[#27272a] border border-[#27272a] hover:border-zinc-500 text-xs font-tech text-zinc-200 hover:text-white transition-all shadow-sm"
              >
                <span>DISCORD SERVER</span>
                <ExternalLink className="w-3 h-3 text-amber-400" />
              </a>

              <a
                href="https://huaxu.app"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl bg-[#18181b] hover:bg-[#27272a] border border-[#27272a] hover:border-zinc-500 text-xs font-tech text-zinc-200 hover:text-white transition-all shadow-sm"
              >
                <span>HUAXU APP</span>
                <ExternalLink className="w-3 h-3 text-zinc-400" />
              </a>
            </div>
          </div>

          {/* Col 2: Core Navigation (3 of 12) */}
          <div className="lg:col-span-3 space-y-3">
            <div className="text-xs font-tech text-white uppercase tracking-wider font-bold">
              PORTAL SECTIONS
            </div>
            <ul className="space-y-2 text-xs font-sans">
              <li>
                <button
                  onClick={() => onNavigate('hub')}
                  className="hover:text-amber-300 transition-colors flex items-center space-x-1"
                >
                  <ChevronRight className="w-3 h-3 text-zinc-600" />
                  <span>Guild Hub &amp; Branches</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('hub')}
                  className="hover:text-amber-300 transition-colors flex items-center space-x-1"
                >
                  <ChevronRight className="w-3 h-3 text-zinc-600" />
                  <span>Alliance Member Roster</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('leaderboards')}
                  className="hover:text-amber-300 transition-colors flex items-center space-x-1"
                >
                  <ChevronRight className="w-3 h-3 text-zinc-600" />
                  <span>Competitive Leaderboards</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('ppc')}
                  className="hover:text-amber-300 transition-colors flex items-center space-x-1"
                >
                  <ChevronRight className="w-3 h-3 text-zinc-600" />
                  <span>PPC Tactical Tools</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('reffs')}
                  className="hover:text-amber-300 transition-colors flex items-center space-x-1"
                >
                  <ChevronRight className="w-3 h-3 text-zinc-600" />
                  <span>Strategy References</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('contact')}
                  className="hover:text-amber-300 transition-colors flex items-center space-x-1"
                >
                  <ChevronRight className="w-3 h-3 text-zinc-600" />
                  <span>Contact &amp; Recruitment</span>
                </button>
              </li>
            </ul>
          </div>

          {/* Col 3: Alliance Divisions (4 of 12) */}
          <div className="lg:col-span-4 space-y-3">
            <div className="text-xs font-tech text-white uppercase tracking-wider font-bold">
              ALLIANCE DIVISIONS
            </div>
            <div className="space-y-2 text-xs font-sans">
              <button
                onClick={() => onNavigate('hub', 3638)}
                className="w-full p-2.5 rounded-xl bg-[#121215] hover:bg-[#18181b] border border-[#27272a] flex items-center justify-between text-left transition-colors group"
              >
                <div>
                  <span className="text-white font-heading font-bold block group-hover:text-amber-300">
                    Karuhun 夜 (AP Server)
                  </span>
                  <span className="text-[10px] font-tech text-zinc-500">ID: 3638 • Competitive Division</span>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-zinc-600 group-hover:text-white transition-colors" />
              </button>

              <button
                onClick={() => onNavigate('hub', 1164)}
                className="w-full p-2.5 rounded-xl bg-[#121215] hover:bg-[#18181b] border border-[#27272a] flex items-center justify-between text-left transition-colors group"
              >
                <div>
                  <span className="text-white font-heading font-bold block group-hover:text-amber-300">
                    Izanami 夜 (AP Server)
                  </span>
                  <span className="text-[10px] font-tech text-zinc-500">ID: 1164 • Sub-Competitive</span>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-zinc-600 group-hover:text-white transition-colors" />
              </button>

              <button
                onClick={() => onNavigate('hub', 7641)}
                className="w-full p-2.5 rounded-xl bg-[#121215] hover:bg-[#18181b] border border-[#27272a] flex items-center justify-between text-left transition-colors group"
              >
                <div>
                  <span className="text-white font-heading font-bold block group-hover:text-amber-300">
                    Astrelume 夜 (AP Server)
                  </span>
                  <span className="text-[10px] font-tech text-zinc-500">ID: 7641 • Casual &amp; Community</span>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-zinc-600 group-hover:text-white transition-colors" />
              </button>

              <button
                onClick={() => onNavigate('hub', 2013)}
                className="w-full p-2.5 rounded-xl bg-[#121215] hover:bg-[#18181b] border border-[#27272a] flex items-center justify-between text-left transition-colors group"
              >
                <div>
                  <span className="text-white font-heading font-bold block group-hover:text-amber-300">
                    Karuhun 夜’ (NA Server)
                  </span>
                  <span className="text-[10px] font-tech text-zinc-500">ID: 2013 • North America Division</span>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-zinc-600 group-hover:text-white transition-colors" />
              </button>
            </div>
          </div>

        </div>

        {/* Bottom Legal & Copyright Bar */}
        <div className="pt-6 border-t border-[#27272a]/60 flex flex-col md:flex-row items-center justify-between gap-3 text-[11px] text-zinc-500 font-sans">
          <p className="text-center md:text-left leading-relaxed">
            KARUHUN is a fan-created community portal. Punishing: Gray Raven is a registered trademark of Kuro Games. All game assets &amp; characters belong to their respective copyright holders.
          </p>

          <p className="font-tech text-zinc-400 whitespace-nowrap">
            &copy; 2026 KARUHUN UNION. ALL RIGHTS RESERVED.
          </p>
        </div>

      </div>
    </footer>
  );
};
