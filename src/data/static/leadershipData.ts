export interface LeadershipProfile {
  playerId: number;
  name: string;
  role: 'LEADER' | 'VICE LEADER';
  rankLevel: number;
  portrait: string;
  frame?: string;
  level: number;
}

export const DEFAULT_LEADERSHIP: Record<number, LeadershipProfile[]> = {
  3638: [
    {
      playerId: 18445854,
      name: '夜’ Narasula_',
      role: 'LEADER',
      rankLevel: 1,
      portrait: 'image/roleplayersp/roleheadluolan5',
      frame: 'image/roleplayersp/headframe24',
      level: 120,
    },
    {
      playerId: 26438993,
      name: '夜’ Ronova',
      role: 'VICE LEADER',
      rankLevel: 2,
      portrait: 'image/roleplayersp/roleheadr3kurumi4',
      frame: 'image/roleplayersp/headframe23',
      level: 120,
    },
    {
      playerId: 11143541,
      name: '夜’ Yezki',
      role: 'VICE LEADER',
      rankLevel: 2,
      portrait: 'image/roleplayersp/roleheadr2jietawei5',
      frame: 'image/roleplayersp/headframe23',
      level: 120,
    },
  ],
  1164: [
    {
      playerId: 12301680,
      name: '夜’ しにがみ',
      role: 'LEADER',
      rankLevel: 1,
      portrait: 'image/roleplayersp/roleheadkuluomu7',
      frame: '',
      level: 120,
    },
    {
      playerId: 10353724,
      name: '夜’ YukiTo',
      role: 'VICE LEADER',
      rankLevel: 2,
      portrait: 'image/roleplayersp/roleheadr3kurumi4',
      frame: 'image/roleplayersp/headframe23',
      level: 120,
    },
    {
      playerId: 26523528,
      name: "夜' MoskDark",
      role: 'VICE LEADER',
      rankLevel: 2,
      portrait: 'image/roleplayersp/roleheadr4luna7',
      frame: '',
      level: 120,
    },
    {
      playerId: 29375482,
      name: '夜’ Aleph א',
      role: 'VICE LEADER',
      rankLevel: 2,
      portrait: 'image/roleplayersp/roleheadr3cibeizhe7',
      frame: '',
      level: 120,
    },
  ],
  7641: [
    {
      playerId: 26173412,
      name: "夜' MysriouX",
      role: 'LEADER',
      rankLevel: 1,
      portrait: 'image/roleplayersp/roleheadshenwei5ss',
      frame: '',
      level: 96,
    },
    {
      playerId: 25830009,
      name: '夜’ Seira',
      role: 'VICE LEADER',
      rankLevel: 2,
      portrait: 'image/roleplayersp/roleheadr3kurumi4',
      frame: 'image/roleplayersp/headframe31',
      level: 105,
    },
    {
      playerId: 29487893,
      name: "夜' Evelyn",
      role: 'VICE LEADER',
      rankLevel: 2,
      portrait: 'image/roleplayersp/roleheadr3lamiya6',
      frame: 'image/roleplayersp/headframe24',
      level: 113,
    },
  ],
  2013: [
    {
      playerId: 27528870,
      name: "夜' xoxo",
      role: 'LEADER',
      rankLevel: 1,
      portrait: 'image/roleplayersp/roleplayer27',
      frame: 'image/roleplayersp/headframe34',
      level: 59,
    },
    {
      playerId: 16667588,
      name: "夜' Yoru ʜʟᴄ",
      role: 'VICE LEADER',
      rankLevel: 2,
      portrait: 'image/roleplayersp/roleheadveracharactertower6',
      frame: 'image/roleplayersp/headframe34',
      level: 113,
    },
  ],
};
