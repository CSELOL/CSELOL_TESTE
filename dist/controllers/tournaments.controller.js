"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
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
//# sourceMappingURL=tournaments.controller.js.map