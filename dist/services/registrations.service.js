"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRegistration = exports.createRegistration = void 0;
const database_1 = require("../config/database");
const createRegistration = async (tournamentId, teamId, paymentProofUrl) => {
    const result = await database_1.db.query(`INSERT INTO tournament_registrations (tournament_id, team_id, payment_proof_url)
     VALUES ($1, $2, $3)
     RETURNING *`, [tournamentId, teamId, paymentProofUrl]);
    return result.rows[0];
};
exports.createRegistration = createRegistration;
const getRegistration = async (tournamentId, teamId) => {
    const result = await database_1.db.query(`SELECT * FROM tournament_registrations 
     WHERE tournament_id = $1 AND team_id = $2`, [tournamentId, teamId]);
    return result.rows[0];
};
exports.getRegistration = getRegistration;
//# sourceMappingURL=registrations.service.js.map