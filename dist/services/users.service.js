"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUserMe = exports.getUserById = exports.getUserBySupabaseId = void 0;
const database_1 = require("../config/database");
const getUserBySupabaseId = async (supabaseId) => {
    const result = await database_1.db.query('SELECT * FROM users WHERE supabase_id = $1', [supabaseId]);
    return result.rows[0];
};
exports.getUserBySupabaseId = getUserBySupabaseId;
const getUserById = async (id) => {
    const result = await database_1.db.query('SELECT * FROM users WHERE id = $1', [id]);
    return result.rows[0];
};
exports.getUserById = getUserById;
const getUserMe = async (supabaseId) => {
    const result = await database_1.db.query(`SELECT id, supabase_id, email, nickname, avatar_url, riot_id, 
                primary_role, secondary_role, team_id, team_role, 
                role, is_onboarded, created_at
         FROM users WHERE supabase_id = $1`, [supabaseId]);
    return result.rows[0] || null;
};
exports.getUserMe = getUserMe;
//# sourceMappingURL=users.service.js.map