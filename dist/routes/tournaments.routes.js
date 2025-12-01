"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const tournaments_controller_1 = require("../controllers/tournaments.controller");
// Import the matches controller to handle the sub-route
const matches_controller_1 = require("../controllers/matches.controller");
const registrations_controller_1 = require("../controllers/registrations.controller");
const tournaments_management_controller_1 = require("../controllers/tournaments-management.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const router = (0, express_1.Router)();
router.get('/', tournaments_controller_1.getAllTournamentsController);
router.get('/:id', registrations_controller_1.getTournamentById);
// --- Admin Routes ---
router.post('/', auth_middleware_1.jwtAuth, (0, auth_middleware_1.checkRole)(['admin']), tournaments_controller_1.createTournamentController);
router.put('/:id', auth_middleware_1.jwtAuth, (0, auth_middleware_1.checkRole)(['admin']), tournaments_controller_1.updateTournamentController);
router.delete('/:id', auth_middleware_1.jwtAuth, (0, auth_middleware_1.checkRole)(['admin']), tournaments_controller_1.deleteTournamentController);
// Teams
router.get('/:id/teams', auth_middleware_1.jwtAuth, (0, auth_middleware_1.checkRole)(['admin']), tournaments_controller_1.getTournamentTeamsController);
router.get('/:id/public-teams', tournaments_controller_1.getPublicTournamentTeamsController);
// --- MATCHES SUB-ROUTE ---
// Calls getMatches which checks req.params.id
router.get('/:id/matches', matches_controller_1.getMatches);
// Bracket Generation
router.post('/:id/generate-bracket', auth_middleware_1.jwtAuth, (0, auth_middleware_1.checkRole)(['admin']), tournaments_controller_1.generateBracketController);
router.post('/:id/generate-groups', auth_middleware_1.jwtAuth, (0, auth_middleware_1.checkRole)(['admin']), tournaments_controller_1.generateGroupsController);
// Registration
router.post('/:id/register', auth_middleware_1.jwtAuth, registrations_controller_1.registerForTournament);
router.put('/registrations/:id/status', auth_middleware_1.jwtAuth, (0, auth_middleware_1.checkRole)(['admin']), registrations_controller_1.updateRegistrationStatus);
router.get('/registrations/:id/proof', auth_middleware_1.jwtAuth, (0, auth_middleware_1.checkRole)(['admin']), registrations_controller_1.getPaymentProofUrl);
// --- Advanced Tournament Management ---
router.post('/:id/assign-groups', auth_middleware_1.jwtAuth, (0, auth_middleware_1.checkRole)(['admin']), tournaments_management_controller_1.assignGroupsController);
router.get('/:id/groups', tournaments_management_controller_1.getGroupsController);
router.post('/:id/matches', auth_middleware_1.jwtAuth, (0, auth_middleware_1.checkRole)(['admin']), tournaments_management_controller_1.createMatchController);
router.put('/:id/matches/bulk', auth_middleware_1.jwtAuth, (0, auth_middleware_1.checkRole)(['admin']), tournaments_management_controller_1.bulkUpdateMatchesController);
router.post('/:id/stages', auth_middleware_1.jwtAuth, (0, auth_middleware_1.checkRole)(['admin']), tournaments_management_controller_1.createStageController);
exports.default = router;
//# sourceMappingURL=tournaments.routes.js.map