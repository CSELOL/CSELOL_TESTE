import { Request, Response } from 'express';
import { getUserMe } from '../services/users.service';

export const getMeController = async (req: Request, res: Response) => {
    try {
        const auth = (req as any).auth;
        const supabaseId = auth.sub;

        const user = await getUserMe(supabaseId);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json(user);
    } catch (error) {
        console.error('Error fetching user profile:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
