"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const files_controller_1 = require("../controllers/files.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const multer_1 = require("../config/multer");
const router = (0, express_1.Router)();
// PROTECTED: Only Admins can upload/delete tournament assets
router.post('/upload', auth_middleware_1.jwtAuth, (0, auth_middleware_1.checkRole)(['admin']), multer_1.localUpload.single('file'), files_controller_1.uploadFile);
router.delete('/delete', auth_middleware_1.jwtAuth, (0, auth_middleware_1.checkRole)(['admin']), files_controller_1.deleteFile);
exports.default = router;
//# sourceMappingURL=files.routes.js.map