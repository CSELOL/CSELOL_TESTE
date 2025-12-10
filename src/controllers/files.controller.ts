import { Request, Response } from 'express';
import { uploadToStorage, deleteFromStorage } from '../config/storage';

// Storage bucket names
const BUCKETS = {
    PUBLIC: 'public-assets',      // For logos, banners (public access)
    PRIVATE: 'private-assets'     // For payment proofs (signed URLs)
};

// POST /api/files/upload
// Body: file (multipart), type ('tournament' | 'team' | 'payment-proof')
export const uploadFile = async (req: Request, res: Response) => {
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

        const result = await uploadToStorage(
            req.file.buffer,
            req.file.originalname,
            bucket,
            folder
        );

        res.json({
            url: result.url,
            path: result.path,
            bucket
        });
    } catch (error: any) {
        console.error('Upload error:', error);
        res.status(500).json({ error: error.message || 'Upload failed' });
    }
};

// DELETE /api/files/delete
// Body: { path, bucket }
export const deleteFile = async (req: Request, res: Response) => {
    const { path, bucket } = req.body;

    if (!path) return res.status(400).json({ error: 'No path provided' });

    try {
        await deleteFromStorage(bucket || BUCKETS.PUBLIC, path);
        res.json({ message: 'File deleted successfully' });
    } catch (error: any) {
        console.error('Delete error:', error);
        res.status(500).json({ error: error.message || 'Deletion failed' });
    }
};

// POST /api/files/upload-team-logo
// Convenience endpoint for team logo uploads
export const uploadTeamLogo = async (req: Request, res: Response) => {
    if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
    }

    try {
        const result = await uploadToStorage(
            req.file.buffer,
            req.file.originalname,
            BUCKETS.PUBLIC,
            'teams'
        );

        res.json({ url: result.url, path: result.path });
    } catch (error: any) {
        console.error('Team logo upload error:', error);
        res.status(500).json({ error: error.message || 'Upload failed' });
    }
};

// POST /api/files/upload-tournament-asset
// Convenience endpoint for tournament banner/logo uploads
export const uploadTournamentAsset = async (req: Request, res: Response) => {
    if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
    }

    try {
        const result = await uploadToStorage(
            req.file.buffer,
            req.file.originalname,
            BUCKETS.PUBLIC,
            'tournaments'
        );

        res.json({ url: result.url, path: result.path });
    } catch (error: any) {
        console.error('Tournament asset upload error:', error);
        res.status(500).json({ error: error.message || 'Upload failed' });
    }
};

// POST /api/files/upload-payment-proof
// For tournament registration payment proofs (private bucket)
export const uploadPaymentProof = async (req: Request, res: Response) => {
    if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
    }

    try {
        const result = await uploadToStorage(
            req.file.buffer,
            req.file.originalname,
            BUCKETS.PRIVATE,
            'payment-proofs'
        );

        // Return just the path (not public URL since it's private)
        res.json({ path: result.path });
    } catch (error: any) {
        console.error('Payment proof upload error:', error);
        res.status(500).json({ error: error.message || 'Upload failed' });
    }
};
