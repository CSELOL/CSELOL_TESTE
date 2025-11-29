"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMatches = getMatches;
exports.getMatchById = getMatchById;
exports.createMatch = createMatch;
exports.deleteMatch = deleteMatch;
const db_1 = __importDefault(require("../db"));
async function getMatches() {
    const { rows } = await db_1.default.query("SELECT * FROM matches ORDER BY match_date DESC");
    return rows;
}
async function getMatchById(id) {
    const { rows } = await db_1.default.query("SELECT * FROM matches WHERE id = $1", [id]);
    return rows[0];
}
async function createMatch(data) {
    const { tournament_id, team1_id, team2_id, score1, score2, match_date } = data;
    const { rows } = await db_1.default.query(`INSERT INTO matches 
      (tournament_id, team1_id, team2_id, score1, score2, match_date)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING *`, [tournament_id, team1_id, team2_id, score1, score2, match_date]);
    return rows[0];
}
async function deleteMatch(id) {
    await db_1.default.query("DELETE FROM matches WHERE id = $1", [id]);
}
//# sourceMappingURL=matches.service.js.map