import pool from "../db";

export async function calculateStandings(tournamentId: number) {
  const { rows } = await pool.query(
    `
    SELECT 
      t.id,
      t.name,
      t.logo,
      COALESCE(SUM(CASE WHEN m.team1_id = t.id THEN m.score1 > m.score2
                        WHEN m.team2_id = t.id THEN m.score2 > m.score1 END), 0) AS wins,
      COALESCE(SUM(CASE WHEN m.team1_id = t.id THEN m.score1 < m.score2
                        WHEN m.team2_id = t.id THEN m.score2 < m.score1 END), 0) AS losses
    FROM teams t
    LEFT JOIN matches m ON m.team1_id = t.id OR m.team2_id = t.id
    WHERE m.tournament_id = $1
    GROUP BY t.id
    ORDER BY wins DESC
    `,
    [tournamentId]
  );

  return rows;
}
