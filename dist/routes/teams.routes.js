"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const teams_controller_1 = require("../controllers/teams.controller");
const router = (0, express_1.Router)();
router.get("/", teams_controller_1.getTeams);
router.get("/:id", teams_controller_1.getTeamById);
router.post("/", teams_controller_1.createTeam);
router.delete("/:id", teams_controller_1.deleteTeam);
exports.default = router;
//# sourceMappingURL=teams.routes.js.map