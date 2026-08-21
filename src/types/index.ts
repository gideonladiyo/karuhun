// Types for Karuhun Alliance Guild & Character Database

export type MainTab = 'home' | 'hub' | 'reffs' | 'leaderboards' | 'ppc' | 'admin' | 'contact';

export interface GuildInfo {
  id: number;
  guildId?: number;
  server?: string;
  name: string;
  level: number;
  icon: string;
  declaration?: string;
  memberCount?: number;
  maxMemberCount?: number;
  contributionWeek?: number;
  leaderName?: string;
  members?: GuildMember[];
  sumContributeWeek?: number;
  sumContribute?: number;
}

export interface GuildMember {
  playerId: number;
  name: string;
  level: number;
  portrait: string;
  frame?: string;
  rankLevel: number; // 1: Leader, 2: Vice Leader, 3: Senior, 4: Member
  contributeWeek?: number;
  contributeTotal?: number;
  lastLoginTime?: string;
}

export interface GuildListItem {
  uuid?: string;
  server: string;
  guildId: number;
  name: string;
  level: number;
  memberCount: number;
  maxMemberCount: number;
  contributionWeek: number;
  leaderName: string;
  declaration?: string;
  createdAt?: string;
  updatedAt?: string;
  icon?: string;
}

export interface GuildsListResponse {
  status: string;
  data: {
    guilds: GuildListItem[];
  };
}

export interface GuildActivityStats {
  guildId: number;
  server: string;
  name: string;
  totalMembers: number;
  maxMembers: number;
  activeMembers: number;
  inactiveMembers: number;
  activePercentage: number;
  contributionWeek: number;
  leaderName: string;
}

export interface AllianceActivitySummary {
  totalMembers: number;
  totalActive: number;
  totalInactive: number;
  overallActivePercentage: number;
  branches: Record<number, GuildActivityStats>;
}

export interface GuildDataResponse {
  status: string;
  data: {
    guild: GuildInfo;
    members: GuildMember[];
  };
}

export type GuildResponse = GuildDataResponse;

export interface PlayerCharacter {
  id: number;
  characterName: string;
  frameName: string;
  frameType: string;
  frameCode: string;
  normalIcon: string;
  fashionIcon: string;
  priority: number;
  level: number;
  quality: number;
  stars?: number;
  awakeningLevel: number;
  acquired?: boolean;
  visible?: boolean;
}

export type NameplateInfo = string | { icon?: string; image?: string; url?: string; iconUrl?: string; path?: string } | null;

export interface PlayerProfileData {
  player: {
    id: number;
    name: string;
    level: number;
    sign?: string;
    portrait: string;
    frame?: string;
    likes?: number;
    guildId?: number;
    guildName?: string;
    nameplate?: NameplateInfo;
    guild?: { name: string };
  };
  characters: PlayerCharacter[];
  characterRating?: number;
}

export interface WeaponResonance {
  slot: number;
  name: string;
  description?: string;
  icon: string;
  hypertuned?: boolean;
  active?: boolean;
  desc?: string;
}

export interface HarmonizationSkill {
  name: string;
  icon: string;
  description?: string;
}

export interface HarmonizationData {
  id: number;
  slug?: string;
  name: string;
  quality: number;
  icon: string;
  iconBig?: string;
  suit?: number;
  harmonizationSkill?: HarmonizationSkill;
}

export interface WeaponData {
  id: number;
  slug?: string;
  name: string;
  quality: number;
  icon: string;
  iconBig?: string;
  level: number;
  breakthrough: number;
  weaponSkill?: {
    name: string;
    description: string;
  };
  resonances?: WeaponResonance[];
  harmonization?: HarmonizationData;
  harmonize?: HarmonizationData;
  harmonizationLevel?: number;
  harmonizationSkill?: HarmonizationSkill;
  harmonizeSkill?: HarmonizationSkill;
}

export interface MemoryData {
  slot: number;
  id: number;
  name: string;
  icon: string;
  quality: number;
  level: number;
  breakthrough: number;
  suitId?: number;
  suitName?: string;
  position?: number;
  resonance?: {
    name?: string;
    description?: string;
  };
  resonances?: Array<{ name?: string; description?: string }>;
}

export interface SuitBonus {
  id: number;
  name: string;
  count: number;
  description: string;
  icon?: string;
}

export interface CubSkill {
  id: number;
  name: string;
  description?: string;
  icon: string;
  primary?: boolean;
  level: number;
  equipped: boolean;
}

export interface CubData {
  id: number;
  name: string;
  icon: string;
  quality: number;
  level: number;
  star?: number;
  breakthrough?: number;
  skills: CubSkill[];
}

export interface CharacterDetailInfo {
  id: number;
  slug: string;
  characterName: string;
  frameName: string;
  frameType: string;
  frameCode: string;
  frameGender?: number;
  priority: number;
  intro: string;
  image: string;
  icons: {
    normal: string;
    ultima: string;
    round: string;
  };
  class: string;
  classIcon?: string;
  element: string;
  elements: Array<{ element: string; percentage: number }>;
  quality: number;
  stars?: number;
  affix?: {
    id: number;
    name: string;
    description: string;
    icon: string;
  };
  equipments?: {
    weapon?: {
      name: string;
      icon: string;
      level: number;
      quality: number;
      resonances?: Array<{ name: string; desc?: string }>;
      harmonize?: { name: string; icon: string };
    };
    suits?: Array<{ name: string; icon: string; position?: number; level?: number }>;
  };
  partner?: {
    name: string;
    icon: string;
    level: number;
    star: number;
    quality?: number;
  };
  level?: number;
  bp?: number;
  gradeName?: string;
  awakeningLevel?: number;
}

export interface CharacterDetailResponse {
  status: string;
  data: {
    character: CharacterDetailInfo;
    weapon?: WeaponData | null;
    memories?: (MemoryData | null)[];
    suits?: SuitBonus[];
    cub?: CubData | null;
    fashion?: any;
  };
}


export interface PPCResponse {
  status: string;
  data?: any;
}

export interface WarzoneResponse {
  status: string;
  data?: any;
}
