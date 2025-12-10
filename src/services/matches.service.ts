import { db as pool } from "../config/database";

export interface Match {
  id: number;
  tournamentId: number;
  round: number;
  matchIndex: number;
  teamAId: number | null;
  teamBId: number | null;
  scoreA: number;
  scoreB: number;
  status: 'scheduled' | 'live' | 'completed';
  scheduledAt: string | null;
  winnerId: number | null;
  bestOf: number;
  metadata: any;
  teamAName?: string;
  teamATag?: string;
  teamALogo?: string;
  teamBName?: string;
  teamBTag?: string;
  teamBLogo?: string;
}

const mapMatch = (row: any): Match => ({
  id: row.id,
  tournamentId: row.tournament_id,
  round: row.round,
  matchIndex: row.match_index,
  teamAId: row.team_a_id,
  teamBId: row.team_b_id,
  scoreA: row.score_a || 0,
  scoreB: row.score_b || 0,
  status: row.status || 'scheduled',
  scheduledAt: row.scheduled_to,
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

export async function getMatches(tournamentId: number) {
  const query = `
    SELECT m.*,
      t1.name as team_a_name, t1.tag as team_a_tag, t1.logo_url as team_a_logo,
      t2.name as team_b_name, t2.tag as team_b_tag, t2.logo_url as team_b_logo
    FROM matches m
    LEFT JOIN teams t1 ON m.team_a_id = t1.id
    LEFT JOIN teams t2 ON m.team_b_id = t2.id
    WHERE m.tournament_id = $1
    ORDER BY m.round ASC, m.match_index ASC;
  `;
  const { rows } = await pool.query(query, [tournamentId]);
  return rows.map(mapMatch);
}

export async function getMatchById(id: number) {
  const { rows } = await pool.query("SELECT * FROM matches WHERE id = $1", [id]);
  return rows[0] ? mapMatch(rows[0]) : null;
}

export async function updateMatch(id: number, data: any) {
  const { scoreA, scoreB, status, scheduledAt, teamAId, teamBId, winnerId, bestOf, metadata } = data;

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    let determinedWinnerId = winnerId;
    if (status === 'completed' && !determinedWinnerId) {
      let sA = scoreA, sB = scoreB, tA = teamAId, tB = teamBId;
      if (sA === undefined || sB === undefined || !tA || !tB) {
        const curr = await client.query("SELECT * FROM matches WHERE id = $1", [id]);
        const m = curr.rows[0];
        if (!m) throw new Error("Match not found");
        sA = sA ?? m.score_a;
        sB = sB ?? m.score_b;
        tA = tA ?? m.team_a_id;
        tB = tB ?? m.team_b_id;
      }
      if (sA > sB) determinedWinnerId = tA;
      else if (sB > sA) determinedWinnerId = tB;
    }

    const updateQuery = `
      UPDATE matches SET 
        score_a = COALESCE($1, score_a),
        score_b = COALESCE($2, score_b),
        status = COALESCE($3, status),
        scheduled_to = COALESCE($4, scheduled_to),
        team_a_id = COALESCE($5, team_a_id),
        team_b_id = COALESCE($6, team_b_id),
        winner_id = $7,
        best_of = COALESCE($8, best_of),
        metadata = COALESCE($9, metadata),
        updated_at = NOW()
      WHERE id = $10
      RETURNING *
    `;

    const { rows } = await client.query(updateQuery, [
      scoreA, scoreB, status, scheduledAt, teamAId, teamBId, determinedWinnerId, bestOf, metadata, id
    ]);
    const currentMatch = rows[0];

    if (status === 'completed' && determinedWinnerId) {
      const nextRound = currentMatch.round + 1;
      const nextMatchIndex = Math.floor(currentMatch.match_index / 2);
      const targetColumn = (currentMatch.match_index % 2) === 0 ? 'team_a_id' : 'team_b_id';

      await client.query(
        `UPDATE matches SET ${targetColumn} = $1 
         WHERE tournament_id = $2 AND round = $3 AND match_index = $4`,
        [determinedWinnerId, currentMatch.tournament_id, nextRound, nextMatchIndex]
      );
    }

    await client.query('COMMIT');
    return mapMatch(currentMatch);
  } catch (e) {
    await client.query('ROLLBACK');
    throw e;
  } finally {
    client.release();
  }
}

export async function deleteMatch(id: number) {
  await pool.query("DELETE FROM matches WHERE id = $1", [id]);
}

export async function createMatch(data: any) {
  const { rows } = await pool.query(
    `INSERT INTO matches (tournament_id, stage, round, match_index, team_a_id, team_b_id, best_of, status)
     VALUES ($1, $2, $3, $4, $5, $6, $7, 'scheduled') RETURNING *`,
    [data.tournamentId, data.stage || 'groups', data.round || 1, data.matchIndex || 0,
    data.teamAId, data.teamBId, data.bestOf || 1]
  );
  return rows[0];
}