export interface SiegeBranchData {
  id: number;
  server: 'ap' | 'na';
  name: string;
  divisionCode: string;
  tier: 'Competitive' | 'Sub-Competitive' | 'Casual';
  tag: string;
  targetRef: string;
  clearanceRate: number;
  currentMilestone: string;
  rosterCapacity: string;
  activeStatus: string;
  badgeColor: {
    border: string;
    bg: string;
    text: string;
    accent: string;
  };
}

export const SIEGE_BRANCH_DATA: SiegeBranchData[] = [
  {
    id: 3638,
    server: 'ap',
    name: 'KARUHUN 夜',
    divisionCode: 'DIV-01 // ALPHA',
    tier: 'Competitive',
    tag: 'Flagship Competitive',
    targetRef: 'Global Rank #1 Reference',
    clearanceRate: 98,
    currentMilestone: 'Area 12 Ex-Boss Terminated // Maximum Overdrive',
    rosterCapacity: '80 / 80',
    activeStatus: 'FULL COMBAT DEPLOYMENT',
    badgeColor: {
      border: 'border-amber-500/40',
      bg: 'bg-amber-950/20',
      text: 'text-amber-400',
      accent: 'bg-amber-500'
    }
  },
  {
    id: 1164,
    server: 'ap',
    name: 'IZANAMI 夜',
    divisionCode: 'DIV-02 // BRAVO',
    tier: 'Sub-Competitive',
    tag: 'Sub-Competitive High Tier',
    targetRef: 'Top 5 Alliance Target',
    clearanceRate: 91,
    currentMilestone: 'Area 10 Final Defense Zone Secured',
    rosterCapacity: '80 / 80',
    activeStatus: 'SECTOR CLEARANCE ACTIVE',
    badgeColor: {
      border: 'border-emerald-500/40',
      bg: 'bg-emerald-950/20',
      text: 'text-emerald-400',
      accent: 'bg-emerald-500'
    }
  },
  {
    id: 7641,
    server: 'ap',
    name: 'ASTRELUME 夜',
    divisionCode: 'DIV-03 // CHARLIE',
    tier: 'Casual',
    tag: 'Casual Growth Tier',
    targetRef: 'Top 15 AP Division Target',
    clearanceRate: 84,
    currentMilestone: 'Area 08 Sector Cleanse in Progress',
    rosterCapacity: '80 / 80',
    activeStatus: 'TACTICAL ROTATION',
    badgeColor: {
      border: 'border-cyan-500/40',
      bg: 'bg-cyan-950/20',
      text: 'text-cyan-400',
      accent: 'bg-cyan-500'
    }
  },
  {
    id: 2013,
    server: 'na',
    name: 'KARUHUN 夜’',
    divisionCode: 'DIV-04 // DELTA',
    tier: 'Casual',
    tag: 'NA Vanguard Division',
    targetRef: 'Top 10 NA Regional Target',
    clearanceRate: 86,
    currentMilestone: 'Area 08 Frontier Outpost Secured',
    rosterCapacity: '80 / 80',
    activeStatus: 'FRONTIER DEFENSE ACTIVE',
    badgeColor: {
      border: 'border-sky-500/40',
      bg: 'bg-sky-950/20',
      text: 'text-sky-400',
      accent: 'bg-sky-500'
    }
  }
];
