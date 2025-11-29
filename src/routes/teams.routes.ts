import { Router } from "express";
import {
  getTeams,
  getTeamById,
  createTeam,
  deleteTeam,
} from "../controllers/teams.controller";

const router = Router();

router.get("/", getTeams);
router.get("/:id", getTeamById);
router.post("/", createTeam);
router.delete("/:id", deleteTeam);

export default router;
