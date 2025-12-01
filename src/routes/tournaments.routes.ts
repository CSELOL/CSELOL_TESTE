import { Router } from 'express';
import {
  getAllTournamentsController as getTournaments,
  createTournamentController as createTournament,
  updateTournamentController,
  deleteTournamentController,
  getTournamentTeamsController,
  getPublicTournamentTeamsController,
  generateBracketController,
  generateGroupsController
} from '../controllers/tournaments.controller';

// Import the matches controller to handle the sub-route
import { getMatches } from '../controllers/matches.controller';

import {
  getTournamentById,
  registerForTournament,
  updateRegistrationStatus,
  getPaymentProofUrl
} from '../controllers/registrations.controller';

import { jwtAuth, checkRole } from '../middlewares/auth.middleware';

const router = Router();

router.get('/', getTournaments);
router.get('/:id', getTournamentById);

// --- Admin Routes ---
router.post('/', jwtAuth, checkRole(['admin']), createTournament);
router.put('/:id', jwtAuth, checkRole(['admin']), updateTournamentController);
router.delete('/:id', jwtAuth, checkRole(['admin']), deleteTournamentController);

// Teams
router.get('/:id/teams', jwtAuth, checkRole(['admin']), getTournamentTeamsController);
router.get('/:id/public-teams', getPublicTournamentTeamsController);

// --- MATCHES SUB-ROUTE (This fixes your original error context) ---
// Calls getMatches which checks req.params.id
router.get('/:id/matches', getMatches);

// Bracket Generation
router.post('/:id/generate-bracket', jwtAuth, checkRole(['admin']), generateBracketController);

// Registration
router.post('/:id/register', jwtAuth, registerForTournament);
router.put('/registrations/:id/status', jwtAuth, checkRole(['admin']), updateRegistrationStatus);
router.get('/registrations/:id/proof', jwtAuth, checkRole(['admin']), getPaymentProofUrl);
router.post('/:id/generate-groups', jwtAuth, checkRole(['admin']), generateGroupsController);
export default router;