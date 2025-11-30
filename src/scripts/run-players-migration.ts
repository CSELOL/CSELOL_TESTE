import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

async function runMigration() {
    const client = await pool.connect();
    try {
        console.log('Running migration: Fix players table schema...');

        await client.query('BEGIN');

        // 1. Rename user_id to keycloak_id and change type to VARCHAR
        console.log('Renaming user_id to keycloak_id and changing type...');
        // Check if user_id exists first to avoid errors if already renamed
        const checkColumn = await client.query(`
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name='players' AND column_name='user_id'
        `);

        if (checkColumn.rows.length > 0) {
            await client.query(`
                ALTER TABLE players 
                RENAME COLUMN user_id TO keycloak_id;
            `);
        }

        // Change type to VARCHAR(255) to store Keycloak UUIDs
        await client.query(`
            ALTER TABLE players 
            ALTER COLUMN keycloak_id TYPE VARCHAR(255);
        `);

        // 2. Add missing columns
        console.log('Adding missing columns...');
        await client.query(`
            ALTER TABLE players 
            ADD COLUMN IF NOT EXISTS username VARCHAR(255),
            ADD COLUMN IF NOT EXISTS summoner_name VARCHAR(255),
            ADD COLUMN IF NOT EXISTS role VARCHAR(50),
            ADD COLUMN IF NOT EXISTS team_id INTEGER,
            ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;
        `);

        // 3. Add foreign key for team_id
        console.log('Adding foreign key for team_id...');
        await client.query(`
            ALTER TABLE players 
            DROP CONSTRAINT IF EXISTS fk_team;
        `);

        await client.query(`
            ALTER TABLE players 
            ADD CONSTRAINT fk_team 
            FOREIGN KEY (team_id) 
            REFERENCES teams(id) 
            ON DELETE SET NULL;
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
