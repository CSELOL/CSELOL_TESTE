import { Request, Response } from 'express';
import { createPlayer, getPlayerBySupabaseId } from '../services/players.service';

export const createPlayerController = async (req: Request, res: Response) => {
    try {
        const auth = (req as any).auth;
        const supabaseId = auth.sub;
        const { username, summoner_name, role } = req.body;

        // Check if player already exists
        const existingPlayer = await getPlayerBySupabaseId(supabaseId);
        if (existingPlayer) {
            return res.status(409).json({ error: 'Player already registered' });
        }

        const player = await createPlayer(supabaseId, username, summoner_name, role);
        res.status(201).json(player);
    } catch (error) {
        console.error('Error creating player:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

export const getMeController = async (req: Request, res: Response) => {
    try {
        const auth = (req as any).auth;
        const supabaseId = auth.sub;

        const player = await getPlayerBySupabaseId(supabaseId);
        if (!player) {
            return res.status(404).json({ error: 'Player profile not found' });
        }

        res.json(player);
    } catch (error) {
        console.error('Error fetching player profile:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
