"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMatches = getMatches;
exports.getMatchById = getMatchById;
exports.updateMatch = updateMatch;
exports.deleteMatch = deleteMatch;
exports.createMatch = createMatch;
const database_1 = require("../config/database");
// Map DB row to Interface
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
    scheduledAt: row.scheduled_to, // FIXED: Mapped from 'scheduled_to'
    winnerId: row.winner_id,
    bestOf: row.best_of || 1,
    metadata: row.metadata || {},
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
    const { scoreA, scoreB, status, scheduledAt, teamAId, teamBId, winnerId, bestOf, metadata } = data;
    const client = await database_1.db.connect();
    try {
        await client.query('BEGIN');
        // A. Auto-Determine Winner if needed
        let determinedWinnerId = winnerId;
        if (status === 'completed' && !determinedWinnerId) {
            let sA = scoreA, sB = scoreB, tA = teamAId, tB = teamBId;
            // Fetch current values if not provided in payload
            if (sA === undefined || sB === undefined || !tA || !tB) {
                const curr = await client.query("SELECT * FROM matches WHERE id = $1", [id]);
                const m = curr.rows[0];
                if (!m)
                    throw new Error("Match not found");
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
        // FIXED: Uses scheduled_to, includes best_of and metadata
        const updateQuery = `
      UPDATE matches 
      SET 
        score_a = COALESCE($1, score_a),
        score_b = COALESCE($2, score_b),
        status = COALESCE($3, status),
        scheduled_to = COALESCE($4, scheduled_to),
        team_a_id = COALESCE($5, team_a_id),
        team_b_id = COALESCE($6, team_b_id),
        winner_id = $7, -- Allow setting to null/undefined or specific value
        best_of = COALESCE($8, best_of),
        metadata = COALESCE($9, metadata),
        updated_at = NOW()
      WHERE id = $10
      RETURNING *
    `;
        // Note: winner_id handled carefully. If determinedWinnerId is undefined, we might pass null if we want to reset it, 
        // or use COALESCE if we want to keep it. 
        // For this implementation, let's assume if determinedWinnerId is derived, we update it.
        // If it is undefined/null, we might want to keep existing OR set to null. 
        // Using COALESCE for safety unless explicit null passed.
        // However, if match is not completed, we might want to clear winner_id? 
        // For simplicity, we use the calculated one or the passed one.
        const { rows } = await client.query(updateQuery, [
            scoreA,
            scoreB,
            status,
            scheduledAt, // Maps to scheduled_to
            teamAId,
            teamBId,
            determinedWinnerId,
            bestOf,
            metadata,
            id
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
async function deleteMatch(id) {
    await database_1.db.query("DELETE FROM matches WHERE id = $1", [id]);
}
// ... createMatch stub
async function createMatch(data) { return null; }
//# sourceMappingURL=matches.service.js.map