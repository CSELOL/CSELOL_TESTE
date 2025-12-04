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
  getPaymentProofUrl,
  withdrawRegistration
} from '../controllers/registrations.controller';

import {
  assignGroupsController,
  getGroupsController,
  createMatchController,
  bulkUpdateMatchesController,
  createStageController,
  generateGroupMatchesController
} from '../controllers/tournaments-management.controller';

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

// --- MATCHES SUB-ROUTE ---
// Calls getMatches which checks req.params.id
router.get('/:id/matches', getMatches);
// FIX: Add this alias for the public frontend call
router.get('/:id/public-matches', getMatches);

// Bracket Generation
router.post('/:id/generate-bracket', jwtAuth, checkRole(['admin']), generateBracketController);
router.post('/:id/generate-groups', jwtAuth, checkRole(['admin']), generateGroupsController);

// Registration
router.post('/:id/register', jwtAuth, registerForTournament);
router.delete('/:id/register', jwtAuth, withdrawRegistration);
router.put('/registrations/:id/status', jwtAuth, checkRole(['admin']), updateRegistrationStatus);
router.get('/registrations/:id/proof', jwtAuth, checkRole(['admin']), getPaymentProofUrl);

// --- Advanced Tournament Management ---
router.post('/:id/assign-groups', jwtAuth, checkRole(['admin']), assignGroupsController);
router.get('/:id/groups', getGroupsController);
router.post('/:id/matches', jwtAuth, checkRole(['admin']), createMatchController);
router.post('/:id/generate-group-matches', jwtAuth, checkRole(['admin']), generateGroupMatchesController);
router.put('/:id/matches/bulk', jwtAuth, checkRole(['admin']), bulkUpdateMatchesController);
router.post('/:id/stages', jwtAuth, checkRole(['admin']), createStageController);

export default router;