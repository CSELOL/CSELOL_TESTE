"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.withdrawRegistration = exports.getPaymentProofUrl = exports.updateRegistrationStatus = exports.registerForTournament = exports.getTournamentTeams = exports.getTournamentById = void 0;
const database_1 = require("../config/database");
const supabase_1 = require("../config/supabase");
// --- 1. GET SINGLE TOURNAMENT ---
const getTournamentById = async (req, res) => {
    const { id } = req.params;
    try {
        const query = `SELECT * FROM tournaments WHERE id = $1`;
        const result = await database_1.db.query(query, [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: "Tournament not found" });
        }
        res.json(result.rows[0]);
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: "Server error" });
    }
};
exports.getTournamentById = getTournamentById;
// --- 2. GET REGISTERED TEAMS ---
const getTournamentTeams = async (req, res) => {
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
        const result = await database_1.db.query(query, [id]);
        res.json(result.rows);
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to fetch teams" });
    }
};
exports.getTournamentTeams = getTournamentTeams;
// --- 3. REGISTER TEAM ---
const registerForTournament = async (req, res) => {
    const { id } = req.params;
    const auth = req.auth;
    const userId = auth?.sub;
    const { payment_proof_url } = req.body;
    if (!userId)
        return res.status(401).json({ error: "Unauthorized" });
    if (!payment_proof_url)
        return res.status(400).json({ error: "Payment proof required" });
    try {
        const teamRes = await database_1.db.query("SELECT * FROM teams WHERE created_by_user_id = $1", [userId]);
        if (teamRes.rows.length === 0) {
            return res.status(400).json({ error: "You must be a Team Captain." });
        }
        const team = teamRes.rows[0];
        const existing = await database_1.db.query("SELECT * FROM tournament_registrations WHERE tournament_id = $1 AND team_id = $2", [id, team.id]);
        if (existing.rows.length > 0) {
            return res.status(409).json({ error: "Team already registered." });
        }
        const insertQuery = `
            INSERT INTO tournament_registrations 
            (tournament_id, team_id, payment_proof_url, status) 
            VALUES ($1, $2, $3, 'PENDING')
            RETURNING *
        `;
        const result = await database_1.db.query(insertQuery, [id, team.id, payment_proof_url]);
        res.status(201).json(result.rows[0]);
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: "Registration failed" });
    }
};
exports.registerForTournament = registerForTournament;
// --- 4. UPDATE STATUS ---
const updateRegistrationStatus = async (req, res) => {
    const { id } = req.params; // Fixed from regId
    const { status, rejection_reason } = req.body;
    try {
        const query = `
            UPDATE tournament_registrations 
            SET status = $1, rejection_reason = $2, updated_at = NOW() 
            WHERE id = $3 
            RETURNING *
        `;
        const result = await database_1.db.query(query, [status, rejection_reason || null, id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: "Registration not found" });
        }
        res.json(result.rows[0]);
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: "Update failed" });
    }
};
exports.updateRegistrationStatus = updateRegistrationStatus;
// --- 5. GET PROOF URL ---
const getPaymentProofUrl = async (req, res) => {
    const { id } = req.params; // Fixed from regId
    try {
        const query = `SELECT payment_proof_url FROM tournament_registrations WHERE id = $1`;
        const result = await database_1.db.query(query, [id]);
        if (result.rows.length === 0)
            return res.status(404).json({ error: "Registration not found" });
        const path = result.rows[0].payment_proof_url;
        // If it's already a full URL, return it
        if (path.startsWith('http')) {
            return res.json({ url: path });
        }
        // DEBUG: Log what we are trying to fetch
        console.log(`Attempting to sign URL for path: [${path}] in bucket 'payment-proofs'`);
        const { data, error } = await supabase_1.supabase
            .storage
            .from('private-assets')
            .createSignedUrl(path, 60);
        if (error) {
            console.error("Supabase Storage Error:", error);
            // Handle "Object not found" specifically
            if (error.statusCode === '404' || error.message?.includes('not found')) {
                return res.status(404).json({ error: "Proof file not found in storage bucket." });
            }
            throw error;
        }
        res.json({ url: data.signedUrl });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to generate URL" });
    }
};
exports.getPaymentProofUrl = getPaymentProofUrl;
// --- 6. WITHDRAW REGISTRATION ---
const withdrawRegistration = async (req, res) => {
    const { id } = req.params; // Tournament ID
    const auth = req.auth;
    const userId = auth?.sub;
    if (!userId)
        return res.status(401).json({ error: "Unauthorized" });
    try {
        // 1. Get User's Team
        const teamRes = await database_1.db.query("SELECT * FROM teams WHERE created_by_user_id = $1", [userId]);
        if (teamRes.rows.length === 0) {
            return res.status(400).json({ error: "You must be a Team Captain." });
        }
        const team = teamRes.rows[0];
        // 2. Delete Registration
        const query = `
            DELETE FROM tournament_registrations 
            WHERE tournament_id = $1 AND team_id = $2 
            RETURNING *
        `;
        const result = await database_1.db.query(query, [id, team.id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: "Registration not found or already withdrawn." });
        }
        res.json({ message: "Registration withdrawn successfully." });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: "Withdrawal failed" });
    }
};
exports.withdrawRegistration = withdrawRegistration;
//# sourceMappingURL=registrations.controller.js.map