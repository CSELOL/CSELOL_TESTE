import { db as pool } from '../config/database';
import { v4 as uuidv4 } from 'uuid';

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

    const inviteCode = uuidv4().substring(0, 8).toUpperCase();

    const teamResult = await client.query(
      `INSERT INTO teams (name, tag, logo_url, description, social_media, captain_id, invite_code)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [name, tag, logoUrl, description, socialMedia, userId, inviteCode]
    );
    const team = teamResult.rows[0];

    await client.query(
      `UPDATE users SET team_id = $1, team_role = 'CAPTAIN' WHERE supabase_id = $2`,
      [team.id, userId]
    );

    await client.query('COMMIT');
    return team;
  } catch (e) {
    await client.query('ROLLBACK');
    throw e;
  } finally {
    client.release();
  }
};

export const joinTeam = async (userId: number, teamId: number) => {
  const result = await pool.query(
    `UPDATE users SET team_id = $1, team_role = 'MEMBER' WHERE id = $2 RETURNING *`,
    [teamId, userId]
  );
  return result.rows[0];
};

export const getTeamById = async (teamId: number) => {
  const result = await pool.query(`SELECT * FROM teams WHERE id = $1`, [teamId]);
  return result.rows[0];
};

export const getTeamByInviteCode = async (code: string) => {
  const result = await pool.query(`SELECT * FROM teams WHERE invite_code = $1`, [code]);
  return result.rows[0];
};

export const getTeamMembers = async (teamId: number) => {
  const result = await pool.query(
    `SELECT id, supabase_id, nickname, avatar_url, team_role, primary_role, secondary_role 
     FROM users WHERE team_id = $1`,
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

export const transferTeamOwnership = async (teamId: number, currentCaptainId: string, newCaptainId: string) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    await client.query(
      `UPDATE users SET team_role = 'MEMBER' WHERE supabase_id = $1 AND team_id = $2`,
      [currentCaptainId, teamId]
    );

    await client.query(
      `UPDATE users SET team_role = 'CAPTAIN' WHERE supabase_id = $1 AND team_id = $2`,
      [newCaptainId, teamId]
    );

    const result = await client.query(
      `UPDATE teams SET captain_id = $1 WHERE id = $2 RETURNING *`,
      [newCaptainId, teamId]
    );

    await client.query('COMMIT');
    return result.rows[0];
  } catch (e) {
    await client.query('ROLLBACK');
    throw e;
  } finally {
    client.release();
  }
};

export const getTeamMatches = async (teamId: number) => {
  const result = await pool.query(
    `SELECT
       m.id, m.round, m.status, m.created_at as start_time, m.score_a, m.score_b, m.winner_id,
       json_build_object('id', t.id, 'name', t.tournament_name) as tournament,
       json_build_object('id', ta.id, 'name', ta.name, 'tag', ta.tag, 'logo_url', ta.logo_url) as team_a,
       json_build_object('id', tb.id, 'name', tb.name, 'tag', tb.tag, 'logo_url', tb.logo_url) as team_b
     FROM matches m
     JOIN tournaments t ON m.tournament_id = t.id
     LEFT JOIN teams ta ON m.team_a_id = ta.id
     LEFT JOIN teams tb ON m.team_b_id = tb.id
     WHERE m.team_a_id = $1 OR m.team_b_id = $1
     ORDER BY m.created_at ASC`,
    [teamId]
  );
  return result.rows;
};

export const getTeamTournaments = async (teamId: number) => {
  const result = await pool.query(
    `SELECT t.id, t.tournament_name as name, t.status,
       UPPER(tr.status) as registration_status, tr.rejection_reason
     FROM tournament_registrations tr
     JOIN tournaments t ON tr.tournament_id = t.id
     WHERE tr.team_id = $1`,
    [teamId]
  );
  return result.rows;
};