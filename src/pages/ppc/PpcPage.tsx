import React, { useState, useEffect } from 'react';
import { BossesPage } from './BossesPage';
import { ScoreCalculatorPage } from './ScoreCalculatorPage';
import { Skull, Calculator, Flame } from 'lucide-react';
import { SegmentedTabs, SegmentedTabOption } from '@/components/ui/segmented-tabs';

interface PpcPageProps {
  initialSubTab?: 'bosses' | 'calculator';
  initialBossSlug?: string;
}

const PPC_SUB_TABS: SegmentedTabOption<'bosses' | 'calculator'>[] = [
  { value: 'bosses', label: 'Boss Directory', icon: Skull },
  { value: 'calculator', label: 'Score Calculator', icon: Calculator },
];

export const PpcPage: React.FC<PpcPageProps> = ({
  initialSubTab = 'bosses',
  initialBossSlug
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'bosses' | 'calculator'>(initialSubTab);

  useEffect(() => {
    if (initialSubTab) {
      setActiveSubTab(initialSubTab);
    }
  }, [initialSubTab]);

  return (
    <div className="space-y-6 animate-fadeIn pb-16 md:pb-0">
      {/* Sub-Navigation Header Bar */}
      <div className="minimal-card p-4 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center space-x-2">
            <Flame className="w-5 h-5 text-white" />
            <h1 className="font-heading font-bold text-lg text-white uppercase tracking-wider">
              PPC HUB &amp; TOOLS
            </h1>
          </div>

          <SegmentedTabs
            options={PPC_SUB_TABS}
            value={activeSubTab}
            onChange={setActiveSubTab}
          />
        </div>
      </div>

      {/* Render Active Sub-Page */}
      {activeSubTab === 'bosses' ? (
        <BossesPage />
      ) : (
        <ScoreCalculatorPage
          initialBossSlug={initialBossSlug}
        />
      )}
    </div>
  );
};
