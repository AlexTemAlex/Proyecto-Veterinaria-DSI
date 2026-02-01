import { GoogleDriveFile, GoogleDriveFolder, Cita } from "types/index";

// Backend API URL
const API_BASE_URL = "/api";

/** Make API request */
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
/** ========================
 * DRIVE
 * ======================== */
/** List all folders */
export const listFolders = async (): Promise<GoogleDriveFolder[]> => {
  const data = await apiRequest<{ carpetas: GoogleDriveFolder[] }>("/drive/folders");
  return data.carpetas;
};

/** List files in a specific folder */
export const listFilesInFolder = async (
  folderId: string
): Promise<GoogleDriveFile[]> => {
  const data = await apiRequest<{ archivos: GoogleDriveFile[] }>(
    `/drive/folders/${folderId}/files`
  );
  return data.archivos;
};

/** Create a new folder */
export const createFolder = async (folderName: string): Promise<GoogleDriveFolder> => {
  return apiRequest<GoogleDriveFolder>("/drive/folders", {
    method: "POST",
    body: new URLSearchParams({ name: folderName }),
  });
};

/** Rename a folder */
export const renameFolder = async (
  folderId: string,
  newName: string
): Promise<GoogleDriveFolder> => {
  return apiRequest<GoogleDriveFolder>("/drive/folder/rename", {
    method: "PUT",
    body: new URLSearchParams({ folder_id: folderId, new_name: newName }),
  });
};

/** Delete a folder */
export const deleteFolder = async (folderId: string): Promise<void> => {
  return apiRequest<void>(`/drive/folder?folder_id=${folderId}`, {
    method: "DELETE",
  });
};

/** Upload a file to a folder */
export const uploadFile = async (
  file: File,
  folderId: string
): Promise<GoogleDriveFile> => {
  const MAX_SIZE = 100 * 1024 * 1024; // 100 MB
  if (file.size > MAX_SIZE) {
    throw new Error("El archivo supera el límite de 100 MB");
  }

  // Creamos FormData para enviar archivo y otros datos
  const formData = new FormData();
  formData.append("file", file);       // campo que n8n espera: "file"
  formData.append("folder_id", folderId);

  // Llamamos a la API usando apiRequest
  // apiRequest detectará que es FormData y no agregará JSON headers
  return apiRequest<GoogleDriveFile>("/drive/files/upload", {
    method: "POST",
    body: formData,
  });
};

/** Rename a file */
export const renameFile = async (
  fileId: string,
  newName: string
): Promise<GoogleDriveFile> => {
  return apiRequest<GoogleDriveFile>("/drive/file/rename", {
    method: "PUT",
    body: new URLSearchParams({ file_id: fileId, new_name: newName }),
  });
};

/** Delete a file */
export const deleteFile = async (fileId: string): Promise<void> => {
  return apiRequest<void>(`/drive/file?file_id=${fileId}`, {
    method: "DELETE",
  });
};

/** Download a file */
export const downloadFile = async (fileId: string): Promise<void> => {
  try {
    const response = await fetch(`${API_BASE_URL}/drive/file/download?file_id=${fileId}`);
    if (!response.ok) {
      throw new Error("Failed to get download link");
    }

    const data = await response.json();
    const downloadUrl = data.webContentLink;
    if (!downloadUrl) {
      throw new Error("Download link not found in response");
    }

    // Abrimos el link en una nueva pestaña para disparar la descarga
    window.open(downloadUrl, "_blank");
  } catch (error) {
    console.error("Error downloading file:", error);
    throw error;
  }
};

/** Open a file in Google Drive (in a new tab) */
export const openFileInDrive = (webViewLink: string): void => {
  window.open(webViewLink, "_blank");
};

/** CITAS  */
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

/** Chatbot */
export const sendChatbot = (mensaje: string) =>
  apiRequest<{ respuesta: string }>("/chatbot", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ mensaje }),
  });


/** Format file size */
export const formatFileSize = (bytes: string | undefined): string => {
  if (!bytes) return "N/A";
  const size = parseInt(bytes);
  if (size < 1024) return size + " B";
  if (size < 1024 * 1024) return (size / 1024).toFixed(2) + " KB";
  if (size < 1024 * 1024 * 1024)
    return (size / (1024 * 1024)).toFixed(2) + " MB";
  return (size / (1024 * 1024 * 1024)).toFixed(2) + " GB";
};

/** Format date */
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

export const checkHealth = async (): Promise<boolean> => {
  try {
    const res = await fetch("/api/health");
    const data = await res.json();
    return data.status === "OK";
  } catch {
    return false;
  }
};
