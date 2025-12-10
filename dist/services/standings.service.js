"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.calculateStandings = calculateStandings;
exports.getStandingsByGroup = getStandingsByGroup;
const database_1 = require("../config/database");
async function calculateStandings(tournamentId) {
    const { rows } = await database_1.db.query(`SELECT ts.team_id, ts.wins, ts.losses, ts.points, ts.group_name,
                t.id, t.name, t.logo_url as logo
         FROM tournament_standings ts
         JOIN teams t ON ts.team_id = t.id
         WHERE ts.tournament_id = $1
         ORDER BY ts.points DESC, ts.wins DESC`, [tournamentId]);
    return rows.map(row => ({
        id: row.id,
        name: row.name,
        logo: row.logo,
        wins: row.wins || 0,
        losses: row.losses || 0,
        points: row.points || 0,
        group_name: row.group_name
    }));
}
async function getStandingsByGroup(tournamentId, groupName) {
    const { rows } = await database_1.db.query(`SELECT ts.team_id, ts.wins, ts.losses, ts.points,
                t.id, t.name, t.tag, t.logo_url
         FROM tournament_standings ts
         JOIN teams t ON ts.team_id = t.id
         WHERE ts.tournament_id = $1 AND ts.group_name = $2
         ORDER BY ts.points DESC`, [tournamentId, groupName]);
    return rows;
}
//# sourceMappingURL=standings.service.js.map