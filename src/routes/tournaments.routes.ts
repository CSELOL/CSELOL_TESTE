import { Router } from 'express';
import {
  getAllTournamentsController as getTournaments,
  createTournamentController as createTournament,
  updateTournamentController,
  deleteTournamentController,
  getTournamentTeamsController,
  getPublicTournamentTeamsController
} from '../controllers/tournaments.controller';

import {
  getTournamentById,
  registerForTournament,
  updateRegistrationStatus,
  getPaymentProofUrl
} from '../controllers/registrations.controller';

import { jwtAuth, checkRole } from '../middlewares/auth.middleware';

const router = Router();

/**
 * @swagger
 * /tournaments:
 *   get:
 *     summary: Get all tournaments
 *     tags: [Tournaments]
 */
router.get('/', getTournaments);

/**
 * @swagger
 * /tournaments/{id}:
 *   get:
 *     summary: Get a specific tournament by ID
 *     tags: [Tournaments]
 */
router.get('/:id', getTournamentById);

/**
 * @swagger
 * /tournaments:
 *   post:
 *     summary: Create a new tournament (Admin only)
 *     tags: [Tournaments]
 *     security:
 *       - bearerAuth: []
 */
router.post('/', jwtAuth, checkRole(['admin']), createTournament);

/**
 * @swagger
 * /tournaments/{id}:
 *   put:
 *     summary: Update a tournament (Admin only)
 *     tags: [Tournaments]
 *     security:
 *       - bearerAuth: []
 */
router.put('/:id', jwtAuth, checkRole(['admin']), updateTournamentController);

/**
 * @swagger
 * /tournaments/{id}:
 *   delete:
 *     summary: Delete a tournament (Admin only)
 *     tags: [Tournaments]
 *     security:
 *       - bearerAuth: []
 */
router.delete('/:id', jwtAuth, checkRole(['admin']), deleteTournamentController);

/**
 * @swagger
 * /tournaments/{id}/teams:
 *   get:
 *     summary: Get all teams registered for a tournament (Admin only)
 *     tags: [Tournaments]
 *     security:
 *       - bearerAuth: []
 */
router.get('/:id/teams', jwtAuth, checkRole(['admin']), getTournamentTeamsController);

/**
 * @swagger
 * /tournaments/{id}/public-teams:
 *   get:
 *     summary: Get approved teams for a tournament (Public)
 *     tags: [Tournaments]
 */
router.get('/:id/public-teams', getPublicTournamentTeamsController);

/**
 * @swagger
 * /tournaments/{id}/register:
 *   post:
 *     summary: Register a team for a tournament (Captain only)
 *     tags: [Tournaments]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               payment_proof_url:
 *                 type: string
 */
router.post('/:id/register', jwtAuth, registerForTournament);

/**
 * @swagger
 * /tournaments/registrations/{regId}/status:
 *   put:
 *     summary: Update registration status (Admin only)
 *     tags: [Tournaments]
 *     security:
 *       - bearerAuth: []
 */
router.put('/registrations/:id/status', jwtAuth, checkRole(['admin']), updateRegistrationStatus);

/**
 * @swagger
 * /tournaments/registrations/{regId}/proof:
 *   get:
 *     summary: Get signed URL for payment proof (Admin only)
 *     tags: [Tournaments]
 *     security:
 *       - bearerAuth: []
 */
router.get('/registrations/:id/proof', jwtAuth, checkRole(['admin']), getPaymentProofUrl);

export default router;