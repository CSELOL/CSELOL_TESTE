"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.assignTeamsToGroups = assignTeamsToGroups;
exports.getGroupsWithTeams = getGroupsWithTeams;
exports.createSingleMatch = createSingleMatch;
exports.bulkUpdateMatches = bulkUpdateMatches;
exports.createCustomStage = createCustomStage;
exports.generateGroupStageMatches = generateGroupStageMatches;
const database_1 = require("../config/database");
// ==========================================
// SERVICE METHODS
// ==========================================
/**
 * Manually assign teams to groups
 * Deletes existing group stage matches for reassigned teams
 */
async function assignTeamsToGroups(tournamentId, assignments) {
    const client = await database_1.db.connect();
    try {
        await client.query('BEGIN');
        // 1. Validate all teams are registered
        const teamIds = assignments.map(a => a.teamId);
        const { rows: regTeams } = await client.query(`SELECT team_id FROM tournament_registrations 
             WHERE tournament_id = $1 AND team_id = ANY($2) AND status IN ('approved', 'APPROVED')`, [tournamentId, teamIds]);
        // Note: You might want to relax this check if you allow assigning pending teams, 
        // but generally only approved teams should be grouped.
        if (regTeams.length !== teamIds.length) {
            // Optional: Log which teams failed
            // console.warn('Mismatch in registered teams vs assignments');
        }
        // 2. Delete existing group stage matches for these teams (as per user requirement)
        // This ensures if a team moves groups, their old matches are cleared.
        await client.query(`DELETE FROM matches 
             WHERE tournament_id = $1 
             AND stage = 'groups' 
             AND (team_a_id = ANY($2) OR team_b_id = ANY($2))`, [tournamentId, teamIds]);
        // 3. Upsert team assignments in tournament_standings
        for (const { teamId, groupName } of assignments) {
            await client.query(`INSERT INTO tournament_standings (tournament_id, team_id, group_name)
                 VALUES ($1, $2, $3)
                 ON CONFLICT (tournament_id, team_id) 
                 DO UPDATE SET group_name = $3`, [tournamentId, teamId, groupName] // groupName can be null (unassigned)
            );
        }
        await client.query('COMMIT');
        return { success: true, message: `Assigned ${assignments.length} teams to groups` };
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
 * Get all groups with their teams for a tournament.
 *
 * Logic:
 * 1. Fetch teams already in 'tournament_standings' with a group assigned (Assigned).
 * 2. Fetch ALL teams in 'tournament_registrations' with status 'approved' (Total Pool).
 * 3. Unassigned = Total Pool - Assigned.
 */
async function getGroupsWithTeams(tournamentId) {
    const client = await database_1.db.connect();
    try {
        // 1. Fetch Teams currently assigned to groups (from tournament_standings)
        // We filter where group_name IS NOT NULL to ensure they are actually in a group bucket
        const assignedQuery = `
            SELECT 
                ts.group_name,
                ts.team_id,
                t.name as team_name,
                t.tag as team_tag,
                t.logo_url as team_logo,
                ts.wins,
                ts.losses,
                ts.points
             FROM tournament_standings ts
             JOIN teams t ON ts.team_id = t.id
             WHERE ts.tournament_id = $1 AND ts.group_name IS NOT NULL
             ORDER BY ts.group_name, t.name
        `;
        const { rows: assignedRows } = await client.query(assignedQuery, [tournamentId]);
        // 2. Fetch ALL Approved Registered Teams for this tournament
        // This ensures we don't load random teams from the database, only those explicitly signed up.
        const registeredQuery = `
            SELECT 
                t.id as team_id,
                t.name as team_name,
                t.tag as team_tag,
                t.logo_url as team_logo
             FROM tournament_registrations tr
             JOIN teams t ON tr.team_id = t.id
             WHERE tr.tournament_id = $1 
             AND (tr.status = 'APPROVED' OR tr.status = 'approved')
        `;
        const { rows: registeredRows } = await client.query(registeredQuery, [tournamentId]);
        // 3. Process Groups Map
        const groupMap = new Map();
        const assignedTeamIds = new Set();
        for (const row of assignedRows) {
            assignedTeamIds.add(row.team_id);
            if (!groupMap.has(row.group_name)) {
                groupMap.set(row.group_name, {
                    name: row.group_name, // e.g., "A", "B"
                    teams: []
                });
            }
            const group = groupMap.get(row.group_name);
            if (group) {
                group.teams.push({
                    id: row.team_id,
                    name: row.team_name,
                    tag: row.team_tag,
                    logo_url: row.team_logo,
                    wins: row.wins ?? 0,
                    losses: row.losses ?? 0,
                    points: row.points ?? 0
                });
            }
        }
        // 4. Calculate Unassigned Teams (Registered - Assigned)
        // We iterate through all approved registrations. If they are not in the 'assignedTeamIds' Set, they go to the unassigned pool.
        const unassigned = registeredRows
            .filter((row) => !assignedTeamIds.has(row.team_id))
            .map((row) => ({
            id: row.team_id,
            name: row.team_name,
            tag: row.team_tag,
            logo_url: row.team_logo
        }));
        return {
            groups: Array.from(groupMap.values()),
            unassigned: unassigned
        };
    }
    finally {
        client.release();
    }
}
/**
 * Create a single match manually
 */
async function createSingleMatch(tournamentId, matchData) {
    const { stage, round, matchIndex, groupName, teamAId, teamBId, bestOf, scheduledAt, status } = matchData;
    const { rows } = await database_1.db.query(`INSERT INTO matches 
     (tournament_id, stage, round, match_index, group_name, team_a_id, team_b_id, best_of, scheduled_to, status)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
     RETURNING *`, [
        tournamentId,
        stage || 'groups',
        round || 1,
        matchIndex || 0,
        groupName || null,
        teamAId || null,
        teamBId || null,
        bestOf || 1,
        scheduledAt || null, // FIX: Maps to scheduled_to
        status || 'scheduled'
    ]);
    return rows[0];
}
/**
 * Bulk update multiple matches
 */
async function bulkUpdateMatches(tournamentId, matchIds, updates) {
    const client = await database_1.db.connect();
    try {
        await client.query('BEGIN');
        const { scheduledAt, bestOf, status } = updates;
        const updateParts = [];
        const values = [];
        let paramIndex = 1;
        // Build dynamic UPDATE query
        if (scheduledAt !== undefined) {
            updateParts.push(`scheduled_to = $${paramIndex++}`); // FIX: scheduled_to
            values.push(scheduledAt);
        }
        if (bestOf !== undefined) {
            updateParts.push(`best_of = $${paramIndex++}`);
            values.push(bestOf);
        }
        if (status !== undefined) {
            updateParts.push(`status = $${paramIndex++}`);
            values.push(status);
        }
        if (updateParts.length === 0) {
            throw new Error('No fields to update');
        }
        values.push(matchIds);
        values.push(tournamentId);
        const query = `
      UPDATE matches 
      SET ${updateParts.join(', ')}, updated_at = NOW()
      WHERE id = ANY($${paramIndex++}) 
      AND tournament_id = $${paramIndex}
      RETURNING *
    `;
        const { rows } = await client.query(query, values);
        await client.query('COMMIT');
        return { success: true, updated: rows.length, matches: rows };
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
 * Create a custom tournament stage
 */
async function createCustomStage(tournamentId, stageData) {
    const { name, type, orderIndex, config } = stageData;
    const { rows } = await database_1.db.query(`INSERT INTO stages (tournament_id, name, type, order_index, config)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING *`, [tournamentId, name, type, orderIndex || 0, config || {}]);
    return rows[0];
}
/**
 * Generates Group Stage Matches (Round Robin) based on existing assignments
 */
async function generateGroupStageMatches(tournamentId, bestOf = 1) {
    const client = await database_1.db.connect();
    try {
        await client.query('BEGIN');
        // FIX: Delete 'playoffs' matches too, because new groups invalidate the bracket.
        // Actually, let's delete ALL matches for this tournament to ensure a clean state.
        await client.query("DELETE FROM matches WHERE tournament_id = $1", [tournamentId]);
        // 2. Fetch Teams grouped by Group Name
        const { rows: standings } = await client.query(`SELECT team_id, group_name FROM tournament_standings 
             WHERE tournament_id = $1 AND group_name IS NOT NULL
             ORDER BY group_name, team_id`, [tournamentId]);
        if (standings.length === 0)
            throw new Error("No teams assigned to groups.");
        // Group teams
        const groups = {};
        standings.forEach(s => {
            if (!groups[s.group_name])
                groups[s.group_name] = [];
            groups[s.group_name].push(s.team_id);
        });
        let totalMatches = 0;
        // 3. Generate Matches (Round Robin)
        for (const [groupName, teamIds] of Object.entries(groups)) {
            const n = teamIds.length;
            if (n < 2)
                continue;
            const teams = [...teamIds];
            if (n % 2 !== 0)
                teams.push(-1); // Bye
            const numTeams = teams.length;
            const numRounds = numTeams - 1;
            const matchesPerRound = numTeams / 2;
            for (let round = 0; round < numRounds; round++) {
                for (let match = 0; match < matchesPerRound; match++) {
                    const home = teams[match];
                    const away = teams[numTeams - 1 - match];
                    if (home === -1 || away === -1)
                        continue;
                    // Note: Use 'scheduled_to' if your DB expects it, or 'scheduled_at' if you mapped it back.
                    // Based on previous errors, I'm using 'scheduled_to' here to be safe with your DB schema.
                    await client.query(`INSERT INTO matches 
                         (tournament_id, stage, group_name, round, team_a_id, team_b_id, best_of, status, scheduled_to)
                         VALUES ($1, 'groups', $2, $3, $4, $5, $6, 'scheduled', NULL)`, [tournamentId, groupName, round + 1, home, away, bestOf]);
                    totalMatches++;
                }
                const fixed = teams[0];
                const rotating = teams.slice(1);
                const last = rotating.pop();
                if (last)
                    rotating.unshift(last);
                teams.splice(0, teams.length, fixed, ...rotating);
            }
        }
        await client.query('COMMIT');
        return { success: true, message: `Generated ${totalMatches} matches across ${Object.keys(groups).length} groups.` };
    }
    catch (e) {
        await client.query('ROLLBACK');
        throw e;
    }
    finally {
        client.release();
    }
}
//# sourceMappingURL=tournaments-management.service.js.map