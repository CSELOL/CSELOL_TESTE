"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const teams_controller_1 = require("../controllers/teams.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const multer_1 = require("../config/multer");
const router = (0, express_1.Router)();
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
router.post('/', auth_middleware_1.jwtAuth, multer_1.localUpload.single('logo'), teams_controller_1.createTeamController);
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
const teams_controller_2 = require("../controllers/teams.controller");
router.get('/my-team', auth_middleware_1.jwtAuth, teams_controller_2.getMyTeamController);
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
router.post('/join', auth_middleware_1.jwtAuth, teams_controller_2.joinTeamByCodeController);
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
router.get('/:id/members', teams_controller_2.getTeamMembersController);
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
router.post('/:id/refresh-code', auth_middleware_1.jwtAuth, teams_controller_2.refreshInviteCodeController);
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
router.post('/:id/join', auth_middleware_1.jwtAuth, teams_controller_1.joinTeamController);
exports.default = router;
//# sourceMappingURL=teams.routes.js.map