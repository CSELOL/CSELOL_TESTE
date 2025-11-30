"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.localUpload = void 0;
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const uuid_1 = require("uuid");
// Ensure directories exist
const createDir = (dir) => {
    if (!fs_1.default.existsSync(dir)) {
        fs_1.default.mkdirSync(dir, { recursive: true });
    }
};
// Define storage locations
const storage = multer_1.default.diskStorage({
    destination: (req, file, cb) => {
        let uploadPath = 'public/uploads/misc'; // Default
        // You can pass a 'type' in the body to organize folders
        if (req.body.type === 'tournament')
            uploadPath = 'public/uploads/tournaments';
        else if (req.body.type === 'team')
            uploadPath = 'public/uploads/teams';
        createDir(uploadPath);
        cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
        // Generate unique name: uuid + original extension
        const ext = path_1.default.extname(file.originalname);
        cb(null, `${(0, uuid_1.v4)()}${ext}`);
    }
});
// Filter for Images only
const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
        cb(null, true);
    }
    else {
        cb(new Error('Only images are allowed'), false);
    }
};
exports.localUpload = (0, multer_1.default)({
    storage,
    fileFilter,
    limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});
//# sourceMappingURL=multer.js.map