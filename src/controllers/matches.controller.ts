import { Request, Response } from "express";
import * as matchesService from "../services/matches.service";

export async function getMatches(req: Request, res: Response) {
  return res.json(await matchesService.getMatches());
}

export async function getMatchById(req: Request, res: Response) {
  return res.json(await matchesService.getMatchById(Number(req.params.id)));
}

export async function createMatch(req: Request, res: Response) {
  return res.status(201).json(await matchesService.createMatch(req.body));
}

export async function deleteMatch(req: Request, res: Response) {
  await matchesService.deleteMatch(Number(req.params.id));
  return res.json({ message: "Match deleted" });
}
