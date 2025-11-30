"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const tournaments_controller_1 = require("../controllers/tournaments.controller");
const registrations_controller_1 = require("../controllers/registrations.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const router = (0, express_1.Router)();
/**
 * @swagger
 * /tournaments:
 *   get:
 *     summary: Get all tournaments
 *     tags: [Tournaments]
 */
router.get('/', tournaments_controller_1.getAllTournamentsController);
/**
 * @swagger
 * /tournaments/{id}:
 *   get:
 *     summary: Get a specific tournament by ID
 *     tags: [Tournaments]
 */
router.get('/:id', registrations_controller_1.getTournamentById);
/**
 * @swagger
 * /tournaments:
 *   post:
 *     summary: Create a new tournament (Admin only)
 *     tags: [Tournaments]
 *     security:
 *       - bearerAuth: []
 */
router.post('/', auth_middleware_1.jwtAuth, (0, auth_middleware_1.checkRole)(['admin']), tournaments_controller_1.createTournamentController);
/**
 * @swagger
 * /tournaments/{id}:
 *   put:
 *     summary: Update a tournament (Admin only)
 *     tags: [Tournaments]
 *     security:
 *       - bearerAuth: []
 */
router.put('/:id', auth_middleware_1.jwtAuth, (0, auth_middleware_1.checkRole)(['admin']), tournaments_controller_1.updateTournamentController);
/**
 * @swagger
 * /tournaments/{id}:
 *   delete:
 *     summary: Delete a tournament (Admin only)
 *     tags: [Tournaments]
 *     security:
 *       - bearerAuth: []
 */
router.delete('/:id', auth_middleware_1.jwtAuth, (0, auth_middleware_1.checkRole)(['admin']), tournaments_controller_1.deleteTournamentController);
/**
 * @swagger
 * /tournaments/{id}/teams:
 *   get:
 *     summary: Get all teams registered for a tournament (Admin only)
 *     tags: [Tournaments]
 *     security:
 *       - bearerAuth: []
 */
router.get('/:id/teams', auth_middleware_1.jwtAuth, (0, auth_middleware_1.checkRole)(['admin']), tournaments_controller_1.getTournamentTeamsController);
/**
 * @swagger
 * /tournaments/{id}/public-teams:
 *   get:
 *     summary: Get approved teams for a tournament (Public)
 *     tags: [Tournaments]
 */
router.get('/:id/public-teams', tournaments_controller_1.getPublicTournamentTeamsController);
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
router.post('/:id/register', auth_middleware_1.jwtAuth, registrations_controller_1.registerForTournament);
/**
 * @swagger
 * /tournaments/registrations/{regId}/status:
 *   put:
 *     summary: Update registration status (Admin only)
 *     tags: [Tournaments]
 *     security:
 *       - bearerAuth: []
 */
router.put('/registrations/:id/status', auth_middleware_1.jwtAuth, (0, auth_middleware_1.checkRole)(['admin']), registrations_controller_1.updateRegistrationStatus);
/**
 * @swagger
 * /tournaments/registrations/{regId}/proof:
 *   get:
 *     summary: Get signed URL for payment proof (Admin only)
 *     tags: [Tournaments]
 *     security:
 *       - bearerAuth: []
 */
router.get('/registrations/:id/proof', auth_middleware_1.jwtAuth, (0, auth_middleware_1.checkRole)(['admin']), registrations_controller_1.getPaymentProofUrl);
exports.default = router;
//# sourceMappingURL=tournaments.routes.js.map