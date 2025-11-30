import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

async function runMigration() {
    const client = await pool.connect();
    try {
        console.log('Running migration: Change created_by_user_id to TEXT...');

        await client.query('BEGIN');

        // 1. Drop the foreign key constraint
        console.log('Dropping foreign key constraint...');
        await client.query(`
            ALTER TABLE teams 
            DROP CONSTRAINT IF EXISTS teams_created_by_user_id_fkey;
        `);

        // 2. Alter the column type to TEXT
        console.log('Altering column type to TEXT...');
        await client.query(`
            ALTER TABLE teams 
            ALTER COLUMN created_by_user_id TYPE TEXT;
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
