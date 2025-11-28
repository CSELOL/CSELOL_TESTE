import { Request, Response, NextFunction } from 'express';
import * as service from '../services/teams.service';


export async function create(req: Request, res: Response, next: NextFunction) {
try {
const created = await service.create(req.body);
res.status(201).json(created);
} catch (err) { next(err); }
}


export async function getOne(req: Request, res: Response, next: NextFunction) {
try {
const id = Number(req.params.id);
const team = await service.findById(id);
if (!team) return res.status(404).json({ error: 'Not found' });
res.json(team);
} catch (err) { next(err); }
}