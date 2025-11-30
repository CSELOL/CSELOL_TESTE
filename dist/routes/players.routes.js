"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const players_controller_1 = require("../controllers/players.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const validate_middleware_1 = require("../middlewares/validate.middleware");
const zod_schemas_1 = require("../utils/zod-schemas");
const router = (0, express_1.Router)();
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
router.post('/', auth_middleware_1.jwtAuth, (0, validate_middleware_1.validateBody)(zod_schemas_1.CreatePlayerSchema), players_controller_1.createPlayerController);
router.get('/me', auth_middleware_1.jwtAuth, players_controller_1.getMeController);
exports.default = router;
//# sourceMappingURL=players.routes.js.map