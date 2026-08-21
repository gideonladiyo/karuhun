import React, { useState } from 'react';
import { MessageSquare, CheckCircle2, ChevronRight, ArrowUpRight, HelpCircle } from 'lucide-react';
import { MainTab } from '@/pages/HomePage';
import { MAIN_DISCORD_LINK } from '@/data/static/contactData';

interface RecruitmentSectionProps {
  onNavigate: (tab: MainTab, branchId?: number) => void;
}

export const RecruitmentSection: React.FC<RecruitmentSectionProps> = ({ onNavigate }) => {
  const [selectedTier, setSelectedTier] = useState<'competitive' | 'sub_competitive' | 'casual'>('competitive');

  const tierDetails = {
    competitive: {
      title: 'Competitive Division',
      targetBranch: 'Karuhun 夜 (AP Server #00003638)',
      badge: 'TOP 10 GUILD SIEGE',
      status: 'LIMITED SLOTS',
      statusColor: 'text-amber-400 border-amber-500/30 bg-amber-500/10',
      description: 'Dedicated to top-tier endgame competitive dominance. Focused on high-ranking Simulated Siege clears, active Discord communication, and regular Warzone & PPC progression.',
      requirements: [
        'Minimum Simulated Siege score of 4,000,000 (4M) scores',
        'Mandatory weekly Simulated Siege active participation',
        'Active gameplay required (No Simulated Siege Contribution 2x = Kick)'
      ]
    },
    sub_competitive: {
      title: 'Sub-Competitive Division',
      targetBranch: 'Izanami 夜 (AP Server #00001164)',
      badge: 'TOP 50 GUILD SIEGE',
      status: 'OPEN RECRUITMENT',
      statusColor: 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10',
      description: 'Bridging the gap between casual gameplay and high-level competitive execution. Ideal for commanders refining their elemental rotations with consistent weekly Siege contribution.',
      requirements: [
        'Minimum Simulated Siege score of 3,000,000 (3M) scores',
        'Mandatory weekly Simulated Siege active participation',
        'Active gameplay required (No Simulated Siege Contribution 2x = Kick)'
      ]
    },
    casual: {
      title: 'Casual & Regional Divisions',
      targetBranch: 'Astrelume 夜 (AP #00007641) • Karuhun 夜’ (NA #00002013)',
      badge: 'COMMUNITY & CHILL',
      status: 'OPEN RECRUITMENT',
      statusColor: 'text-sky-400 border-sky-500/30 bg-sky-500/10',
      description: 'A welcoming and supportive home for casual commanders, collectors, and cross-server players. Enjoy Punishing: Gray Raven at your own pace across AP and NA regions.',
      requirements: [
        'Complete weekly Simulated Siege runs (no minimum score required)',
        'Active gameplay required (No Simulated Siege Contribution 2x = Kick)'
      ]
    }
  };

  const currentTier = tierDetails[selectedTier];

  return (
    <section className="relative w-full mb-14 sm:mb-20 animate-fadeIn">
      
      {/* Section Header */}
      <div className="mb-6 sm:mb-8 pb-4 border-b border-[#27272a]">
        <h2 className="font-heading font-black text-2xl sm:text-4xl text-white tracking-tight">
          JOIN THE KARUHUN UNION
        </h2>
        <p className="text-zinc-400 text-xs sm:text-sm font-sans mt-1 max-w-3xl leading-relaxed">
          Find your ideal division within the Karuhun union. Choose between competitive siege brackets, semi-competitive growth, or relaxed casual gameplay.
        </p>
      </div>

      {/* Main Grid: Left Tier Inspector + Right 5-Step Onboarding */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-stretch">
        
        {/* LEFT COLUMN (7 of 12): Interactive Tier Card */}
        <div className="lg:col-span-7 p-1 rounded-2xl sm:rounded-3xl bg-[#18181b]/50 border border-[#27272a] flex flex-col">
          <div className="h-full rounded-xl sm:rounded-2xl bg-[#0d0d11] p-6 sm:p-8 border border-[#27272a]/60 bracket-corner flex flex-col justify-between space-y-6">
            
            <div className="space-y-5">
              
              {/* Tier Selector Tablist */}
              <div className="flex items-center space-x-1.5 bg-[#121215] p-1.5 rounded-2xl border border-[#27272a]" role="tablist">
                <button
                  role="tab"
                  aria-selected={selectedTier === 'competitive'}
                  onClick={() => setSelectedTier('competitive')}
                  className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-tech font-bold transition-all text-center focus-tactical ${
                    selectedTier === 'competitive'
                      ? 'bg-amber-400 text-black shadow-md font-black'
                      : 'text-zinc-400 hover:text-white hover:bg-[#18181b]'
                  }`}
                >
                  COMPETITIVE
                </button>

                <button
                  role="tab"
                  aria-selected={selectedTier === 'sub_competitive'}
                  onClick={() => setSelectedTier('sub_competitive')}
                  className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-tech font-bold transition-all text-center focus-tactical ${
                    selectedTier === 'sub_competitive'
                      ? 'bg-white text-black shadow-md font-black'
                      : 'text-zinc-400 hover:text-white hover:bg-[#18181b]'
                  }`}
                >
                  SUB-COMP
                </button>

                <button
                  role="tab"
                  aria-selected={selectedTier === 'casual'}
                  onClick={() => setSelectedTier('casual')}
                  className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-tech font-bold transition-all text-center focus-tactical ${
                    selectedTier === 'casual'
                      ? 'bg-white text-black shadow-md font-black'
                      : 'text-zinc-400 hover:text-white hover:bg-[#18181b]'
                  }`}
                >
                  CASUAL / NA
                </button>
              </div>

              {/* Tier Details Box */}
              <div className="space-y-4 pt-1">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <h3 className="font-heading font-black text-xl sm:text-2xl text-white tracking-tight flex items-center space-x-2">
                      <span>{currentTier.targetBranch}</span>
                    </h3>
                    <div className="text-xs font-tech text-amber-400 tracking-wider uppercase mt-1">
                      {currentTier.title}
                    </div>
                  </div>
                </div>

                <p className="text-zinc-400 text-xs sm:text-sm font-sans leading-relaxed">
                  {currentTier.description}
                </p>

                {/* Requirements Checklist */}
                <div className="bg-[#121215] border border-[#27272a] rounded-xl p-4 space-y-2.5">
                  <span className="text-[11px] font-tech text-zinc-400 uppercase tracking-wider block font-bold">
                    Key Expectations &amp; Prerequisites:
                  </span>
                  
                  <div className="space-y-2">
                    {currentTier.requirements.map((req, idx) => (
                      <div key={idx} className="flex items-start space-x-2.5 text-xs font-sans text-zinc-300">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                        <span>{req}</span>
                      </div>
                    ))}
                  </div>
                </div>

              </div>

            </div>

            {/* Action Buttons */}
            <div className="pt-4 border-t border-[#27272a] flex flex-col sm:flex-row items-center gap-3">
              <a
                href={MAIN_DISCORD_LINK}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:flex-1 flex items-center justify-center space-x-2 p-3 rounded-xl bg-white hover:bg-zinc-200 text-black font-heading font-bold text-xs sm:text-sm transition-all focus-tactical shadow-md"
              >
                <span>JOIN DISCORD RECRUITMENT</span>
                <ArrowUpRight className="w-4 h-4" />
              </a>

              <button
                onClick={() => onNavigate('contact')}
                className="w-full sm:w-auto flex items-center justify-center space-x-2 p-3 rounded-xl bg-[#18181b] hover:bg-zinc-800 text-zinc-200 hover:text-white border border-[#27272a] font-heading font-bold text-xs sm:text-sm transition-all focus-tactical"
              >
                <MessageSquare className="w-4 h-4 text-amber-400" />
                <span>CONTACT OFFICER</span>
              </button>
            </div>

          </div>
        </div>

        {/* RIGHT COLUMN (5 of 12): 5-Step Onboarding Process */}
        <div className="lg:col-span-5 flex flex-col space-y-2.5 sm:space-y-3">
          
          {/* Step 1 */}
          <div className="p-3.5 rounded-2xl bg-[#121215] border border-[#27272a] flex items-start space-x-3.5">
            <div className="w-7 h-7 rounded-xl bg-amber-400 text-black font-heading font-black text-xs flex items-center justify-center flex-shrink-0 shadow-md">
              01
            </div>
            <div className="space-y-0.5 min-w-0">
              <h4 className="font-heading font-bold text-xs sm:text-sm text-white">
                Join Discord Server
              </h4>
              <p className="text-[11px] sm:text-xs font-sans text-zinc-400 leading-relaxed">
                Join the official Karuhun Discord server via the recruitment link.
              </p>
            </div>
          </div>

          {/* Step 2 */}
          <div className="p-3.5 rounded-2xl bg-[#121215] border border-[#27272a] flex items-start space-x-3.5">
            <div className="w-7 h-7 rounded-xl bg-white text-black font-heading font-black text-xs flex items-center justify-center flex-shrink-0 shadow-md">
              02
            </div>
            <div className="space-y-0.5 min-w-0">
              <h4 className="font-heading font-bold text-xs sm:text-sm text-white">
                Verify &amp; Select Role
              </h4>
              <p className="text-[11px] sm:text-xs font-sans text-zinc-400 leading-relaxed">
                Complete verification by selecting the "I want to apply" role.
              </p>
            </div>
          </div>

          {/* Step 3 */}
          <div className="p-3.5 rounded-2xl bg-[#121215] border border-[#27272a] flex items-start space-x-3.5">
            <div className="w-7 h-7 rounded-xl bg-white text-black font-heading font-black text-xs flex items-center justify-center flex-shrink-0 shadow-md">
              03
            </div>
            <div className="space-y-0.5 min-w-0">
              <h4 className="font-heading font-bold text-xs sm:text-sm text-white">
                Open #pgr-guild-apply Channel
              </h4>
              <p className="text-[11px] sm:text-xs font-sans text-zinc-400 leading-relaxed">
                Check the channel to identify designated admins for each branch.
              </p>
            </div>
          </div>

          {/* Step 4 */}
          <div className="p-3.5 rounded-2xl bg-[#121215] border border-[#27272a] flex items-start space-x-3.5">
            <div className="w-7 h-7 rounded-xl bg-white text-black font-heading font-black text-xs flex items-center justify-center flex-shrink-0 shadow-md">
              04
            </div>
            <div className="space-y-0.5 min-w-0">
              <h4 className="font-heading font-bold text-xs sm:text-sm text-white">
                Tag Admin in Chat
              </h4>
              <p className="text-[11px] sm:text-xs font-sans text-zinc-400 leading-relaxed">
                Tag the respective branch admin to submit registration &amp; UID.
              </p>
            </div>
          </div>

          {/* Step 5 */}
          <div className="p-3.5 rounded-2xl bg-[#121215] border border-[#27272a] flex items-start space-x-3.5">
            <div className="w-7 h-7 rounded-xl bg-white text-black font-heading font-black text-xs flex items-center justify-center flex-shrink-0 shadow-md">
              05
            </div>
            <div className="space-y-0.5 min-w-0">
              <h4 className="font-heading font-bold text-xs sm:text-sm text-white">
                In-Game Union Entry
              </h4>
              <p className="text-[11px] sm:text-xs font-sans text-zinc-400 leading-relaxed">
                Receive your in-game invite and deploy into your new guild division!
              </p>
            </div>
          </div>

          {/* Help Box */}
          <div className="p-3.5 rounded-2xl bg-[#0d0d11] border border-[#27272a] flex items-center justify-between text-xs font-tech text-zinc-400">
            <span className="flex items-center space-x-2">
              <HelpCircle className="w-4 h-4 text-amber-400 flex-shrink-0" />
              <span>Need registration assistance?</span>
            </span>
            <button
              onClick={() => onNavigate('contact')}
              className="text-amber-400 hover:text-amber-300 font-bold flex items-center space-x-1"
            >
              <span>CONTACT US</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

        </div>

      </div>

    </section>
  );
};
