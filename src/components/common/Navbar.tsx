import React, { useState } from 'react';
import { Shield, Video, Trophy, ExternalLink, Globe, PlayCircle, Skull, Lock, Menu, X, Users, Mail } from 'lucide-react';
import { GUILD_BRANCHES } from '@/services/imageUtils';
const karuhunLogo = '/logo.png';

interface NavbarProps {
  activeTab: 'hub' | 'members' | 'reffs' | 'leaderboards' | 'ppc' | 'admin' | 'contact';
  onNavigate: (tab: 'hub' | 'members' | 'reffs' | 'leaderboards' | 'ppc' | 'admin' | 'contact', branchId?: number) => void;
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

  const handleMobileNav = (tab: 'hub' | 'members' | 'reffs' | 'leaderboards' | 'ppc' | 'admin' | 'contact') => {
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
              className="flex items-center space-x-3 group cursor-pointer min-w-0"
            >
              <div className="relative flex items-center justify-center w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-black border border-[#27272a] p-1 group-hover:border-white transition-colors shadow-sm flex-shrink-0">
                <img 
                  src={karuhunLogo} 
                  alt="Karuhun Logo"
                  className="w-full h-full object-contain filter contrast-125"
                />
              </div>

              <div className="min-w-0">
                <div className="flex items-center space-x-2">
                  <span className="font-heading font-bold text-base sm:text-xl tracking-tight text-white group-hover:text-zinc-300 transition-colors whitespace-nowrap">
                    KARUHUN <span className="text-zinc-500 font-normal">夜</span>
                  </span>
                </div>
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
                <span>GUILD</span>
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
                <span>REFERENCES</span>
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

              <a
                href="/contact"
                onClick={(e) => { e.preventDefault(); onNavigate('contact'); }}
                className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-heading font-bold transition-all ${
                  activeTab === 'contact'
                    ? 'bg-white text-black shadow-sm'
                    : 'text-zinc-400 hover:text-white hover:bg-[#18181b]'
                }`}
              >
                <Mail className="w-3.5 h-3.5" />
                <span>CONTACT</span>
              </a>
            </nav>

            {/* Right Actions & Mobile Hamburger */}
            <div className="flex items-center space-x-2 sm:space-x-3 flex-shrink-0">
              <a
                href="https://discord.gg/Cz9bzjcdV"
                target="_blank"
                rel="noopener noreferrer"
                className="hidden sm:inline-flex items-center space-x-1.5 px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl bg-white hover:bg-zinc-200 text-black font-heading font-bold text-xs transition-colors shadow-sm whitespace-nowrap"
              >
                <span>JOIN DISCORD</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>

              {/* Hamburger Button for Mobile */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 rounded-xl bg-[#121215] border border-[#27272a] text-zinc-300 hover:text-white"
                aria-label="Toggle navigation menu"
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
              <span>GUILD</span>
            </button>

            <button
              onClick={() => handleMobileNav('reffs')}
              className={`w-full flex items-center space-x-3 p-3 rounded-xl text-xs font-heading font-bold ${
                activeTab === 'reffs' ? 'bg-white text-black' : 'text-zinc-300 bg-[#121215]'
              }`}
            >
              <Video className="w-4 h-4" />
              <span>REFERENCES</span>
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

            <button
              onClick={() => handleMobileNav('contact')}
              className={`w-full flex items-center space-x-3 p-3 rounded-xl text-xs font-heading font-bold ${
                activeTab === 'contact' ? 'bg-white text-black' : 'text-zinc-300 bg-[#121215]'
              }`}
            >
              <Mail className="w-4 h-4" />
              <span>CONTACT</span>
            </button>

            <a
              href="https://discord.gg/Cz9bzjcdV"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center justify-center space-x-2 p-3 mt-2 rounded-xl bg-white text-black font-heading font-bold text-xs shadow-sm hover:bg-zinc-200 transition-colors"
            >
              <span>JOIN DISCORD</span>
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        )}
      </header>

      {/* Floating Bottom Navigation Bar for Mobile Phones (App-Like Dock) */}
      <div className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-[#09090b]/95 border-t border-[#27272a] backdrop-blur-lg px-4 py-2.5 flex items-center justify-around shadow-2xl">
        <button
          onClick={() => onNavigate('hub')}
          title="Guild"
          className={`p-2.5 rounded-xl transition-all flex items-center justify-center ${
            activeTab === 'hub' ? 'text-white bg-[#18181b] border border-[#27272a] scale-105 shadow-sm' : 'text-zinc-400 hover:text-white'
          }`}
        >
          <Shield className="w-5 h-5" />
        </button>

        <button
          onClick={() => onNavigate('reffs')}
          title="References"
          className={`p-2.5 rounded-xl transition-all flex items-center justify-center ${
            activeTab === 'reffs' ? 'text-white bg-[#18181b] border border-[#27272a] scale-105 shadow-sm' : 'text-zinc-400 hover:text-white'
          }`}
        >
          <Video className="w-5 h-5" />
        </button>

        <button
          onClick={() => onNavigate('leaderboards')}
          title="Rankings"
          className={`p-2.5 rounded-xl transition-all flex items-center justify-center ${
            activeTab === 'leaderboards' ? 'text-white bg-[#18181b] border border-[#27272a] scale-105 shadow-sm' : 'text-zinc-400 hover:text-white'
          }`}
        >
          <Trophy className="w-5 h-5" />
        </button>

        <button
          onClick={() => onNavigate('ppc')}
          title="PPC Tools"
          className={`p-2.5 rounded-xl transition-all flex items-center justify-center ${
            activeTab === 'ppc' ? 'text-white bg-[#18181b] border border-[#27272a] scale-105 shadow-sm' : 'text-zinc-400 hover:text-white'
          }`}
        >
          <Skull className="w-5 h-5" />
        </button>

        <button
          onClick={() => onNavigate('contact')}
          title="Contact & Support"
          className={`p-2.5 rounded-xl transition-all flex items-center justify-center ${
            activeTab === 'contact' ? 'text-white bg-[#18181b] border border-[#27272a] scale-105 shadow-sm' : 'text-zinc-400 hover:text-white'
          }`}
        >
          <Mail className="w-5 h-5" />
        </button>
      </div>
    </>
  );
};
