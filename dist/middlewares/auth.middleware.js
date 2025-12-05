"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkRole = exports.jwtAuth = void 0;
const express_jwt_1 = require("express-jwt");
const dotenv_1 = __importDefault(require("dotenv"));
const database_1 = require("../config/database");
dotenv_1.default.config();
// Supabase JWT Configuration
const SUPABASE_JWT_SECRET = process.env.SUPABASE_JWT_SECRET;
const SUPABASE_URL = process.env.SUPABASE_URL;
if (!SUPABASE_JWT_SECRET) {
    console.error("FATAL: SUPABASE_JWT_SECRET is not set in environment variables!");
}
// --- Database Sync Middleware ---
const syncUserToDatabase = async (req, res, next) => {
    const auth = req.auth;
    if (!auth || !auth.sub) {
        return next();
    }
    const supabaseId = auth.sub;
    const email = auth.email || "";
    // Supabase uses user_metadata for custom fields, fallback to email prefix
    const nickname = auth.user_metadata?.nickname ||
        auth.user_metadata?.name ||
        auth.email?.split('@')[0] ||
        "Summoner";
    try {
        // Sync Logic - upsert user based on supabase_id
        const query = `
            INSERT INTO users (supabase_id, email, nickname)
            VALUES ($1, $2, $3)
            ON CONFLICT (supabase_id) 
            DO UPDATE SET 
                email = EXCLUDED.email,
                nickname = EXCLUDED.nickname,
                updated_at = CURRENT_TIMESTAMP
        `;
        await database_1.db.query(query, [supabaseId, email, nickname]);
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
        secret: SUPABASE_JWT_SECRET,
        algorithms: ["HS256"],
        requestProperty: "auth",
        // Supabase issuer format: https://[project-ref].supabase.co/auth/v1
        issuer: SUPABASE_URL ? `${SUPABASE_URL}/auth/v1` : undefined,
    }),
    syncUserToDatabase
];
// --- Role Checker (queries user_roles table) ---
const checkRole = (roles) => {
    return async (req, res, next) => {
        const auth = req.auth;
        if (!auth) {
            return res.status(401).json({ error: 'Unauthorized' });
        }
        try {
            const supabaseId = auth.sub;
            // Query user_roles table to get user's roles
            const result = await database_1.db.query(`SELECT r.role FROM user_roles r
                 JOIN users u ON r.user_id = u.id
                 WHERE u.supabase_id = $1`, [supabaseId]);
            const userRoles = result.rows.map((r) => r.role);
            const hasRole = roles.some(role => userRoles.includes(role));
            if (!hasRole) {
                return res.status(403).json({ error: 'Forbidden: Insufficient permissions' });
            }
            next();
        }
        catch (error) {
            console.error("Error checking user roles:", error);
            return res.status(500).json({ error: 'Internal server error' });
        }
    };
};
exports.checkRole = checkRole;
//# sourceMappingURL=auth.middleware.js.map