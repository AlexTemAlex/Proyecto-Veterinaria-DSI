// Google Drive Types
export interface GoogleDriveFolder {
  id: string;
  name: string;
  mimeType: string;
  createdTime: string;
  modifiedTime: string;
  fileCount?: number;
}

export interface GoogleDriveFile {
  id: string;
  name: string;
  mimeType: string;
  size?: string;
  createdTime: string;
  modifiedTime: string;
  webViewLink?: string;
  webContentLink?: string;
  thumbnailLink?: string;
  iconLink?: string;
}

// Inventario (Google Sheets)
export interface Producto {
  codigo: string;
  producto: string;
  categoria: string;
  subcategoria: string;
  presentacion: string;
  stock: number;
}

export interface GoogleAuthTokens {
  access_token: string;
  refresh_token?: string;
  scope: string;
  token_type: string;
  expiry_date?: number;
}

export interface Cita {
  
}