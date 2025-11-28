import { Router } from 'express';
import { getTournaments, createTournament } from '../controllers/tournamentController';

const router = Router();

// GET /api/tournaments
router.get('/', getTournaments);

// POST /api/tournaments
router.post('/', createTournament);

export default router;