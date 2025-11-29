import { Router } from 'express';
import {
  createTournamentController,
  getAllTournamentsController
} from '../controllers/tournaments.controller';

const router = Router();

router.post('/', createTournamentController);
router.get('/', getAllTournamentsController);

export default router;
