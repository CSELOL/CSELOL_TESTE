import { Router } from 'express';
import { createTeamController, joinTeamController } from '../controllers/teams.controller';
import { jwtAuth } from '../middlewares/auth.middleware';
import { validateBody } from '../middlewares/validate.middleware';
import { CreateTeamSchema } from '../utils/zod-schemas';

import { localUpload } from '../config/multer';

const router = Router();

/**
 * @swagger
 * /teams:
 *   post:
 *     summary: Create a new team
 *     tags: [Teams]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               tag:
 *                 type: string
 *               description:
 *                 type: string
 *               social_media:
 *                 type: string
 *                 description: JSON string of social media links
 *               logo:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: Team created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Team'
 *       400:
 *         description: Player profile required
 *       409:
 *         description: Already in a team
 *       401:
 *         description: Unauthorized
 */
router.post('/', jwtAuth, localUpload.single('logo'), createTeamController);

/**
 * @swagger
 * /teams/my-team:
 *   get:
 *     summary: Get the current user's team
 *     tags: [Teams]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: The user's team
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Team'
 *       404:
 *         description: User not found or not in a team
 *       401:
 *         description: Unauthorized
 */
import { getMyTeamController, joinTeamByCodeController, getTeamMembersController, refreshInviteCodeController, getMyTeamMatchesController, getMyTeamTournamentsController } from '../controllers/teams.controller';
router.get('/my-team', jwtAuth, getMyTeamController);

/**
 * @swagger
 * /teams/my-team/matches:
 *   get:
 *     summary: Get my team's matches
 *     tags: [Teams]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of matches
 */
router.get('/my-team/matches', jwtAuth, getMyTeamMatchesController);

/**
 * @swagger
 * /teams/my-team/tournaments:
 *   get:
 *     summary: Get my team's tournaments
 *     tags: [Teams]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of tournaments
 */
router.get('/my-team/tournaments', jwtAuth, getMyTeamTournamentsController);


/**
 * @swagger
 * /teams/join:
 *   post:
 *     summary: Join a team using an invite code
 *     tags: [Teams]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               code:
 *                 type: string
 *     responses:
 *       200:
 *         description: Joined team successfully
 *       400:
 *         description: Invalid code or user state
 *       404:
 *         description: Team not found
 *       409:
 *         description: Already in a team
 */
router.post('/join', jwtAuth, joinTeamByCodeController);

/**
 * @swagger
 * /teams/{id}/members:
 *   get:
 *     summary: Get team members
 *     tags: [Teams]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: List of team members
 */
router.get('/:id/members', getTeamMembersController);

/**
 * @swagger
 * /teams/{id}/refresh-code:
 *   post:
 *     summary: Refresh team invite code (Captain only)
 *     tags: [Teams]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: New invite code generated
 *       403:
 *         description: Only captain can refresh code
 */
router.post('/:id/refresh-code', jwtAuth, refreshInviteCodeController);

/**
 * @swagger
 * /teams/{id}/join:
 *   post:
 *     summary: Join an existing team (Deprecated in favor of /join with code)
 *     tags: [Teams]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The team ID
 *     responses:
 *       200:
 *         description: Joined team successfully
 *       400:
 *         description: Player profile required
 *       404:
 *         description: Team not found
 *       409:
 *         description: Already in a team
 *       401:
 *         description: Unauthorized
 */
router.post('/:id/join', jwtAuth, joinTeamController);

export default router;

/**
 * @swagger
 * /teams/{id}/transfer-ownership:
 *   post:
 *     summary: Transfer team ownership (Captain only)
 *     tags: [Teams]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               newCaptainId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Ownership transferred successfully
 *       403:
 *         description: Only captain can transfer ownership
 */
import { transferOwnershipController } from '../controllers/teams.controller';
router.post('/:id/transfer-ownership', jwtAuth, transferOwnershipController);

