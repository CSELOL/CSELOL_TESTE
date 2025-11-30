"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUserById = exports.getUserByKeycloakId = void 0;
const database_1 = require("../config/database");
const getUserByKeycloakId = async (keycloakId) => {
    const result = await database_1.db.query('SELECT * FROM users WHERE keycloak_id = $1', [keycloakId]);
    return result.rows[0];
};
exports.getUserByKeycloakId = getUserByKeycloakId;
const getUserById = async (id) => {
    const result = await database_1.db.query('SELECT * FROM users WHERE id = $1', [id]);
    return result.rows[0];
};
exports.getUserById = getUserById;
//# sourceMappingURL=users.service.js.map