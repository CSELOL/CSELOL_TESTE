import pool from "../db";

export async function getMatches() {
  const { rows } = await pool.query(
    "SELECT * FROM matches ORDER BY match_date DESC"
  );
  return rows;
}

export async function getMatchById(id: number) {
  const { rows } = await pool.query("SELECT * FROM matches WHERE id = $1", [id]);
  return rows[0];
}

export async function createMatch(data: any) {
  const { tournament_id, team1_id, team2_id, score1, score2, match_date } = data;

  const { rows } = await pool.query(
    `INSERT INTO matches 
      (tournament_id, team1_id, team2_id, score1, score2, match_date)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING *`,
    [tournament_id, team1_id, team2_id, score1, score2, match_date]
  );

  return rows[0];
}

export async function deleteMatch(id: number) {
  await pool.query("DELETE FROM matches WHERE id = $1", [id]);
}
