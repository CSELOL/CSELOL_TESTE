import { supabase } from './supabase';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';

export interface UploadResult {
    url: string;
    path: string;
}

/**
 * Upload a file to Supabase Storage
 * @param buffer - File buffer
 * @param originalName - Original filename (for extension)
 * @param bucket - Storage bucket name
 * @param folder - Folder path within bucket (e.g., 'teams', 'tournaments')
 */
export const uploadToStorage = async (
    buffer: Buffer,
    originalName: string,
    bucket: string,
    folder: string
): Promise<UploadResult> => {
    if (!supabase) {
        throw new Error('Supabase Storage not configured. Check SUPABASE_SERVICE_ROLE_KEY');
    }

    const ext = path.extname(originalName);
    const fileName = `${uuidv4()}${ext}`;
    const filePath = `${folder}/${fileName}`;

    const { error } = await supabase.storage
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
    const { data: urlData } = supabase.storage
        .from(bucket)
        .getPublicUrl(filePath);

    return {
        url: urlData.publicUrl,
        path: filePath
    };
};

/**
 * Delete a file from Supabase Storage
 */
export const deleteFromStorage = async (bucket: string, filePath: string): Promise<void> => {
    if (!supabase) {
        throw new Error('Supabase Storage not configured');
    }

    const { error } = await supabase.storage
        .from(bucket)
        .remove([filePath]);

    if (error) {
        console.error('Storage delete error:', error);
        throw error;
    }
};

/**
 * Create a signed URL for private files
 */
export const createSignedUrl = async (bucket: string, filePath: string, expiresIn: number = 60): Promise<string> => {
    if (!supabase) {
        throw new Error('Supabase Storage not configured');
    }

    const { data, error } = await supabase.storage
        .from(bucket)
        .createSignedUrl(filePath, expiresIn);

    if (error) throw error;
    return data.signedUrl;
};

const getMimeType = (ext: string): string => {
    const mimeTypes: Record<string, string> = {
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
