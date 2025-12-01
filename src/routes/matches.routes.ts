import { Router } from "express";
import {
  getMatches,
  getMatchById,
  createMatch,
  updateMatch, // Import this
  deleteMatch,
} from "../controllers/matches.controller";
import { jwtAuth, checkRole } from "../middlewares/auth.middleware"; // Assuming you want security

const router = Router();

// Matches are now usually fetched via /tournaments/:id/matches, 
// but this route supports /matches?tournamentId=1
router.get("/", getMatches);

router.get("/:id", getMatchById);
router.post("/", jwtAuth, checkRole(['admin']), createMatch);
router.put("/:id", jwtAuth, checkRole(['admin']), updateMatch); // Added PUT
router.delete("/:id", jwtAuth, checkRole(['admin']), deleteMatch);

export default router;