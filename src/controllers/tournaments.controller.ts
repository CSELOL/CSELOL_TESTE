import { Request, Response } from 'express';
import { createTournament, getTournaments } from '../services/tournaments.service';

export async function createTournamentController(req: Request, res: Response) {
  try {
    const tournament = await createTournament(req.body);
    return res.status(201).json(tournament);
  } catch (err: any) {
    console.error(err);
    return res.status(500).json({ error: err.message || 'Error creating tournament' });
  }
}

export async function getAllTournamentsController(req: Request, res: Response) {
  try {
    const tournaments = await getTournaments();
    return res.json(tournaments);
  } catch (err: any) {
    console.error(err);
    return res.status(500).json({ error: err.message });
  }
}
