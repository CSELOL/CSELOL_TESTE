import { Router } from "express";
import {
  getMatches,
  getMatchById,
  createMatch,
  deleteMatch,
} from "../controllers/matches.controller";

const router = Router();

/**
 * @swagger
 * /matches:
 *   get:
 *     summary: Get all matches
 *     tags: [Matches]
 *     responses:
 *       200:
 *         description: List of all matches
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Match'
 *   post:
 *     summary: Create a new match
 *     tags: [Matches]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateMatch'
 *     responses:
 *       201:
 *         description: The created match
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Match'
 */
router.get("/", getMatches);

/**
 * @swagger
 * /matches/{id}:
 *   get:
 *     summary: Get a match by ID
 *     tags: [Matches]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The match ID
 *     responses:
 *       200:
 *         description: The match description
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Match'
 *       404:
 *         description: Match not found
 *   delete:
 *     summary: Delete a match
 *     tags: [Matches]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The match ID
 *     responses:
 *       204:
 *         description: Match deleted
 */
router.get("/:id", getMatchById);
router.post("/", createMatch);
router.delete("/:id", deleteMatch);

export default router;
