import { Request, Response } from 'express';
import * as googleDriveService from '../services/googleDriveService';

/**
 * List folders
 */
export const listFolders = async (req: Request, res: Response): Promise<void> => {
  try {
    const folders = await googleDriveService.listFolders();

    // Get file count for each folder
    const foldersWithCount = await Promise.all(
      folders.map(async (folder) => {
        const fileCount = await googleDriveService.getFileCount(folder.id);
        return { ...folder, fileCount };
      })
    );

    res.json(foldersWithCount);
  } catch (error) {
    console.error('Error listing folders:', error);
    res.status(500).json({ error: 'Failed to list folders' });
  }
};

/**
 * List files in a folder
 */
export const listFiles = async (req: Request, res: Response): Promise<void> => {
  try {
    const { folderId } = req.params;

    if (!folderId) {
      res.status(400).json({ error: 'Folder ID is required' });
      return;
    }

    const files = await googleDriveService.listFilesInFolder(folderId);
    res.json(files);
  } catch (error) {
    console.error('Error listing files:', error);
    res.status(500).json({ error: 'Failed to list files' });
  }
};

/**
 * Create a folder
 */
export const createFolder = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, parentFolderId } = req.body;

    if (!name) {
      res.status(400).json({ error: 'Folder name is required' });
      return;
    }

    const folder = await googleDriveService.createFolder(name, parentFolderId);
    res.json(folder);
  } catch (error) {
    console.error('Error creating folder:', error);
    res.status(500).json({ error: 'Failed to create folder' });
  }
};

/**
 * Rename a folder
 */
export const renameFolder = async (req: Request, res: Response): Promise<void> => {
  try {
    const { folderId } = req.params;
    const { name } = req.body;

    if (!folderId) {
      res.status(400).json({ error: 'Folder ID is required' });
      return;
    }

    if (!name) {
      res.status(400).json({ error: 'New folder name is required' });
      return;
    }

    const folder = await googleDriveService.renameFolder(folderId, name);
    res.json(folder);
  } catch (error) {
    console.error('Error renaming folder:', error);
    res.status(500).json({ error: 'Failed to rename folder' });
  }
};

/**
 * Delete a folder
 */
export const deleteFolder = async (req: Request, res: Response): Promise<void> => {
  try {
    const { folderId } = req.params;

    if (!folderId) {
      res.status(400).json({ error: 'Folder ID is required' });
      return;
    }

    await googleDriveService.deleteItem(folderId);
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting folder:', error);
    res.status(500).json({ error: 'Failed to delete folder' });
  }
};

/**
 * Upload a file
 */
export const uploadFile = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.files || !req.files.file) {
      res.status(400).json({ error: 'No file uploaded' });
      return;
    }

    const file = Array.isArray(req.files.file) ? req.files.file[0] : req.files.file;
    const { folderId } = req.body;

    const uploadedFile = await googleDriveService.uploadFile(
      file.data,
      file.name,
      file.mimetype,
      folderId
    );

    res.json(uploadedFile);
  } catch (error) {
    console.error('Error uploading file:', error);
    res.status(500).json({ error: 'Failed to upload file' });
  }
};

/**
 * Rename a file
 */
export const renameFile = async (req: Request, res: Response): Promise<void> => {
  try {
    const { fileId } = req.params;
    const { name } = req.body;

    if (!fileId) {
      res.status(400).json({ error: 'File ID is required' });
      return;
    }

    if (!name) {
      res.status(400).json({ error: 'New file name is required' });
      return;
    }

    const file = await googleDriveService.renameFile(fileId, name);
    res.json(file);
  } catch (error) {
    console.error('Error renaming file:', error);
    res.status(500).json({ error: 'Failed to rename file' });
  }
};

/**
 * Download a file
 */
export const downloadFile = async (req: Request, res: Response): Promise<void> => {
  try {
    const { fileId } = req.params;

    if (!fileId) {
      res.status(400).json({ error: 'File ID is required' });
      return;
    }

    // Get file metadata first
    const metadata = await googleDriveService.getFileMetadata(fileId);

    // Download file
    const fileBuffer = await googleDriveService.downloadFile(fileId);

    res.setHeader('Content-Type', metadata.mimeType);
    res.setHeader('Content-Disposition', `attachment; filename="${metadata.name}"`);
    res.send(fileBuffer);
  } catch (error) {
    console.error('Error downloading file:', error);
    res.status(500).json({ error: 'Failed to download file' });
  }
};

/**
 * Delete a file
 */
export const deleteFile = async (req: Request, res: Response): Promise<void> => {
  try {
    const { fileId } = req.params;

    if (!fileId) {
      res.status(400).json({ error: 'File ID is required' });
      return;
    }

    await googleDriveService.deleteItem(fileId);
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting file:', error);
    res.status(500).json({ error: 'Failed to delete file' });
  }
};
