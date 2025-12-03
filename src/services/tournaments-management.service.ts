import { db as pool } from '../config/database';

// ==========================================
// MANUAL TOURNAMENT MANAGEMENT
// ==========================================

/**
 * Manually assign teams to groups
 * Deletes existing group stage matches for reassigned teams
 */
export async function assignTeamsToGroups(
    tournamentId: number,
    assignments: Array<{ teamId: number; groupName: string | null }>
) {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        // 1. Validate all teams are registered
        const teamIds = assignments.map(a => a.teamId);
        const { rows: regTeams } = await client.query(
            `SELECT team_id FROM tournament_registrations 
       WHERE tournament_id = $1 AND team_id = ANY($2) AND status IN ('approved', 'APPROVED')`,
            [tournamentId, teamIds]
        );

        if (regTeams.length !== teamIds.length) {
            throw new Error('Some teams are not registered or approved for this tournament');
        }

        // 2. Delete existing group stage matches for these teams (as per user requirement)
        await client.query(
            `DELETE FROM matches 
       WHERE tournament_id = $1 
       AND stage = 'groups' 
       AND (team_a_id = ANY($2) OR team_b_id = ANY($2))`,
            [tournamentId, teamIds]
        );

        // 3. Upsert team assignments in tournament_standings
        for (const { teamId, groupName } of assignments) {
            await client.query(
                `INSERT INTO tournament_standings (tournament_id, team_id, group_name)
         VALUES ($1, $2, $3)
         ON CONFLICT (tournament_id, team_id) 
         DO UPDATE SET group_name = $3`,
                [tournamentId, teamId, groupName]
            );
        }

        await client.query('COMMIT');
        return { success: true, message: `Assigned ${assignments.length} teams to groups` };
    } catch (e) {
        await client.query('ROLLBACK');
        throw e;
    } finally {
        client.release();
    }
}

/**
 * Get all groups with their teams for a tournament
 */
export async function getGroupsWithTeams(tournamentId: number) {
    const { rows } = await pool.query(
        `SELECT 
      ts.group_name,
      ts.team_id,
      t.name as team_name,
      t.tag as team_tag,
      t.logo_url as team_logo,
      ts.wins,
      ts.losses,
      ts.points,
      (SELECT COUNT(*) FROM matches m 
       WHERE m.tournament_id = $1 
       AND m.stage = 'groups' 
       AND (m.team_a_id = ts.team_id OR m.team_b_id = ts.team_id)
      ) as match_count
     FROM tournament_standings ts
     JOIN teams t ON ts.team_id = t.id
     WHERE ts.tournament_id = $1
     ORDER BY ts.group_name NULLS LAST, t.name`,
        [tournamentId]
    );

    // Group by group_name
    const grouped: any = {
        groups: [],
        unassigned: []
    };

    const groupMap = new Map<string, any>();

    for (const row of rows) {
        const team = {
            id: row.team_id,
            name: row.team_name,
            tag: row.team_tag,
            logo_url: row.team_logo,
            wins: row.wins || 0,
            losses: row.losses || 0,
            points: row.points || 0,
            matchCount: parseInt(row.match_count)
        };

        if (row.group_name === null) {
            grouped.unassigned.push(team);
        } else {
            if (!groupMap.has(row.group_name)) {
                groupMap.set(row.group_name, {
                    name: row.group_name,
                    teams: []
                });
            }
            groupMap.get(row.group_name).teams.push(team);
        }
    }

    grouped.groups = Array.from(groupMap.values());
    return grouped;
}

/**
 * Create a single match manually
 */
export async function createSingleMatch(tournamentId: number, matchData: any) {
    const {
        stage,
        round,
        matchIndex,
        groupName,
        teamAId,
        teamBId,
        bestOf,
        scheduledAt,
        status
    } = matchData;

    const { rows } = await pool.query(
        `INSERT INTO matches 
     (tournament_id, stage, round, match_index, group_name, team_a_id, team_b_id, best_of, scheduled_at, status)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
     RETURNING *`,
        [
            tournamentId,
            stage || 'groups',
            round || 1,
            matchIndex || 0,
            groupName || null,
            teamAId || null,
            teamBId || null,
            bestOf || 1,
            scheduledAt || null,
            status || 'scheduled'
        ]
    );

    return rows[0];
}

/**
 * Bulk update multiple matches
 */
export async function bulkUpdateMatches(
    tournamentId: number,
    matchIds: number[],
    updates: any
) {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        const { scheduledAt, bestOf, status } = updates;
        const updateParts: string[] = [];
        const values: any[] = [];
        let paramIndex = 1;

        // Build dynamic UPDATE query
        if (scheduledAt !== undefined) {
            updateParts.push(`scheduled_at = $${paramIndex++}`);
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
    } catch (e) {
        await client.query('ROLLBACK');
        throw e;
    } finally {
        client.release();
    }
}

/**
 * Create a custom tournament stage
 */
export async function createCustomStage(tournamentId: number, stageData: any) {
    const { name, type, orderIndex, config } = stageData;

    const { rows } = await pool.query(
        `INSERT INTO stages (tournament_id, name, type, order_index, config)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING *`,
        [tournamentId, name, type, orderIndex || 0, config || {}]
    );

    return rows[0];
}

/**
 * Generates Group Stage Matches (Round Robin) based on existing assignments
 */
export async function generateGroupStageMatches(tournamentId: number, bestOf: number = 1) {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        // 1. Cleanup: Wipe existing matches for 'groups' stage
        await client.query("DELETE FROM matches WHERE tournament_id = $1 AND stage = 'groups'", [tournamentId]);

        // 2. Fetch Teams grouped by Group Name
        const { rows: standings } = await client.query(
            `SELECT team_id, group_name FROM tournament_standings 
             WHERE tournament_id = $1 AND group_name IS NOT NULL
             ORDER BY group_name, team_id`,
            [tournamentId]
        );

        if (standings.length === 0) throw new Error("No teams assigned to groups.");

        // Group teams
        const groups: Record<string, number[]> = {};
        standings.forEach(s => {
            if (!groups[s.group_name]) groups[s.group_name] = [];
            groups[s.group_name].push(s.team_id);
        });

        let totalMatches = 0;

        // 3. Generate Matches
        for (const [groupName, teamIds] of Object.entries(groups)) {
            const n = teamIds.length;
            if (n < 2) continue;

            // Circle Method
            const teams = [...teamIds];
            if (n % 2 !== 0) teams.push(-1); // Bye

            const numTeams = teams.length;
            const numRounds = numTeams - 1;
            const matchesPerRound = numTeams / 2;

            for (let round = 0; round < numRounds; round++) {
                for (let match = 0; match < matchesPerRound; match++) {
                    const home = teams[match];
                    const away = teams[numTeams - 1 - match];

                    if (home === -1 || away === -1) continue;

                    await client.query(
                        `INSERT INTO matches 
                         (tournament_id, stage, group_name, round, team_a_id, team_b_id, best_of, status)
                         VALUES ($1, 'groups', $2, $3, $4, $5, $6, 'scheduled')`,
                        [tournamentId, groupName, round + 1, home, away, bestOf]
                    );
                    totalMatches++;
                }

                // Rotate
                const fixed = teams[0];
                const rotating = teams.slice(1);
                const last = rotating.pop();
                if (last) rotating.unshift(last);
                teams.splice(0, teams.length, fixed, ...rotating);
            }
        }

        await client.query('COMMIT');
        return { success: true, message: `Generated ${totalMatches} matches across ${Object.keys(groups).length} groups.` };
    } catch (e) {
        await client.query('ROLLBACK');
        throw e;
    } finally {
        client.release();
    }
}
