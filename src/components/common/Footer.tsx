import React from 'react';
import { ExternalLink, ChevronRight } from 'lucide-react';
import { MainTab } from '@/components/common/Navbar';
import { GUILD_BRANCHES } from '@/services/imageUtils';
import { MAIN_DISCORD_LINK } from '@/data/static/contactData';

interface FooterProps {
  onNavigate?: (tab: MainTab, branchId?: number) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {

  const handleNav = (tab: MainTab, branchId?: number) => {
    if (onNavigate) {
      onNavigate(tab, branchId);
    } else {
      window.location.href = `/${tab}`;
    }
  };

  return (
    <footer className="relative z-10 w-full pt-12 sm:pt-16 pb-16 sm:pb-20 border-t border-[#27272a] bg-[#09090b]/95 backdrop-blur-md text-zinc-400 font-sans mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Grid: 3 Main Columns */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 sm:gap-10 mb-12">
          
          {/* Col 1: Guild Identity & Mission (5 of 12) */}
          <div className="lg:col-span-5 space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 rounded-xl  text-white flex items-center justify-center font-heading font-black text-2xl sm:text-3xl shadow-lg flex-shrink-0">
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
                href={MAIN_DISCORD_LINK}
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

          {/* Col 2: Navigation Links (3 of 12) */}
          <div className="lg:col-span-3 space-y-3">
            <div className="text-xs font-tech text-white uppercase tracking-wider font-bold">
              NAVIGATION
            </div>
            <ul className="space-y-2 text-xs font-sans">
              <li>
                <button 
                  onClick={() => handleNav('home')} 
                  className="hover:text-white transition-colors flex items-center space-x-1.5 py-1"
                >
                  <ChevronRight className="w-3 h-3 text-zinc-500" />
                  <span>Alliance Home</span>
                </button>
              </li>
              <li>
                <button 
                  onClick={() => handleNav('hub')} 
                  className="hover:text-white transition-colors flex items-center space-x-1.5 py-1"
                >
                  <ChevronRight className="w-3 h-3 text-zinc-500" />
                  <span>Guild Divisions Hub</span>
                </button>
              </li>
              <li>
                <button 
                  onClick={() => handleNav('reffs')} 
                  className="hover:text-white transition-colors flex items-center space-x-1.5 py-1"
                >
                  <ChevronRight className="w-3 h-3 text-zinc-500" />
                  <span>Combat &amp; Siege References</span>
                </button>
              </li>
              <li>
                <button 
                  onClick={() => handleNav('leaderboards')} 
                  className="hover:text-white transition-colors flex items-center space-x-1.5 py-1"
                >
                  <ChevronRight className="w-3 h-3 text-zinc-500" />
                  <span>Union Rankings</span>
                </button>
              </li>
              <li>
                <button 
                  onClick={() => handleNav('ppc')} 
                  className="hover:text-white transition-colors flex items-center space-x-1.5 py-1"
                >
                  <ChevronRight className="w-3 h-3 text-zinc-500" />
                  <span>PPC Tactical Suite</span>
                </button>
              </li>
              <li>
                <button 
                  onClick={() => handleNav('contact')} 
                  className="hover:text-white transition-colors flex items-center space-x-1.5 py-1"
                >
                  <ChevronRight className="w-3 h-3 text-zinc-500" />
                  <span>Union Recruitment &amp; Contact</span>
                </button>
              </li>
            </ul>
          </div>

          {/* Col 3: Alliance Branches (4 of 12) */}
          <div className="lg:col-span-4 space-y-3">
            <div className="text-xs font-tech text-white uppercase tracking-wider font-bold">
              BRANCHES
            </div>
            <div className="space-y-2 text-xs font-sans">
              {GUILD_BRANCHES.map((branch) => (
                <button
                  key={branch.id}
                  onClick={() => handleNav('hub', branch.id)}
                  className="w-full p-2.5 rounded-xl bg-[#121215] hover:bg-[#18181b] border border-[#27272a] flex items-center justify-between text-left transition-colors group"
                >
                  <div>
                    <span className="text-white font-heading font-bold block group-hover:text-amber-300">
                      {branch.name} ({branch.shortRegion} Server)
                    </span>
                    <span className="text-[10px] font-tech text-zinc-500">
                      ID: {String(branch.id).padStart(8, '0')} • {branch.tag}
                    </span>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-zinc-600 group-hover:text-white transition-colors" />
                </button>
              ))}
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
