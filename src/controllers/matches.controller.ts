import { Request, Response } from "express";
import * as matchesService from "../services/matches.service";
import * as matchPlayersService from "../services/match-players.service";

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

// --- MATCH PLAYERS ---

/**
 * GET /api/matches/:id/players
 * Get all players who participated in a match
 */
export async function getMatchPlayers(req: Request, res: Response) {
  try {
    const matchId = Number(req.params.id);
    const players = await matchPlayersService.getMatchPlayers(matchId);
    return res.json(players);
  } catch (error: any) {
    console.error(error);
    return res.status(500).json({ error: "Failed to fetch match players" });
  }
}

/**
 * PUT /api/matches/:id/players
 * Set players for a match (admin only)
 * Body: { teamAPlayerIds: number[], teamBPlayerIds: number[], teamAId: number, teamBId: number }
 */
export async function setMatchPlayers(req: Request, res: Response) {
  try {
    const matchId = Number(req.params.id);
    const { teamAPlayerIds, teamBPlayerIds, teamAId, teamBId } = req.body;

    if (!teamAPlayerIds || !teamBPlayerIds || !teamAId || !teamBId) {
      return res.status(400).json({
        error: "Required: teamAPlayerIds, teamBPlayerIds, teamAId, teamBId"
      });
    }

    await matchPlayersService.setMatchPlayers(
      matchId,
      teamAPlayerIds,
      teamBPlayerIds,
      teamAId,
      teamBId
    );

    return res.json({ message: "Match players updated successfully" });
  } catch (error: any) {
    console.error(error);
    return res.status(500).json({ error: "Failed to set match players" });
  }
}