import React, { useState } from 'react';
import { MessageSquare, CheckCircle2, ChevronRight, ArrowUpRight, HelpCircle } from 'lucide-react';
import { MainTab } from '@/pages/HomePage';
import { MAIN_DISCORD_LINK } from '@/data/static/contactData';
import { SectionHeader } from '@/components/ui/section-header';
import { SegmentedTabs, SegmentedTabOption } from '@/components/ui/segmented-tabs';
import { Button } from '@/components/ui/button';

interface RecruitmentSectionProps {
  onNavigate: (tab: MainTab, branchId?: number) => void;
}

type RecruitmentTier = 'competitive' | 'sub_competitive' | 'casual';

const RECRUITMENT_TIER_OPTIONS: SegmentedTabOption<RecruitmentTier>[] = [
  { value: 'competitive', label: 'Competitive' },
  { value: 'sub_competitive', label: 'Sub-Comp' },
  { value: 'casual', label: 'Casual / NA' },
];

export const RecruitmentSection: React.FC<RecruitmentSectionProps> = ({ onNavigate }) => {
  const [selectedTier, setSelectedTier] = useState<RecruitmentTier>('competitive');

  const tierDetails: Record<
    RecruitmentTier,
    {
      title: string;
      targetBranch: string;
      description: string;
      requirements: string[];
    }
  > = {
    competitive: {
      title: 'Competitive Division',
      targetBranch: 'Karuhun 夜 (AP Server #00003638)',
      description:
        'Focused on top-ranking Simulated Siege clears, active Discord coordination, and consistent Warzone & PPC progression.',
      requirements: [
        'Minimum Simulated Siege score of 4,000,000 (4M)',
        'Mandatory weekly Simulated Siege participation',
        'Active gameplay required (missing Simulated Siege 2x = kick)'
      ]
    },
    sub_competitive: {
      title: 'Sub-Competitive Division',
      targetBranch: 'Izanami 夜 (AP Server #00001164)',
      description:
        'Ideal for players refining their elemental rotations with consistent weekly Simulated Siege contribution.',
      requirements: [
        'Minimum Simulated Siege score of 3,000,000 (3M)',
        'Mandatory weekly Simulated Siege participation',
        'Active gameplay required (missing Simulated Siege 2x = kick)'
      ]
    },
    casual: {
      title: 'Casual & Regional Divisions',
      targetBranch: 'Astrelume 夜 (AP #00007641) · Karuhun 夜’ (NA #00002013)',
      description:
        'A welcoming home for casual players, collectors, and cross-server members across AP and NA regions.',
      requirements: [
        'Complete weekly Simulated Siege runs (no minimum score required)',
        'Active gameplay required (missing Simulated Siege 2x = kick)'
      ]
    }
  };

  const currentTier = tierDetails[selectedTier];

  const onboardingSteps = [
    {
      num: '01',
      title: 'Join Discord Server',
      desc: 'Join the official Karuhun Discord server via the recruitment link.'
    },
    {
      num: '02',
      title: 'Verify & Select Role',
      desc: 'Complete verification by selecting the "I want to apply" role.'
    },
    {
      num: '03',
      title: 'Open #pgr-guild-apply Channel',
      desc: 'Check the channel to find the admin for your target branch.'
    },
    {
      num: '04',
      title: 'Tag Admin in Chat',
      desc: 'Tag the branch admin to submit your registration and in-game UID.'
    },
    {
      num: '05',
      title: 'In-Game Union Entry',
      desc: 'Accept your in-game invite and join your division.'
    }
  ];

  return (
    <section id="recruitment" className="relative w-full scroll-mt-20">
      <SectionHeader
        level="secondary"
        title="Join Karuhun"
        subtitle="Choose a division that matches your pace and apply on Discord."
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-stretch">
        {/* LEFT COLUMN (7 of 12): Interactive Tier Card */}
        <div className="lg:col-span-7 rounded-xl bg-[#121215] p-6 sm:p-7 border border-[#27272a] flex flex-col justify-between space-y-6">
          <div className="space-y-5">
            <SegmentedTabs
              options={RECRUITMENT_TIER_OPTIONS}
              value={selectedTier}
              onChange={setSelectedTier}
              fullWidthOnMobile
              className="w-full"
            />

            <div className="space-y-4 pt-1">
              <div>
                <h3 className="font-heading font-black text-xl sm:text-2xl text-white tracking-tight">
                  {currentTier.targetBranch}
                </h3>
                <div className="text-xs font-tech text-amber-400 font-semibold mt-1">
                  {currentTier.title}
                </div>
              </div>

              <p className="text-zinc-400 text-xs sm:text-sm font-sans leading-relaxed">
                {currentTier.description}
              </p>

              {/* Requirements Checklist */}
              <div className="bg-[#09090b] border border-[#27272a] rounded-xl p-4 space-y-2.5">
                <span className="text-xs font-tech text-zinc-300 font-semibold block">
                  Requirements
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
          <div className="pt-4 border-t border-[#27272a] flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <Button
              asChild
              variant="default"
              size="lg"
              className="w-full sm:flex-1"
            >
              <a
                href={MAIN_DISCORD_LINK}
                target="_blank"
                rel="noopener noreferrer"
              >
                <span>Join Discord Recruitment</span>
                <ArrowUpRight className="w-4 h-4" />
              </a>
            </Button>

            <Button
              variant="secondary"
              size="lg"
              onClick={() => onNavigate('contact')}
              className="w-full sm:w-auto"
            >
              <MessageSquare className="w-4 h-4 text-amber-400" />
              <span>Contact Officer</span>
            </Button>
          </div>
        </div>

        {/* RIGHT COLUMN (5 of 12): 5-Step Onboarding Process */}
        <div className="lg:col-span-5 flex flex-col justify-between space-y-2.5">
          <div className="space-y-2.5">
            {onboardingSteps.map((step, idx) => (
              <div
                key={step.num}
                className="p-3.5 rounded-xl bg-[#121215] border border-[#27272a] flex items-start space-x-3.5"
              >
                <div className={`w-7 h-7 rounded-lg font-heading font-black text-xs flex items-center justify-center flex-shrink-0 ${
                  idx === 0 ? 'bg-amber-400 text-black' : 'bg-[#18181b] text-zinc-200 border border-[#27272a]'
                }`}>
                  {step.num}
                </div>
                <div className="space-y-0.5 min-w-0">
                  <h4 className="font-heading font-bold text-xs sm:text-sm text-white">
                    {step.title}
                  </h4>
                  <p className="text-xs font-sans text-zinc-400 leading-relaxed">
                    {step.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Help Box */}
          <div className="p-3.5 rounded-xl bg-[#121215] border border-[#27272a] flex items-center justify-between text-xs font-sans text-zinc-400">
            <span className="flex items-center space-x-2">
              <HelpCircle className="w-4 h-4 text-amber-400 flex-shrink-0" />
              <span>Need help applying?</span>
            </span>
            <button
              type="button"
              onClick={() => onNavigate('contact')}
              className="text-white hover:text-amber-300 font-semibold flex items-center space-x-1 transition-colors"
            >
              <span>Contact Us</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};
