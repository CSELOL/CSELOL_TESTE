import { Request, Response } from "express";
import * as matchesService from "../services/matches.service";

// Fixed: Now accepts tournamentId either from URL params ( /tournaments/:id/matches ) or Query string
export async function getMatches(req: Request, res: Response) {
  const tournamentId = Number(req.params.id) || Number(req.query.tournamentId);

  if (!tournamentId || isNaN(tournamentId)) {
    return res.status(400).json({ error: "Tournament ID is required to fetch matches." });
  }

  try {
    const matches = await matchesService.getMatches(tournamentId);
    return res.json(matches);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}

export async function getMatchById(req: Request, res: Response) {
  return res.json(await matchesService.getMatchById(Number(req.params.id)));
}

export async function createMatch(req: Request, res: Response) {
  return res.status(201).json(await matchesService.createMatch(req.body));
}

// New: Function to handle score updates
export async function updateMatch(req: Request, res: Response) {
  const id = Number(req.params.id);
  try {
    // We pass the whole body (score1, score2, status, etc) to the service
    const updatedMatch = await matchesService.updateMatch(id, req.body);
    return res.json(updatedMatch);
  } catch (error: any) {
    console.error(error);
    return res.status(500).json({ error: "Failed to update match" });
  }
}

export async function deleteMatch(req: Request, res: Response) {
  await matchesService.deleteMatch(Number(req.params.id));
  return res.json({ message: "Match deleted" });
}