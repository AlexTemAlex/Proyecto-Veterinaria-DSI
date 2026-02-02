import { useState, useMemo, useEffect } from "react";
import { Card, Table, Pagination, Spinner } from "react-bootstrap";

export interface Producto {
  codigo: string;
  producto: string;
  categoria: string;
  subcategoria: string;
  presentacion: string;
  stock: number;
}

const API_BASE_URL = "/api";

const ITEMS_PER_PAGE = 10;

interface InventarioTableProps {
  searchTerm: string;
}

const InventarioTable = ({ searchTerm }: InventarioTableProps) => {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchInventario = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(`${API_BASE_URL}/drive/products`, {
          credentials: "include",
        });

        if (!response.ok) {
          throw new Error("Error al obtener el inventario");
        }

        const json = await response.json();

        const data: Producto[] = (json.products ?? []).map((p: any) => ({
          codigo: p["Código"],
          producto: p["Producto"],
          categoria: p["Categoría"],
          subcategoria: p["Subcategoría"],
          presentacion: p["Presentación"],
          stock: Number(p["Stock"] ?? 0),
        }));

        setProductos(data);
      } catch (err) {
        console.error("Error fetching inventario:", err);
        setError("No se pudo cargar el inventario");
      } finally {
        setIsLoading(false);
      }
    };

    fetchInventario();
  }, []);

  const filteredProducts = useMemo(() => {
    if (!searchTerm.trim()) return productos;
    const term = searchTerm.toLowerCase();
    return productos.filter(
      (p) =>
        p.codigo.toLowerCase().includes(term) ||
        p.producto.toLowerCase().includes(term) ||
        p.categoria.toLowerCase().includes(term) ||
        p.subcategoria.toLowerCase().includes(term) ||
        p.presentacion.toLowerCase().includes(term)
    );
  }, [searchTerm, productos]);

  const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE);

  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredProducts.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredProducts, currentPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const renderPagination = () => {
    const items = [];
    const maxVisible = 4;

    // Always show page 1
    items.push(
      <Pagination.Item key={1} active={currentPage === 1} onClick={() => handlePageChange(1)}>
        1
      </Pagination.Item>
    );

    if (totalPages <= 1) return items;

    // Calculate range around current page
    let start = Math.max(2, currentPage - 1);
    let end = Math.min(totalPages - 1, start + maxVisible - 2);
    start = Math.max(2, end - (maxVisible - 2));

    // Ellipsis before
    if (start > 2) {
      items.push(<Pagination.Ellipsis key="start-ellipsis" disabled />);
    }

    // Middle pages
    for (let i = start; i <= end; i++) {
      items.push(
        <Pagination.Item key={i} active={i === currentPage} onClick={() => handlePageChange(i)}>
          {i}
        </Pagination.Item>
      );
    }

    // Ellipsis after
    if (end < totalPages - 1) {
      items.push(<Pagination.Ellipsis key="end-ellipsis" disabled />);
    }

    // Always show last page
    items.push(
      <Pagination.Item key={totalPages} active={currentPage === totalPages} onClick={() => handlePageChange(totalPages)}>
        {totalPages}
      </Pagination.Item>
    );

    return items;
  };

  return (
    <Card>
      <Card.Body>
        {isLoading ? (
          <div className="text-center py-5">
            <Spinner animation="border" />
            <p className="mt-2 text-muted">Cargando inventario...</p>
          </div>
        ) : error ? (
          <div className="text-center py-5 text-danger">{error}</div>
        ) : (
          <>
            <Table hover responsive className="text-nowrap">
              <thead className="table-light">
                <tr>
                  <th>Codigo</th>
                  <th>Producto</th>
                  <th>Categoria</th>
                  <th>Subcategoria</th>
                  <th>Presentacion</th>
                  <th>Stock</th>
                </tr>
              </thead>
              <tbody>
                {paginatedProducts.length > 0 ? (
                  paginatedProducts.map((producto, index) => (
                    <tr key={index}>
                      <td>{producto.codigo}</td>
                      <td>{producto.producto}</td>
                      <td>{producto.categoria}</td>
                      <td>{producto.subcategoria}</td>
                      <td>{producto.presentacion}</td>
                      <td>{producto.stock}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="text-center text-muted py-4">
                      No se encontraron productos
                    </td>
                  </tr>
                )}
              </tbody>
            </Table>

            {totalPages > 1 && (
              <div className="d-flex justify-content-end">
                <Pagination className="mb-0">
                  <Pagination.Prev
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                  />
                  {renderPagination()}
                  <Pagination.Next
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                  />
                </Pagination>
              </div>
            )}
          </>
        )}
      </Card.Body>
    </Card>
  );
};

export default InventarioTable;
