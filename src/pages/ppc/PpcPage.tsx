import React, { useState, useEffect } from 'react';
import { BossesPage } from './BossesPage';
import { ScoreCalculatorPage } from './ScoreCalculatorPage';
import { Skull, Calculator, Flame } from 'lucide-react';

interface PpcPageProps {
  initialSubTab?: 'bosses' | 'calculator';
  initialBossSlug?: string;
}

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

          {/* Sub-Tabs Switcher */}
          <div className="flex items-center bg-black p-1 rounded-xl border border-[#27272a]">
            <button
              onClick={() => setActiveSubTab('bosses')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-xs font-heading font-bold transition-all ${
                activeSubTab === 'bosses'
                  ? 'bg-white text-black shadow-sm'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <Skull className="w-3.5 h-3.5" />
              <span>BOSS DIRECTORY</span>
            </button>

            <button
              onClick={() => setActiveSubTab('calculator')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-xs font-heading font-bold transition-all ${
                activeSubTab === 'calculator'
                  ? 'bg-white text-black shadow-sm'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <Calculator className="w-3.5 h-3.5" />
              <span>SCORE CALCULATOR</span>
            </button>
          </div>

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
