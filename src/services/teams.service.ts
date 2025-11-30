import { db as pool } from '../config/database';

export const createTeam = async (
  name: string,
  tag: string,
  logoUrl: string | undefined,
  description: string | undefined,
  socialMedia: any | undefined,
  userId: string
) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // 1. Create Team
    const teamResult = await client.query(
      `INSERT INTO teams (name, tag, logo_url, description, social_media, created_by_user_id)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [name, tag, logoUrl, description, socialMedia, userId]
    );
    const team = teamResult.rows[0];

    // 2. Update User's team_id in users table
    await client.query(
      `UPDATE users SET team_id = $1 WHERE keycloak_id = $2`,
      [team.id, userId]
    );

    await client.query('COMMIT');
    console.error('DEBUG: Team created successfully:', team);
    return team;
  } catch (e) {
    await client.query('ROLLBACK');
    console.error('DEBUG: Error creating team in DB:', e);
    throw e;
  } finally {
    client.release();
  }
};

export const joinTeam = async (userId: number, teamId: number) => {
  const result = await pool.query(
    `UPDATE users SET team_id = $1 WHERE id = $2 RETURNING *`,
    [teamId, userId]
  );
  return result.rows[0];
};

export const getTeamById = async (teamId: number) => {
  const result = await pool.query(
    `SELECT * FROM teams WHERE id = $1`,
    [teamId]
  );
  return result.rows[0];
};

export const getTeamByInviteCode = async (code: string) => {
  const result = await pool.query(
    `SELECT * FROM teams WHERE invite_code = $1`,
    [code]
  );
  return result.rows[0];
};

export const getTeamMembers = async (teamId: number) => {
  const result = await pool.query(
    `SELECT id, keycloak_id, nickname, avatar_url, team_role, primary_role, secondary_role 
     FROM users 
     WHERE team_id = $1`,
    [teamId]
  );
  return result.rows;
};

export const refreshInviteCode = async (teamId: number, newCode: string) => {
  const result = await pool.query(
    `UPDATE teams SET invite_code = $1 WHERE id = $2 RETURNING *`,
    [newCode, teamId]
  );
  return result.rows[0];
};
