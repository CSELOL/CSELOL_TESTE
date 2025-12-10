import multer from 'multer';

// Use memory storage so we can forward the buffer to Supabase
const memoryStorage = multer.memoryStorage();

// Filter for Images only
const imageFilter = (req: any, file: any, cb: any) => {
    if (file.mimetype.startsWith('image/')) {
        cb(null, true);
    } else {
        cb(new Error('Only images are allowed'), false);
    }
};

// Filter for Images and PDFs (for payment proofs)
const documentFilter = (req: any, file: any, cb: any) => {
    if (file.mimetype.startsWith('image/') || file.mimetype === 'application/pdf') {
        cb(null, true);
    } else {
        cb(new Error('Only images and PDFs are allowed'), false);
    }
};

// For image uploads (logos, banners)
export const imageUpload = multer({
    storage: memoryStorage,
    fileFilter: imageFilter,
    limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

// For document uploads (payment proofs)
export const documentUpload = multer({
    storage: memoryStorage,
    fileFilter: documentFilter,
    limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

// Generic upload (any file type)
export const genericUpload = multer({
    storage: memoryStorage,
    limits: { fileSize: 10 * 1024 * 1024 }
});

// Keep old export for backward compatibility
export const localUpload = imageUpload;
