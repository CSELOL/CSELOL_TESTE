"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.localUpload = exports.genericUpload = exports.documentUpload = exports.imageUpload = void 0;
const multer_1 = __importDefault(require("multer"));
// Use memory storage so we can forward the buffer to Supabase
const memoryStorage = multer_1.default.memoryStorage();
// Filter for Images only
const imageFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
        cb(null, true);
    }
    else {
        cb(new Error('Only images are allowed'), false);
    }
};
// Filter for Images and PDFs (for payment proofs)
const documentFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image/') || file.mimetype === 'application/pdf') {
        cb(null, true);
    }
    else {
        cb(new Error('Only images and PDFs are allowed'), false);
    }
};
// For image uploads (logos, banners)
exports.imageUpload = (0, multer_1.default)({
    storage: memoryStorage,
    fileFilter: imageFilter,
    limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});
// For document uploads (payment proofs)
exports.documentUpload = (0, multer_1.default)({
    storage: memoryStorage,
    fileFilter: documentFilter,
    limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});
// Generic upload (any file type)
exports.genericUpload = (0, multer_1.default)({
    storage: memoryStorage,
    limits: { fileSize: 10 * 1024 * 1024 }
});
// Keep old export for backward compatibility
exports.localUpload = exports.imageUpload;
//# sourceMappingURL=multer.js.map