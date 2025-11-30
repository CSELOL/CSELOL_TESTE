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

import { db } from '../config/database';

export const getTournamentTeamsController = async (req: Request, res: Response) => {
  const { id } = req.params; // Tournament ID

  try {
    // Join 'teams' with 'tournament_registrations'
    // We need team info (name, tag) AND registration info (status, proof, date)
    const query = `
      SELECT 
        t.id, 
        t.name, 
        t.tag, 
        t.logo_url,
        tr.id as registration_id,
        tr.status as registration_status,
        tr.payment_proof_url,
        tr.created_at as registered_at
      FROM teams t
      JOIN tournament_registrations tr ON t.id = tr.team_id
      WHERE tr.tournament_id = $1
      ORDER BY tr.created_at DESC
    `;

    const result = await db.query(query, [id]);
    res.json(result.rows);

  } catch (err) {
    console.error("Error fetching tournament teams:", err);
    res.status(500).json({ error: "Failed to fetch registered teams" });
  }
};

export const getPublicTournamentTeamsController = async (req: Request, res: Response) => {
  const { id } = req.params; // Tournament ID

  try {
    // Only fetch APPROVED teams and safe fields
    const query = `
      SELECT 
        t.id, 
        t.name, 
        t.tag, 
        t.logo_url
      FROM teams t
      JOIN tournament_registrations tr ON t.id = tr.team_id
      WHERE tr.tournament_id = $1 AND tr.status = 'approved'
      ORDER BY t.name ASC
    `;

    const result = await db.query(query, [id]);
    res.json(result.rows);

  } catch (err) {
    console.error("Error fetching public tournament teams:", err);
    res.status(500).json({ error: "Failed to fetch tournament teams" });
  }
};
