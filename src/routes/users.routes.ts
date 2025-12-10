import { Router } from 'express';
import { getMeController } from '../controllers/users.controller';
import { jwtAuth } from '../middlewares/auth.middleware';

const router = Router();

/**
 * @swagger
 * /users/me:
 *   get:
 *     summary: Get current user's profile (including role)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User profile with role
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       404:
 *         description: User not found
 *       401:
 *         description: Unauthorized
 */
router.get('/me', jwtAuth, getMeController);

export default router;
