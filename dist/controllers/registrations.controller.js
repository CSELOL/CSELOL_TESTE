"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPaymentProofUrl = exports.updateRegistrationStatus = exports.registerForTournament = exports.getTournamentTeams = exports.getTournamentById = void 0;
const database_1 = require("../config/database"); // Assuming this is your pg pool
const supabase_1 = require("../config/supabase"); // Assuming you set this up
// --- 1. GET SINGLE TOURNAMENT (Fixes your UI "Not Found" error) ---
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
// --- 2. GET REGISTERED TEAMS (For Admin Table) ---
const getTournamentTeams = async (req, res) => {
    const { id } = req.params;
    try {
        // Join Teams and Registrations to get data + status
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
// --- 3. REGISTER TEAM (Fixed to accept string URL) ---
const registerForTournament = async (req, res) => {
    const { id } = req.params; // Tournament ID
    const auth = req.auth;
    const userId = auth?.sub;
    // 1. Get the payment proof PATH from frontend (not the file itself)
    const { payment_proof_url } = req.body;
    if (!userId)
        return res.status(401).json({ error: "Unauthorized" });
    if (!payment_proof_url)
        return res.status(400).json({ error: "Payment proof required" });
    try {
        // 2. Get User's Team
        const teamRes = await database_1.db.query("SELECT * FROM teams WHERE created_by_user_id = $1", [userId]);
        if (teamRes.rows.length === 0) {
            return res.status(400).json({ error: "You must be a Team Captain." });
        }
        const team = teamRes.rows[0];
        // 3. Check if already registered
        const existing = await database_1.db.query("SELECT * FROM tournament_registrations WHERE tournament_id = $1 AND team_id = $2", [id, team.id]);
        if (existing.rows.length > 0) {
            return res.status(409).json({ error: "Team already registered." });
        }
        // 4. Insert Registration
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
// --- 4. UPDATE STATUS (Approve/Reject) ---
const updateRegistrationStatus = async (req, res) => {
    const { regId } = req.params; // Registration ID
    const { status } = req.body; // 'APPROVED' or 'REJECTED'
    try {
        const query = `UPDATE tournament_registrations SET status = $1 WHERE id = $2 RETURNING *`;
        const result = await database_1.db.query(query, [status, regId]);
        res.json(result.rows[0]);
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: "Update failed" });
    }
};
exports.updateRegistrationStatus = updateRegistrationStatus;
// --- 5. GET PROOF URL (Signed URL) ---
const getPaymentProofUrl = async (req, res) => {
    const { regId } = req.params;
    try {
        // Get the path from DB
        const query = `SELECT payment_proof_url FROM tournament_registrations WHERE id = $1`;
        const result = await database_1.db.query(query, [regId]);
        if (result.rows.length === 0)
            return res.status(404).json({ error: "Not found" });
        const path = result.rows[0].payment_proof_url;
        // Generate Signed URL (Valid 60 seconds)
        const { data, error } = await supabase_1.supabase
            .storage
            .from('payment-proofs') // Ensure this matches your Supabase bucket name
            .createSignedUrl(path, 60);
        if (error)
            throw error;
        res.json({ url: data.signedUrl });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to generate URL" });
    }
};
exports.getPaymentProofUrl = getPaymentProofUrl;
//# sourceMappingURL=registrations.controller.js.map