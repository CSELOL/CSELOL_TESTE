"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUserById = exports.getUserBySupabaseId = void 0;
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
//# sourceMappingURL=users.service.js.map