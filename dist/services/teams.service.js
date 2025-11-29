"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTeams = getTeams;
exports.getTeamById = getTeamById;
exports.createTeam = createTeam;
exports.deleteTeam = deleteTeam;
const db_1 = __importDefault(require("../db"));
async function getTeams() {
    const { rows } = await db_1.default.query("SELECT * FROM teams ORDER BY id");
    return rows;
}
async function getTeamById(id) {
    const { rows } = await db_1.default.query("SELECT * FROM teams WHERE id = $1", [id]);
    return rows[0];
}
async function createTeam(data) {
    const { name, logo } = data;
    const { rows } = await db_1.default.query("INSERT INTO teams (name, logo) VALUES ($1, $2) RETURNING *", [name, logo]);
    return rows[0];
}
async function deleteTeam(id) {
    await db_1.default.query("DELETE FROM teams WHERE id = $1", [id]);
}
//# sourceMappingURL=teams.service.js.map