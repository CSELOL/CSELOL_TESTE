"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkRole = exports.jwtAuth = void 0;
const express_jwt_1 = require("express-jwt");
const jwks_rsa_1 = __importDefault(require("jwks-rsa"));
const dotenv_1 = __importDefault(require("dotenv"));
// CORRECTED IMPORT based on your screenshot
const database_1 = require("../config/database");
dotenv_1.default.config();
const KEYCLOAK_REALM = process.env.KEYCLOAK_REALM || "cselol";
const KEYCLOAK_ISSUER = `http://localhost:8080/realms/${KEYCLOAK_REALM}`;
// --- Database Sync Middleware ---
const syncUserToDatabase = async (req, res, next) => {
    const auth = req.auth;
    if (!auth || !auth.sub) {
        return next();
    }
    const keycloakId = auth.sub;
    const email = auth.email || "";
    const nickname = auth.preferred_username || auth.name || "Summoner";
    try {
        // Sync Logic
        const query = `
            INSERT INTO users (keycloak_id, email, nickname)
            VALUES ($1, $2, $3)
            ON CONFLICT (keycloak_id) 
            DO UPDATE SET 
                email = EXCLUDED.email,
                nickname = EXCLUDED.nickname,
                updated_at = CURRENT_TIMESTAMP
        `;
        // Using 'db' instead of 'pool'
        await database_1.db.query(query, [keycloakId, email, nickname]);
        next();
    }
    catch (error) {
        console.error("FATAL: Failed to sync user to database:", error);
        next();
    }
};
// --- Main Auth Middleware Chain ---
exports.jwtAuth = [
    (0, express_jwt_1.expressjwt)({
        secret: jwks_rsa_1.default.expressJwtSecret({
            cache: true,
            rateLimit: true,
            jwksRequestsPerMinute: 10,
            jwksUri: `${KEYCLOAK_ISSUER}/protocol/openid-connect/certs`
        }),
        issuer: KEYCLOAK_ISSUER,
        algorithms: ["RS256"],
        requestProperty: "auth",
    }),
    syncUserToDatabase
];
// --- Role Checker ---
const checkRole = (roles) => {
    return (req, res, next) => {
        const auth = req.auth;
        if (!auth) {
            return res.status(401).json({ error: 'Unauthorized' });
        }
        const realmRoles = auth?.realm_access?.roles || [];
        const resourceRoles = [];
        if (auth?.resource_access) {
            Object.values(auth.resource_access).forEach((resource) => {
                if (resource.roles) {
                    resourceRoles.push(...resource.roles);
                }
            });
        }
        const allRoles = [...realmRoles, ...resourceRoles];
        const hasRole = roles.some(role => allRoles.includes(role));
        if (!hasRole) {
            return res.status(403).json({ error: 'Forbidden: Insufficient permissions' });
        }
        next();
    };
};
exports.checkRole = checkRole;
//# sourceMappingURL=auth.middleware.js.map