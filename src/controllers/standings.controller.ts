import { Request, Response } from "express";
import * as standingsService from "../services/standings.service";

export async function getStandings(req: Request, res: Response) {
  return res.json(
    await standingsService.calculateStandings(Number(req.params.tournamentId))
  );
}
