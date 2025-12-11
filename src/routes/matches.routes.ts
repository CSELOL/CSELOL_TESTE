import { Router } from "express";
import {
  getMatches,
  getMatchById,
  createMatch,
  updateMatch,
  deleteMatch,
  getMatchPlayers,
  setMatchPlayers,
} from "../controllers/matches.controller";
import { jwtAuth, checkRole } from "../middlewares/auth.middleware";

const router = Router();

// Matches are now usually fetched via /tournaments/:id/matches, 
// but this route supports /matches?tournamentId=1
router.get("/", getMatches);

router.get("/:id", getMatchById);
router.post("/", jwtAuth, checkRole(['admin']), createMatch);
router.put("/:id", jwtAuth, checkRole(['admin']), updateMatch);
router.delete("/:id", jwtAuth, checkRole(['admin']), deleteMatch);

/**
 * @swagger
 * /matches/{id}/players:
 *   get:
 *     summary: Get players who participated in a match
 *     tags: [Matches]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Match ID
 *     responses:
 *       200:
 *         description: List of match players
 */
router.get("/:id/players", getMatchPlayers);

/**
 * @swagger
 * /matches/{id}/players:
 *   put:
 *     summary: Set players for a match (admin only)
 *     tags: [Matches]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Match ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - teamAPlayerIds
 *               - teamBPlayerIds
 *               - teamAId
 *               - teamBId
 *             properties:
 *               teamAPlayerIds:
 *                 type: array
 *                 items:
 *                   type: integer
 *               teamBPlayerIds:
 *                 type: array
 *                 items:
 *                   type: integer
 *               teamAId:
 *                 type: integer
 *               teamBId:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Players set successfully
 *       403:
 *         description: Admin access required
 */
router.put("/:id/players", jwtAuth, checkRole(['admin']), setMatchPlayers);

export default router;