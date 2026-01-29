import { GoogleDriveFile, GoogleDriveFolder } from "types";

// Backend API URL
const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3001/api/google-drive";

/**
 * Make API request
 */
const apiRequest = async (
  endpoint: string,
  options: RequestInit = {}
): Promise<Response> => {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, options);
  return response;
};

/**
 * List all folders in Google Drive
 */
export const listFolders = async (): Promise<GoogleDriveFolder[]> => {
  try {
    const response = await apiRequest("/folders");

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to list folders");
    }

    return await response.json();
  } catch (error) {
    console.error("Error listing folders:", error);
    throw error;
  }
};

/**
 * List files in a specific folder
 */
export const listFilesInFolder = async (
  folderId: string
): Promise<GoogleDriveFile[]> => {
  try {
    const response = await apiRequest(`/folders/${folderId}/files`);

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to list files");
    }

    return await response.json();
  } catch (error) {
    console.error("Error listing files:", error);
    throw error;
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
    const response = await apiRequest("/folders", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: folderName,
        parentFolderId,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to create folder");
    }

    return await response.json();
  } catch (error) {
    console.error("Error creating folder:", error);
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
    const response = await apiRequest(`/folders/${folderId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: newName,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to rename folder");
    }

    return await response.json();
  } catch (error) {
    console.error("Error renaming folder:", error);
    throw error;
  }
};

/**
 * Delete a folder
 */
export const deleteFolder = async (folderId: string): Promise<void> => {
  try {
    const response = await apiRequest(`/folders/${folderId}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to delete folder");
    }
  } catch (error) {
    console.error("Error deleting folder:", error);
    throw error;
  }
};

/**
 * Upload a file to Google Drive
 */
export const uploadFile = async (
  file: File,
  folderId?: string
): Promise<GoogleDriveFile> => {
  try {
    const formData = new FormData();
    formData.append("file", file);
    if (folderId) {
      formData.append("folderId", folderId);
    }

    const response = await fetch(`${API_BASE_URL}/files`, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to upload file");
    }

    return await response.json();
  } catch (error) {
    console.error("Error uploading file:", error);
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
    const response = await apiRequest(`/files/${fileId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: newName,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to rename file");
    }

    return await response.json();
  } catch (error) {
    console.error("Error renaming file:", error);
    throw error;
  }
};

/**
 * Delete a file
 */
export const deleteFile = async (fileId: string): Promise<void> => {
  try {
    const response = await apiRequest(`/files/${fileId}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to delete file");
    }
  } catch (error) {
    console.error("Error deleting file:", error);
    throw error;
  }
};

/**
 * Download a file
 */
export const downloadFile = async (
  fileId: string,
  fileName: string
): Promise<void> => {
  try {
    const response = await fetch(`${API_BASE_URL}/files/${fileId}/download`);

    if (!response.ok) {
      throw new Error("Failed to download file");
    }

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);

    // Create a temporary link and trigger download
    const link = document.createElement("a");
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error("Error downloading file:", error);
    throw error;
  }
};

/**
 * Open a file in Google Drive (in a new tab)
 */
export const openFileInDrive = (webViewLink: string): void => {
  window.open(webViewLink, "_blank");
};

/**
 * Format file size
 */
export const formatFileSize = (bytes: string | undefined): string => {
  if (!bytes) return "N/A";
  const size = parseInt(bytes);
  if (size < 1024) return size + " B";
  if (size < 1024 * 1024) return (size / 1024).toFixed(2) + " KB";
  if (size < 1024 * 1024 * 1024)
    return (size / (1024 * 1024)).toFixed(2) + " MB";
  return (size / (1024 * 1024 * 1024)).toFixed(2) + " GB";
};

/**
 * Format date
 */
export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString() + " " + date.toLocaleTimeString();
};
