import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const HUAXU_BASE_URL = process.env.VITE_HUAXU_API_URL || 'https://api.huaxu.app';
const HUAXU_API_KEY = process.env.VITE_HUAXU_API_KEY || process.env.HUAXU_API_KEY || '';

const guildBranchesPath = path.join(__dirname, '../src/data/config/guildBranches.json');
const GUILDS = JSON.parse(fs.readFileSync(guildBranchesPath, 'utf-8'));

async function fetchGuildMembers(guild, isLive = true) {
  const endpoint = isLive ? 'live/guilds' : 'guilds';
  const url = `${HUAXU_BASE_URL}/servers/${guild.server}/${endpoint}/${guild.id}`;
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
  console.log('Fetching members from all 4 guilds in parallel...');

  const results = await Promise.allSettled(
    GUILDS.map(guild => fetchGuildMembers(guild))
  );

  let allMembers = [];
  results.forEach((result, i) => {
    if (result.status === 'fulfilled') {
      const members = result.value;
      console.log(`Fetched ${members.length} members for ${GUILDS[i].name} (ID: ${GUILDS[i].id})`);
      allMembers = allMembers.concat(members);
    } else {
      console.error(`Failed to fetch guild ${GUILDS[i].name}:`, result.reason);
    }
  });

  const exportData = {
    fetchedAt: new Date().toISOString(),
    totalMembers: allMembers.length,
    members: allMembers
  };

  const outputDir = path.join(__dirname, '../src/data/generated');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const outputPath = path.join(outputDir, 'guild_members_comparison.json');
  fs.writeFileSync(outputPath, JSON.stringify(exportData, null, 2), 'utf-8');

  console.log(`Saved snapshot to ${outputPath}`);
  console.log('\n--- SUMMARY ---');
  console.log(`Total Guilds Processed: ${GUILDS.length}`);
  console.log(`Total Members Exported: ${allMembers.length}`);
}

main();
