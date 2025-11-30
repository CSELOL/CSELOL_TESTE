"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMeController = exports.createPlayerController = void 0;
const players_service_1 = require("../services/players.service");
const createPlayerController = async (req, res) => {
    try {
        const auth = req.auth;
        const keycloakId = auth.sub;
        const { username, summoner_name, role } = req.body;
        // Check if player already exists
        const existingPlayer = await (0, players_service_1.getPlayerByKeycloakId)(keycloakId);
        if (existingPlayer) {
            return res.status(409).json({ error: 'Player already registered' });
        }
        const player = await (0, players_service_1.createPlayer)(keycloakId, username, summoner_name, role);
        res.status(201).json(player);
    }
    catch (error) {
        console.error('Error creating player:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
exports.createPlayerController = createPlayerController;
const getMeController = async (req, res) => {
    try {
        const auth = req.auth;
        const keycloakId = auth.sub;
        const player = await (0, players_service_1.getPlayerByKeycloakId)(keycloakId);
        if (!player) {
            return res.status(404).json({ error: 'Player profile not found' });
        }
        res.json(player);
    }
    catch (error) {
        console.error('Error fetching player profile:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
exports.getMeController = getMeController;
//# sourceMappingURL=players.controller.js.map