import pool from '../db';

export async function createTournament(data: any) {
  const {
    name,
    description,
    organizer_id,
    start_date,
    end_date,
    timezone,
    status,
    max_teams
  } = data;

  const query = `
    INSERT INTO tournaments 
      (name, description, organizer_id, start_date, end_date, timezone, status, max_teams, created_at, updated_at)
    VALUES 
      ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW())
    RETURNING *;
  `;

  const values = [
    name,
    description,
    organizer_id,
    start_date,
    end_date,
    timezone,
    status,
    max_teams
  ];

  const result = await pool.query(query, values);
  return result.rows[0];
}

export async function getTournaments() {
  const result = await pool.query(`
    SELECT * FROM tournaments ORDER BY created_at DESC
  `);
  return result.rows;
}
