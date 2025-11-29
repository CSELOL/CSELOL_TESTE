"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const matches_controller_1 = require("../controllers/matches.controller");
const router = (0, express_1.Router)();
router.get("/", matches_controller_1.getMatches);
router.get("/:id", matches_controller_1.getMatchById);
router.post("/", matches_controller_1.createMatch);
router.delete("/:id", matches_controller_1.deleteMatch);
exports.default = router;
//# sourceMappingURL=matches.routes.js.map