import { Request, Response, NextFunction } from 'express';
import { expressjwt as expressJwt } from "express-jwt";
import dotenv from "dotenv";
import { db } from "../config/database";

dotenv.config();

// Supabase JWT Configuration
const SUPABASE_JWT_SECRET = process.env.SUPABASE_JWT_SECRET;
const SUPABASE_URL = process.env.SUPABASE_URL;

if (!SUPABASE_JWT_SECRET) {
    console.error("FATAL: SUPABASE_JWT_SECRET is not set in environment variables!");
}

// Simple in-memory cache to avoid syncing on every request
interface UserCache {
    role: string;
    timestamp: number;
}
const userCache = new Map<string, UserCache>();
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

// --- Database Sync Middleware (Optimized with Caching) ---
const syncUserToDatabase = async (req: Request, res: Response, next: NextFunction) => {
    const auth = (req as any).auth;

    if (!auth || !auth.sub) {
        return next();
    }

    const supabaseId = auth.sub;

    // Check cache - skip sync if recently synced
    const cached = userCache.get(supabaseId);
    if (cached && (Date.now() - cached.timestamp) < CACHE_TTL_MS) {
        (req as any).userRole = cached.role;
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

        const result = await db.query(query, [supabaseId, email, nickname]);
        const userRole = result.rows[0]?.role || 'user';

        userCache.set(supabaseId, { role: userRole, timestamp: Date.now() });
        (req as any).userRole = userRole;

        next();
    } catch (error) {
        console.error("FATAL: Failed to sync user to database:", error);
        next();
    }
};

// --- Main Auth Middleware Chain ---
export const jwtAuth = [
    expressJwt({
        secret: SUPABASE_JWT_SECRET!,
        algorithms: ["HS256"],
        requestProperty: "auth",
        issuer: SUPABASE_URL ? `${SUPABASE_URL}/auth/v1` : undefined,
    }),
    syncUserToDatabase
];

// --- Role Checker (uses cached role from users table) ---
export const checkRole = (allowedRoles: string[]) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        const auth = (req as any).auth;

        if (!auth) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        try {
            let userRole = (req as any).userRole;

            if (!userRole) {
                const supabaseId = auth.sub;
                const result = await db.query(
                    `SELECT role FROM users WHERE supabase_id = $1`,
                    [supabaseId]
                );
                userRole = result.rows[0]?.role || 'user';
                userCache.set(supabaseId, { role: userRole, timestamp: Date.now() });
            }

            if (!allowedRoles.includes(userRole)) {
                return res.status(403).json({ error: 'Forbidden: Insufficient permissions' });
            }

            next();
        } catch (error) {
            console.error("Error checking user role:", error);
            return res.status(500).json({ error: 'Internal server error' });
        }
    };
};

export const clearUserCache = (supabaseId: string) => {
    userCache.delete(supabaseId);
};