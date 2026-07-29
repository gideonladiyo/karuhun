import React from 'react';
import { Shield, Users, Trophy, ExternalLink, Globe, PlayCircle, Skull, Calculator } from 'lucide-react';
import { GUILD_BRANCHES } from '../services/imageUtils';
import karuhunLogo from '../Logo__4_-removebg-preview.png';

interface NavbarProps {
  activeTab: 'hub' | 'members' | 'leaderboards' | 'bosses' | 'calculator';
  onNavigate: (tab: 'hub' | 'members' | 'leaderboards' | 'bosses' | 'calculator', branchId?: number) => void;
  selectedBranchId: number;
  onReplayIntro?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  onNavigate,
  selectedBranchId,
  onReplayIntro
}) => {
  return (
    <header className="sticky top-0 z-40 w-full bg-[#09090b]/90 border-b border-[#27272a] backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          
          {/* Logo & Guild Brand */}
          <a 
            href="/guild/3638"
            onClick={(e) => { e.preventDefault(); onNavigate('hub'); }}
            className="flex items-center space-x-3 group cursor-pointer"
          >
            <div className="relative flex items-center justify-center w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-black border border-[#27272a] p-1 group-hover:border-white transition-colors shadow-sm flex-shrink-0">
              <img 
                src={karuhunLogo} 
                alt="Karuhun Logo"
                className="w-full h-full object-contain filter contrast-125"
              />
            </div>

            <div>
              <div className="flex items-center space-x-2">
                <span className="font-heading font-bold text-lg sm:text-xl tracking-tight text-white group-hover:text-zinc-300 transition-colors">
                  KARUHUN <span className="text-zinc-500 font-normal">夜</span>
                </span>
                <span className="hidden sm:inline-block bg-[#18181b] text-zinc-300 border border-[#27272a] text-[10px] font-tech font-bold px-2 py-0.5 rounded-md uppercase tracking-wider">
                  PGR CORPS
                </span>
              </div>
              <p className="text-[10px] sm:text-[11px] text-zinc-400 font-tech truncate">
                International Guild Portal
              </p>
            </div>
          </a>

          {/* Desktop Navigation Links (Clean URLs) */}
          <nav className="hidden md:flex items-center space-x-1">
            <a
              href={`/guild/${selectedBranchId}`}
              onClick={(e) => { e.preventDefault(); onNavigate('hub'); }}
              className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-heading font-bold transition-all ${
                activeTab === 'hub'
                  ? 'bg-white text-black shadow-sm'
                  : 'text-zinc-400 hover:text-white hover:bg-[#18181b]'
              }`}
            >
              <Shield className="w-3.5 h-3.5" />
              <span>GUILD HUB</span>
            </a>

            <a
              href={`/members/${selectedBranchId}`}
              onClick={(e) => { e.preventDefault(); onNavigate('members'); }}
              className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-heading font-bold transition-all ${
                activeTab === 'members'
                  ? 'bg-white text-black shadow-sm'
                  : 'text-zinc-400 hover:text-white hover:bg-[#18181b]'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>MEMBERS</span>
            </a>

            <a
              href="/rankings"
              onClick={(e) => { e.preventDefault(); onNavigate('leaderboards'); }}
              className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-heading font-bold transition-all ${
                activeTab === 'leaderboards'
                  ? 'bg-white text-black shadow-sm'
                  : 'text-zinc-400 hover:text-white hover:bg-[#18181b]'
              }`}
            >
              <Trophy className="w-3.5 h-3.5" />
              <span>RANKINGS</span>
            </a>

            <a
              href="/bosses"
              onClick={(e) => { e.preventDefault(); onNavigate('bosses'); }}
              className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-heading font-bold transition-all ${
                activeTab === 'bosses'
                  ? 'bg-white text-black shadow-sm'
                  : 'text-zinc-400 hover:text-white hover:bg-[#18181b]'
              }`}
            >
              <Skull className="w-3.5 h-3.5" />
              <span>BOSSES</span>
            </a>

            <a
              href="/calculator"
              onClick={(e) => { e.preventDefault(); onNavigate('calculator'); }}
              className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-heading font-bold transition-all ${
                activeTab === 'calculator'
                  ? 'bg-white text-black shadow-sm'
                  : 'text-zinc-400 hover:text-white hover:bg-[#18181b]'
              }`}
            >
              <Calculator className="w-3.5 h-3.5" />
              <span>CALCULATOR</span>
            </a>
          </nav>

          {/* Right Action Icons & Mobile Menu Button */}
          <div className="flex items-center space-x-3">
            {onReplayIntro && (
              <button
                onClick={onReplayIntro}
                className="hidden lg:inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-[#121215] hover:bg-[#18181b] border border-[#27272a] hover:border-white text-xs font-tech font-bold text-zinc-300 hover:text-white transition-all shadow-sm"
                title="Replay Video Intro Portal"
              >
                <PlayCircle className="w-3.5 h-3.5 text-white" />
                <span>VIDEO INTRO</span>
              </button>
            )}

            <a
              href="https://discord.gg/karuhun"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-white hover:bg-zinc-200 text-black font-heading font-bold text-xs transition-colors shadow-sm"
            >
              <span>JOIN DISCORD</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </div>

      {/* Mobile Fixed Bottom Navigation Bar (Clean URLs) */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#09090b]/95 border-t border-[#27272a] backdrop-blur-lg px-2 py-2">
        <div className="grid grid-cols-5 gap-1 text-center">
          <a
            href={`/guild/${selectedBranchId}`}
            onClick={(e) => { e.preventDefault(); onNavigate('hub'); }}
            className={`flex flex-col items-center justify-center py-1.5 rounded-xl text-[10px] font-heading font-bold transition-all ${
              activeTab === 'hub' ? 'bg-white text-black' : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Shield className="w-4 h-4 mb-0.5" />
            <span>HUB</span>
          </a>

          <a
            href={`/members/${selectedBranchId}`}
            onClick={(e) => { e.preventDefault(); onNavigate('members'); }}
            className={`flex flex-col items-center justify-center py-1.5 rounded-xl text-[10px] font-heading font-bold transition-all ${
              activeTab === 'members' ? 'bg-white text-black' : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Users className="w-4 h-4 mb-0.5" />
            <span>MEMBERS</span>
          </a>

          <a
            href="/rankings"
            onClick={(e) => { e.preventDefault(); onNavigate('leaderboards'); }}
            className={`flex flex-col items-center justify-center py-1.5 rounded-xl text-[10px] font-heading font-bold transition-all ${
              activeTab === 'leaderboards' ? 'bg-white text-black' : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Trophy className="w-4 h-4 mb-0.5" />
            <span>RANKINGS</span>
          </a>

          <a
            href="/bosses"
            onClick={(e) => { e.preventDefault(); onNavigate('bosses'); }}
            className={`flex flex-col items-center justify-center py-1.5 rounded-xl text-[10px] font-heading font-bold transition-all ${
              activeTab === 'bosses' ? 'bg-white text-black' : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Skull className="w-4 h-4 mb-0.5" />
            <span>BOSSES</span>
          </a>

          <a
            href="/calculator"
            onClick={(e) => { e.preventDefault(); onNavigate('calculator'); }}
            className={`flex flex-col items-center justify-center py-1.5 rounded-xl text-[10px] font-heading font-bold transition-all ${
              activeTab === 'calculator' ? 'bg-white text-black' : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Calculator className="w-4 h-4 mb-0.5" />
            <span>CALC</span>
          </a>
        </div>
      </div>
    </header>
  );
};
