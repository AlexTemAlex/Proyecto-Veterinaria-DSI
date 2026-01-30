import { GoogleDriveFile, GoogleDriveFolder, Cita } from "types/index";

// Backend API URL
//const API_BASE_URL = import.meta.env.VITE_API_URL;
const API_BASE_URL = "http://localhost:8000";

/**
 * Make API request
 */
const apiRequest = async <T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> => {
  const res = await fetch(`${API_BASE_URL}${endpoint}`, {
    credentials: "include",
    ...options,
  });

  let data: any = null;

  try {
    data = await res.json();
  } catch (_) {}

  if (!res.ok) {
    throw new Error(data?.error || data?.message || "API error");
  }

  return data as T;
};

/**
 * List all folders in Google Drive
 */
type FoldersResponse = {
  carpetas: GoogleDriveFolder[];
};

export const listFolders = async (): Promise<GoogleDriveFolder[]> => {
  const data = await apiRequest<FoldersResponse>("/api/drive/folders");
  return data.carpetas;
};


/**
 * List files in a specific folder
 */
type FilesResponse = {
  archivos: GoogleDriveFile[];
};

export const listFilesInFolder = async (
  folder_id: string
): Promise<GoogleDriveFile[]> => {
  const data = await apiRequest<FilesResponse>(
    `/api/drive/folders/${folder_id}/files`
  );
  return data.archivos;
};


/**
 * Create a new folder
 */
export const createFolder = (
  folderName: string,
  parentFolderId?: string
): Promise<GoogleDriveFolder> => {
  return apiRequest<GoogleDriveFolder>("/folders", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name: folderName, parentFolderId }),
  });
};

/**
 * Rename a folder
 */
export const renameFolder = (
  folderId: string,
  newName: string
): Promise<GoogleDriveFolder> => {
  return apiRequest<GoogleDriveFolder>(`/folders/${folderId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name: newName }),
  });
};

/**
 * Delete a folder
 */
export const deleteFolder = (folderId: string): Promise<void> => {
  return apiRequest<void>(`/folders/${folderId}`, {
    method: "DELETE",
  });
};

/**
 * Upload a file to Google Drive
 */
export const uploadFile = async (
  file: File,
  folderId?: string
): Promise<GoogleDriveFile> => {
  const formData = new FormData();
  formData.append("file", file);

  if (folderId) {
    formData.append("folderId", folderId);
  }

  return apiRequest<GoogleDriveFile>("/files", {
    method: "POST",
    body: formData,
  });
};

/**
 * Rename a file
 */
export const renameFile = (
  fileId: string,
  newName: string
): Promise<GoogleDriveFile> => {
  return apiRequest<GoogleDriveFile>(`/files/${fileId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name: newName }),
  });
};

/**
 * Delete a file
 */
export const deleteFile = (fileId: string): Promise<void> => {
  return apiRequest<void>(`/files/${fileId}`, {
    method: "DELETE",
  });
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
 * CITAS 
 */
export const getCitas = (limit = 50, offset = 0) =>
  apiRequest<Cita[]>(`/api/citas?limit=${limit}&offset=${offset}`);

export const filterCitas = (fecha?: string, estado?: string) => {
  const params = new URLSearchParams();
  if (fecha) params.append("fecha", fecha);
  if (estado) params.append("estado", estado);

  return apiRequest<Cita[]>(`/api/citas/filtrar?${params.toString()}`);
};

export const getCita = (id: string) =>
  apiRequest<Cita>(`/api/citas/${id}`);

export const getCitasHoy = () =>
  apiRequest<Cita[]>(`/api/citas/hoy`);

/**
 * Chatbot
 */
export const sendChatbot = (mensaje: string) =>
  apiRequest<{ respuesta: string }>("/chatbot", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ mensaje }),
  });


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
export const formatDate = (dateString?: string): string => {
  if (!dateString) return "-";

  const date = new Date(dateString);

  if (isNaN(date.getTime())) return "-";

  return (
    date.toLocaleDateString("es-EC") +
    " " +
    date.toLocaleTimeString("es-EC")
  );
};

