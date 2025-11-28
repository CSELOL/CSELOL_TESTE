import { Request, Response, NextFunction } from 'express';
import * as service from '../services/tournaments.service';


export async function list(req: Request, res: Response, next: NextFunction) {
try {
const items = await service.findAll();
res.json(items);
} catch (err) { next(err); }
}


export async function getOne(req: Request, res: Response, next: NextFunction) {
try {
const id = Number(req.params.id);
const item = await service.findById(id);
if (!item) return res.status(404).json({ error: 'Not found' });
res.json(item);
} catch (err) { next(err); }
}


export async function create(req: Request, res: Response, next: NextFunction) {
try {
const data = req.body;
const created = await service.create(data);
res.status(201).json(created);
} catch (err) { next(err); }
}