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
exports.createStageController = exports.bulkUpdateMatchesController = exports.createMatchController = exports.getGroupsController = exports.assignGroupsController = void 0;
const tournamentManagementService = __importStar(require("../services/tournaments-management.service"));
const assignGroupsController = async (req, res) => {
    try {
        const tournamentId = parseInt(req.params.id);
        const { assignments } = req.body;
        if (!assignments || !Array.isArray(assignments)) {
            return res.status(400).json({ error: 'Invalid assignments format' });
        }
        const result = await tournamentManagementService.assignTeamsToGroups(tournamentId, assignments);
        res.json(result);
    }
    catch (error) {
        console.error('Error assigning groups:', error);
        res.status(500).json({ error: error.message || 'Internal Server Error' });
    }
};
exports.assignGroupsController = assignGroupsController;
const getGroupsController = async (req, res) => {
    try {
        const tournamentId = parseInt(req.params.id);
        const result = await tournamentManagementService.getGroupsWithTeams(tournamentId);
        res.json(result);
    }
    catch (error) {
        console.error('Error fetching groups:', error);
        res.status(500).json({ error: error.message || 'Internal Server Error' });
    }
};
exports.getGroupsController = getGroupsController;
const createMatchController = async (req, res) => {
    try {
        const tournamentId = parseInt(req.params.id);
        const matchData = req.body;
        const result = await tournamentManagementService.createSingleMatch(tournamentId, matchData);
        res.status(201).json(result);
    }
    catch (error) {
        console.error('Error creating match:', error);
        res.status(500).json({ error: error.message || 'Internal Server Error' });
    }
};
exports.createMatchController = createMatchController;
const bulkUpdateMatchesController = async (req, res) => {
    try {
        const tournamentId = parseInt(req.params.id);
        const { matchIds, updates } = req.body;
        if (!matchIds || !Array.isArray(matchIds)) {
            return res.status(400).json({ error: 'Invalid matchIds format' });
        }
        const result = await tournamentManagementService.bulkUpdateMatches(tournamentId, matchIds, updates);
        res.json(result);
    }
    catch (error) {
        console.error('Error bulk updating matches:', error);
        res.status(500).json({ error: error.message || 'Internal Server Error' });
    }
};
exports.bulkUpdateMatchesController = bulkUpdateMatchesController;
const createStageController = async (req, res) => {
    try {
        const tournamentId = parseInt(req.params.id);
        const stageData = req.body;
        const result = await tournamentManagementService.createCustomStage(tournamentId, stageData);
        res.status(201).json(result);
    }
    catch (error) {
        console.error('Error creating stage:', error);
        res.status(500).json({ error: error.message || 'Internal Server Error' });
    }
};
exports.createStageController = createStageController;
//# sourceMappingURL=tournaments-management.controller.js.map