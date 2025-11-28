import pool from '../db';


export async function create(data: any) {
const { rows } = await pool.query(`INSERT INTO teams (name, tag, logo_url, created_by_user_id) VALUES ($1,$2,$3,$4) RETURNING *`, [data.name, data.tag || null, data.logoUrl || null, data.createdByUserId || null]);
return rows[0];
}


export async function findById(id: number) {
const { rows } = await pool.query('SELECT * FROM teams WHERE id = $1', [id]);
return rows[0];
}