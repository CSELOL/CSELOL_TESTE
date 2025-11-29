import { Request, Response } from "express";
import * as teamsService from "../services/teams.service";

export async function getTeams(req: Request, res: Response) {
  return res.json(await teamsService.getTeams());
}

export async function getTeamById(req: Request, res: Response) {
  return res.json(await teamsService.getTeamById(Number(req.params.id)));
}

export async function createTeam(req: Request, res: Response) {
  return res.status(201).json(await teamsService.createTeam(req.body));
}

export async function deleteTeam(req: Request, res: Response) {
  await teamsService.deleteTeam(Number(req.params.id));
  return res.json({ message: "Team deleted" });
}
