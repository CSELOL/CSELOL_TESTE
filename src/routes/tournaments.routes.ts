import { Router } from 'express';
import {
  createTournamentController,
  getAllTournamentsController,
  updateTournamentController,
  deleteTournamentController
} from '../controllers/tournaments.controller';

const router = Router();

/**
 * @swagger
 * /tournaments:
 *   post:
 *     summary: Create a new tournament
 *     tags: [Tournaments]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateTournament'
 *     responses:
 *       201:
 *         description: The created tournament
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Tournament'
 *   get:
 *     summary: Get all tournaments
 *     tags: [Tournaments]
 *     responses:
 *       200:
 *         description: List of all tournaments
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Tournament'
 */
router.post('/', createTournamentController);
router.get('/', getAllTournamentsController);

/**
 * @swagger
 * /tournaments/{id}:
 *   put:
 *     summary: Update a tournament
 *     tags: [Tournaments]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The tournament ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateTournament'
 *     responses:
 *       200:
 *         description: The updated tournament
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Tournament'
 *       404:
 *         description: Tournament not found
 *   delete:
 *     summary: Delete a tournament
 *     tags: [Tournaments]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The tournament ID
 *     responses:
 *       204:
 *         description: Tournament deleted
 *       404:
 *         description: Tournament not found
 */
router.put('/:id', updateTournamentController);
router.delete('/:id', deleteTournamentController);

export default router;
