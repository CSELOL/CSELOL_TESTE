"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTeamTournaments = exports.getTeamMatches = exports.transferTeamOwnership = exports.refreshInviteCode = exports.getTeamMembers = exports.getTeamByInviteCode = exports.getTeamById = exports.joinTeam = exports.createTeam = void 0;
const database_1 = require("../config/database");
const uuid_1 = require("uuid"); // Ensure uuid is installed: npm install uuid @types/uuid
const createTeam = async (name, tag, logoUrl, description, socialMedia, userId) => {
    const client = await database_1.db.connect();
    try {
        await client.query('BEGIN');
        // Generate a short 8-character invite code
        const inviteCode = (0, uuid_1.v4)().substring(0, 8).toUpperCase();
        // 1. Create Team (Now includes invite_code and captain_id)
        const teamResult = await client.query(`INSERT INTO teams (name, tag, logo_url, description, social_media, created_by_user_id, captain_id, invite_code)
       VALUES ($1, $2, $3, $4, $5, $6, $6, $7)
       RETURNING *`, [name, tag, logoUrl, description, socialMedia, userId, inviteCode]);
        const team = teamResult.rows[0];
        // 2. Update User's team_id in users table (Captain automatically joins)
        // Also set them as CAPTAIN if your users table tracks role per team context
        // Assuming 'team_role' column exists in users. If not, remove that part.
        await client.query(`UPDATE users 
       SET team_id = $1, team_role = 'CAPTAIN' 
       WHERE supabase_id = $2`, [team.id, userId]);
        await client.query('COMMIT');
        console.log('Team created successfully:', team);
        return team;
    }
    catch (e) {
        await client.query('ROLLBACK');
        console.error('Error creating team in DB:', e);
        throw e;
    }
    finally {
        client.release();
    }
};
exports.createTeam = createTeam;
const joinTeam = async (userId, teamId) => {
    // Reset role to MEMBER when joining a new team (safeguard)
    const result = await database_1.db.query(`UPDATE users 
     SET team_id = $1, team_role = 'MEMBER' 
     WHERE id = $2 
     RETURNING *`, [teamId, userId]);
    return result.rows[0];
};
exports.joinTeam = joinTeam;
const getTeamById = async (teamId) => {
    const result = await database_1.db.query(`SELECT * FROM teams WHERE id = $1`, [teamId]);
    return result.rows[0];
};
exports.getTeamById = getTeamById;
const getTeamByInviteCode = async (code) => {
    const result = await database_1.db.query(`SELECT * FROM teams WHERE invite_code = $1`, [code]);
    return result.rows[0];
};
exports.getTeamByInviteCode = getTeamByInviteCode;
const getTeamMembers = async (teamId) => {
    const result = await database_1.db.query(`SELECT id, supabase_id, nickname, avatar_url, team_role, primary_role, secondary_role 
     FROM users 
     WHERE team_id = $1`, [teamId]);
    return result.rows;
};
exports.getTeamMembers = getTeamMembers;
const refreshInviteCode = async (teamId, newCode) => {
    const result = await database_1.db.query(`UPDATE teams SET invite_code = $1 WHERE id = $2 RETURNING *`, [newCode, teamId]);
    return result.rows[0];
};
exports.refreshInviteCode = refreshInviteCode;
const transferTeamOwnership = async (teamId, currentCaptainId, newCaptainId) => {
    const client = await database_1.db.connect();
    try {
        await client.query('BEGIN');
        // 1. Demote current captain to MEMBER
        await client.query(`UPDATE users SET team_role = 'MEMBER' WHERE supabase_id = $1 AND team_id = $2`, [currentCaptainId, teamId]);
        // 2. Promote new captain to CAPTAIN
        await client.query(`UPDATE users SET team_role = 'CAPTAIN' WHERE supabase_id = $1 AND team_id = $2`, [newCaptainId, teamId]);
        // 3. Update team ownership record (captain_id)
        const result = await client.query(`UPDATE teams SET captain_id = $1 WHERE id = $2 RETURNING *`, [newCaptainId, teamId]);
        await client.query('COMMIT');
        return result.rows[0];
    }
    catch (e) {
        await client.query('ROLLBACK');
        throw e;
    }
    finally {
        client.release();
    }
};
exports.transferTeamOwnership = transferTeamOwnership;
const getTeamMatches = async (teamId) => {
    const result = await database_1.db.query(`SELECT
       m.id,
       m.round,
       m.status,
       m.created_at as start_time,
       m.score_a,
       m.score_b,
       m.winner_id,
       json_build_object('id', t.id, 'name', t.tournament_name) as tournament,
       json_build_object('id', ta.id, 'name', ta.name, 'tag', ta.tag, 'logo_url', ta.logo_url) as team_a,
       json_build_object('id', tb.id, 'name', tb.name, 'tag', tb.tag, 'logo_url', tb.logo_url) as team_b
     FROM matches m
     JOIN tournaments t ON m.tournament_id = t.id
     LEFT JOIN teams ta ON m.team_a_id = ta.id
     LEFT JOIN teams tb ON m.team_b_id = tb.id
     WHERE m.team_a_id = $1 OR m.team_b_id = $1
     ORDER BY m.created_at ASC`, [teamId]);
    return result.rows;
};
exports.getTeamMatches = getTeamMatches;
const getTeamTournaments = async (teamId) => {
    const result = await database_1.db.query(`SELECT
       t.id,
       t.tournament_name as name,
       t.status,
       UPPER(tr.status) as registration_status,
       tr.rejection_reason
     FROM tournament_registrations tr
     JOIN tournaments t ON tr.tournament_id = t.id
     WHERE tr.team_id = $1`, [teamId]);
    return result.rows;
};
exports.getTeamTournaments = getTeamTournaments;
//# sourceMappingURL=teams.service.js.map