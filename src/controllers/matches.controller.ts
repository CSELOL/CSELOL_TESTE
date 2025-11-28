import { Request, Response, NextFunction } from 'express';
import * as service from '../services/matches.service';


export async function create(req: Request, res: Response, next: NextFunction) {
try {
const created = await service.create(req.body);
res.status(201).json(created);
} catch (err) { next(err); }
}


export async function updateScore(req: Request, res: Response, next: NextFunction) {
try {
const id = Number(req.params.id);
const { scoreA, scoreB, status } = req.body;
const updated = await service.updateScore(id, scoreA, scoreB, status);
res.json(updated);
} catch (err) { next(err); }
}