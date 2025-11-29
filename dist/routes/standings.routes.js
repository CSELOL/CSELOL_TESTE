"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const standings_controller_1 = require("../controllers/standings.controller");
const router = (0, express_1.Router)();
/**
 * @swagger
 * /standings/{tournamentId}:
 *   get:
 *     summary: Get standings for a tournament
 *     tags: [Standings]
 *     parameters:
 *       - in: path
 *         name: tournamentId
 *         required: true
 *         schema:
 *           type: integer
 *         description: The tournament ID
 *     responses:
 *       200:
 *         description: Standings for the tournament
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   teamId:
 *                     type: integer
 *                   teamName:
 *                     type: string
 *                   wins:
 *                     type: integer
 *                   losses:
 *                     type: integer
 */
router.get("/:tournamentId", standings_controller_1.getStandings);
exports.default = router;
//# sourceMappingURL=standings.routes.js.map