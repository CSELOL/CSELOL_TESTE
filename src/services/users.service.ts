import { db } from '../config/database';

export const getUserBySupabaseId = async (supabaseId: string) => {
    const result = await db.query(
        'SELECT * FROM users WHERE supabase_id = $1',
        [supabaseId]
    );
    return result.rows[0];
};

export const getUserById = async (id: number) => {
    const result = await db.query(
        'SELECT * FROM users WHERE id = $1',
        [id]
    );
    return result.rows[0];
};
