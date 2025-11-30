import { Router } from 'express';
import { uploadFile, deleteFile } from '../controllers/files.controller';
import { jwtAuth, checkRole } from '../middlewares/auth.middleware';
import { localUpload } from '../config/multer';

const router = Router();

// PROTECTED: Only Admins can upload/delete tournament assets
router.post('/upload', jwtAuth, checkRole(['admin']), localUpload.single('file'), uploadFile);
router.delete('/delete', jwtAuth, checkRole(['admin']), deleteFile);

export default router;
