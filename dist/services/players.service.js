"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPlayerByKeycloakId = exports.createPlayer = void 0;
const database_1 = require("../config/database");
const createPlayer = async (keycloakId, username, summonerName, role) => {
    const result = await database_1.db.query(`INSERT INTO players (keycloak_id, username, summoner_name, role)
     VALUES ($1, $2, $3, $4)
     RETURNING *`, [keycloakId, username, summonerName, role]);
    return result.rows[0];
};
exports.createPlayer = createPlayer;
const getPlayerByKeycloakId = async (keycloakId) => {
    const result = await database_1.db.query(`SELECT * FROM players WHERE keycloak_id = $1`, [keycloakId]);
    console.error(`DEBUG: getPlayerByKeycloakId result for ${keycloakId}:`, result.rows[0]);
    return result.rows[0] || null;
};
exports.getPlayerByKeycloakId = getPlayerByKeycloakId;
//# sourceMappingURL=players.service.js.map