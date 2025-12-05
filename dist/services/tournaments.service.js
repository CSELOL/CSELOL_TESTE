"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerTeam = void 0;
exports.createTournament = createTournament;
exports.getTournaments = getTournaments;
exports.getTournamentById = getTournamentById;
exports.updateTournament = updateTournament;
exports.deleteTournament = deleteTournament;
exports.generateGroupStage = generateGroupStage;
exports.generateBracket = generateBracket;
const database_1 = require("../config/database");
async function createTournament(data) {
    const { tournament_name, tournament_description, banner_url, logo_url, format, has_lower_bracket, start_date, is_listed, allow_signups, is_archived, status } = data;
    const query = `
    INSERT INTO tournaments 
      (tournament_name, tournament_description, banner_url, logo_url, format, has_lower_bracket, start_date, is_listed, allow_signups, is_archived, status, created_at, updated_at)
    VALUES 
      ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, NOW(), NOW())
    RETURNING *;
  `;
    const values = [
        tournament_name,
        tournament_description,
        banner_url,
        logo_url,
        format,
        has_lower_bracket,
        start_date,
        is_listed,
        allow_signups,
        is_archived || false,
        status
    ];
    const result = await database_1.db.query(query, values);
    return result.rows[0];
}
async function getTournaments() {
    const result = await database_1.db.query(`SELECT * FROM tournaments ORDER BY created_at DESC`);
    return result.rows;
}
async function getTournamentById(id) {
    const result = await database_1.db.query(`SELECT * FROM tournaments WHERE id = $1`, [id]);
    return result.rows[0];
}
async function updateTournament(id, data) {
    const { tournament_name, tournament_description, banner_url, logo_url, format, has_lower_bracket, start_date, is_listed, allow_signups, is_archived, status } = data;
    const query = `
    UPDATE tournaments
    SET
      tournament_name = COALESCE($1, tournament_name),
      tournament_description = COALESCE($2, tournament_description),
      banner_url = COALESCE($3, banner_url),
      logo_url = COALESCE($4, logo_url),
      format = COALESCE($5, format),
      has_lower_bracket = COALESCE($6, has_lower_bracket),
      start_date = COALESCE($7, start_date),
      is_listed = COALESCE($8, is_listed),
      allow_signups = COALESCE($9, allow_signups),
      is_archived = COALESCE($10, is_archived),
      status = COALESCE($11, status),
      updated_at = NOW()
    WHERE id = $12
    RETURNING *;
  `;
    const values = [
        tournament_name,
        tournament_description,
        banner_url,
        logo_url,
        format,
        has_lower_bracket,
        start_date,
        is_listed,
        allow_signups,
        is_archived,
        status,
        id
    ].map(val => val === undefined ? null : val);
    const result = await database_1.db.query(query, values);
    return result.rows[0];
}
async function deleteTournament(id) {
    const query = `DELETE FROM tournaments WHERE id = $1 RETURNING *;`;
    const values = [id];
    const result = await database_1.db.query(query, values);
    return result.rows[0];
}
const registerTeam = async (tournamentId, teamId, paymentProofUrl) => {
    const client = await database_1.db.connect();
    try {
        await client.query('BEGIN');
        const tournamentRes = await client.query('SELECT * FROM tournaments WHERE id = $1', [tournamentId]);
        if (tournamentRes.rows.length === 0)
            throw new Error('Tournament not found');
        const existingReg = await client.query('SELECT * FROM tournament_registrations WHERE tournament_id = $1 AND team_id = $2', [tournamentId, teamId]);
        if (existingReg.rows.length > 0)
            throw new Error('Team is already registered for this tournament');
        const result = await client.query(`INSERT INTO tournament_registrations (tournament_id, team_id, payment_proof_url, status)
       VALUES ($1, $2, $3, 'pending') RETURNING *`, [tournamentId, teamId, paymentProofUrl]);
        await client.query('COMMIT');
        return result.rows[0];
    }
    catch (e) {
        await client.query('ROLLBACK');
        throw e;
    }
    finally {
        client.release();
    }
};
exports.registerTeam = registerTeam;
/**
 * Generates a Group Stage (Round Robin)
 * - Splits teams into N groups (e.g., 2 groups)
 * - Creates matches so everyone plays everyone in their group
 */
async function generateGroupStage(tournamentId, numberOfGroups = 1, bestOf = 1) {
    const client = await database_1.db.connect();
    try {
        await client.query('BEGIN');
        // 1. Cleanup: Wipe existing matches/standings for this tournament to start fresh
        await client.query('DELETE FROM matches WHERE tournament_id = $1', [tournamentId]);
        await client.query('DELETE FROM tournament_standings WHERE tournament_id = $1', [tournamentId]);
        // 2. Fetch Teams
        const { rows: teams } = await client.query(`SELECT team_id FROM tournament_registrations 
       WHERE tournament_id = $1 AND status IN ('approved', 'APPROVED')`, [tournamentId]);
        if (teams.length < 2)
            throw new Error("Need at least 2 teams.");
        // 3. Shuffle and Distribute into Groups
        const shuffled = teams.sort(() => 0.5 - Math.random());
        const groups = Array.from({ length: numberOfGroups }, () => []);
        shuffled.forEach((team, index) => {
            const groupIndex = index % numberOfGroups;
            groups[groupIndex].push(team);
        });
        // 4. Create Matches & Standings for each Group
        const groupNames = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H']; // Support up to 8 groups easily
        for (let g = 0; g < groups.length; g++) {
            const groupName = groupNames[g];
            const groupTeams = groups[g];
            // A. Initialize Standings
            for (const t of groupTeams) {
                await client.query(`INSERT INTO tournament_standings (tournament_id, team_id, group_name) VALUES ($1, $2, $3)`, [tournamentId, t.team_id, groupName]);
            }
            // B. Generate Round Robin Schedule
            // Circle Method Logic or Simple Double Loop
            for (let i = 0; i < groupTeams.length; i++) {
                for (let j = i + 1; j < groupTeams.length; j++) {
                    const t1 = groupTeams[i].team_id;
                    const t2 = groupTeams[j].team_id;
                    // Create Match
                    await client.query(`INSERT INTO matches 
                    (tournament_id, stage, group_name, team_a_id, team_b_id, best_of, status)
                    VALUES ($1, 'groups', $2, $3, $4, $5, 'scheduled')`, [tournamentId, groupName, t1, t2, bestOf]);
                }
            }
        }
        await client.query('COMMIT');
        return { success: true, message: `Generated ${groups.length} groups.` };
    }
    catch (e) {
        await client.query('ROLLBACK');
        throw e;
    }
    finally {
        client.release();
    }
}
/**
 * Generates a Playoff Bracket
 * - Can be seeded manually or random
 */
async function generateBracket(tournamentId, bestOf = 3) {
    const client = await database_1.db.connect();
    try {
        await client.query('BEGIN');
        // Wipe matches only (keep standings if they exist)
        // NOTE: In a real app, you might only wipe 'playoffs' stage matches
        await client.query("DELETE FROM matches WHERE tournament_id = $1 AND stage = 'playoffs'", [tournamentId]);
        // Fetch Teams
        const { rows: teams } = await client.query(`SELECT team_id FROM tournament_registrations 
       WHERE tournament_id = $1 AND status IN ('approved', 'APPROVED')`, [tournamentId]);
        if (teams.length < 2)
            throw new Error("Not enough teams (min 2)");
        const shuffled = teams.sort(() => 0.5 - Math.random());
        let matchIndex = 0;
        // Round 1 (Quarterfinals, etc.)
        for (let i = 0; i < shuffled.length; i += 2) {
            if (i + 1 < shuffled.length) {
                await client.query(`INSERT INTO matches (tournament_id, stage, round, match_index, team_a_id, team_b_id, best_of, status)
           VALUES ($1, 'playoffs', 1, $2, $3, $4, $5, 'scheduled')`, [tournamentId, matchIndex, shuffled[i].team_id, shuffled[i + 1].team_id, bestOf]);
                matchIndex++;
            }
            else {
                // Bye
                await client.query(`INSERT INTO matches (tournament_id, stage, round, match_index, team_a_id, winner_id, status)
             VALUES ($1, 'playoffs', 1, $2, $3, $3, 'completed')`, [tournamentId, matchIndex, shuffled[i].team_id]);
                matchIndex++;
            }
        }
        // Empty Future Rounds
        let currentMatches = matchIndex;
        let round = 2;
        while (currentMatches > 1 || (round === 2 && currentMatches === 1)) {
            const nextCount = Math.floor(currentMatches / 2);
            if (nextCount > 0) {
                for (let i = 0; i < nextCount; i++) {
                    await client.query(`INSERT INTO matches (tournament_id, stage, round, match_index, best_of, status)
                VALUES ($1, 'playoffs', $2, $3, $4, 'scheduled')`, [tournamentId, round, i, bestOf] // Best Of 3/5 for later rounds? Can configure here.
                    );
                }
            }
            else
                break;
            currentMatches = nextCount;
            round++;
        }
        await client.query('COMMIT');
        return { success: true };
    }
    catch (e) {
        await client.query('ROLLBACK');
        throw e;
    }
    finally {
        client.release();
    }
}
//# sourceMappingURL=tournaments.service.js.map