"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createTournamentController = createTournamentController;
exports.getAllTournamentsController = getAllTournamentsController;
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
//# sourceMappingURL=tournaments.controller.js.map