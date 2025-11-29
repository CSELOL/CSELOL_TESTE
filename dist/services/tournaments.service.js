"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createTournament = createTournament;
exports.getTournaments = getTournaments;
const db_1 = __importDefault(require("../db"));
async function createTournament(data) {
    const { name, description, organizer_id, start_date, end_date, timezone, status, max_teams } = data;
    const query = `
    INSERT INTO tournaments 
      (name, description, organizer_id, start_date, end_date, timezone, status, max_teams, created_at, updated_at)
    VALUES 
      ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW())
    RETURNING *;
  `;
    const values = [
        name,
        description,
        organizer_id,
        start_date,
        end_date,
        timezone,
        status,
        max_teams
    ];
    const result = await db_1.default.query(query, values);
    return result.rows[0];
}
async function getTournaments() {
    const result = await db_1.default.query(`
    SELECT * FROM tournaments ORDER BY created_at DESC
  `);
    return result.rows;
}
//# sourceMappingURL=tournaments.service.js.map