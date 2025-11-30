"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const database_1 = require("../config/database");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
async function runMigration() {
    const client = await database_1.db.connect();
    try {
        const sqlPath = path_1.default.join(__dirname, '../../migration_payment_proofs.sql');
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
        await database_1.db.end();
    }
}
runMigration();
//# sourceMappingURL=run-payment-migration.js.map