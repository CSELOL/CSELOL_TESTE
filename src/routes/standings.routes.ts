import { Router } from "express";
import { getStandings } from "../controllers/standings.controller";

const router = Router();

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
router.get("/:tournamentId", getStandings);

export default router;
