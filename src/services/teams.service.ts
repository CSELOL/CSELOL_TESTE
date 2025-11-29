import pool from "../db";

export async function getTeams() {
  const { rows } = await pool.query("SELECT * FROM teams ORDER BY id");
  return rows;
}

export async function getTeamById(id: number) {
  const { rows } = await pool.query("SELECT * FROM teams WHERE id = $1", [id]);
  return rows[0];
}

export async function createTeam(data: any) {
  const { name, logo } = data;

  const { rows } = await pool.query(
    "INSERT INTO teams (name, logo) VALUES ($1, $2) RETURNING *",
    [name, logo]
  );

  return rows[0];
}

export async function deleteTeam(id: number) {
  await pool.query("DELETE FROM teams WHERE id = $1", [id]);
}
