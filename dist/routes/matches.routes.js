"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const matches_controller_1 = require("../controllers/matches.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware"); // Assuming you want security
const router = (0, express_1.Router)();
// Matches are now usually fetched via /tournaments/:id/matches, 
// but this route supports /matches?tournamentId=1
router.get("/", matches_controller_1.getMatches);
router.get("/:id", matches_controller_1.getMatchById);
router.post("/", auth_middleware_1.jwtAuth, (0, auth_middleware_1.checkRole)(['admin']), matches_controller_1.createMatch);
router.put("/:id", auth_middleware_1.jwtAuth, (0, auth_middleware_1.checkRole)(['admin']), matches_controller_1.updateMatch); // Added PUT
router.delete("/:id", auth_middleware_1.jwtAuth, (0, auth_middleware_1.checkRole)(['admin']), matches_controller_1.deleteMatch);
exports.default = router;
//# sourceMappingURL=matches.routes.js.map