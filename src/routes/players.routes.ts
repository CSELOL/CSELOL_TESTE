import { Router } from 'express';
import { createPlayerController, getMeController } from '../controllers/players.controller';
import { jwtAuth } from '../middlewares/auth.middleware';
import { validateBody } from '../middlewares/validate.middleware';
import { CreatePlayerSchema } from '../utils/zod-schemas';

const router = Router();

/**
 * @swagger
 * /players:
 *   post:
 *     summary: Register a new player profile
 *     tags: [Players]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreatePlayer'
 *     responses:
 *       201:
 *         description: Player profile created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Player'
 *       409:
 *         description: Player already registered
 *       401:
 *         description: Unauthorized
 *   get:
 *     summary: Get current user's player profile
 *     tags: [Players]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Player profile
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Player'
 *       404:
 *         description: Player profile not found
 *       401:
 *         description: Unauthorized
 */
router.post('/', jwtAuth, validateBody(CreatePlayerSchema), createPlayerController);
router.get('/me', jwtAuth, getMeController);

export default router;
