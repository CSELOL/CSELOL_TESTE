"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.refreshInviteCode = exports.getTeamMembers = exports.getTeamByInviteCode = exports.getTeamById = exports.joinTeam = exports.createTeam = void 0;
const database_1 = require("../config/database");
const uuid_1 = require("uuid"); // Ensure uuid is installed: npm install uuid @types/uuid
const createTeam = async (name, tag, logoUrl, description, socialMedia, userId) => {
    const client = await database_1.db.connect();
    try {
        await client.query('BEGIN');
        // Generate a short 8-character invite code
        const inviteCode = (0, uuid_1.v4)().substring(0, 8).toUpperCase();
        // 1. Create Team (Now includes invite_code)
        const teamResult = await client.query(`INSERT INTO teams (name, tag, logo_url, description, social_media, created_by_user_id, invite_code)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`, [name, tag, logoUrl, description, socialMedia, userId, inviteCode]);
        const team = teamResult.rows[0];
        // 2. Update User's team_id in users table (Captain automatically joins)
        // Also set them as CAPTAIN if your users table tracks role per team context
        // Assuming 'team_role' column exists in users. If not, remove that part.
        await client.query(`UPDATE users 
       SET team_id = $1, team_role = 'CAPTAIN' 
       WHERE keycloak_id = $2`, [team.id, userId]);
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
    const result = await database_1.db.query(`SELECT id, keycloak_id, nickname, avatar_url, team_role, primary_role, secondary_role 
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
//# sourceMappingURL=teams.service.js.map