"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPlayerBySupabaseId = exports.createPlayer = void 0;
const database_1 = require("../config/database");
const createPlayer = async (supabaseId, username, summonerName, role) => {
    const result = await database_1.db.query(`INSERT INTO players (supabase_id, username, summoner_name, role)
     VALUES ($1, $2, $3, $4)
     RETURNING *`, [supabaseId, username, summonerName, role]);
    return result.rows[0];
};
exports.createPlayer = createPlayer;
const getPlayerBySupabaseId = async (supabaseId) => {
    const result = await database_1.db.query(`SELECT * FROM players WHERE supabase_id = $1`, [supabaseId]);
    console.log(`DEBUG: getPlayerBySupabaseId result for ${supabaseId}:`, result.rows[0]);
    return result.rows[0] || null;
};
exports.getPlayerBySupabaseId = getPlayerBySupabaseId;
//# sourceMappingURL=players.service.js.map