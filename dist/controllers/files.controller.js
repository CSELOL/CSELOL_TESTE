"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadPaymentProof = exports.uploadTournamentAsset = exports.uploadTeamLogo = exports.deleteFile = exports.uploadFile = void 0;
const storage_1 = require("../config/storage");
// Storage bucket names
const BUCKETS = {
    PUBLIC: 'public-assets', // For logos, banners (public access)
    PRIVATE: 'private-assets' // For payment proofs (signed URLs)
};
// POST /api/files/upload
// Body: file (multipart), type ('tournament' | 'team' | 'payment-proof')
const uploadFile = async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
    }
    const type = req.body.type || 'misc';
    try {
        // Determine bucket and folder based on type
        let bucket = BUCKETS.PUBLIC;
        let folder = 'misc';
        switch (type) {
            case 'tournament':
                folder = 'tournaments';
                break;
            case 'team':
                folder = 'teams';
                break;
            case 'payment-proof':
                bucket = BUCKETS.PRIVATE;
                folder = 'payment-proofs';
                break;
        }
        const result = await (0, storage_1.uploadToStorage)(req.file.buffer, req.file.originalname, bucket, folder);
        res.json({
            url: result.url,
            path: result.path,
            bucket
        });
    }
    catch (error) {
        console.error('Upload error:', error);
        res.status(500).json({ error: error.message || 'Upload failed' });
    }
};
exports.uploadFile = uploadFile;
// DELETE /api/files/delete
// Body: { path, bucket }
const deleteFile = async (req, res) => {
    const { path, bucket } = req.body;
    if (!path)
        return res.status(400).json({ error: 'No path provided' });
    try {
        await (0, storage_1.deleteFromStorage)(bucket || BUCKETS.PUBLIC, path);
        res.json({ message: 'File deleted successfully' });
    }
    catch (error) {
        console.error('Delete error:', error);
        res.status(500).json({ error: error.message || 'Deletion failed' });
    }
};
exports.deleteFile = deleteFile;
// POST /api/files/upload-team-logo
// Convenience endpoint for team logo uploads
const uploadTeamLogo = async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
    }
    try {
        const result = await (0, storage_1.uploadToStorage)(req.file.buffer, req.file.originalname, BUCKETS.PUBLIC, 'teams');
        res.json({ url: result.url, path: result.path });
    }
    catch (error) {
        console.error('Team logo upload error:', error);
        res.status(500).json({ error: error.message || 'Upload failed' });
    }
};
exports.uploadTeamLogo = uploadTeamLogo;
// POST /api/files/upload-tournament-asset
// Convenience endpoint for tournament banner/logo uploads
const uploadTournamentAsset = async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
    }
    try {
        const result = await (0, storage_1.uploadToStorage)(req.file.buffer, req.file.originalname, BUCKETS.PUBLIC, 'tournaments');
        res.json({ url: result.url, path: result.path });
    }
    catch (error) {
        console.error('Tournament asset upload error:', error);
        res.status(500).json({ error: error.message || 'Upload failed' });
    }
};
exports.uploadTournamentAsset = uploadTournamentAsset;
// POST /api/files/upload-payment-proof
// For tournament registration payment proofs (private bucket)
const uploadPaymentProof = async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
    }
    try {
        const result = await (0, storage_1.uploadToStorage)(req.file.buffer, req.file.originalname, BUCKETS.PRIVATE, 'payment-proofs');
        // Return just the path (not public URL since it's private)
        res.json({ path: result.path });
    }
    catch (error) {
        console.error('Payment proof upload error:', error);
        res.status(500).json({ error: error.message || 'Upload failed' });
    }
};
exports.uploadPaymentProof = uploadPaymentProof;
//# sourceMappingURL=files.controller.js.map