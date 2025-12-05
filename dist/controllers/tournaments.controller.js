"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPublicTournamentTeamsController = exports.getTournamentTeamsController = void 0;
exports.createTournamentController = createTournamentController;
exports.getAllTournamentsController = getAllTournamentsController;
exports.updateTournamentController = updateTournamentController;
exports.deleteTournamentController = deleteTournamentController;
exports.generateBracketController = generateBracketController;
exports.generateGroupsController = generateGroupsController;
const tournaments_service_1 = require("../services/tournaments.service");
const database_1 = require("../config/database");
// ... (keep createTournamentController, getAllTournamentsController, updateTournamentController, deleteTournamentController as they are)
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
// UPDATED CONTROLLER
const getTournamentTeamsController = async (req, res) => {
    const { id } = req.params;
    try {
        const query = `
      SELECT 
        t.id, 
        t.name, 
        t.tag, 
        t.logo_url,
        t.description,
        t.social_media,
        tr.id as registration_id,
        tr.status as registration_status,
        tr.payment_proof_url,
        tr.created_at as registered_at,
        (
            SELECT json_agg(json_build_object(
                'id', u.id,
                'nickname', u.nickname,
                'riot_id', u.riot_id, -- Added Riot ID
                'avatar_url', u.avatar_url,
                'role', u.team_role,
                'primary_role', u.primary_role
            ))
            FROM users u
            WHERE u.team_id = t.id
        ) as roster
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
    const { id } = req.params;
    try {
        const query = `
        SELECT 
          t.id, 
          t.name, 
          t.tag, 
          t.logo_url,
          (
            SELECT json_agg(json_build_object(
                'id', u.id,
                'nickname', u.nickname,
                'riot_id', u.riot_id, -- Added Riot ID
                'avatar_url', u.avatar_url,
                'role', u.team_role,
                'primary_role', u.primary_role
            ))
            FROM users u
            WHERE u.team_id = t.id
          ) as roster
        FROM teams t
        JOIN tournament_registrations tr ON t.id = tr.team_id
        WHERE tr.tournament_id = $1 AND (tr.status = 'approved' OR tr.status = 'APPROVED')
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
async function generateBracketController(req, res) {
    try {
        const id = parseInt(req.params.id);
        await (0, tournaments_service_1.generateBracket)(id);
        return res.status(200).json({ message: "Bracket generated successfully" });
    }
    catch (err) {
        console.error(err);
        return res.status(500).json({ error: err.message || 'Error generating bracket' });
    }
}
async function generateGroupsController(req, res) {
    try {
        const id = parseInt(req.params.id);
        const { groups, bestOf } = req.body;
        await (0, tournaments_service_1.generateGroupStage)(id, groups || 1, bestOf || 1);
        return res.status(200).json({ message: "Group stage generated successfully" });
    }
    catch (err) {
        console.error(err);
        return res.status(500).json({ error: err.message });
    }
}
//# sourceMappingURL=tournaments.controller.js.map