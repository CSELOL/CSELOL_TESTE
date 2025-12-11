import { db } from '../config/database';

export const getUserBySupabaseId = async (supabaseId: string) => {
    const result = await db.query(
        'SELECT * FROM users WHERE supabase_id = $1 AND deleted_at IS NULL',
        [supabaseId]
    );
    return result.rows[0];
};

export const getUserById = async (id: number) => {
    const result = await db.query(
        'SELECT * FROM users WHERE id = $1 AND deleted_at IS NULL',
        [id]
    );
    return result.rows[0];
};

// For historical queries (matches, tournaments) - includes soft-deleted users
export const getUserByIdIncludeDeleted = async (id: number) => {
    const result = await db.query(
        'SELECT * FROM users WHERE id = $1',
        [id]
    );
    return result.rows[0];
};

export const getUserMe = async (supabaseId: string) => {
    const result = await db.query(
        `SELECT id, supabase_id, email, nickname, avatar_url, riot_id, 
                primary_role, secondary_role, team_id, team_role, 
                role, is_onboarded, created_at
         FROM users WHERE supabase_id = $1 AND deleted_at IS NULL`,
        [supabaseId]
    );
    return result.rows[0] || null;
};
