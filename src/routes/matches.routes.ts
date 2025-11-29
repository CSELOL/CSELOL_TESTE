import { Router } from "express";
import {
  getMatches,
  getMatchById,
  createMatch,
  deleteMatch,
} from "../controllers/matches.controller";

const router = Router();

router.get("/", getMatches);
router.get("/:id", getMatchById);
router.post("/", createMatch);
router.delete("/:id", deleteMatch);

export default router;
