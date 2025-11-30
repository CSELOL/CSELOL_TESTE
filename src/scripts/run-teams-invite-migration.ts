import { Pool } from 'pg';
import dotenv from 'dotenv';
import { v4 as uuidv4 } from 'uuid';

dotenv.config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

function generateInviteCode() {
    return uuidv4().substring(0, 8).toUpperCase();
}

async function runMigration() {
    const client = await pool.connect();
    try {
        console.log('Running migration: Add invite_code to teams table...');

        await client.query('BEGIN');

        // 1. Add column as nullable first
        console.log('Adding invite_code column...');
        await client.query(`
            ALTER TABLE teams 
            ADD COLUMN IF NOT EXISTS invite_code VARCHAR(10);
        `);

        // 2. Generate codes for existing teams
        console.log('Generating codes for existing teams...');
        const teamsResult = await client.query('SELECT id FROM teams WHERE invite_code IS NULL');

        for (const team of teamsResult.rows) {
            const code = generateInviteCode();
            await client.query('UPDATE teams SET invite_code = $1 WHERE id = $2', [code, team.id]);
        }

        // 3. Add constraints (UNIQUE and NOT NULL)
        console.log('Adding constraints...');
        await client.query(`
            ALTER TABLE teams 
            ALTER COLUMN invite_code SET NOT NULL,
            ADD CONSTRAINT teams_invite_code_key UNIQUE (invite_code);
        `);

        await client.query('COMMIT');
        console.log('Migration completed successfully.');
    } catch (err) {
        await client.query('ROLLBACK');
        console.error('Migration failed:', err);
    } finally {
        client.release();
        await pool.end();
    }
}

runMigration();
