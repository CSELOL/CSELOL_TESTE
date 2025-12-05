import { db as pool } from '../config/database';

export const createPlayer = async (
    supabaseId: string,
    username: string,
    summonerName?: string,
    role?: string
) => {
    const result = await pool.query(
        `INSERT INTO players (supabase_id, username, summoner_name, role)
     VALUES ($1, $2, $3, $4)
     RETURNING *`,
        [supabaseId, username, summonerName, role]
    );
    return result.rows[0];
};

export const getPlayerBySupabaseId = async (supabaseId: string) => {
    const result = await pool.query(
        `SELECT * FROM players WHERE supabase_id = $1`,
        [supabaseId]
    );
    console.log(`DEBUG: getPlayerBySupabaseId result for ${supabaseId}:`, result.rows[0]);
    return result.rows[0] || null;
};
