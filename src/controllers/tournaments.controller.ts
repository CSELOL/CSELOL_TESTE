import { Request, Response } from 'express';
import { createTournament, getTournaments, updateTournament, deleteTournament } from '../services/tournaments.service';

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

export async function updateTournamentController(req: Request, res: Response) {
  try {
    const id = parseInt(req.params.id);
    const tournament = await updateTournament(id, req.body);
    if (!tournament) {
      return res.status(404).json({ error: 'Tournament not found' });
    }
    return res.json(tournament);
  } catch (err: any) {
    console.error(err);
    return res.status(500).json({ error: err.message || 'Error updating tournament' });
  }
}

export async function deleteTournamentController(req: Request, res: Response) {
  try {
    const id = parseInt(req.params.id);
    const tournament = await deleteTournament(id);
    if (!tournament) {
      return res.status(404).json({ error: 'Tournament not found' });
    }
    return res.status(204).send();
  } catch (err: any) {
    console.error(err);
    return res.status(500).json({ error: err.message || 'Error deleting tournament' });
  }
}
