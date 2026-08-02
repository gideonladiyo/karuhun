export interface ContributorItem {
  id: string;
  name: string;
  avatarKey: 'larkshin' | 'huaxu' | 'admin';
  description: string;
  discordTag?: string;
  tiktok?: string;
  website?: string;
}

export const MAIN_DISCORD_LINK = 'https://discord.gg/Cz9bzjcdV';
export const OFFICIAL_YOUTUBE_LINK = 'https://www.youtube.com/@karuhun_union67';
export const OFFICIAL_TIKTOK_LINK = 'https://www.tiktok.com/@karuhunguild.official';

export const CONTRIBUTORS_LIST: ContributorItem[] = [
  {
    id: 'larkshin',
    name: 'LarkShinnn',
    avatarKey: 'larkshin',
    description: 'Developed and built the Karuhun Guild Portal web application.',
    discordTag: 'larkshinnn',
    tiktok: 'https://www.tiktok.com/@larkshinnn'
  },
  {
    id: 'huaxu',
    name: 'Huaxu',
    avatarKey: 'huaxu',
    description: 'Provides official API endpoints & assets for guild members and leaderboards.',
    website: 'https://huaxu.app'
  },
  {
    id: 'admin',
    name: 'Karuhun Admin',
    avatarKey: 'admin',
    description: 'Assisted throughout the development process and feature planning.'
  }
];
