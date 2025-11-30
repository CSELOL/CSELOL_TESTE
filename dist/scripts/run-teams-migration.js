"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const pg_1 = require("pg");
const dotenv_1 = __importDefault(require("dotenv"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
dotenv_1.default.config();
const pool = new pg_1.Pool({
    connectionString: process.env.DATABASE_URL,
});
async function runMigration() {
    const client = await pool.connect();
    try {
        const sqlPath = path_1.default.join(__dirname, '../../migration_teams_players.sql');
        const sql = fs_1.default.readFileSync(sqlPath, 'utf8');
        console.log('Running migration...');
        await client.query(sql);
        console.log('Migration completed successfully.');
    }
    catch (err) {
        console.error('Migration failed:', err);
    }
    finally {
        client.release();
        await pool.end();
    }
}
runMigration();
//# sourceMappingURL=run-teams-migration.js.map