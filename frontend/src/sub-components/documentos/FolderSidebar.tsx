import { useState } from "react";
import {
  Card,
  ListGroup,
  Button,
  Form,
  Modal,
  Spinner,
  Badge,
} from "react-bootstrap";
import { Folder, Plus, Trash2, Edit2 } from "react-feather";
import { GoogleDriveFolder } from "types";

interface FolderSidebarProps {
  folders: GoogleDriveFolder[];
  selectedFolder: GoogleDriveFolder | null;
  onSelectFolder: (folder: GoogleDriveFolder) => void;
  onCreateFolder: (folderName: string) => Promise<void>;
  onRenameFolder: (folderId: string, newName: string) => Promise<void>;
  onDeleteFolder: (folderId: string) => Promise<void>;
  isLoading: boolean;
}

const FolderSidebar = ({
  folders,
  selectedFolder,
  onSelectFolder,
  onCreateFolder,
  onRenameFolder,
  onDeleteFolder,
  isLoading,
}: FolderSidebarProps) => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showRenameModal, setShowRenameModal] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const [renameValue, setRenameValue] = useState("");
  const [folderToRename, setFolderToRename] = useState<GoogleDriveFolder | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isRenaming, setIsRenaming] = useState(false);
  const [folderToDelete, setFolderToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleCreateFolder = async () => {
    if (!newFolderName.trim()) return;

    setIsCreating(true);
    try {
      await onCreateFolder(newFolderName);
      setNewFolderName("");
      setShowCreateModal(false);
    } catch (error) {
      console.error("Error creating folder:", error);
      alert("Error al crear la carpeta");
    } finally {
      setIsCreating(false);
    }
  };

  const handleOpenRenameModal = (folder: GoogleDriveFolder) => {
    setFolderToRename(folder);
    setRenameValue(folder.name);
    setShowRenameModal(true);
  };

  const handleRenameFolder = async () => {
    if (!folderToRename || !renameValue.trim()) return;

    setIsRenaming(true);
    try {
      await onRenameFolder(folderToRename.id, renameValue);
      setShowRenameModal(false);
      setFolderToRename(null);
      setRenameValue("");
    } catch (error) {
      console.error("Error renaming folder:", error);
      alert("Error al renombrar la carpeta");
    } finally {
      setIsRenaming(false);
    }
  };

  const handleDeleteFolder = async (folderId: string) => {
    setIsDeleting(true);
    try {
      await onDeleteFolder(folderId);
      setFolderToDelete(null);
    } catch (error) {
      console.error("Error deleting folder:", error);
      alert("Error al eliminar la carpeta");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <Card className="h-100">
        <Card.Header className="d-flex justify-content-between align-items-center">
          <h5 className="mb-0">
            <Folder size={20} className="me-2" />
            Carpetas
          </h5>
          <Button
            variant="primary"
            size="sm"
            onClick={() => setShowCreateModal(true)}
            disabled={isLoading}
          >
            <Plus size={16} />
          </Button>
        </Card.Header>
        <Card.Body className="p-0" style={{ maxHeight: "70vh", overflowY: "auto" }}>
          {isLoading ? (
            <div className="text-center p-4">
              <Spinner animation="border" size="sm" />
              <p className="mt-2 mb-0">Cargando carpetas...</p>
            </div>
          ) : folders.length === 0 ? (
            <div className="text-center p-4 text-muted">
              <Folder size={48} className="mb-3 opacity-50" />
              <p>No hay carpetas</p>
              <Button
                variant="outline-primary"
                size="sm"
                onClick={() => setShowCreateModal(true)}
              >
                Crear carpeta
              </Button>
            </div>
          ) : (
            <ListGroup variant="flush">
              {folders.map((folder) => (
                <ListGroup.Item
                  key={folder.id}
                  active={selectedFolder?.id === folder.id}
                  action
                  onClick={() => onSelectFolder(folder)}
                  className="d-flex justify-content-between align-items-center"
                >
                  <div className="d-flex align-items-center flex-grow-1">
                    <Folder size={18} className="me-2" />
                    <span className="text-truncate">{folder.name}</span>
                    {folder.fileCount !== undefined && (
                      <Badge
                        bg="secondary"
                        className="ms-2"
                        style={{ fontSize: "0.7rem" }}
                      >
                        {folder.fileCount}
                      </Badge>
                    )}
                  </div>
                  <div className="d-flex gap-1">
                    <Button
                      variant="link"
                      size="sm"
                      className="text-primary p-0"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenRenameModal(folder);
                      }}
                      title="Renombrar"
                    >
                      <Edit2 size={16} />
                    </Button>
                    <Button
                      variant="link"
                      size="sm"
                      className="text-danger p-0"
                      onClick={(e) => {
                        e.stopPropagation();
                        setFolderToDelete(folder.id);
                      }}
                      title="Eliminar"
                    >
                      <Trash2 size={16} />
                    </Button>
                  </div>
                </ListGroup.Item>
              ))}
            </ListGroup>
          )}
        </Card.Body>
      </Card>

      {/* Create Folder Modal */}
      <Modal show={showCreateModal} onHide={() => setShowCreateModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Crear Nueva Carpeta</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group>
              <Form.Label>Nombre de la carpeta</Form.Label>
              <Form.Control
                type="text"
                placeholder="Ingrese el nombre"
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleCreateFolder();
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
            onClick={() => setShowCreateModal(false)}
            disabled={isCreating}
          >
            Cancelar
          </Button>
          <Button
            variant="primary"
            onClick={handleCreateFolder}
            disabled={!newFolderName.trim() || isCreating}
          >
            {isCreating ? (
              <>
                <Spinner
                  as="span"
                  animation="border"
                  size="sm"
                  className="me-2"
                />
                Creando...
              </>
            ) : (
              "Crear"
            )}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Rename Folder Modal */}
      <Modal show={showRenameModal} onHide={() => setShowRenameModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Renombrar Carpeta</Modal.Title>
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
                    handleRenameFolder();
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
            onClick={handleRenameFolder}
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

      {/* Delete Folder Confirmation Modal */}
      <Modal
        show={folderToDelete !== null}
        onHide={() => setFolderToDelete(null)}
      >
        <Modal.Header closeButton>
          <Modal.Title>Confirmar Eliminación</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          ¿Estás seguro de que deseas eliminar esta carpeta? Esta acción no se
          puede deshacer.
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => setFolderToDelete(null)}
            disabled={isDeleting}
          >
            Cancelar
          </Button>
          <Button
            variant="danger"
            onClick={() => folderToDelete && handleDeleteFolder(folderToDelete)}
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

export default FolderSidebar;
