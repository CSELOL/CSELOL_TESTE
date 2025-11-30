import { db } from '../config/database';
import fs from 'fs';
import path from 'path';

async function runMigration() {
    const client = await db.connect();
    try {
        const sqlPath = path.join(__dirname, '../../migration_payment_proofs.sql');
        const sql = fs.readFileSync(sqlPath, 'utf8');

        console.log('Running migration...');
        await client.query(sql);
        console.log('Migration completed successfully.');
    } catch (err) {
        console.error('Migration failed:', err);
    } finally {
        client.release();
        await db.end();
    }
}

runMigration();
