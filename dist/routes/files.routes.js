"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const files_controller_1 = require("../controllers/files.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const multer_1 = require("../config/multer");
const router = (0, express_1.Router)();
// General file upload (Admin only)
router.post('/upload', auth_middleware_1.jwtAuth, (0, auth_middleware_1.checkRole)(['admin']), multer_1.genericUpload.single('file'), files_controller_1.uploadFile);
// Delete file (Admin only)
router.delete('/delete', auth_middleware_1.jwtAuth, (0, auth_middleware_1.checkRole)(['admin']), files_controller_1.deleteFile);
// Team logo upload (authenticated users)
router.post('/team-logo', auth_middleware_1.jwtAuth, multer_1.imageUpload.single('file'), files_controller_1.uploadTeamLogo);
// Tournament asset upload (Admin only)
router.post('/tournament-asset', auth_middleware_1.jwtAuth, (0, auth_middleware_1.checkRole)(['admin']), multer_1.imageUpload.single('file'), files_controller_1.uploadTournamentAsset);
// Payment proof upload (authenticated users)
router.post('/payment-proof', auth_middleware_1.jwtAuth, multer_1.documentUpload.single('file'), files_controller_1.uploadPaymentProof);
exports.default = router;
//# sourceMappingURL=files.routes.js.map