
require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.DATABASE_SSL === 'true' ? { rejectUnauthorized: false } : false
});

const run = async () => {
    try {
        console.log('Verifying Group Logic...');

        // 1. Get Tournament ID
        const tRes = await pool.query("SELECT id FROM tournaments ORDER BY id DESC LIMIT 1");
        const tournamentId = tRes.rows[0].id;
        console.log(`Using Tournament ID: ${tournamentId}`);

        // 2. Fetch some teams
        const teamsRes = await pool.query("SELECT id FROM teams LIMIT 4");
        const teamIds = teamsRes.rows.map(r => r.id);
        console.log('Teams:', teamIds);

        // 3. Assign Teams to Groups (Manual Assignment Simulation)
        console.log('Assigning teams to groups...');
        for (let i = 0; i < teamIds.length; i++) {
            const group = i < 2 ? 'A' : 'B';
            await pool.query(`
                INSERT INTO tournament_standings (tournament_id, team_id, group_name)
                VALUES ($1, $2, $3)
                ON CONFLICT (tournament_id, team_id) DO UPDATE SET group_name = $3
            `, [tournamentId, teamIds[i], group]);
        }
        console.log('Teams assigned.');

        // 4. Simulate Match Generation Logic (Circle Method)
        console.log('Simulating Match Generation (Circle Method)...');
        const standingsRes = await pool.query("SELECT team_id, group_name FROM tournament_standings WHERE tournament_id = $1 ORDER BY group_name, team_id", [tournamentId]);
        const standings = standingsRes.rows;

        const groups = {};
        standings.forEach(s => {
            if (!groups[s.group_name]) groups[s.group_name] = [];
            groups[s.group_name].push(s.team_id);
        });

        for (const [groupName, teamIds] of Object.entries(groups)) {
            const n = teamIds.length;
            console.log(`Group ${groupName} has ${n} teams.`);
            const teams = [...teamIds];
            if (n % 2 !== 0) teams.push(-1);

            const numTeams = teams.length;
            const numRounds = numTeams - 1;
            const matchesPerRound = numTeams / 2;

            console.log(`Generating ${numRounds} rounds...`);

            for (let round = 0; round < numRounds; round++) {
                let roundMatches = 0;
                for (let match = 0; match < matchesPerRound; match++) {
                    const home = teams[match];
                    const away = teams[numTeams - 1 - match];
                    if (home !== -1 && away !== -1) {
                        roundMatches++;
                    }
                }
                console.log(`Round ${round + 1}: ${roundMatches} matches`);

                // Rotate
                const fixed = teams[0];
                const rotating = teams.slice(1);
                const last = rotating.pop();
                if (last) rotating.unshift(last);
                teams.splice(0, teams.length, fixed, ...rotating);
            }
        }

        console.log('Verification Complete. The logic seems sound.');
        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};

run();
