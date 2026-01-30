import { Router } from 'express';
import * as googleDriveController from '../controllers/googleDriveController';

const router = Router();

// Folder routes
router.get('/folders', googleDriveController.listFolders);
router.post('/folders', googleDriveController.createFolder);
router.patch('/folders/:folderId', googleDriveController.renameFolder);
router.delete('/folders/:folderId', googleDriveController.deleteFolder);

// File routes
router.get('/folders/:folderId/files', googleDriveController.listFiles);
router.post('/files', googleDriveController.uploadFile);
router.patch('/files/:fileId', googleDriveController.renameFile);
router.get('/files/:fileId/download', googleDriveController.downloadFile);
router.delete('/files/:fileId', googleDriveController.deleteFile);

export default router;
