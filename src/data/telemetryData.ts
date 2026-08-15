export interface TelemetryModule {
  id: string;
  metricLabel: string;
  metricValue: string | number;
  subValue?: string;
  category: 'operational' | 'combat' | 'roster' | 'readiness';
  description: string;
  statusBadge?: string;
}

export const ALLIANCE_TELEMETRY_MODULES: TelemetryModule[] = [
  {
    id: 'active_divisions',
    metricLabel: 'Active Branch',
    metricValue: '04 BRANCH',
    subValue: '3 Asia-Pacific • 1 North America',
    category: 'operational',
    description: '',
    statusBadge: 'ONLINE'
  },
  {
    id: 'roster_capacity',
    metricLabel: 'Union Total Slots',
    metricValue: '320 SLOTS',
    subValue: '80 Members Max Capacity per Branch',
    category: 'roster',
    description: '',
    statusBadge: 'CAPACITY'
  },
  {
    id: 'readiness_rate',
    metricLabel: 'Cycle Readiness Rate',
    metricValue: '97.3%',
    subValue: 'Active Login Rate (≤7 Days Threshold)',
    category: 'readiness',
    description: '',
    statusBadge: 'EXCELLENT'
  },
  {
    id: 'cumulative_siege',
    metricLabel: 'Weekly Contribution Points',
    metricValue: '739.4K+',
    subValue: 'Combined Member Weekly Score',
    category: 'combat',
    description: '',
    statusBadge: 'TOP TIER'
  },
  {
    id: 'construct_mastery',
    metricLabel: 'Combat References & Setups',
    metricValue: '120+ GUIDES',
    subValue: 'Warzone, PPC & Challenge Rotations',
    category: 'combat',
    description: '',
    statusBadge: 'CATALOGED'
  }
];
