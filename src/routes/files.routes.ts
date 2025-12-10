import { Router } from 'express';
import {
    uploadFile,
    deleteFile,
    uploadTeamLogo,
    uploadTournamentAsset,
    uploadPaymentProof
} from '../controllers/files.controller';
import { jwtAuth, checkRole } from '../middlewares/auth.middleware';
import { imageUpload, documentUpload, genericUpload } from '../config/multer';

const router = Router();

// General file upload (Admin only)
router.post('/upload', jwtAuth, checkRole(['admin']), genericUpload.single('file'), uploadFile);

// Delete file (Admin only)
router.delete('/delete', jwtAuth, checkRole(['admin']), deleteFile);

// Team logo upload (authenticated users)
router.post('/team-logo', jwtAuth, imageUpload.single('file'), uploadTeamLogo);

// Tournament asset upload (Admin only)
router.post('/tournament-asset', jwtAuth, checkRole(['admin']), imageUpload.single('file'), uploadTournamentAsset);

// Payment proof upload (authenticated users)
router.post('/payment-proof', jwtAuth, documentUpload.single('file'), uploadPaymentProof);

export default router;
