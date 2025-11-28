import pool from '../db';


export async function create(data: any) {
const { rows } = await pool.query(
`INSERT INTO matches (bracket_id, stage_id, tournament_id, round, match_index, team_a_id, team_b_id, scheduled_at, best_of, status)
VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING *`,
[data.bracketId || null, data.stageId || null, data.tournamentId, data.round || 0, data.matchIndex || 0, data.teamAId, data.teamBId, data.scheduledAt || null, data.bestOf || 3, data.status || 'scheduled']
);
return rows[0];
}


export async function updateScore(id: number, scoreA: number, scoreB: number, status?: string) {
const { rows } = await pool.query('UPDATE matches SET score_a=$1, score_b=$2, status=$3, updated_at=now() WHERE id=$4 RETURNING *', [scoreA, scoreB, status || 'finished', id]);
return rows[0];
}