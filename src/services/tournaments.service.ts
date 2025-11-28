import pool from '../db';


export async function findAll() {
const { rows } = await pool.query('SELECT * FROM tournaments ORDER BY id DESC');
return rows;
}


export async function findById(id: number) {
const { rows } = await pool.query('SELECT * FROM tournaments WHERE id = $1', [id]);
return rows[0];
}


export async function create(data: any) {
const { rows } = await pool.query(
`INSERT INTO tournaments (slug, name, description, start_date, end_date, timezone, status, max_teams)
VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
[data.slug || null, data.name, data.description || null, data.startDate || null, data.endDate || null, data.timezone || null, data.status || 'draft', data.maxTeams || null]
);
return rows[0];
}