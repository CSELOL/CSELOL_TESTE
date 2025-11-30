import { Request, Response, NextFunction } from 'express';
import { expressjwt as expressJwt } from "express-jwt";
import jwksRsa from "jwks-rsa";
import dotenv from "dotenv";
// CORRECTED IMPORT based on your screenshot
import { db } from "../config/database";

dotenv.config();

const KEYCLOAK_REALM = process.env.KEYCLOAK_REALM || "cselol";
const KEYCLOAK_ISSUER = `http://localhost:8080/realms/${KEYCLOAK_REALM}`;

// --- Database Sync Middleware ---
const syncUserToDatabase = async (req: Request, res: Response, next: NextFunction) => {
    const auth = (req as any).auth;

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
        await db.query(query, [keycloakId, email, nickname]);
        next();
    } catch (error) {
        console.error("FATAL: Failed to sync user to database:", error);
        next();
    }
};

// --- Main Auth Middleware Chain ---
export const jwtAuth = [
    expressJwt({
        secret: jwksRsa.expressJwtSecret({
            cache: true,
            rateLimit: true,
            jwksRequestsPerMinute: 10,
            jwksUri: `${KEYCLOAK_ISSUER}/protocol/openid-connect/certs`
        }) as any,
        issuer: KEYCLOAK_ISSUER,
        algorithms: ["RS256"],
        requestProperty: "auth",
    }),
    syncUserToDatabase
];

// --- Role Checker ---
export const checkRole = (roles: string[]) => {
    return (req: Request, res: Response, next: NextFunction) => {
        const auth = (req as any).auth;

        if (!auth) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        const realmRoles = auth?.realm_access?.roles || [];
        const resourceRoles: string[] = [];
        if (auth?.resource_access) {
            Object.values(auth.resource_access).forEach((resource: any) => {
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