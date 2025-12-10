"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.clearUserCache = exports.checkRole = exports.jwtAuth = void 0;
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
const userCache = new Map();
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes
// --- Database Sync Middleware (Optimized with Caching) ---
const syncUserToDatabase = async (req, res, next) => {
    const auth = req.auth;
    if (!auth || !auth.sub) {
        return next();
    }
    const supabaseId = auth.sub;
    // Check cache - skip sync if recently synced
    const cached = userCache.get(supabaseId);
    if (cached && (Date.now() - cached.timestamp) < CACHE_TTL_MS) {
        req.userRole = cached.role;
        return next();
    }
    const email = auth.email || "";
    const nickname = auth.user_metadata?.nickname ||
        auth.user_metadata?.name ||
        auth.email?.split('@')[0] ||
        "Summoner";
    try {
        const query = `
            INSERT INTO users (supabase_id, email, nickname)
            VALUES ($1, $2, $3)
            ON CONFLICT (supabase_id) 
            DO UPDATE SET 
                email = EXCLUDED.email,
                nickname = EXCLUDED.nickname,
                updated_at = CURRENT_TIMESTAMP
            RETURNING role
        `;
        const result = await database_1.db.query(query, [supabaseId, email, nickname]);
        const userRole = result.rows[0]?.role || 'user';
        userCache.set(supabaseId, { role: userRole, timestamp: Date.now() });
        req.userRole = userRole;
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
        issuer: SUPABASE_URL ? `${SUPABASE_URL}/auth/v1` : undefined,
    }),
    syncUserToDatabase
];
// --- Role Checker (uses cached role from users table) ---
const checkRole = (allowedRoles) => {
    return async (req, res, next) => {
        const auth = req.auth;
        if (!auth) {
            return res.status(401).json({ error: 'Unauthorized' });
        }
        try {
            let userRole = req.userRole;
            if (!userRole) {
                const supabaseId = auth.sub;
                const result = await database_1.db.query(`SELECT role FROM users WHERE supabase_id = $1`, [supabaseId]);
                userRole = result.rows[0]?.role || 'user';
                userCache.set(supabaseId, { role: userRole, timestamp: Date.now() });
            }
            if (!allowedRoles.includes(userRole)) {
                return res.status(403).json({ error: 'Forbidden: Insufficient permissions' });
            }
            next();
        }
        catch (error) {
            console.error("Error checking user role:", error);
            return res.status(500).json({ error: 'Internal server error' });
        }
    };
};
exports.checkRole = checkRole;
const clearUserCache = (supabaseId) => {
    userCache.delete(supabaseId);
};
exports.clearUserCache = clearUserCache;
//# sourceMappingURL=auth.middleware.js.map