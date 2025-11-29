"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const tournaments_controller_1 = require("../controllers/tournaments.controller");
const router = (0, express_1.Router)();
router.post('/', tournaments_controller_1.createTournamentController);
router.get('/', tournaments_controller_1.getAllTournamentsController);
exports.default = router;
//# sourceMappingURL=tournaments.routes.js.map