import { useState, useRef } from "react";
import {
  Card,
  Table,
  Button,
  Spinner,
  Modal,
  Form,
  Badge,
} from "react-bootstrap";
import {
  Upload,
  Download,
  Trash2,
  ExternalLink,
  File,
  Image as ImageIcon,
  FileText,
  Film,
  Edit2,
} from "react-feather";
import { GoogleDriveFile, GoogleDriveFolder } from "types";
import { formatFileSize, formatDate } from "services/googleDriveService";

interface FileViewerProps {
  selectedFolder: GoogleDriveFolder | null;
  files: GoogleDriveFile[];
  onUploadFile: (file: File) => Promise<void>;
  onRenameFile: (fileId: string, newName: string) => Promise<void>;
  onDownloadFile: (fileId: string, fileName: string) => Promise<void>;
  onDeleteFile: (fileId: string) => Promise<void>;
  onOpenFile: (webViewLink: string) => void;
  isLoading: boolean;
}

const FileViewer = ({
  selectedFolder,
  files,
  onUploadFile,
  onRenameFile,
  onDownloadFile,
  onDeleteFile,
  onOpenFile,
  isLoading,
}: FileViewerProps) => {
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showRenameModal, setShowRenameModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [renameValue, setRenameValue] = useState("");
  const [fileToRename, setFileToRename] = useState<GoogleDriveFile | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isRenaming, setIsRenaming] = useState(false);
  const [fileToDelete, setFileToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setIsUploading(true);
    try {
      await onUploadFile(selectedFile);
      setSelectedFile(null);
      setShowUploadModal(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (error) {
      console.error("Error uploading file:", error);
      alert("Error al subir el archivo");
    } finally {
      setIsUploading(false);
    }
  };

  const handleOpenRenameModal = (file: GoogleDriveFile) => {
    setFileToRename(file);
    setRenameValue(file.name);
    setShowRenameModal(true);
  };

  const handleRename = async () => {
    if (!fileToRename || !renameValue.trim()) return;

    setIsRenaming(true);
    try {
      await onRenameFile(fileToRename.id, renameValue);
      setShowRenameModal(false);
      setFileToRename(null);
      setRenameValue("");
    } catch (error) {
      console.error("Error renaming file:", error);
      alert("Error al renombrar el archivo");
    } finally {
      setIsRenaming(false);
    }
  };

  const handleDelete = async (fileId: string) => {
    setIsDeleting(true);
    try {
      await onDeleteFile(fileId);
      setFileToDelete(null);
    } catch (error) {
      console.error("Error deleting file:", error);
      alert("Error al eliminar el archivo");
    } finally {
      setIsDeleting(false);
    }
  };

  const getFileIcon = (mimeType: string) => {
    if (mimeType.startsWith("image/")) {
      return <ImageIcon size={18} className="me-2" />;
    } else if (mimeType.startsWith("video/")) {
      return <Film size={18} className="me-2" />;
    } else if (
      mimeType.includes("document") ||
      mimeType.includes("text") ||
      mimeType.includes("pdf")
    ) {
      return <FileText size={18} className="me-2" />;
    }
    return <File size={18} className="me-2" />;
  };

  const getMimeTypeBadge = (mimeType: string) => {
    const type = mimeType.split("/")[1] || mimeType;
    const shortType = type.split(".").pop()?.toUpperCase() || "FILE";
    return (
      <Badge bg="info" style={{ fontSize: "0.7rem" }}>
        {shortType}
      </Badge>
    );
  };

  return (
    <>
      <Card className="h-100">
        <Card.Header className="d-flex justify-content-between align-items-center">
          <div>
            <h5 className="mb-0">
              {selectedFolder ? selectedFolder.name : "Selecciona una carpeta"}
            </h5>
            {files.length > 0 && (
              <small className="text-muted">{files.length} archivo(s)</small>
            )}
          </div>
          <Button
            variant="primary"
            size="sm"
            onClick={() => setShowUploadModal(true)}
            disabled={!selectedFolder || isLoading}
          >
            <Upload size={16} className="me-1" />
            Subir
          </Button>
        </Card.Header>
        <Card.Body className="p-0" style={{ maxHeight: "70vh", overflowY: "auto" }}>
          {!selectedFolder ? (
            <div className="text-center p-5 text-muted">
              <File size={64} className="mb-3 opacity-50" />
              <p>Selecciona una carpeta para ver sus archivos</p>
            </div>
          ) : isLoading ? (
            <div className="text-center p-5">
              <Spinner animation="border" />
              <p className="mt-3 mb-0">Cargando archivos...</p>
            </div>
          ) : files.length === 0 ? (
            <div className="text-center p-5 text-muted">
              <File size={64} className="mb-3 opacity-50" />
              <p>Esta carpeta está vacía</p>
              <Button
                variant="outline-primary"
                size="sm"
                onClick={() => setShowUploadModal(true)}
              >
                <Upload size={16} className="me-1" />
                Subir archivo
              </Button>
            </div>
          ) : (
            <Table hover responsive className="mb-0">
              <thead className="bg-light">
                <tr>
                  <th>Nombre</th>
                  <th>Tipo</th>
                  <th>Tamaño</th>
                  <th>Modificado</th>
                  <th className="text-end">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {files.map((file) => (
                  <tr key={file.id}>
                    <td className="align-middle">
                      <div className="d-flex align-items-center">
                        {file.thumbnailLink ? (
                          <img
                            src={file.thumbnailLink}
                            alt={file.name}
                            style={{
                              width: "32px",
                              height: "32px",
                              objectFit: "cover",
                              marginRight: "8px",
                              borderRadius: "4px",
                            }}
                          />
                        ) : (
                          getFileIcon(file.mimeType)
                        )}
                        <span className="text-truncate" style={{ maxWidth: "300px" }}>
                          {file.name}
                        </span>
                      </div>
                    </td>
                    <td className="align-middle">
                      {getMimeTypeBadge(file.mimeType)}
                    </td>
                    <td className="align-middle">{formatFileSize(file.size)}</td>
                    <td className="align-middle">
                      <small>{formatDate(file.createdTime)}</small>
                    </td>
                    <td className="align-middle text-end">
                      <div className="d-flex justify-content-end gap-2">
                        {file.webViewLink && (
                          <Button
                            variant="outline-primary"
                            size="sm"
                            onClick={() => onOpenFile(file.webViewLink!)}
                            title="Abrir en Google Drive"
                          >
                            <ExternalLink size={16} />
                          </Button>
                        )}
                        <Button
                          variant="outline-info"
                          size="sm"
                          onClick={() => handleOpenRenameModal(file)}
                          title="Renombrar"
                        >
                          <Edit2 size={16} />
                        </Button>
                        <Button
                          variant="outline-success"
                          size="sm"
                          onClick={() => onDownloadFile(file.id, file.name)}
                          title="Descargar"
                        >
                          <Download size={16} />
                        </Button>
                        <Button
                          variant="outline-danger"
                          size="sm"
                          onClick={() => setFileToDelete(file.id)}
                          title="Eliminar"
                        >
                          <Trash2 size={16} />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </Card.Body>
      </Card>

      {/* Upload File Modal */}
      <Modal show={showUploadModal} onHide={() => setShowUploadModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Subir Archivo</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group>
              <Form.Label>Selecciona un archivo</Form.Label>
              <Form.Control
                ref={fileInputRef}
                type="file"
                onChange={handleFileSelect}
              />
              {selectedFile && (
                <div className="mt-3 p-3 bg-light rounded">
                  <strong>Archivo seleccionado:</strong>
                  <br />
                  <File size={16} className="me-2" />
                  {selectedFile.name} ({(selectedFile.size / 1024).toFixed(2)}{" "}
                  KB)
                </div>
              )}
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => {
              setShowUploadModal(false);
              setSelectedFile(null);
              if (fileInputRef.current) {
                fileInputRef.current.value = "";
              }
            }}
            disabled={isUploading}
          >
            Cancelar
          </Button>
          <Button
            variant="primary"
            onClick={handleUpload}
            disabled={!selectedFile || isUploading}
          >
            {isUploading ? (
              <>
                <Spinner
                  as="span"
                  animation="border"
                  size="sm"
                  className="me-2"
                />
                Subiendo...
              </>
            ) : (
              <>
                <Upload size={16} className="me-1" />
                Subir
              </>
            )}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Rename File Modal */}
      <Modal show={showRenameModal} onHide={() => setShowRenameModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Renombrar Archivo</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group>
              <Form.Label>Nuevo nombre</Form.Label>
              <Form.Control
                type="text"
                placeholder="Ingrese el nuevo nombre"
                value={renameValue}
                onChange={(e) => setRenameValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleRename();
                  }
                }}
                autoFocus
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => setShowRenameModal(false)}
            disabled={isRenaming}
          >
            Cancelar
          </Button>
          <Button
            variant="primary"
            onClick={handleRename}
            disabled={!renameValue.trim() || isRenaming}
          >
            {isRenaming ? (
              <>
                <Spinner
                  as="span"
                  animation="border"
                  size="sm"
                  className="me-2"
                />
                Renombrando...
              </>
            ) : (
              "Renombrar"
            )}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Delete File Confirmation Modal */}
      <Modal show={fileToDelete !== null} onHide={() => setFileToDelete(null)}>
        <Modal.Header closeButton>
          <Modal.Title>Confirmar Eliminación</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          ¿Estás seguro de que deseas eliminar este archivo? Esta acción no se
          puede deshacer.
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => setFileToDelete(null)}
            disabled={isDeleting}
          >
            Cancelar
          </Button>
          <Button
            variant="danger"
            onClick={() => fileToDelete && handleDelete(fileToDelete)}
            disabled={isDeleting}
          >
            {isDeleting ? (
              <>
                <Spinner
                  as="span"
                  animation="border"
                  size="sm"
                  className="me-2"
                />
                Eliminando...
              </>
            ) : (
              "Eliminar"
            )}
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default FileViewer;
