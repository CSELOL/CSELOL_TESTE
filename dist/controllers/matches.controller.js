"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMatches = getMatches;
exports.getMatchById = getMatchById;
exports.createMatch = createMatch;
exports.updateMatch = updateMatch;
exports.deleteMatch = deleteMatch;
const matchesService = __importStar(require("../services/matches.service"));
// Fixed: Now accepts tournamentId either from URL params ( /tournaments/:id/matches ) or Query string
async function getMatches(req, res) {
    const tournamentId = Number(req.params.id) || Number(req.query.tournamentId);
    if (!tournamentId || isNaN(tournamentId)) {
        return res.status(400).json({ error: "Tournament ID is required to fetch matches." });
    }
    try {
        const matches = await matchesService.getMatches(tournamentId);
        return res.json(matches);
    }
    catch (error) {
        return res.status(500).json({ error: error.message });
    }
}
async function getMatchById(req, res) {
    return res.json(await matchesService.getMatchById(Number(req.params.id)));
}
async function createMatch(req, res) {
    return res.status(201).json(await matchesService.createMatch(req.body));
}
// New: Function to handle score updates
async function updateMatch(req, res) {
    const id = Number(req.params.id);
    try {
        // We pass the whole body (score1, score2, status, etc) to the service
        const updatedMatch = await matchesService.updateMatch(id, req.body);
        return res.json(updatedMatch);
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({ error: "Failed to update match" });
    }
}
async function deleteMatch(req, res) {
    await matchesService.deleteMatch(Number(req.params.id));
    return res.json({ message: "Match deleted" });
}
//# sourceMappingURL=matches.controller.js.map