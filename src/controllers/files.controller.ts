import { Request, Response } from 'express';
import fs from 'fs';
import path from 'path';

// POST /api/files/upload
export const uploadFile = (req: Request, res: Response) => {
    if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
    }

    // Construct the Public URL
    // Assuming your server runs on localhost:3333
    // The path will be relative to the public folder
    const filePath = req.file.path.replace(/\\/g, '/'); // Fix Windows slashes
    const publicUrl = `${req.protocol}://${req.get('host')}/${filePath.replace('public/', '')}`;

    res.json({ url: publicUrl, filePath: filePath });
};

// DELETE /api/files/delete (Admin Only)
export const deleteFile = (req: Request, res: Response) => {
    const { fileUrl } = req.body;

    if (!fileUrl) return res.status(400).json({ error: 'No URL provided' });

    try {
        // Convert URL back to file path
        // Example: http://localhost:3333/uploads/tournaments/abc.jpg -> public/uploads/tournaments/abc.jpg
        const relativePath = fileUrl.split('/').slice(3).join('/'); // Remove protocol/host
        // Note: This splitting depends on the URL structure. 
        // If url is http://localhost:3333/uploads/..., split('/') gives:
        // [0] http:
        // [1] 
        // [2] localhost:3333
        // [3] uploads
        // ...

        // However, we need to be careful if the host has slashes or different ports.
        // A safer way might be to just look for 'uploads/' index.

        const uploadsIndex = fileUrl.indexOf('uploads/');
        if (uploadsIndex === -1) {
            return res.status(400).json({ error: 'Invalid file URL' });
        }

        const pathAfterUploads = fileUrl.substring(uploadsIndex);
        const fullPath = path.join(process.cwd(), 'public', pathAfterUploads);

        if (fs.existsSync(fullPath)) {
            fs.unlinkSync(fullPath);
            res.json({ message: 'File deleted' });
        } else {
            res.status(404).json({ error: 'File not found' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Deletion failed' });
    }
};
