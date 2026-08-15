import React, { useState, useEffect } from 'react';
import { Navbar, MainTab } from '@/components/common/Navbar';
import { Footer } from '@/components/common/Footer';
import { HomePage } from '@/pages/HomePage';
import { GuildHub } from '@/pages/GuildHubPage';
import { MemberList } from '@/pages/MemberListPage';
import { PlayerProfilePage } from '@/pages/PlayerProfilePage';
import { CharacterInspectPage } from '@/pages/CharacterInspectPage';
import { CompetitiveLeaderboard } from '@/pages/CompetitiveLeaderboardPage';
import { PpcPage } from '@/pages/ppc/PpcPage';
import { ReffsPage } from '@/pages/ReffsPage';
import { AdminPage } from '@/pages/AdminPage';
import { ContactPage } from '@/pages/ContactPage';
import { GuildIntroOverlay } from '@/pages/GuildIntroOverlay';

import { getGuildData } from '@/services/apiService';
import { GUILD_BRANCHES } from '@/services/imageUtils';
import { GuildInfo, GuildMember, PlayerCharacter } from '@/types';

export default function App() {
  const [showIntro, setShowIntro] = useState<boolean>(() => {
    const seen = sessionStorage.getItem('karuhun_intro_seen');
    return !seen;
  });

  const [activeTab, setActiveTab] = useState<MainTab>('home');
  const [ppcSubTab, setPpcSubTab] = useState<'bosses' | 'calculator'>('bosses');
  const [selectedBranchId, setSelectedBranchId] = useState<number>(3638);
  const [activeBossSlug, setActiveBossSlug] = useState<string | undefined>(undefined);
  const [activeRefId, setActiveRefId] = useState<string | undefined>(undefined);

  const [currentGuild, setCurrentGuild] = useState<GuildInfo | null>(null);
  const [members, setMembers] = useState<GuildMember[]>([]);
  const [loadingGuild, setLoadingGuild] = useState<boolean>(true);

  // Active full-page view state: 'mainTab' | 'playerProfile' | 'characterInspect'
  const [currentViewMode, setCurrentViewMode] = useState<'mainTab' | 'playerProfile' | 'characterInspect'>('mainTab');

  // Selected player & character params for full-page views
  const [activePlayerUid, setActivePlayerUid] = useState<number | null>(null);
  const [activePlayerServer, setActivePlayerServer] = useState<string>('ap');
  const [activeCharacter, setActiveCharacter] = useState<PlayerCharacter | null>(null);

  // Auto Scroll-To-Top on Page or Route Change
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' as ScrollBehavior });
  }, [activeTab, currentViewMode, activePlayerUid, activeCharacter?.id, activeRefId]);

  // Clean URL Path & Legacy Hash Router Parser & Synchronizer
  const syncRouteFromLocation = () => {
    let rawPath = window.location.pathname.replace(/^\//, '');
    
    // Support legacy hash links if accessed directly
    if (window.location.hash) {
      rawPath = window.location.hash.replace(/^#\/?/, '');
    }

    const parts = rawPath.split('/').filter(Boolean);

    if (parts[0] === 'player' && parts[1] && parts[2]) {
      const srv = parts[1];
      const uid = Number(parts[2]);
      setActivePlayerServer(srv);
      setActivePlayerUid(uid);

      if (parts[3] === 'character' && parts[4]) {
        const charId = Number(parts[4]);
        setActiveCharacter({
          id: charId,
          characterName: 'Construct',
          frameName: 'Frame',
          frameType: 'omniframe',
          frameCode: 'BPN',
          normalIcon: 'image/rolecharacter/roleheadr2xiezou1',
          fashionIcon: 'image/rolecharacter/roleheadr2xiezou1',
          priority: 2400,
          level: 80,
          quality: 5,
          awakeningLevel: 3,
          acquired: true,
          visible: true
        });
        setCurrentViewMode('characterInspect');
      } else {
        setActiveCharacter(null);
        setCurrentViewMode('playerProfile');
      }
    } else {
      setCurrentViewMode('mainTab');
      if (parts[0] === 'admin' || parts[0] === 'dashboard') {
        setActiveTab('admin');
      } else if (parts[0] === 'contact' || parts[0] === 'support' || parts[0] === 'help') {
        setActiveTab('contact');
      } else if (parts[0] === 'members' || parts[0] === 'roster') {
        setActiveTab('members');
        if (parts[1] && !isNaN(Number(parts[1]))) {
          setSelectedBranchId(Number(parts[1]));
        }
      } else if (parts[0] === 'reffs' || parts[0] === 'ref' || parts[0] === 'references') {
        setActiveTab('reffs');
        if (parts[1]) {
          setActiveRefId(parts[1]);
        } else {
          setActiveRefId(undefined);
        }
      } else if (parts[0] === 'rankings' || parts[0] === 'leaderboards') {
        setActiveTab('leaderboards');
      } else if (parts[0] === 'ppc' || parts[0] === 'bosses' || parts[0] === 'calculator') {
        setActiveTab('ppc');
        if (parts[0] === 'calculator') {
          setPpcSubTab('calculator');
        } else {
          setPpcSubTab('bosses');
        }
      } else if (parts[0] === 'guild' || parts[0] === 'hub') {
        setActiveTab('hub');
        if (parts[1] && !isNaN(Number(parts[1]))) {
          setSelectedBranchId(Number(parts[1]));
        }
      } else if (parts[0] === 'home') {
        setActiveTab('home');
      } else {
        setActiveTab('home');
      }
    }
  };

  const navigateToPath = (targetPath: string) => {
    window.history.pushState({}, '', targetPath);
    syncRouteFromLocation();
  };

  useEffect(() => {
    syncRouteFromLocation();
    window.addEventListener('popstate', syncRouteFromLocation);
    window.addEventListener('hashchange', syncRouteFromLocation);
    return () => {
      window.removeEventListener('popstate', syncRouteFromLocation);
      window.removeEventListener('hashchange', syncRouteFromLocation);
    };
  }, []);

  // Auto reset window scroll to top whenever tab or view mode changes
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, [activeTab, currentViewMode, selectedBranchId, activePlayerUid]);

  // Fetch active guild branch data when branch selection changes
  useEffect(() => {
    setLoadingGuild(true);
    const branch = GUILD_BRANCHES.find((b) => b.id === selectedBranchId) || GUILD_BRANCHES[0];
    setActivePlayerServer(branch.server);
    
    getGuildData(branch.server, branch.id)
      .then((res) => {
        if (res && res.data) {
          setCurrentGuild(res.data.guild);
          setMembers(res.data.members || []);
        }
        setLoadingGuild(false);
      })
      .catch((err) => {
        console.error('Failed to load guild data', err);
        setLoadingGuild(false);
      });
  }, [selectedBranchId]);

  const activeBranch = GUILD_BRANCHES.find((b) => b.id === selectedBranchId) || GUILD_BRANCHES[0];

  const handleNavigateTab = (tab: MainTab, branchId?: number) => {
    const targetBranch = branchId || selectedBranchId;
    if (branchId) setSelectedBranchId(branchId);
    setActiveTab(tab);
    setCurrentViewMode('mainTab');

    if (tab === 'home') navigateToPath(`/`);
    else if (tab === 'hub') navigateToPath(`/guild/${targetBranch}`);
    else if (tab === 'members') navigateToPath(`/members/${targetBranch}`);
    else if (tab === 'reffs') navigateToPath(`/reffs`);
    else if (tab === 'leaderboards') navigateToPath(`/rankings`);
    else if (tab === 'ppc') navigateToPath(`/ppc`);
    else if (tab === 'admin') navigateToPath(`/admin`);
    else if (tab === 'contact') navigateToPath(`/contact`);
  };

  const handleOpenPpcTool = (subTab: 'bosses' | 'calculator') => {
    setPpcSubTab(subTab);
    setActiveTab('ppc');
    setCurrentViewMode('mainTab');
    navigateToPath(subTab === 'calculator' ? '/calculator' : '/ppc');
  };

  const handleOpenPlayerProfile = (uid: number, srv?: string) => {
    const targetServer = srv || activeBranch.server;
    setActivePlayerUid(uid);
    setActivePlayerServer(targetServer);
    setCurrentViewMode('playerProfile');
    navigateToPath(`/player/${targetServer}/${uid}`);
  };

  const handleSelectCharacter = (character: PlayerCharacter) => {
    if (!activePlayerUid) return;
    setActiveCharacter(character);
    setCurrentViewMode('characterInspect');
    navigateToPath(`/player/${activePlayerServer}/${activePlayerUid}/character/${character.id}`);
  };

  const handleBackToProfile = () => {
    if (activePlayerUid) {
      setCurrentViewMode('playerProfile');
      navigateToPath(`/player/${activePlayerServer}/${activePlayerUid}`);
    } else {
      setCurrentViewMode('mainTab');
      navigateToPath(`/members/${selectedBranchId}`);
    }
  };

  const handleBackToMainTab = () => {
    setCurrentViewMode('mainTab');
    navigateToPath(`/members/${selectedBranchId}`);
  };

  const handleNavigateRefDetail = (refId?: string) => {
    setActiveRefId(refId);
    if (refId) {
      navigateToPath(`/reffs/${refId}`);
    } else {
      navigateToPath(`/reffs`);
    }
  };

  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-100 font-sans selection:bg-amber-500/30 selection:text-amber-200 flex flex-col relative overflow-x-clip">
      
      {/* Atmospheric Dual-Side Amber Light Leaks Background */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden select-none">
        
        {/* 1. Primary Right-Side Amber Light Leak */}
        <div 
          className="absolute top-[5%] -right-[15%] sm:-right-[8%] w-[550px] sm:w-[850px] h-[550px] sm:h-[850px] rounded-full opacity-45 blur-[120px] sm:blur-[160px] mix-blend-screen"
          style={{
            background: 'radial-gradient(circle, rgba(245, 158, 11, 0.38) 0%, rgba(217, 119, 6, 0.16) 85%, transparent 75%)'
          }}
        />

        {/* 2. Secondary Left-Side Amber Light Leak */}
        <div 
          className="absolute top-[48%] -left-[15%] sm:-left-[8%] w-[550px] sm:w-[850px] h-[550px] sm:h-[850px] rounded-full opacity-35 blur-[120px] sm:blur-[160px] mix-blend-screen"
          style={{
            background: 'radial-gradient(circle, rgba(251, 191, 36, 0.32) 0%, rgba(180, 83, 9, 0.12) 80%, transparent 80%)'
          }}
        />

        {/* Soft Vignette Overlay */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(9,9,11,0.4)_100%)]" />
      </div>

      {/* Optional First Visit Video Intro Overlay */}
      {showIntro && (
        <GuildIntroOverlay
          onEnter={() => {
            sessionStorage.setItem('karuhun_intro_seen', 'true');
            setShowIntro(false);
          }}
        />
      )}

      {/* Main Top Navigation Header */}
      <Navbar
        activeTab={activeTab}
        onNavigate={handleNavigateTab}
        selectedBranchId={selectedBranchId}
        onReplayIntro={() => setShowIntro(true)}
      />

      {/* Main Content Area */}
      <main className="relative z-10 flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        
        {/* VIEW MODE 1: MAIN TABS (Home, Hub, Members, Reffs, Leaderboards, PPC Tools, Admin, Contact) */}
        {currentViewMode === 'mainTab' && (
          <>
            {activeTab === 'home' && (
              <HomePage
                onNavigate={handleNavigateTab}
                onSelectPlayer={handleOpenPlayerProfile}
                onOpenPpcTool={handleOpenPpcTool}
                onNavigateRefDetail={handleNavigateRefDetail}
              />
            )}

            {activeTab === 'hub' && (
              <GuildHub
                currentGuild={currentGuild}
                members={members}
                loading={loadingGuild}
                selectedBranchId={selectedBranchId}
                onSelectBranch={(bId: number) => handleNavigateTab('hub', bId)}
                onViewMembers={() => handleNavigateTab('members', selectedBranchId)}
              />
            )}

            {activeTab === 'members' && (
              <MemberList
                members={members}
                guildInfo={currentGuild}
                loading={loadingGuild}
                selectedBranchId={selectedBranchId}
                onSelectBranch={(bId: number) => handleNavigateTab('members', bId)}
                onSelectMember={(m: GuildMember) => handleOpenPlayerProfile(m.playerId)}
              />
            )}

            {activeTab === 'reffs' && (
              <ReffsPage
                initialRefId={activeRefId}
                onNavigateRefDetail={handleNavigateRefDetail}
              />
            )}

            {activeTab === 'leaderboards' && (
              <CompetitiveLeaderboard
                onSelectPlayer={(uid: number, srv?: string) => handleOpenPlayerProfile(uid, srv)}
              />
            )}

            {activeTab === 'ppc' && (
              <PpcPage
                initialSubTab={ppcSubTab}
                initialBossSlug={activeBossSlug}
              />
            )}

            {activeTab === 'admin' && (
              <AdminPage />
            )}

            {activeTab === 'contact' && (
              <ContactPage />
            )}
          </>
        )}

        {/* VIEW MODE 2: FULL-PAGE PLAYER CONSTRUCT PROFILE */}
        {currentViewMode === 'playerProfile' && activePlayerUid && (
          <PlayerProfilePage
            uid={activePlayerUid}
            server={activePlayerServer}
            onBack={handleBackToMainTab}
            onSelectCharacter={handleSelectCharacter}
          />
        )}

        {/* VIEW MODE 3: FULL-PAGE CHARACTER DETAILED INSPECTION */}
        {currentViewMode === 'characterInspect' && activePlayerUid && activeCharacter && (
          <CharacterInspectPage
            character={activeCharacter}
            server={activePlayerServer}
            uid={activePlayerUid}
            onBack={handleBackToProfile}
          />
        )}

      </main>

      {/* Universal Full-Width Tactical Footer Across All Pages */}
      <Footer onNavigate={handleNavigateTab} />
    </div>
  );
}
