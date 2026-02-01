import { useState, useEffect } from "react";
import { Container, Row, Col, Alert } from "react-bootstrap";
import { PageHeading } from "widgets";
import FolderSidebar from "sub-components/documentos/FolderSidebar";
import FileViewer from "sub-components/documentos/FileViewer";
import { GoogleDriveFolder, GoogleDriveFile } from "types";
import {
  listFolders,
  listFilesInFolder,
  createFolder,
  renameFolder,
  deleteFolder,
  uploadFile,
  renameFile,
  downloadFile,
  deleteFile,
  openFileInDrive,
} from "services/googleDriveService";
import { useNotifications } from "context/NotificationContext";

const Documentos = () => {
  const { addNotification } = useNotifications();
  const [folders, setFolders] = useState<GoogleDriveFolder[]>([]);
  const [selectedFolder, setSelectedFolder] = useState<GoogleDriveFolder | null>(
    null
  );
  const [files, setFiles] = useState<GoogleDriveFile[]>([]);
  const [isLoadingFolders, setIsLoadingFolders] = useState(false);
  const [isLoadingFiles, setIsLoadingFiles] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load folders on mount
  useEffect(() => {
    loadFolders();
  }, []);

  // Load files when a folder is selected
  useEffect(() => {
    if (selectedFolder) {
      loadFiles(selectedFolder.id);
    } else {
      setFiles([]);
    }
  }, [selectedFolder]);

  const loadFolders = async () => {
    setIsLoadingFolders(true);
    setError(null);
    try {
      const foldersList = await listFolders();
      setFolders(foldersList);
    } catch (error) {
      console.error("Error loading folders:", error);
      setError("Error al cargar las carpetas. Verifica que el backend esté ejecutándose.");
    } finally {
      setIsLoadingFolders(false);
    }
  };

  const loadFiles = async (folderId: string) => {
    setIsLoadingFiles(true);
    setError(null);
    try {
      const filesList = await listFilesInFolder(folderId);
      setFiles(filesList);
    } catch (error) {
      console.error("Error loading files:", error);
      setError("Error al cargar los archivos");
    } finally {
      setIsLoadingFiles(false);
    }
  };

  const handleCreateFolder = async (folderName: string) => {
    try {
      await createFolder(folderName);
      await loadFolders();
      addNotification("documentos", "agregar", `carpeta "${folderName}"`);
    } catch (error) {
      throw error;
    }
  };

  const handleRenameFolder = async (folderId: string, newName: string) => {
    try {
      await renameFolder(folderId, newName);
      await loadFolders();
      addNotification("documentos", "editar", `carpeta renombrada a "${newName}"`);

      if (selectedFolder?.id === folderId) {
        setSelectedFolder({ ...selectedFolder, name: newName });
      }
    } catch (error) {
      throw error;
    }
  };

  const handleDeleteFolder = async (folderId: string) => {
    try {
      const folderName = folders.find((f) => f.id === folderId)?.name || "carpeta";
      await deleteFolder(folderId);
      if (selectedFolder?.id === folderId) {
        setSelectedFolder(null);
      }
      await loadFolders();
      addNotification("documentos", "eliminar", `carpeta "${folderName}"`);
    } catch (error) {
      throw error;
    }
  };

  const handleSelectFolder = (folder: GoogleDriveFolder) => {
    setSelectedFolder(folder);
  };

  const handleUploadFile = async (file: File) => {
    if (!selectedFolder) return;
    try {
      await uploadFile(file, selectedFolder.id);
      await loadFiles(selectedFolder.id);
      await loadFolders();
      addNotification("documentos", "agregar", `archivo "${file.name}"`);
    } catch (error) {
      throw error;
    }
  };

  const handleRenameFile = async (fileId: string, newName: string) => {
    if (!selectedFolder) return;
    try {
      await renameFile(fileId, newName);
      await loadFiles(selectedFolder.id);
      addNotification("documentos", "editar", `archivo renombrado a "${newName}"`);
    } catch (error) {
      throw error;
    }
  };

  const handleDownloadFile = async (fileId: string, fileName: string) => {
    try {
      await downloadFile(fileId, fileName);
    } catch (error) {
      throw error;
    }
  };

  const handleDeleteFile = async (fileId: string) => {
    if (!selectedFolder) return;
    try {
      const fileName = files.find((f) => f.id === fileId)?.name || "archivo";
      await deleteFile(fileId);
      await loadFiles(selectedFolder.id);
      await loadFolders();
      addNotification("documentos", "eliminar", `archivo "${fileName}"`);
    } catch (error) {
      throw error;
    }
  };

  const handleOpenFile = (webViewLink: string) => {
    openFileInDrive(webViewLink);
  };

  return (
    <Container fluid className="p-6">
      <PageHeading heading="Gestión de Documentos" />

      {error && (
        <Alert variant="danger" dismissible onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <Row>
        <Col lg={3} md={4} className="mb-4 mb-lg-0">
          <FolderSidebar
            folders={folders}
            selectedFolder={selectedFolder}
            onSelectFolder={handleSelectFolder}
            onCreateFolder={handleCreateFolder}
            onRenameFolder={handleRenameFolder}
            onDeleteFolder={handleDeleteFolder}
            isLoading={isLoadingFolders}
          />
        </Col>
        <Col lg={9} md={8}>
          <FileViewer
            selectedFolder={selectedFolder}
            files={files}
            onUploadFile={handleUploadFile}
            onRenameFile={handleRenameFile}
            onDownloadFile={handleDownloadFile}
            onDeleteFile={handleDeleteFile}
            onOpenFile={handleOpenFile}
            isLoading={isLoadingFiles}
          />
        </Col>
      </Row>
    </Container>
  );
};

export default Documentos;
