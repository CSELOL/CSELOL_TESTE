"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createSignedUrl = exports.deleteFromStorage = exports.uploadToStorage = void 0;
const supabase_1 = require("./supabase");
const uuid_1 = require("uuid");
const path_1 = __importDefault(require("path"));
/**
 * Upload a file to Supabase Storage
 * @param buffer - File buffer
 * @param originalName - Original filename (for extension)
 * @param bucket - Storage bucket name
 * @param folder - Folder path within bucket (e.g., 'teams', 'tournaments')
 */
const uploadToStorage = async (buffer, originalName, bucket, folder) => {
    if (!supabase_1.supabase) {
        throw new Error('Supabase Storage not configured. Check SUPABASE_SERVICE_ROLE_KEY');
    }
    const ext = path_1.default.extname(originalName);
    const fileName = `${(0, uuid_1.v4)()}${ext}`;
    const filePath = `${folder}/${fileName}`;
    const { error } = await supabase_1.supabase.storage
        .from(bucket)
        .upload(filePath, buffer, {
        contentType: getMimeType(ext),
        upsert: false
    });
    if (error) {
        console.error('Storage upload error:', error);
        throw error;
    }
    // Get public URL
    const { data: urlData } = supabase_1.supabase.storage
        .from(bucket)
        .getPublicUrl(filePath);
    return {
        url: urlData.publicUrl,
        path: filePath
    };
};
exports.uploadToStorage = uploadToStorage;
/**
 * Delete a file from Supabase Storage
 */
const deleteFromStorage = async (bucket, filePath) => {
    if (!supabase_1.supabase) {
        throw new Error('Supabase Storage not configured');
    }
    const { error } = await supabase_1.supabase.storage
        .from(bucket)
        .remove([filePath]);
    if (error) {
        console.error('Storage delete error:', error);
        throw error;
    }
};
exports.deleteFromStorage = deleteFromStorage;
/**
 * Create a signed URL for private files
 */
const createSignedUrl = async (bucket, filePath, expiresIn = 60) => {
    if (!supabase_1.supabase) {
        throw new Error('Supabase Storage not configured');
    }
    const { data, error } = await supabase_1.supabase.storage
        .from(bucket)
        .createSignedUrl(filePath, expiresIn);
    if (error)
        throw error;
    return data.signedUrl;
};
exports.createSignedUrl = createSignedUrl;
const getMimeType = (ext) => {
    const mimeTypes = {
        '.jpg': 'image/jpeg',
        '.jpeg': 'image/jpeg',
        '.png': 'image/png',
        '.gif': 'image/gif',
        '.webp': 'image/webp',
        '.svg': 'image/svg+xml',
        '.pdf': 'application/pdf'
    };
    return mimeTypes[ext.toLowerCase()] || 'application/octet-stream';
};
//# sourceMappingURL=storage.js.map