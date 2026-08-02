import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const HUAXU_BASE_URL = process.env.VITE_HUAXU_API_URL || 'https://api.huaxu.app';
const HUAXU_API_KEY = process.env.VITE_HUAXU_API_KEY || process.env.HUAXU_API_KEY || 'hxu-sWhLLMiqNnbAJRmYRMmnAknPmkWpderauqUxAsCvV7ppohcbugoqeKVdkPCJ';

const GUILDS = [
  { id: 3638, server: 'ap', name: 'Karuhun 夜' },
  { id: 1164, server: 'ap', name: 'Izanami 夜' },
  { id: 7641, server: 'ap', name: 'Astrelume 夜' },
  { id: 2013, server: 'na', name: 'Karuhun 夜’' }
];

async function fetchGuildMembers(guild) {
  const url = `${HUAXU_BASE_URL}/servers/${guild.server}/guilds/${guild.id}`;
  try {
    const res = await fetch(url, {
      headers: { 'x-api-key': HUAXU_API_KEY }
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();
    if (json.status === 'success' && json.data && json.data.members) {
      const guildName = json.data.guild?.name || guild.name;
      return json.data.members.map(member => ({
        guildId: guild.id,
        guildName: guildName,
        server: guild.server,
        playerId: member.playerId,
        name: member.name,
        weeklyContribution: member.contributeWeek ?? 0
      }));
    }
  } catch (err) {
    console.error(`Failed to fetch guild ${guild.id}:`, err.message);
  }
  return [];
}

async function main() {
  console.log('Fetching members from all 4 guilds...');
  let allMembers = [];

  for (const guild of GUILDS) {
    const members = await fetchGuildMembers(guild);
    console.log(`Fetched ${members.length} members for ${guild.name} (ID: ${guild.id})`);
    allMembers = allMembers.concat(members);
  }

  const exportData = {
    fetchedAt: new Date().toISOString(),
    totalMembers: allMembers.length,
    members: allMembers
  };

  const outputDir = path.join(__dirname, '../src/data/generated');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const fallbackDir = path.join(__dirname, '../src/data/fallbacks');
  if (!fs.existsSync(fallbackDir)) {
    fs.mkdirSync(fallbackDir, { recursive: true });
  }

  const outputPath = path.join(outputDir, 'guild_members_comparison.json');
  const fallbackPath = path.join(fallbackDir, 'guild_members_comparison.json');

  fs.writeFileSync(outputPath, JSON.stringify(exportData, null, 2), 'utf-8');
  fs.writeFileSync(fallbackPath, JSON.stringify(exportData, null, 2), 'utf-8');

  console.log(`Saved comparison JSON to ${outputPath} and ${fallbackPath}`);
  console.log(`Total member count: ${exportData.totalMembers}`);

  console.log('\n--- SUMMARY ---');
  console.log(`Total Guilds Processed: ${GUILDS.length}`);
  console.log(`Total Members Exported: ${allMembers.length}`);
}

main();
