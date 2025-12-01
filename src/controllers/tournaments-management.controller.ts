import { Request, Response } from 'express';
import * as tournamentManagementService from '../services/tournaments-management.service';

export const assignGroupsController = async (req: Request, res: Response) => {
    try {
        const tournamentId = parseInt(req.params.id);
        const { assignments } = req.body;

        if (!assignments || !Array.isArray(assignments)) {
            return res.status(400).json({ error: 'Invalid assignments format' });
        }

        const result = await tournamentManagementService.assignTeamsToGroups(tournamentId, assignments);
        res.json(result);
    } catch (error: any) {
        console.error('Error assigning groups:', error);
        res.status(500).json({ error: error.message || 'Internal Server Error' });
    }
};

export const getGroupsController = async (req: Request, res: Response) => {
    try {
        const tournamentId = parseInt(req.params.id);
        const result = await tournamentManagementService.getGroupsWithTeams(tournamentId);
        res.json(result);
    } catch (error: any) {
        console.error('Error fetching groups:', error);
        res.status(500).json({ error: error.message || 'Internal Server Error' });
    }
};

export const createMatchController = async (req: Request, res: Response) => {
    try {
        const tournamentId = parseInt(req.params.id);
        const matchData = req.body;

        const result = await tournamentManagementService.createSingleMatch(tournamentId, matchData);
        res.status(201).json(result);
    } catch (error: any) {
        console.error('Error creating match:', error);
        res.status(500).json({ error: error.message || 'Internal Server Error' });
    }
};

export const bulkUpdateMatchesController = async (req: Request, res: Response) => {
    try {
        const tournamentId = parseInt(req.params.id);
        const { matchIds, updates } = req.body;

        if (!matchIds || !Array.isArray(matchIds)) {
            return res.status(400).json({ error: 'Invalid matchIds format' });
        }

        const result = await tournamentManagementService.bulkUpdateMatches(tournamentId, matchIds, updates);
        res.json(result);
    } catch (error: any) {
        console.error('Error bulk updating matches:', error);
        res.status(500).json({ error: error.message || 'Internal Server Error' });
    }
};

export const createStageController = async (req: Request, res: Response) => {
    try {
        const tournamentId = parseInt(req.params.id);
        const stageData = req.body;

        const result = await tournamentManagementService.createCustomStage(tournamentId, stageData);
        res.status(201).json(result);
    } catch (error: any) {
        console.error('Error creating stage:', error);
        res.status(500).json({ error: error.message || 'Internal Server Error' });
    }
};
