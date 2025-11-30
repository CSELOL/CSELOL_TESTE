"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPublicTournamentTeamsController = exports.getTournamentTeamsController = void 0;
exports.createTournamentController = createTournamentController;
exports.getAllTournamentsController = getAllTournamentsController;
exports.updateTournamentController = updateTournamentController;
exports.deleteTournamentController = deleteTournamentController;
const tournaments_service_1 = require("../services/tournaments.service");
async function createTournamentController(req, res) {
    try {
        const tournament = await (0, tournaments_service_1.createTournament)(req.body);
        return res.status(201).json(tournament);
    }
    catch (err) {
        console.error(err);
        return res.status(500).json({ error: err.message || 'Error creating tournament' });
    }
}
async function getAllTournamentsController(req, res) {
    try {
        const tournaments = await (0, tournaments_service_1.getTournaments)();
        return res.json(tournaments);
    }
    catch (err) {
        console.error(err);
        return res.status(500).json({ error: err.message });
    }
}
async function updateTournamentController(req, res) {
    try {
        const id = parseInt(req.params.id);
        const tournament = await (0, tournaments_service_1.updateTournament)(id, req.body);
        if (!tournament) {
            return res.status(404).json({ error: 'Tournament not found' });
        }
        return res.json(tournament);
    }
    catch (err) {
        console.error(err);
        return res.status(500).json({ error: err.message || 'Error updating tournament' });
    }
}
async function deleteTournamentController(req, res) {
    try {
        const id = parseInt(req.params.id);
        const tournament = await (0, tournaments_service_1.deleteTournament)(id);
        if (!tournament) {
            return res.status(404).json({ error: 'Tournament not found' });
        }
        return res.status(204).send();
    }
    catch (err) {
        console.error(err);
        return res.status(500).json({ error: err.message || 'Error deleting tournament' });
    }
}
const database_1 = require("../config/database");
const getTournamentTeamsController = async (req, res) => {
    const { id } = req.params; // Tournament ID
    try {
        // Join 'teams' with 'tournament_registrations'
        // We need team info (name, tag) AND registration info (status, proof, date)
        const query = `
      SELECT 
        t.id, 
        t.name, 
        t.tag, 
        t.logo_url,
        tr.id as registration_id,
        tr.status as registration_status,
        tr.payment_proof_url,
        tr.created_at as registered_at
      FROM teams t
      JOIN tournament_registrations tr ON t.id = tr.team_id
      WHERE tr.tournament_id = $1
      ORDER BY tr.created_at DESC
    `;
        const result = await database_1.db.query(query, [id]);
        res.json(result.rows);
    }
    catch (err) {
        console.error("Error fetching tournament teams:", err);
        res.status(500).json({ error: "Failed to fetch registered teams" });
    }
};
exports.getTournamentTeamsController = getTournamentTeamsController;
const getPublicTournamentTeamsController = async (req, res) => {
    const { id } = req.params; // Tournament ID
    try {
        // Only fetch APPROVED teams and safe fields
        const query = `
      SELECT 
        t.id, 
        t.name, 
        t.tag, 
        t.logo_url
      FROM teams t
      JOIN tournament_registrations tr ON t.id = tr.team_id
      WHERE tr.tournament_id = $1 AND tr.status = 'approved'
      ORDER BY t.name ASC
    `;
        const result = await database_1.db.query(query, [id]);
        res.json(result.rows);
    }
    catch (err) {
        console.error("Error fetching public tournament teams:", err);
        res.status(500).json({ error: "Failed to fetch tournament teams" });
    }
};
exports.getPublicTournamentTeamsController = getPublicTournamentTeamsController;
//# sourceMappingURL=tournaments.controller.js.map