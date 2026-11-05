import React from 'react';
import { BossesPage } from './BossesPage';
import { ScoreCalculatorPage } from './ScoreCalculatorPage';
import { Calculator, Skull } from 'lucide-react';
import { SegmentedTabs, SegmentedTabOption } from '@/components/ui/segmented-tabs';

type PpcSubTab = 'bosses' | 'calculator';

interface PpcPageProps {
  subTab: PpcSubTab;
  onSubTabChange: (tab: PpcSubTab) => void;
}

const PPC_SUB_TABS: SegmentedTabOption<PpcSubTab>[] = [
  { value: 'calculator', label: 'Calculator', icon: Calculator },
  { value: 'bosses', label: 'Bosses', icon: Skull },
];

const SUBTITLES: Record<PpcSubTab, string> = {
  calculator: 'Turn clear times into score, compare runs side by side, and copy the matching Agus bot command.',
  bosses: 'Stage HP, opener delay, and weaknesses for every boss in the current rotation.',
};

export const PpcPage: React.FC<PpcPageProps> = ({ subTab, onSubTabChange }) => (
  <div className="space-y-6 sm:space-y-8 animate-fadeIn pb-16 md:pb-0">
    <div className="flex flex-col md:flex-row md:items-end justify-between gap-5">
      <div className="space-y-1.5">
        <h1 className="text-2xl sm:text-3xl font-heading font-bold text-white tracking-tight">Phantom Pain Cage</h1>
        <p className="text-sm text-zinc-400 max-w-xl">{SUBTITLES[subTab]}</p>
      </div>
      <SegmentedTabs
        options={PPC_SUB_TABS}
        value={subTab}
        onChange={onSubTabChange}
        fullWidthOnMobile
        ariaLabel="PPC tools"
      />
    </div>

    {subTab === 'bosses' ? <BossesPage /> : <ScoreCalculatorPage />}
  </div>
);
