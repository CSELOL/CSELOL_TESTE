import { db as pool } from '../config/database';

export interface MatchPlayer {
    id: number;
    matchId: number;
    playerId: number;
    teamId: number;
    stats: any;
    createdAt: string;
    // Denormalized fields from join
    nickname?: string;
    avatarUrl?: string;
    riotId?: string;
    primaryRole?: string;
}

/**
 * Get all players for a specific match
 */
export async function getMatchPlayers(matchId: number): Promise<MatchPlayer[]> {
    const result = await pool.query(
        `SELECT mp.*, u.nickname, u.avatar_url, u.riot_id, u.primary_role
     FROM match_players mp
     JOIN users u ON mp.player_id = u.id
     WHERE mp.match_id = $1
     ORDER BY mp.team_id, mp.id`,
        [matchId]
    );
    return result.rows.map(mapMatchPlayer);
}

/**
 * Set players for a match (replaces existing)
 * @param matchId - The match ID
 * @param teamAPlayerIds - Array of user IDs for team A
 * @param teamBPlayerIds - Array of user IDs for team B
 * @param teamAId - Team A's ID
 * @param teamBId - Team B's ID
 */
export async function setMatchPlayers(
    matchId: number,
    teamAPlayerIds: number[],
    teamBPlayerIds: number[],
    teamAId: number,
    teamBId: number
): Promise<void> {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        // Clear existing players for this match
        await client.query('DELETE FROM match_players WHERE match_id = $1', [matchId]);

        // Insert team A players
        for (const playerId of teamAPlayerIds) {
            await client.query(
                `INSERT INTO match_players (match_id, player_id, team_id) VALUES ($1, $2, $3)`,
                [matchId, playerId, teamAId]
            );
        }

        // Insert team B players
        for (const playerId of teamBPlayerIds) {
            await client.query(
                `INSERT INTO match_players (match_id, player_id, team_id) VALUES ($1, $2, $3)`,
                [matchId, playerId, teamBId]
            );
        }

        await client.query('COMMIT');
    } catch (e) {
        await client.query('ROLLBACK');
        throw e;
    } finally {
        client.release();
    }
}

/**
 * Auto-capture current team rosters for a match
 * Used when a match is marked as completed to snapshot who was on each team
 */
export async function captureMatchRosters(
    matchId: number,
    teamAId: number,
    teamBId: number
): Promise<void> {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        // Check if players already recorded for this match
        const existing = await client.query(
            'SELECT COUNT(*) FROM match_players WHERE match_id = $1',
            [matchId]
        );

        if (parseInt(existing.rows[0].count) > 0) {
            // Players already recorded, don't overwrite
            await client.query('ROLLBACK');
            return;
        }

        // Get team A roster
        const teamARoster = await client.query(
            `SELECT id FROM users WHERE team_id = $1 AND deleted_at IS NULL`,
            [teamAId]
        );

        // Get team B roster
        const teamBRoster = await client.query(
            `SELECT id FROM users WHERE team_id = $1 AND deleted_at IS NULL`,
            [teamBId]
        );

        // Insert team A players
        for (const player of teamARoster.rows) {
            await client.query(
                `INSERT INTO match_players (match_id, player_id, team_id) VALUES ($1, $2, $3)`,
                [matchId, player.id, teamAId]
            );
        }

        // Insert team B players
        for (const player of teamBRoster.rows) {
            await client.query(
                `INSERT INTO match_players (match_id, player_id, team_id) VALUES ($1, $2, $3)`,
                [matchId, player.id, teamBId]
            );
        }

        await client.query('COMMIT');
    } catch (e) {
        await client.query('ROLLBACK');
        throw e;
    } finally {
        client.release();
    }
}

/**
 * Update player stats for a match (e.g., kills, deaths, etc.)
 */
export async function updateMatchPlayerStats(
    matchId: number,
    playerId: number,
    stats: Record<string, any>
): Promise<void> {
    await pool.query(
        `UPDATE match_players SET stats = $1 WHERE match_id = $2 AND player_id = $3`,
        [JSON.stringify(stats), matchId, playerId]
    );
}

function mapMatchPlayer(row: any): MatchPlayer {
    return {
        id: row.id,
        matchId: row.match_id,
        playerId: row.player_id,
        teamId: row.team_id,
        stats: row.stats || {},
        createdAt: row.created_at,
        nickname: row.nickname,
        avatarUrl: row.avatar_url,
        riotId: row.riot_id,
        primaryRole: row.primary_role
    };
}
