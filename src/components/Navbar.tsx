import React, { useState } from 'react';
import { Shield, Video, Trophy, ExternalLink, Globe, PlayCircle, Skull, Lock, Menu, X, Users } from 'lucide-react';
import { GUILD_BRANCHES } from '../services/imageUtils';
import karuhunLogo from '../Logo__4_-removebg-preview.png';

interface NavbarProps {
  activeTab: 'hub' | 'members' | 'reffs' | 'leaderboards' | 'ppc' | 'admin';
  onNavigate: (tab: 'hub' | 'members' | 'reffs' | 'leaderboards' | 'ppc' | 'admin', branchId?: number) => void;
  selectedBranchId: number;
  onReplayIntro?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  onNavigate,
  selectedBranchId,
  onReplayIntro
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);

  const handleMobileNav = (tab: 'hub' | 'members' | 'reffs' | 'leaderboards' | 'ppc' | 'admin') => {
    onNavigate(tab);
    setMobileMenuOpen(false);
  };

  return (
    <>
      {/* Sticky Top Header Bar */}
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

            {/* Desktop Navigation Links */}
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
                href="/reffs"
                onClick={(e) => { e.preventDefault(); onNavigate('reffs'); }}
                className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-heading font-bold transition-all ${
                  activeTab === 'reffs'
                    ? 'bg-white text-black shadow-sm'
                    : 'text-zinc-400 hover:text-white hover:bg-[#18181b]'
                }`}
              >
                <Video className="w-3.5 h-3.5" />
                <span>REFFS</span>
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
                href="/ppc"
                onClick={(e) => { e.preventDefault(); onNavigate('ppc'); }}
                className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-heading font-bold transition-all ${
                  activeTab === 'ppc'
                    ? 'bg-white text-black shadow-sm'
                    : 'text-zinc-400 hover:text-white hover:bg-[#18181b]'
                }`}
              >
                <Skull className="w-3.5 h-3.5" />
                <span>PPC TOOLS</span>
              </a>
            </nav>

            {/* Right Actions & Mobile Hamburger */}
            <div className="flex items-center space-x-2 sm:space-x-3">
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
                href="https://discord.gg/Cz9bzjcdV"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center space-x-1.5 px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl bg-white hover:bg-zinc-200 text-black font-heading font-bold text-xs transition-colors shadow-sm"
              >
                <span>JOIN DISCORD</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>

              {/* Hamburger Button for Mobile */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 rounded-xl bg-[#121215] border border-[#27272a] text-zinc-300 hover:text-white"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>

          </div>
        </div>

        {/* Mobile Dropdown Menu Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-[#09090b] border-b border-[#27272a] p-4 space-y-2 animate-fadeIn">
            <button
              onClick={() => handleMobileNav('hub')}
              className={`w-full flex items-center space-x-3 p-3 rounded-xl text-xs font-heading font-bold ${
                activeTab === 'hub' ? 'bg-white text-black' : 'text-zinc-300 bg-[#121215]'
              }`}
            >
              <Shield className="w-4 h-4" />
              <span>GUILD HUB</span>
            </button>

            <button
              onClick={() => handleMobileNav('reffs')}
              className={`w-full flex items-center space-x-3 p-3 rounded-xl text-xs font-heading font-bold ${
                activeTab === 'reffs' ? 'bg-white text-black' : 'text-zinc-300 bg-[#121215]'
              }`}
            >
              <Video className="w-4 h-4" />
              <span>REFFS</span>
            </button>

            <button
              onClick={() => handleMobileNav('leaderboards')}
              className={`w-full flex items-center space-x-3 p-3 rounded-xl text-xs font-heading font-bold ${
                activeTab === 'leaderboards' ? 'bg-white text-black' : 'text-zinc-300 bg-[#121215]'
              }`}
            >
              <Trophy className="w-4 h-4" />
              <span>RANKINGS</span>
            </button>

            <button
              onClick={() => handleMobileNav('ppc')}
              className={`w-full flex items-center space-x-3 p-3 rounded-xl text-xs font-heading font-bold ${
                activeTab === 'ppc' ? 'bg-white text-black' : 'text-zinc-300 bg-[#121215]'
              }`}
            >
              <Skull className="w-4 h-4" />
              <span>PPC TOOLS</span>
            </button>
          </div>
        )}
      </header>

      {/* Floating Bottom Navigation Bar for Mobile Phones (App-Like Dock) */}
      <div className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-[#09090b]/95 border-t border-[#27272a] backdrop-blur-lg px-2 py-1.5 flex items-center justify-around shadow-2xl">
        <button
          onClick={() => onNavigate('hub')}
          className={`flex flex-col items-center space-y-0.5 px-3 py-1 rounded-xl transition-all ${
            activeTab === 'hub' ? 'text-white font-bold scale-105' : 'text-zinc-400'
          }`}
        >
          <Shield className="w-4 h-4" />
          <span className="text-[10px] font-heading uppercase">HUB</span>
        </button>

        <button
          onClick={() => onNavigate('reffs')}
          className={`flex flex-col items-center space-y-0.5 px-3 py-1 rounded-xl transition-all ${
            activeTab === 'reffs' ? 'text-white font-bold scale-105' : 'text-zinc-400'
          }`}
        >
          <Video className="w-4 h-4" />
          <span className="text-[10px] font-heading uppercase">REFFS</span>
        </button>

        <button
          onClick={() => onNavigate('leaderboards')}
          className={`flex flex-col items-center space-y-0.5 px-3 py-1 rounded-xl transition-all ${
            activeTab === 'leaderboards' ? 'text-white font-bold scale-105' : 'text-zinc-400'
          }`}
        >
          <Trophy className="w-4 h-4" />
          <span className="text-[10px] font-heading uppercase">RANKINGS</span>
        </button>

        <button
          onClick={() => onNavigate('ppc')}
          className={`flex flex-col items-center space-y-0.5 px-3 py-1 rounded-xl transition-all ${
            activeTab === 'ppc' ? 'text-white font-bold scale-105' : 'text-zinc-400'
          }`}
        >
          <Skull className="w-4 h-4" />
          <span className="text-[10px] font-heading uppercase">PPC</span>
        </button>
      </div>
    </>
  );
};
