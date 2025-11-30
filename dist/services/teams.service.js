"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.refreshInviteCode = exports.getTeamMembers = exports.getTeamByInviteCode = exports.getTeamById = exports.joinTeam = exports.createTeam = void 0;
const database_1 = require("../config/database");
const createTeam = async (name, tag, logoUrl, description, socialMedia, userId) => {
    const client = await database_1.db.connect();
    try {
        await client.query('BEGIN');
        // 1. Create Team
        const teamResult = await client.query(`INSERT INTO teams (name, tag, logo_url, description, social_media, created_by_user_id)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`, [name, tag, logoUrl, description, socialMedia, userId]);
        const team = teamResult.rows[0];
        // 2. Update User's team_id in users table
        await client.query(`UPDATE users SET team_id = $1 WHERE keycloak_id = $2`, [team.id, userId]);
        await client.query('COMMIT');
        console.error('DEBUG: Team created successfully:', team);
        return team;
    }
    catch (e) {
        await client.query('ROLLBACK');
        console.error('DEBUG: Error creating team in DB:', e);
        throw e;
    }
    finally {
        client.release();
    }
};
exports.createTeam = createTeam;
const joinTeam = async (userId, teamId) => {
    const result = await database_1.db.query(`UPDATE users SET team_id = $1 WHERE id = $2 RETURNING *`, [teamId, userId]);
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