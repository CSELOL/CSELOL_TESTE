"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createTournament = createTournament;
exports.getTournaments = getTournaments;
exports.updateTournament = updateTournament;
exports.deleteTournament = deleteTournament;
const db_1 = __importDefault(require("../db"));
async function createTournament(data) {
    const { tournament_name, tournament_description, banner_url, logo_url, format, has_lower_bracket, start_date, is_listed, allow_signups, is_archived, status } = data;
    const query = `
    INSERT INTO tournaments 
      (tournament_name, tournament_description, banner_url, logo_url, format, has_lower_bracket, start_date, is_listed, allow_signups, is_archived, status, created_at, updated_at)
    VALUES 
      ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, NOW(), NOW())
    RETURNING *;
  `;
    const values = [
        tournament_name,
        tournament_description,
        banner_url,
        logo_url,
        format,
        has_lower_bracket,
        start_date,
        is_listed,
        allow_signups,
        is_archived || false, // Default to false if not provided
        status
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
async function updateTournament(id, data) {
    const { tournament_name, tournament_description, banner_url, logo_url, format, has_lower_bracket, start_date, is_listed, allow_signups, is_archived, status } = data;
    const query = `
    UPDATE tournaments
    SET
      tournament_name = COALESCE($1, tournament_name),
      tournament_description = COALESCE($2, tournament_description),
      banner_url = COALESCE($3, banner_url),
      logo_url = COALESCE($4, logo_url),
      format = COALESCE($5, format),
      has_lower_bracket = COALESCE($6, has_lower_bracket),
      start_date = COALESCE($7, start_date),
      is_listed = COALESCE($8, is_listed),
      allow_signups = COALESCE($9, allow_signups),
      is_archived = COALESCE($10, is_archived),
      status = COALESCE($11, status),
      updated_at = NOW()
    WHERE id = $12
    RETURNING *;
  `;
    const values = [
        tournament_name,
        tournament_description,
        banner_url,
        logo_url,
        format,
        has_lower_bracket,
        start_date,
        is_listed,
        allow_signups,
        is_archived,
        status,
        id
    ];
    const result = await db_1.default.query(query, values);
    return result.rows[0];
}
async function deleteTournament(id) {
    const query = `
    DELETE FROM tournaments
    WHERE id = $1
    RETURNING *;
  `;
    const values = [id];
    const result = await db_1.default.query(query, values);
    return result.rows[0];
}
//# sourceMappingURL=tournaments.service.js.map