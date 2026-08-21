// PPC Score Tables & Boss Database extracted from Google Sheets
import { supabase, isSupabaseConfigured } from '@/services/supabase/client';

// Advanced PPC Score Table (adv.csv)
export const ADVANCED_PPC_SCORES: Record<number, { knight: number; chaos: number; hell: number }> = {
  0: { knight: 62420, chaos: 112340, hell: 212180 },
  1: { knight: 62340, chaos: 112180, hell: 211860 },
  2: { knight: 62260, chaos: 112020, hell: 211540 },
  3: { knight: 62180, chaos: 111860, hell: 211220 },
  4: { knight: 62100, chaos: 111700, hell: 210900 },
  5: { knight: 62020, chaos: 111540, hell: 210580 },
  6: { knight: 61940, chaos: 111380, hell: 210260 },
  7: { knight: 61860, chaos: 111220, hell: 209940 },
  8: { knight: 61780, chaos: 111060, hell: 209620 },
  9: { knight: 61700, chaos: 110900, hell: 209300 },
  10: { knight: 61620, chaos: 110740, hell: 208980 },
  11: { knight: 61540, chaos: 110580, hell: 208660 },
  12: { knight: 61460, chaos: 110420, hell: 208340 },
  13: { knight: 61380, chaos: 110260, hell: 208020 },
  14: { knight: 61300, chaos: 110100, hell: 207700 },
  15: { knight: 61220, chaos: 109940, hell: 207380 },
  16: { knight: 61140, chaos: 109780, hell: 207060 },
  17: { knight: 61060, chaos: 109620, hell: 206740 },
  18: { knight: 60980, chaos: 109460, hell: 206420 },
  19: { knight: 60900, chaos: 109300, hell: 206100 },
  20: { knight: 60820, chaos: 109140, hell: 205780 },
  21: { knight: 60740, chaos: 108980, hell: 205460 },
  22: { knight: 60660, chaos: 108820, hell: 205140 },
  23: { knight: 60580, chaos: 108660, hell: 204820 },
  24: { knight: 60500, chaos: 108500, hell: 204500 },
  25: { knight: 60420, chaos: 108340, hell: 204180 },
  26: { knight: 60340, chaos: 108180, hell: 203860 },
  27: { knight: 60260, chaos: 108020, hell: 203540 },
  28: { knight: 60180, chaos: 107860, hell: 203220 },
  29: { knight: 60100, chaos: 107700, hell: 202900 },
  30: { knight: 60020, chaos: 107540, hell: 202580 },
  31: { knight: 59940, chaos: 107380, hell: 202260 },
  32: { knight: 59860, chaos: 107220, hell: 201940 },
  33: { knight: 59780, chaos: 107060, hell: 201620 },
  34: { knight: 59700, chaos: 106900, hell: 201300 },
  35: { knight: 59620, chaos: 106740, hell: 200980 },
  36: { knight: 59540, chaos: 106580, hell: 200660 },
  37: { knight: 59460, chaos: 106420, hell: 200340 },
  38: { knight: 59380, chaos: 106260, hell: 200020 },
  39: { knight: 59300, chaos: 106100, hell: 199700 },
  40: { knight: 59220, chaos: 105940, hell: 199380 },
  41: { knight: 59140, chaos: 105780, hell: 199060 },
  42: { knight: 59060, chaos: 105620, hell: 198740 },
  43: { knight: 58980, chaos: 105460, hell: 198420 },
  44: { knight: 58900, chaos: 105300, hell: 198100 },
  45: { knight: 58820, chaos: 105140, hell: 197780 },
  46: { knight: 58740, chaos: 104980, hell: 197460 },
  47: { knight: 58660, chaos: 104820, hell: 197140 },
  48: { knight: 58580, chaos: 104660, hell: 196820 },
  49: { knight: 58500, chaos: 104500, hell: 196500 },
  50: { knight: 58420, chaos: 104340, hell: 196180 },
  51: { knight: 58340, chaos: 104180, hell: 195860 },
  52: { knight: 58260, chaos: 104020, hell: 195540 },
  53: { knight: 58180, chaos: 103860, hell: 195220 },
  54: { knight: 58100, chaos: 103700, hell: 194900 },
  55: { knight: 58020, chaos: 103540, hell: 194580 },
  56: { knight: 57940, chaos: 103380, hell: 194260 },
  57: { knight: 57860, chaos: 103220, hell: 193940 },
  58: { knight: 57780, chaos: 103060, hell: 193620 },
  59: { knight: 57700, chaos: 102900, hell: 193300 },
  60: { knight: 57620, chaos: 102740, hell: 192980 },
};

// Ultimate PPC Score Table (ult.csv)
export const ULTIMATE_PPC_SCORES: Record<number, { test: number; elite: number; knight: number; chaos: number; hell: number }> = {
  0: { test: 20925, elite: 41850, knight: 92700, chaos: 185401, hell: 370802 },
  1: { test: 20850, elite: 41701, knight: 92402, chaos: 184804, hell: 369608 },
  2: { test: 20776, elite: 41552, knight: 92104, chaos: 184209, hell: 368418 },
  3: { test: 20702, elite: 41404, knight: 91808, chaos: 183616, hell: 367232 },
  4: { test: 20628, elite: 41256, knight: 91512, chaos: 183025, hell: 366050 },
  5: { test: 20554, elite: 41109, knight: 91218, chaos: 182436, hell: 364872 },
  6: { test: 20481, elite: 40962, knight: 90924, chaos: 181849, hell: 363698 },
  7: { test: 20408, elite: 40816, knight: 90632, chaos: 181264, hell: 362528 },
  8: { test: 20335, elite: 40670, knight: 90340, chaos: 180681, hell: 361362 },
  9: { test: 20262, elite: 40525, knight: 90050, chaos: 180100, hell: 360200 },
  10: { test: 20190, elite: 40380, knight: 89760, chaos: 179521, hell: 359042 },
  11: { test: 20118, elite: 40236, knight: 89472, chaos: 178944, hell: 357888 },
  12: { test: 20046, elite: 40092, knight: 89184, chaos: 178369, hell: 356738 },
  13: { test: 19974, elite: 39949, knight: 88898, chaos: 177796, hell: 355592 },
  14: { test: 19903, elite: 39806, knight: 88612, chaos: 177225, hell: 354450 },
  15: { test: 19832, elite: 39664, knight: 88328, chaos: 176656, hell: 353312 },
  16: { test: 19761, elite: 39522, knight: 88044, chaos: 176089, hell: 352178 },
  17: { test: 19690, elite: 39381, knight: 87762, chaos: 175524, hell: 351048 },
  18: { test: 19620, elite: 39240, knight: 87480, chaos: 174961, hell: 349922 },
  19: { test: 19550, elite: 39100, knight: 87200, chaos: 174400, hell: 348800 },
  20: { test: 19480, elite: 38960, knight: 86920, chaos: 173841, hell: 347682 },
  21: { test: 19410, elite: 38821, knight: 86642, chaos: 173284, hell: 346568 },
  22: { test: 19341, elite: 38682, knight: 86364, chaos: 172729, hell: 345458 },
  23: { test: 19272, elite: 38544, knight: 86088, chaos: 172176, hell: 344352 },
  24: { test: 19203, elite: 38406, knight: 85812, chaos: 171625, hell: 343250 },
  25: { test: 19134, elite: 38269, knight: 85538, chaos: 171076, hell: 342152 },
  26: { test: 19066, elite: 38132, knight: 85264, chaos: 170529, hell: 341058 },
  27: { test: 18998, elite: 37996, knight: 84992, chaos: 169984, hell: 339968 },
  28: { test: 18930, elite: 37860, knight: 84720, chaos: 169441, hell: 338882 },
  29: { test: 18862, elite: 37725, knight: 84450, chaos: 168900, hell: 337800 },
  30: { test: 18795, elite: 37590, knight: 84180, chaos: 168361, hell: 336722 },
  31: { test: 18728, elite: 37456, knight: 83912, chaos: 167824, hell: 335648 },
  32: { test: 18661, elite: 37322, knight: 83644, chaos: 167289, hell: 334578 },
  33: { test: 18594, elite: 37189, knight: 83378, chaos: 166756, hell: 333512 },
  34: { test: 18528, elite: 37056, knight: 83112, chaos: 166225, hell: 332450 },
  35: { test: 18462, elite: 36924, knight: 82848, chaos: 165696, hell: 331392 },
  36: { test: 18396, elite: 36792, knight: 82584, chaos: 165169, hell: 330338 },
  37: { test: 18330, elite: 36661, knight: 82322, chaos: 164644, hell: 329288 },
  38: { test: 18265, elite: 36530, knight: 82060, chaos: 164121, hell: 328242 },
  39: { test: 18200, elite: 36400, knight: 81800, chaos: 163600, hell: 327200 },
  40: { test: 18135, elite: 36270, knight: 81540, chaos: 163081, hell: 326162 },
  41: { test: 18070, elite: 36141, knight: 81282, chaos: 162564, hell: 325128 },
  42: { test: 18006, elite: 36012, knight: 81024, chaos: 162049, hell: 324098 },
  43: { test: 17942, elite: 35884, knight: 80768, chaos: 161536, hell: 323072 },
  44: { test: 17878, elite: 35756, knight: 80512, chaos: 161025, hell: 322050 },
  45: { test: 17814, elite: 35629, knight: 80258, chaos: 160516, hell: 321032 },
  46: { test: 17751, elite: 35502, knight: 80004, chaos: 160009, hell: 320018 },
  47: { test: 17688, elite: 35376, knight: 79752, chaos: 159504, hell: 319008 },
  48: { test: 17625, elite: 35250, knight: 79500, chaos: 159001, hell: 318002 },
  49: { test: 17562, elite: 35125, knight: 79250, chaos: 158500, hell: 317000 },
  50: { test: 17500, elite: 35000, knight: 79000, chaos: 158001, hell: 316002 },
  51: { test: 17438, elite: 34876, knight: 78752, chaos: 157504, hell: 315008 },
  52: { test: 17376, elite: 34752, knight: 78504, chaos: 157009, hell: 314018 },
  53: { test: 17314, elite: 34629, knight: 78258, chaos: 156516, hell: 313032 },
  54: { test: 17253, elite: 34506, knight: 78012, chaos: 156025, hell: 312050 },
  55: { test: 17192, elite: 34384, knight: 77768, chaos: 155536, hell: 311072 },
  56: { test: 17131, elite: 34262, knight: 77524, chaos: 155049, hell: 310098 },
  57: { test: 17070, elite: 34141, knight: 77282, chaos: 154564, hell: 309128 },
  58: { test: 17010, elite: 34020, knight: 77040, chaos: 154081, hell: 308162 },
  59: { test: 16950, elite: 33900, knight: 76800, chaos: 153600, hell: 307200 },
  60: { test: 16890, elite: 33780, knight: 76560, chaos: 153121, hell: 306242 },
};

// Full PPC Boss Detail Interface matching Google Sheet
export interface PpcBossDetail {
  boss: string;
  slug: string;
  super_armor?: string;
  edr?: string;
  deff?: string;
  e_res?: string;
  test?: string;
  elite?: string;
  knight: string;
  chaos: string;
  hell: string;
  start_time: string;
  weakness: string;
  img_url: string;
}

// Complete Boss Database extracted directly from Google Sheets
export const FULL_PPC_BOSSES: PpcBossDetail[] = [
  {
    boss: "Unwinged",
    slug: "unwinged",
    knight: "19.200.000",
    chaos: "28.900.000",
    hell: "42.000.000",
    start_time: "5.19s",
    weakness: "Final ice damage is doubled.",
    img_url: "https://assets.huaxu.app/cn/image/uifubenbosssingle/bosssingletab54.webp"
  },
  {
    boss: "Melinoe",
    slug: "melinoe",
    knight: "15.230.080",
    chaos: "23.500.000",
    hell: "38.000.000",
    start_time: "5.19s",
    weakness: "Final dark damage is doubled.",
    img_url: "https://assets.huaxu.app/glb/image/uifubenbosssingle/bosssingletab53.webp"
  },
  {
    boss: "Ephialtes",
    slug: "ephialtes",
    knight: "16.092.000",
    chaos: "24.138.000",
    hell: "35.000.000",
    start_time: "5.19s",
    weakness: "Final dark damage is doubled.",
    img_url: "https://assets.huaxu.app/browse/glb/image/uifubenchallengemapboss/bosssingletab50.png"
  },
  {
    boss: "Powered",
    slug: "powered",
    knight: "13.790.000",
    chaos: "20.690.000",
    hell: "30.000.000",
    start_time: "5.19s",
    weakness: "Final ultima slash damage is doubled.",
    img_url: "https://assets.huaxu.app/browse/glb/image/uifubenchallengemapboss/bosssingletab49.png"
  },
  {
    boss: "Gwynplaine",
    slug: "gwynplaine",
    knight: "13.790.000",
    chaos: "20.690.000",
    hell: "30.000.000",
    start_time: "5.17s",
    weakness: "Final fire damage is doubled.",
    img_url: "https://assets.huaxu.app/browse/glb/image/uifubenchallengemapboss/bosssingletab48.png"
  },
  {
    boss: "Veronica",
    slug: "veronica",
    knight: "13.790.000",
    chaos: "20.690.000",
    hell: "30.000.000",
    start_time: "5.17s",
    weakness: "Final plasma beam damage is doubled.",
    img_url: "https://assets.huaxu.app/browse/glb/image/uifubenchallengemapboss/bosssingletab47.png"
  },
  {
    boss: "Monzano",
    slug: "monzano",
    knight: "13.790.000",
    chaos: "20.690.000",
    hell: "30.000.000",
    start_time: "5.17s",
    weakness: "Final glaciation damage is doubled.",
    img_url: "https://assets.huaxu.app/browse/glb/image/uifubenchallengemapboss/bosssingletab46.png"
  },
  {
    boss: "Primal: Projection",
    slug: "primal",
    knight: "12.000.000",
    chaos: "18.000.000",
    hell: "27.000.000",
    start_time: "5.17s",
    weakness: "Final dark damage is doubled.",
    img_url: "https://assets.huaxu.app/browse/glb/image/uifubenchallengemapboss/bosssingletab44.png"
  },
  {
    boss: "Cradle",
    slug: "cradle",
    knight: "10.110.000",
    chaos: "15.170.000",
    hell: "22.000.000",
    start_time: "5.13s",
    weakness: "Final lightning damage is doubled.",
    img_url: "https://assets.huaxu.app/browse/glb/image/uifubenchallengemapboss/bosssingletab40.png"
  },
  {
    boss: "Shorthalt",
    slug: "shorthalt",
    knight: "10.110.000",
    chaos: "15.170.000",
    hell: "22.000.000",
    start_time: "5.30s",
    weakness: "Final fire damage is doubled.",
    img_url: "https://assets.huaxu.app/browse/glb/image/uifubenchallengemapboss/bosssingletab42.png"
  },
  {
    boss: "Skych",
    slug: "skych",
    knight: "8.280.000",
    chaos: "12.410.000",
    hell: "18.000.000",
    start_time: "5.50s",
    weakness: "Final physical damage is doubled.",
    img_url: "https://assets.huaxu.app/browse/glb/image/uifubenchallengemapboss/bosssingletab41.png"
  },
  {
    boss: "Ballard",
    slug: "ballard",
    knight: "7.360.000",
    chaos: "11.030.000",
    hell: "17.000.000",
    start_time: "5.50s",
    weakness: "Final fire damage is doubled.",
    img_url: "https://assets.huaxu.app/browse/glb/image/uifubenchallengemapboss/bosssingletab39.png"
  },
  {
    boss: "Emperor",
    slug: "emperor",
    knight: "8.280.000",
    chaos: "12.410.000",
    hell: "19.000.000",
    start_time: "5.25s",
    weakness: "Final ice damage is doubled.",
    img_url: "https://assets.huaxu.app/browse/glb/image/uifubenchallengemapboss/bosssingletab38.png"
  },
  {
    boss: "Lilith",
    slug: "lilith",
    knight: "5.850.001",
    chaos: "8.780.001",
    hell: "13.000.001",
    start_time: "5.24s",
    weakness: "Final dark damage is doubled.",
    img_url: "https://assets.huaxu.app/browse/glb/image/uifubenchallengemapboss/bosssingletab36.png"
  },
  {
    boss: "Trailblazer",
    slug: "trailblazer",
    knight: "3.150.001",
    chaos: "4.730.001",
    hell: "7.000.001",
    start_time: "5.27s",
    weakness: "Steel-willed. No weakness.",
    img_url: "https://assets.huaxu.app/browse/glb/image/uifubenchallengemapboss/bosssingletab37.png"
  },
  {
    boss: "Fu Shen",
    slug: "fushen",
    knight: "4.500.001",
    chaos: "6.750.001",
    hell: "10.000.001",
    start_time: "5.26s",
    weakness: "Final physical damage is doubled.",
    img_url: "https://assets.huaxu.app/browse/glb/image/uifubenchallengemapboss/bosssingletab35.png"
  },
  {
    boss: "Phantom Tifa",
    slug: "tifa",
    knight: "3.750.001",
    chaos: "5.745.001",
    hell: "8.190.001",
    start_time: "5.17s",
    weakness: "Final lightning damage is doubled.",
    img_url: "https://assets.huaxu.app/browse/glb/image/uifubenchallengemapboss/bosssingletab34.png"
  },
  {
    boss: "Madorea",
    slug: "madorea",
    knight: "3.435.010",
    chaos: "5.265.001",
    hell: "7.500.001",
    start_time: "4.64s",
    weakness: "Final ice damage is doubled.",
    img_url: "https://assets.huaxu.app/browse/glb/image/uifubenchallengemapboss/bosssingletab33.png"
  },
  {
    boss: "Dark Shark",
    slug: "darkshark",
    knight: "2.295.001",
    chaos: "3.525.001",
    hell: "5.010.001",
    start_time: "5.60s",
    weakness: "Super cute. Performs a special attack pattern after 25s. -30% EDR for 5s afterwards.",
    img_url: "https://assets.huaxu.app/browse/glb/image/uifubenchallengemapboss/bosssingletab32.png"
  },
  {
    boss: "Hamlet",
    slug: "hamlet",
    knight: "2.745.001",
    chaos: "4.215.001",
    hell: "6.000.001",
    start_time: "3.41s",
    weakness: "Each 3 ping increases all final damage taken by 1.15x, capped at 8 stacks.",
    img_url: "https://assets.huaxu.app/browse/glb/image/uifubenchallengemapboss/bosssingletab30.png"
  },
  {
    boss: "Lamia",
    slug: "lamia",
    knight: "2.096.501",
    chaos: "2.796.501",
    hell: "3.496.501",
    start_time: "5.32s",
    weakness: "Final basic attack and ultimate 50% damage increase.",
    img_url: "https://assets.huaxu.app/browse/glb/image/uifubenchallengemapboss/bosssingletab27.png"
  },
  {
    boss: "Voodoo",
    slug: "voodoo",
    knight: "3.775.801",
    chaos: "5.035.801",
    hell: "6.295.801",
    start_time: "5.37s",
    weakness: "Final dark damage is doubled.",
    img_url: "https://assets.huaxu.app/browse/glb/image/uifubenchallengemapboss/bosssingletab28.png"
  },
  {
    boss: "Siren",
    slug: "siren",
    knight: "1.923.813",
    chaos: "2.779.263",
    hell: "3.592.891",
    start_time: "5.40s",
    weakness: "Final lightning damage is doubled (Electrode).",
    img_url: "https://assets.huaxu.app/browse/glb/image/uifubenchallengemapboss/bosssingletab25.png"
  },
  {
    boss: "Moon Eater",
    slug: "mooneater",
    knight: "4.347.001",
    chaos: "6.673.501",
    hell: "9.499.501",
    start_time: "3.30s",
    weakness: "Final fire damage is doubled (Combustible). Sever arm in Matrix to deal 10% HP.",
    img_url: "https://assets.huaxu.app/browse/glb/image/uifubenchallengemapboss/bosssingletab31.png"
  },
  {
    boss: "Red Liv",
    slug: "redliv",
    knight: "2.934.001",
    chaos: "5.154.001",
    hell: "8.094.001",
    start_time: "4.98s",
    weakness: "Final physical damage is doubled (Frail). Takes more damage below threshold.",
    img_url: "https://assets.huaxu.app/browse/glb/image/uifubenchallengemapboss/bosssingletab29.png"
  },
  {
    boss: "Machiavelli",
    slug: "machiavelli",
    knight: "2.140.527",
    chaos: "3.091.027",
    hell: "3.995.903",
    start_time: "8.16s",
    weakness: "Final ice damage is doubled (Frost).",
    img_url: "https://assets.huaxu.app/browse/glb/image/uifubenchallengemapboss/bosssingletab23.png"
  },
  {
    boss: "Luna",
    slug: "luna",
    knight: "2.808.751",
    chaos: "3.746.251",
    hell: "4.796.251",
    start_time: "8.22s",
    weakness: "Final fire damage is doubled (Combustible).",
    img_url: "https://assets.huaxu.app/browse/glb/image/uifubenchallengemapboss/bosssingletab26.png"
  },
  {
    boss: "Moth Queen",
    slug: "mothqueen",
    knight: "1.605.677",
    chaos: "2.318.677",
    hell: "2.997.453",
    start_time: "3.22s",
    weakness: "Final dark damage is doubled (Corrosion). Weakened when wings are broken.",
    img_url: "https://assets.huaxu.app/browse/glb/image/uifubenchallengemapboss/bosssingletab22.png"
  },
  {
    boss: "Shark-Speare",
    slug: "sharkspeare",
    knight: "1.064.071",
    chaos: "1.536.571",
    hell: "1.986.391",
    start_time: "3.20s",
    weakness: "Play cute. No weakness.",
    img_url: "https://assets.huaxu.app/browse/glb/image/uifubenchallengemapboss/bosssingletab20.png"
  },
  {
    boss: "Qu",
    slug: "qu",
    knight: "1.494.187",
    chaos: "2.159.537",
    hell: "2.794.471",
    start_time: "6.15s",
    weakness: "Final physical damage is doubled (Frail).",
    img_url: "https://assets.huaxu.app/browse/glb/image/uifubenchallengemapboss/bosssingletab24.png"
  },
  {
    boss: "Huaxu",
    slug: "huaxu",
    knight: "459.901",
    chaos: "665.101",
    hell: "826.201",
    start_time: "3.83s",
    weakness: "+20% physical resistance, -40% ice resistance. Bleak state -500% EDR.",
    img_url: "https://assets.huaxu.app/browse/glb/image/uifubenchallengemapboss/bosssingletab18.png"
  },
  {
    boss: "Amberia",
    slug: "amberia",
    knight: "844.501",
    chaos: "1.219.501",
    hell: "1.576.501",
    start_time: "4.72s",
    weakness: "Final lightning damage is doubled.",
    img_url: "https://assets.huaxu.app/browse/glb/image/uifubenchallengemapboss/bosssingletab21.png"
  },
  {
    boss: "Camu",
    slug: "camu",
    knight: "551.881",
    chaos: "798.121",
    hell: "991.441",
    start_time: "5.33s",
    weakness: "-40% dark resistance. -30% EDR for attacks from Kamui.",
    img_url: "https://assets.huaxu.app/browse/glb/image/uifubenchallengemapboss/bosssingletab3.png"
  },
  {
    boss: "Rosetta",
    slug: "rosetta",
    knight: "459.901",
    chaos: "665.101",
    hell: "826.201",
    start_time: "7.03s",
    weakness: "-40% EDR for attacks within 3m.",
    img_url: "https://assets.huaxu.app/browse/glb/image/uifubenchallengemapboss/bosssingletab17.png"
  },
  {
    boss: "Musashi",
    slug: "musashi",
    knight: "459.901",
    chaos: "665.101",
    hell: "826.201",
    start_time: "3.90s",
    weakness: "-50% EDR for attacks from tanks.",
    img_url: "https://assets.huaxu.app/browse/glb/image/uifubenchallengemapboss/bosssingletab10.png"
  },
  {
    boss: "Gabriel",
    slug: "gabriel",
    knight: "844.501",
    chaos: "1.219.501",
    hell: "1.576.501",
    start_time: "5.80s",
    weakness: "Final fire damage is doubled.",
    img_url: "https://assets.huaxu.app/browse/glb/image/uifubenchallengemapboss/bosssingletab19.png"
  },
  {
    boss: "Alpha",
    slug: "alpha",
    knight: "459.901",
    chaos: "665.101",
    hell: "826.201",
    start_time: "3.67s",
    weakness: "-90% EDR for attacks from Rosetta, +90% EDR in parry stance.",
    img_url: "https://assets.huaxu.app/browse/glb/image/uifubenchallengemapboss/bosssingletab16.png"
  },
  {
    boss: "Chiko",
    slug: "chiko",
    knight: "13.790.000",
    chaos: "20.690.000",
    hell: "30.000.000",
    start_time: "5.15s",
    weakness: "Final physical damage is doubled.",
    img_url: "https://assets.huaxu.app/cn/image/uifubenchallengemapboss/bosssingletab51.webp"
  },
  {
    boss: "Overseer",
    slug: "overseer",
    knight: "15.230.000",
    chaos: "23.500.000",
    hell: "34.363.000",
    start_time: "5.25s",
    weakness: "Final lightning damage is doubled.",
    img_url: "https://assets.huaxu.app/glb/image/uifubenchallengemapboss/bosssingletab52.webp"
  }
];

// Helper score lookups
export const getPpcStageScore = (
  type: 'ultimate' | 'advanced',
  difficulty: 'knight' | 'chaos' | 'hell' | 'test' | 'elite',
  killTime: number
): number => {
  const time = Math.max(0, Math.min(60, Math.round(killTime)));
  if (type === 'advanced') {
    const row = ADVANCED_PPC_SCORES[time] || ADVANCED_PPC_SCORES[0];
    if (difficulty === 'knight') return row.knight;
    if (difficulty === 'chaos') return row.chaos;
    return row.hell;
  } else {
    const row = ULTIMATE_PPC_SCORES[time] || ULTIMATE_PPC_SCORES[0];
    if (difficulty === 'test') return row.test;
    if (difficulty === 'elite') return row.elite;
    if (difficulty === 'knight') return row.knight;
    if (difficulty === 'chaos') return row.chaos;
    return row.hell;
  }
};


export interface PPCBossInfo {
  name: string;
  slug: string;
  difficulty: 'Ultimate' | 'Advanced';
  hpKnight: number;
  hpChaos: number;
  hpHell: number;
  startTimeSec: number;
  weakness: string;
  imageUrl: string;
}

export const PPC_BOSSES: PPCBossInfo[] = FULL_PPC_BOSSES.map((b: PpcBossDetail) => ({
  name: b.boss,
  slug: b.slug,
  difficulty: 'Ultimate',
  hpKnight: parseInt(b.knight.replace(/\D/g, '')) || 0,
  hpChaos: parseInt(b.chaos.replace(/\D/g, '')) || 0,
  hpHell: parseInt(b.hell.replace(/\D/g, '')) || 0,
  startTimeSec: parseFloat(b.start_time) || 0,
  weakness: b.weakness || 'No elemental weakness spec.',
  imageUrl: b.img_url
}));

export const GOOGLE_SPREADSHEET_PPC_URL =
  'https://docs.google.com/spreadsheets/d/1z_L4MEGv5q89OFkuN2RNI1gjajddD3_NG169_f0RNrA/gviz/tq?tqx=out:csv&gid=1378072876';

const STORAGE_KEY_PPC_BOSSES = 'karuhun_ppc_bosses_custom_v1';

export function parseCSVLine(text: string): string[] {
  const result: string[] = [];
  let cell = '';
  let inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (c === '"') {
      if (inQuotes && text[i + 1] === '"') {
        cell += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (c === ',' && !inQuotes) {
      result.push(cell.trim());
      cell = '';
    } else {
      cell += c;
    }
  }
  result.push(cell.trim());
  return result;
}

export async function fetchAndSavePpcBossesFromSpreadsheet(): Promise<{
  success: boolean;
  count: number;
  updatedAt: string;
  error?: string;
}> {
  try {
    const res = await fetch(GOOGLE_SPREADSHEET_PPC_URL);
    if (!res.ok) throw new Error(`HTTP Error ${res.status}`);
    const text = await res.text();
    const lines = text.split(/\r?\n/).filter((l) => l.trim().length > 0);
    if (lines.length < 2) throw new Error('File CSV kosong atau tidak valid.');

    const bosses: PpcBossDetail[] = [];
    for (let i = 1; i < lines.length; i++) {
      const cols = parseCSVLine(lines[i]);
      if (cols.length >= 14 && cols[0]) {
        bosses.push({
          boss: cols[0],
          slug: cols[1] || cols[0].toLowerCase().replace(/\s+/g, '-'),
          super_armor: cols[2] || '',
          edr: cols[3] || '',
          deff: cols[4] || '',
          e_res: cols[5] || '',
          test: cols[6] || '',
          elite: cols[7] || '',
          knight: cols[8] || '',
          chaos: cols[9] || '',
          hell: cols[10] || '',
          start_time: cols[11] ? (cols[11].endsWith('s') ? cols[11] : `${cols[11]}s`) : '',
          weakness: cols[12] || '',
          img_url: cols[13] || ''
        });
      }
    }

    if (bosses.length === 0) throw new Error('Tidak ada data boss yang berhasil di-parse dari Google Sheet.');

    const payload = {
      updatedAt: new Date().toISOString(),
      count: bosses.length,
      bosses
    };

    localStorage.setItem(STORAGE_KEY_PPC_BOSSES, JSON.stringify(payload));

    if (isSupabaseConfigured() && supabase) {
      try {
        await supabase.from('guild_recap_snapshots').upsert({
          id: 'latest_ppc_bosses',
          fetched_at: payload.updatedAt,
          total_members: payload.count,
          is_auto: false,
          data: payload,
          updated_at: new Date().toISOString()
        });
      } catch (e) {
        console.warn('[PPCBosses] Supabase cloud sync notice:', e);
      }
    }

    return { success: true, count: bosses.length, updatedAt: payload.updatedAt };
  } catch (err: any) {
    console.error('[PPCBosses] Refresh spreadsheet failed:', err);
    return { success: false, count: 0, updatedAt: '', error: err.message || 'Gagal mengambil data dari Google Spreadsheet' };
  }
}

export function resetPpcBossesToDefault(): void {
  localStorage.removeItem(STORAGE_KEY_PPC_BOSSES);
}

export function getLiveOrStoredPpcBossesDetails(): { updatedAt?: string; bosses: PpcBossDetail[] } {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_PPC_BOSSES);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && Array.isArray(parsed.bosses) && parsed.bosses.length > 0) {
        return { updatedAt: parsed.updatedAt, bosses: parsed.bosses };
      }
    }
  } catch (e) {
    console.warn('[PPCBosses] Failed loading custom stored bosses:', e);
  }
  return { bosses: FULL_PPC_BOSSES };
}

export async function getLiveOrStoredPpcBossesDetailsAsync(): Promise<{ updatedAt?: string; bosses: PpcBossDetail[] }> {
  if (isSupabaseConfigured() && supabase) {
    try {
      const { data, error } = await supabase
        .from('guild_recap_snapshots')
        .select('data')
        .eq('id', 'latest_ppc_bosses')
        .single();
      if (!error && data && data.data && Array.isArray(data.data.bosses)) {
        try {
          localStorage.setItem(STORAGE_KEY_PPC_BOSSES, JSON.stringify(data.data));
        } catch (e) {}
        return { updatedAt: data.data.updatedAt, bosses: data.data.bosses };
      }
    } catch (e) {
      console.warn('[PPCBosses] Supabase read exception:', e);
    }
  }
  return getLiveOrStoredPpcBossesDetails();
}

export function getLiveOrStoredPpcBossesInfo(): { updatedAt?: string; bosses: PPCBossInfo[] } {
  const { updatedAt, bosses } = getLiveOrStoredPpcBossesDetails();
  const infoList: PPCBossInfo[] = bosses.map((b: PpcBossDetail) => ({
    name: b.boss,
    slug: b.slug,
    difficulty: 'Ultimate',
    hpKnight: parseInt(b.knight.replace(/\D/g, '')) || 0,
    hpChaos: parseInt(b.chaos.replace(/\D/g, '')) || 0,
    hpHell: parseInt(b.hell.replace(/\D/g, '')) || 0,
    startTimeSec: parseFloat(b.start_time) || 0,
    weakness: b.weakness || 'No elemental weakness spec.',
    imageUrl: b.img_url
  }));
  return { updatedAt, bosses: infoList };
}

export async function getLiveOrStoredPpcBossesInfoAsync(): Promise<{ updatedAt?: string; bosses: PPCBossInfo[] }> {
  const { updatedAt, bosses } = await getLiveOrStoredPpcBossesDetailsAsync();
  const infoList: PPCBossInfo[] = bosses.map((b: PpcBossDetail) => ({
    name: b.boss,
    slug: b.slug,
    difficulty: 'Ultimate',
    hpKnight: parseInt(b.knight.replace(/\D/g, '')) || 0,
    hpChaos: parseInt(b.chaos.replace(/\D/g, '')) || 0,
    hpHell: parseInt(b.hell.replace(/\D/g, '')) || 0,
    startTimeSec: parseFloat(b.start_time) || 0,
    weakness: b.weakness || 'No elemental weakness spec.',
    imageUrl: b.img_url
  }));
  return { updatedAt, bosses: infoList };
}


