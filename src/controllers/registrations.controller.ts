import { Request, Response } from 'express';
import { db } from '../config/database';
import { supabase } from '../config/supabase';
import { logActivity } from '../services/activity-log.service';
import { getUserBySupabaseId } from '../services/users.service';

// --- 1. GET SINGLE TOURNAMENT ---
export const getTournamentById = async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
        const query = `SELECT * FROM tournaments WHERE id = $1`;
        const result = await db.query(query, [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: "Tournament not found" });
        }

        res.json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Server error" });
    }
};

// --- 2. GET REGISTERED TEAMS ---
export const getTournamentTeams = async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
        const query = `
            SELECT 
                t.id as team_id, 
                t.name, 
                t.tag, 
                tr.id as registration_id,
                tr.status as registration_status, 
                tr.payment_proof_url,
                tr.created_at as registered_at
            FROM teams t
            JOIN tournament_registrations tr ON t.id = tr.team_id
            WHERE tr.tournament_id = $1
        `;
        const result = await db.query(query, [id]);
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to fetch teams" });
    }
};

// --- 3. REGISTER TEAM ---
export const registerForTournament = async (req: Request, res: Response) => {
    const { id } = req.params;
    const auth = (req as any).auth;
    const userId = auth?.sub;
    const { payment_proof_url } = req.body;

    if (!userId) return res.status(401).json({ error: "Unauthorized" });
    if (!payment_proof_url) return res.status(400).json({ error: "Payment proof required" });

    try {
        // Find team where user is captain
        const teamRes = await db.query("SELECT * FROM teams WHERE captain_id = $1", [userId]);
        if (teamRes.rows.length === 0) {
            return res.status(400).json({ error: "You must be a Team Captain." });
        }
        const team = teamRes.rows[0];

        const existing = await db.query(
            "SELECT * FROM tournament_registrations WHERE tournament_id = $1 AND team_id = $2",
            [id, team.id]
        );
        if (existing.rows.length > 0) {
            return res.status(409).json({ error: "Team already registered." });
        }

        // Get tournament info for logging
        const tournamentRes = await db.query("SELECT * FROM tournaments WHERE id = $1", [id]);
        const tournament = tournamentRes.rows[0];

        const insertQuery = `
            INSERT INTO tournament_registrations 
            (tournament_id, team_id, payment_proof_url, status) 
            VALUES ($1, $2, $3, 'PENDING')
            RETURNING *
        `;
        const result = await db.query(insertQuery, [id, team.id, payment_proof_url]);

        // Log activity
        const user = await getUserBySupabaseId(userId);
        logActivity({
            action: 'tournament.register',
            actorId: userId,
            actorNickname: user?.nickname,
            actorRole: user?.role,
            targetType: 'registration',
            targetId: result.rows[0].id,
            targetName: `${team.name} → ${tournament?.tournament_name}`,
            metadata: { team_id: team.id, tournament_id: id },
            ipAddress: req.ip,
            userAgent: req.get('User-Agent')
        });

        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Registration failed" });
    }
};

// --- 4. UPDATE STATUS ---
export const updateRegistrationStatus = async (req: Request, res: Response) => {
    const { id } = req.params;
    const auth = (req as any).auth;
    const adminId = auth?.sub;
    const { status, rejection_reason } = req.body;

    try {
        // Get registration info before update for logging
        const regBefore = await db.query(
            `SELECT tr.*, t.name as team_name, tour.tournament_name 
             FROM tournament_registrations tr
             JOIN teams t ON tr.team_id = t.id
             JOIN tournaments tour ON tr.tournament_id = tour.id
             WHERE tr.id = $1`,
            [id]
        );

        const query = `
            UPDATE tournament_registrations 
            SET status = $1, rejection_reason = $2, updated_at = NOW() 
            WHERE id = $3 
            RETURNING *
        `;
        const result = await db.query(query, [status, rejection_reason || null, id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: "Registration not found" });
        }

        // Log activity
        if (adminId) {
            const user = await getUserBySupabaseId(adminId);
            const actionType = status.toUpperCase() === 'APPROVED'
                ? 'tournament.approve_registration'
                : 'tournament.reject_registration';

            logActivity({
                action: actionType as any,
                actorId: adminId,
                actorNickname: user?.nickname,
                actorRole: user?.role || 'admin',
                targetType: 'registration',
                targetId: parseInt(id),
                targetName: regBefore.rows[0]
                    ? `${regBefore.rows[0].team_name} → ${regBefore.rows[0].tournament_name}`
                    : undefined,
                metadata: { status, rejection_reason },
                ipAddress: req.ip,
                userAgent: req.get('User-Agent')
            });
        }

        res.json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Update failed" });
    }
};

// --- 5. GET PROOF URL ---
export const getPaymentProofUrl = async (req: Request, res: Response) => {
    const { id } = req.params; // Fixed from regId

    try {
        const query = `SELECT payment_proof_url FROM tournament_registrations WHERE id = $1`;
        const result = await db.query(query, [id]);

        if (result.rows.length === 0) return res.status(404).json({ error: "Registration not found" });

        const path = result.rows[0].payment_proof_url;

        // If it's already a full URL, return it
        if (path.startsWith('http')) {
            return res.json({ url: path });
        }

        // DEBUG: Log what we are trying to fetch
        console.log(`Attempting to sign URL for path: [${path}] in bucket 'payment-proofs'`);

        if (!supabase) {
            return res.status(500).json({ error: "Storage not configured. Missing SUPABASE_SERVICE_ROLE_KEY" });
        }

        const { data, error } = await supabase
            .storage
            .from('private-assets')
            .createSignedUrl(path, 60);

        if (error) {
            console.error("Supabase Storage Error:", error);

            // Handle "Object not found" specifically
            if ((error as any).statusCode === '404' || (error as any).message?.includes('not found')) {
                return res.status(404).json({ error: "Proof file not found in storage bucket." });
            }

            throw error;
        }

        res.json({ url: data.signedUrl });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to generate URL" });
    }
};

// --- 6. WITHDRAW REGISTRATION ---
export const withdrawRegistration = async (req: Request, res: Response) => {
    const { id } = req.params; // Tournament ID
    const auth = (req as any).auth;
    const userId = auth?.sub;

    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    try {
        // 1. Get User's Team (where user is captain)
        const teamRes = await db.query("SELECT * FROM teams WHERE captain_id = $1", [userId]);
        if (teamRes.rows.length === 0) {
            return res.status(400).json({ error: "You must be a Team Captain." });
        }
        const team = teamRes.rows[0];

        // Get tournament info for logging
        const tournamentRes = await db.query("SELECT * FROM tournaments WHERE id = $1", [id]);
        const tournament = tournamentRes.rows[0];

        // 2. Delete Registration
        const query = `
            DELETE FROM tournament_registrations 
            WHERE tournament_id = $1 AND team_id = $2 
            RETURNING *
        `;
        const result = await db.query(query, [id, team.id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: "Registration not found or already withdrawn." });
        }

        // Log activity
        const user = await getUserBySupabaseId(userId);
        logActivity({
            action: 'tournament.withdraw_registration',
            actorId: userId,
            actorNickname: user?.nickname,
            actorRole: user?.role,
            targetType: 'registration',
            targetId: result.rows[0].id,
            targetName: `${team.name} → ${tournament?.tournament_name}`,
            metadata: { team_id: team.id, tournament_id: id },
            ipAddress: req.ip,
            userAgent: req.get('User-Agent')
        });

        res.json({ message: "Registration withdrawn successfully." });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Withdrawal failed" });
    }
};