"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMatches = getMatches;
exports.getMatchById = getMatchById;
exports.updateMatch = updateMatch;
exports.createMatch = createMatch;
exports.deleteMatch = deleteMatch;
const database_1 = require("../config/database");
// 2. Helper to map DB Row -> Interface
const mapMatch = (row) => ({
    id: row.id,
    tournamentId: row.tournament_id,
    round: row.round,
    matchIndex: row.match_index,
    teamAId: row.team_a_id,
    teamBId: row.team_b_id,
    scoreA: row.score_a || 0,
    scoreB: row.score_b || 0,
    status: row.status || 'scheduled',
    scheduledAt: row.scheduled_at,
    winnerId: row.winner_id,
    teamAName: row.team_a_name,
    teamATag: row.team_a_tag,
    teamALogo: row.team_a_logo,
    teamBName: row.team_b_name,
    teamBTag: row.team_b_tag,
    teamBLogo: row.team_b_logo
});
async function getMatches(tournamentId) {
    const query = `
    SELECT 
      m.*,
      t1.name as team_a_name, t1.tag as team_a_tag, t1.logo_url as team_a_logo,
      t2.name as team_b_name, t2.tag as team_b_tag, t2.logo_url as team_b_logo
    FROM matches m
    LEFT JOIN teams t1 ON m.team_a_id = t1.id
    LEFT JOIN teams t2 ON m.team_b_id = t2.id
    WHERE m.tournament_id = $1
    ORDER BY m.round ASC, m.match_index ASC;
  `;
    const { rows } = await database_1.db.query(query, [tournamentId]);
    return rows.map(mapMatch);
}
async function getMatchById(id) {
    const { rows } = await database_1.db.query("SELECT * FROM matches WHERE id = $1", [id]);
    return rows[0] ? mapMatch(rows[0]) : null;
}
async function updateMatch(id, data) {
    const { scoreA, scoreB, status, scheduledAt, teamAId, teamBId, winnerId } = data;
    const client = await database_1.db.connect();
    try {
        await client.query('BEGIN');
        // A. Auto-Determine Winner
        let determinedWinnerId = winnerId;
        if (status === 'completed' && !determinedWinnerId) {
            // Check passed data first, then fallback to DB if partial update
            let sA = scoreA, sB = scoreB, tA = teamAId, tB = teamBId;
            if (sA === undefined || sB === undefined || !tA || !tB) {
                const curr = await client.query("SELECT * FROM matches WHERE id = $1", [id]);
                const m = curr.rows[0];
                sA = sA ?? m.score_a;
                sB = sB ?? m.score_b;
                tA = tA ?? m.team_a_id;
                tB = tB ?? m.team_b_id;
            }
            if (sA > sB)
                determinedWinnerId = tA;
            else if (sB > sA)
                determinedWinnerId = tB;
        }
        // B. Update DB
        const updateQuery = `
      UPDATE matches 
      SET 
        score_a = COALESCE($1, score_a),
        score_b = COALESCE($2, score_b),
        status = COALESCE($3, status),
        scheduled_at = COALESCE($4, scheduled_at),
        team_a_id = COALESCE($5, team_a_id),
        team_b_id = COALESCE($6, team_b_id),
        winner_id = COALESCE($7, winner_id),
        updated_at = NOW()
      WHERE id = $8
      RETURNING *
    `;
        const { rows } = await client.query(updateQuery, [
            scoreA, scoreB, status, scheduledAt, teamAId, teamBId, determinedWinnerId, id
        ]);
        const currentMatch = rows[0];
        // C. Progression Logic (Move winner to next round)
        if (status === 'completed' && determinedWinnerId) {
            const nextRound = currentMatch.round + 1;
            const nextMatchIndex = Math.floor(currentMatch.match_index / 2);
            const targetColumn = (currentMatch.match_index % 2) === 0 ? 'team_a_id' : 'team_b_id';
            await client.query(`UPDATE matches SET ${targetColumn} = $1 
             WHERE tournament_id = $2 AND round = $3 AND match_index = $4`, [determinedWinnerId, currentMatch.tournament_id, nextRound, nextMatchIndex]);
        }
        await client.query('COMMIT');
        return mapMatch(currentMatch);
    }
    catch (e) {
        await client.query('ROLLBACK');
        throw e;
    }
    finally {
        client.release();
    }
}
async function createMatch(data) {
    // Internal use only generally
    return null;
}
async function deleteMatch(id) {
    await database_1.db.query("DELETE FROM matches WHERE id = $1", [id]);
}
//# sourceMappingURL=matches.service.js.map