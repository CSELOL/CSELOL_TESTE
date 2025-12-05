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

// --- Database Sync Middleware ---
const syncUserToDatabase = async (req: Request, res: Response, next: NextFunction) => {
    const auth = (req as any).auth;

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

        await db.query(query, [supabaseId, email, nickname]);
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
        // Supabase issuer format: https://[project-ref].supabase.co/auth/v1
        issuer: SUPABASE_URL ? `${SUPABASE_URL}/auth/v1` : undefined,
    }),
    syncUserToDatabase
];

// --- Role Checker (queries user_roles table) ---
export const checkRole = (roles: string[]) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        const auth = (req as any).auth;

        if (!auth) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        try {
            const supabaseId = auth.sub;

            // Query user_roles table directly (user_id is now supabase_id)
            const result = await db.query(
                `SELECT role FROM user_roles WHERE user_id = $1`,
                [supabaseId]
            );

            const userRoles = result.rows.map((r: any) => r.role);
            const hasRole = roles.some(role => userRoles.includes(role));

            if (!hasRole) {
                return res.status(403).json({ error: 'Forbidden: Insufficient permissions' });
            }

            next();
        } catch (error) {
            console.error("Error checking user roles:", error);
            return res.status(500).json({ error: 'Internal server error' });
        }
    };
};