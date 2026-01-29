import { google } from 'googleapis';
import { GoogleDriveFolder, GoogleDriveFile } from '../types';
import path from 'path';

// Path to service account key file
const SERVICE_ACCOUNT_KEY_FILE = process.env.GOOGLE_SERVICE_ACCOUNT_KEY_FILE ||
  path.join(__dirname, '../../service-account-key.json');

// Create auth client using Service Account
const auth = new google.auth.GoogleAuth({
  keyFile: SERVICE_ACCOUNT_KEY_FILE,
  scopes: ['https://www.googleapis.com/auth/drive'],
});

// Google Drive API instance
const drive = google.drive({ version: 'v3', auth });

/**
 * List all folders in Google Drive
 */
export const listFolders = async (): Promise<GoogleDriveFolder[]> => {
  try {
    const response = await drive.files.list({
      q: "mimeType='application/vnd.google-apps.folder' and trashed=false",
      fields: 'files(id, name, mimeType, createdTime, modifiedTime)',
      orderBy: 'name',
      pageSize: 1000,
    });

    return (response.data.files || []) as GoogleDriveFolder[];
  } catch (error) {
    console.error('Error listing folders:', error);
    throw error;
  }
};

/**
 * List files in a specific folder
 */
export const listFilesInFolder = async (folderId: string): Promise<GoogleDriveFile[]> => {
  try {
    const response = await drive.files.list({
      q: `'${folderId}' in parents and trashed=false and mimeType!='application/vnd.google-apps.folder'`,
      fields:
        'files(id, name, mimeType, size, createdTime, modifiedTime, webViewLink, webContentLink, thumbnailLink, iconLink)',
      orderBy: 'name',
      pageSize: 1000,
    });

    return (response.data.files || []) as GoogleDriveFile[];
  } catch (error) {
    console.error('Error listing files:', error);
    throw error;
  }
};

/**
 * Get file count for a folder
 */
export const getFileCount = async (folderId: string): Promise<number> => {
  try {
    const files = await listFilesInFolder(folderId);
    return files.length;
  } catch (error) {
    return 0;
  }
};

/**
 * Create a new folder
 */
export const createFolder = async (
  folderName: string,
  parentFolderId?: string
): Promise<GoogleDriveFolder> => {
  try {
    const fileMetadata: any = {
      name: folderName,
      mimeType: 'application/vnd.google-apps.folder',
    };

    if (parentFolderId) {
      fileMetadata.parents = [parentFolderId];
    }

    const response = await drive.files.create({
      requestBody: fileMetadata,
      fields: 'id, name, mimeType, createdTime, modifiedTime',
    });

    return response.data as GoogleDriveFolder;
  } catch (error) {
    console.error('Error creating folder:', error);
    throw error;
  }
};

/**
 * Rename a folder
 */
export const renameFolder = async (
  folderId: string,
  newName: string
): Promise<GoogleDriveFolder> => {
  try {
    const response = await drive.files.update({
      fileId: folderId,
      requestBody: {
        name: newName,
      },
      fields: 'id, name, mimeType, createdTime, modifiedTime',
    });

    return response.data as GoogleDriveFolder;
  } catch (error) {
    console.error('Error renaming folder:', error);
    throw error;
  }
};

/**
 * Delete a folder or file
 */
export const deleteItem = async (itemId: string): Promise<void> => {
  try {
    await drive.files.delete({
      fileId: itemId,
    });
  } catch (error) {
    console.error('Error deleting item:', error);
    throw error;
  }
};

/**
 * Upload a file to Google Drive
 */
export const uploadFile = async (
  fileBuffer: Buffer,
  fileName: string,
  mimeType: string,
  folderId?: string
): Promise<GoogleDriveFile> => {
  try {
    const fileMetadata: any = {
      name: fileName,
    };

    if (folderId) {
      fileMetadata.parents = [folderId];
    }

    const media = {
      mimeType: mimeType,
      body: require('stream').Readable.from(fileBuffer),
    };

    const response = await drive.files.create({
      requestBody: fileMetadata,
      media: media,
      fields: 'id, name, mimeType, size, createdTime, modifiedTime, webViewLink, webContentLink, thumbnailLink, iconLink',
    });

    return response.data as GoogleDriveFile;
  } catch (error) {
    console.error('Error uploading file:', error);
    throw error;
  }
};

/**
 * Rename a file
 */
export const renameFile = async (
  fileId: string,
  newName: string
): Promise<GoogleDriveFile> => {
  try {
    const response = await drive.files.update({
      fileId: fileId,
      requestBody: {
        name: newName,
      },
      fields: 'id, name, mimeType, size, createdTime, modifiedTime, webViewLink, webContentLink, thumbnailLink, iconLink',
    });

    return response.data as GoogleDriveFile;
  } catch (error) {
    console.error('Error renaming file:', error);
    throw error;
  }
};

/**
 * Download a file from Google Drive
 */
export const downloadFile = async (fileId: string): Promise<Buffer> => {
  try {
    const response = await drive.files.get(
      { fileId: fileId, alt: 'media' },
      { responseType: 'arraybuffer' }
    );

    return Buffer.from(response.data as ArrayBuffer);
  } catch (error) {
    console.error('Error downloading file:', error);
    throw error;
  }
};

/**
 * Get file metadata
 */
export const getFileMetadata = async (fileId: string): Promise<GoogleDriveFile> => {
  try {
    const response = await drive.files.get({
      fileId: fileId,
      fields: 'id, name, mimeType, size, createdTime, modifiedTime, webViewLink, webContentLink, thumbnailLink, iconLink',
    });

    return response.data as GoogleDriveFile;
  } catch (error) {
    console.error('Error getting file metadata:', error);
    throw error;
  }
};
