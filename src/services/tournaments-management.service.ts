import { db as pool } from '../config/database';

interface GroupedTeam {
    id: number;
    name: string;
    tag: string;
    logo_url: string | null;
    wins: number;
    losses: number;
    points: number;
}

interface UnassignedTeam {
    id: number;
    name: string;
    tag: string;
    logo_url: string | null;
}

interface GroupData {
    name: string;
    teams: GroupedTeam[];
}

interface GroupsResponse {
    groups: GroupData[];
    unassigned: UnassignedTeam[];
}

export async function assignTeamsToGroups(
    tournamentId: number,
    assignments: Array<{ teamId: number; groupName: string | null }>
) {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        const teamIds = assignments.map(a => a.teamId);

        await client.query(
            `DELETE FROM matches WHERE tournament_id = $1 AND stage = 'groups' 
             AND (team_a_id = ANY($2) OR team_b_id = ANY($2))`,
            [tournamentId, teamIds]
        );

        for (const { teamId, groupName } of assignments) {
            await client.query(
                `INSERT INTO tournament_standings (tournament_id, team_id, group_name)
                 VALUES ($1, $2, $3)
                 ON CONFLICT (tournament_id, team_id) DO UPDATE SET group_name = $3`,
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

export async function getGroupsWithTeams(tournamentId: number): Promise<GroupsResponse> {
    const client = await pool.connect();
    try {
        const { rows: assignedRows } = await client.query(
            `SELECT ts.group_name, ts.team_id, t.name as team_name, t.tag as team_tag, 
                    t.logo_url as team_logo, ts.wins, ts.losses, ts.points
             FROM tournament_standings ts
             JOIN teams t ON ts.team_id = t.id
             WHERE ts.tournament_id = $1 AND ts.group_name IS NOT NULL
             ORDER BY ts.group_name, t.name`,
            [tournamentId]
        );

        const { rows: registeredRows } = await client.query(
            `SELECT t.id as team_id, t.name as team_name, t.tag as team_tag, t.logo_url as team_logo
             FROM tournament_registrations tr
             JOIN teams t ON tr.team_id = t.id
             WHERE tr.tournament_id = $1 AND (tr.status = 'APPROVED' OR tr.status = 'approved')`,
            [tournamentId]
        );

        const groupMap = new Map<string, GroupData>();
        const assignedTeamIds = new Set<number>();

        for (const row of assignedRows) {
            assignedTeamIds.add(row.team_id);

            if (!groupMap.has(row.group_name)) {
                groupMap.set(row.group_name, { name: row.group_name, teams: [] });
            }

            groupMap.get(row.group_name)!.teams.push({
                id: row.team_id,
                name: row.team_name,
                tag: row.team_tag,
                logo_url: row.team_logo,
                wins: row.wins ?? 0,
                losses: row.losses ?? 0,
                points: row.points ?? 0
            });
        }

        const unassigned: UnassignedTeam[] = registeredRows
            .filter((row: any) => !assignedTeamIds.has(row.team_id))
            .map((row: any) => ({
                id: row.team_id,
                name: row.team_name,
                tag: row.team_tag,
                logo_url: row.team_logo
            }));

        return { groups: Array.from(groupMap.values()), unassigned };
    } finally {
        client.release();
    }
}

export async function createSingleMatch(tournamentId: number, matchData: any) {
    const { rows } = await pool.query(
        `INSERT INTO matches 
         (tournament_id, stage, round, match_index, group_name, team_a_id, team_b_id, best_of, scheduled_to, status)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *`,
        [
            tournamentId, matchData.stage || 'groups', matchData.round || 1, matchData.matchIndex || 0,
            matchData.groupName || null, matchData.teamAId || null, matchData.teamBId || null,
            matchData.bestOf || 1, matchData.scheduledAt || null, matchData.status || 'scheduled'
        ]
    );
    return rows[0];
}

export async function bulkUpdateMatches(tournamentId: number, matchIds: number[], updates: any) {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        const { scheduledAt, bestOf, status } = updates;
        const updateParts: string[] = [];
        const values: any[] = [];
        let paramIndex = 1;

        if (scheduledAt !== undefined) {
            updateParts.push(`scheduled_to = $${paramIndex++}`);
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

        if (updateParts.length === 0) throw new Error('No fields to update');

        values.push(matchIds);
        values.push(tournamentId);

        const query = `
            UPDATE matches SET ${updateParts.join(', ')}, updated_at = NOW()
            WHERE id = ANY($${paramIndex++}) AND tournament_id = $${paramIndex}
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

export async function createCustomStage(tournamentId: number, stageData: any) {
    const { rows } = await pool.query(
        `INSERT INTO stages (tournament_id, name, type, order_index, config)
         VALUES ($1, $2, $3, $4, $5) RETURNING *`,
        [tournamentId, stageData.name, stageData.type, stageData.orderIndex || 0, stageData.config || {}]
    );
    return rows[0];
}

export async function generateGroupStageMatches(tournamentId: number, bestOf: number = 1) {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        await client.query("DELETE FROM matches WHERE tournament_id = $1", [tournamentId]);

        const { rows: standings } = await client.query(
            `SELECT team_id, group_name FROM tournament_standings 
             WHERE tournament_id = $1 AND group_name IS NOT NULL ORDER BY group_name, team_id`,
            [tournamentId]
        );

        if (standings.length === 0) throw new Error("No teams assigned to groups.");

        const groups: Record<string, number[]> = {};
        standings.forEach(s => {
            if (!groups[s.group_name]) groups[s.group_name] = [];
            groups[s.group_name].push(s.team_id);
        });

        let totalMatches = 0;

        for (const [groupName, teamIds] of Object.entries(groups)) {
            const n = teamIds.length;
            if (n < 2) continue;

            const teams = [...teamIds];
            if (n % 2 !== 0) teams.push(-1);

            const numTeams = teams.length;
            const numRounds = numTeams - 1;
            const matchesPerRound = numTeams / 2;

            for (let round = 0; round < numRounds; round++) {
                for (let match = 0; match < matchesPerRound; match++) {
                    const home = teams[match];
                    const away = teams[numTeams - 1 - match];

                    if (home === -1 || away === -1) continue;

                    await client.query(
                        `INSERT INTO matches (tournament_id, stage, group_name, round, team_a_id, team_b_id, best_of, status)
                         VALUES ($1, 'groups', $2, $3, $4, $5, $6, 'scheduled')`,
                        [tournamentId, groupName, round + 1, home, away, bestOf]
                    );
                    totalMatches++;
                }

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