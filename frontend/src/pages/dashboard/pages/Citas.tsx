import { useState, useMemo, useEffect } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Table,
  Badge,
  Form,
  Spinner,
  Pagination,
} from "react-bootstrap";

export interface CitaData {
  id: string;
  cedula: string;
  mascota: string;
  dueno: string;
  fechaCita: string;
  horaCita: string;
  tipoCita: string;
  telefono: string;
  estado: string;
}

const API_BASE_URL = "/api";
const ITEMS_PER_PAGE = 10;

const getEstadoBadge = (estado: string) => {
  switch (estado.toLowerCase()) {
    case "activo":
      return "success";
    case "cancelado":
      return "danger";
    case "reprogramado":
      return "warning";
    default:
      return "secondary";
  }
};

const getEstadoColor = (estado: string) => {
  switch (estado.toLowerCase()) {
    case "activo":
      return "#198754";
    case "cancelado":
      return "#dc3545";
    case "reprogramado":
      return "#ffc107";
    default:
      return "#6c757d";
  }
};

const formatTelefono = (tel: string): string => {
  if (!tel) return "";
  const trimmed = tel.trim();
  if (trimmed.startsWith("+")) return trimmed;
  if (!trimmed.startsWith("0")) return "0" + trimmed;
  return trimmed;
};

const todayStr = (): string => {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
};

const Citas = () => {
  const [citas, setCitas] = useState<CitaData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [fechaDesde, setFechaDesde] = useState(todayStr());
  const [fechaHasta, setFechaHasta] = useState(todayStr());
  const [filtroTipo, setFiltroTipo] = useState("");
  const [filtroEstado, setFiltroEstado] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  // Date validation error
  const fechaError = fechaDesde && fechaHasta && fechaDesde > fechaHasta;

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`${API_BASE_URL}/citas`);
        if (!res.ok) throw new Error("Error al obtener citas");
        const raw = await res.json();
        const list = Array.isArray(raw) ? raw : raw.citas ?? raw.data ?? [];

        const mapped: CitaData[] = list.map((c: any) => ({
          id: String(c["ID"] ?? ""),
          cedula: String(c["Cedula"] ?? ""),
          mascota: String(c["Mascota"] ?? ""),
          dueno: String(c["Dueño"] ?? c["Dueno"] ?? ""),
          fechaCita: String(c["Fecha cita"] ?? c["Fecha_cita"] ?? ""),
          horaCita: String(c["Hora cita"] ?? c["Hora_cita"] ?? ""),
          tipoCita: String(c["Tipo cita"] ?? c["Tipo_cita"] ?? ""),
          telefono: String(c["Telefono"] ?? c["Teléfono"] ?? ""),
          estado: String(c["Estado"] ?? ""),
        }));

        setCitas(mapped);
      } catch (err) {
        console.error("Error fetching citas:", err);
        setError("No se pudo cargar las citas");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Próximas citas (desde hoy en adelante, ordenadas por fecha)
  const proximasCitas = useMemo(() => {
    const hoy = todayStr();
    return citas
      .filter((c) => c.fechaCita >= hoy)
      .sort((a, b) => a.fechaCita.localeCompare(b.fechaCita) || a.horaCita.localeCompare(b.horaCita))
      .slice(0, 6);
  }, [citas]);

  // Available filter options
  const tiposDisponibles = useMemo(
    () => [...new Set(citas.map((c) => c.tipoCita).filter(Boolean))],
    [citas]
  );
  const estadosDisponibles = useMemo(
    () => [...new Set(citas.map((c) => c.estado).filter(Boolean))],
    [citas]
  );

  // Filtered data
  const citasFiltradas = useMemo(() => {
    return citas.filter((c) => {
      if (fechaDesde && c.fechaCita < fechaDesde) return false;
      if (fechaHasta && c.fechaCita > fechaHasta) return false;
      if (filtroTipo && c.tipoCita !== filtroTipo) return false;
      if (filtroEstado && c.estado !== filtroEstado) return false;
      return true;
    });
  }, [citas, fechaDesde, fechaHasta, filtroTipo, filtroEstado]);

  // Pagination
  const totalPages = Math.max(1, Math.ceil(citasFiltradas.length / ITEMS_PER_PAGE));

  const citasPaginadas = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return citasFiltradas.slice(start, start + ITEMS_PER_PAGE);
  }, [citasFiltradas, currentPage]);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [fechaDesde, fechaHasta, filtroTipo, filtroEstado]);

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) setCurrentPage(page);
  };

  const renderPagination = () => {
    const items = [];
    const maxVisible = 4;

    items.push(
      <Pagination.Item key={1} active={currentPage === 1} onClick={() => handlePageChange(1)}>
        1
      </Pagination.Item>
    );

    if (totalPages <= 1) return items;

    let start = Math.max(2, currentPage - 1);
    let end = Math.min(totalPages - 1, start + maxVisible - 2);
    start = Math.max(2, end - (maxVisible - 2));

    if (start > 2) {
      items.push(<Pagination.Ellipsis key="start-ellipsis" disabled />);
    }

    for (let i = start; i <= end; i++) {
      items.push(
        <Pagination.Item key={i} active={i === currentPage} onClick={() => handlePageChange(i)}>
          {i}
        </Pagination.Item>
      );
    }

    if (end < totalPages - 1) {
      items.push(<Pagination.Ellipsis key="end-ellipsis" disabled />);
    }

    items.push(
      <Pagination.Item key={totalPages} active={currentPage === totalPages} onClick={() => handlePageChange(totalPages)}>
        {totalPages}
      </Pagination.Item>
    );

    return items;
  };

  if (loading) {
    return (
      <Container fluid className="p-6 d-flex justify-content-center align-items-center" style={{ minHeight: "60vh" }}>
        <Spinner animation="border" variant="primary" />
      </Container>
    );
  }

  return (
    <Container fluid className="p-6">
      <Row>
        <Col lg={12} md={12} xs={12}>
          <div className="border-bottom pb-4 mb-4">
            <h3 className="mb-0 fw-bold">Citas</h3>
          </div>
        </Col>
      </Row>

      {/* Próximas Citas */}
      {proximasCitas.length > 0 && (
        <>
          <h5 className="fw-bold mb-3">Próximas Citas</h5>
          <Row className="mb-4">
            {proximasCitas.map((cita, i) => (
              <Col xs={12} md={6} lg={4} key={i} className="mb-3">
                <Card
                  className="border-0 shadow-sm h-100"
                  style={{ borderLeft: `4px solid ${getEstadoColor(cita.estado)}` }}
                >
                  <Card.Body className="p-3">
                    <div className="d-flex justify-content-between align-items-start mb-2">
                      <h6 className="fw-bold mb-0">{cita.mascota}</h6>
                      <Badge pill bg={getEstadoBadge(cita.estado)} className="px-2 py-1" style={{ fontSize: "0.7rem" }}>
                        {cita.estado}
                      </Badge>
                    </div>
                    <p className="text-muted mb-1" style={{ fontSize: "0.85rem" }}>
                      <strong>Dueño:</strong> {cita.dueno}
                    </p>
                    <p className="text-muted mb-1" style={{ fontSize: "0.85rem" }}>
                      <strong>Fecha:</strong> {cita.fechaCita} &nbsp; <strong>Hora:</strong> {cita.horaCita}
                    </p>
                    <p className="text-muted mb-1" style={{ fontSize: "0.85rem" }}>
                      <strong>Tipo:</strong> {cita.tipoCita}
                    </p>
                    <p className="text-muted mb-1" style={{ fontSize: "0.85rem" }}>
                      <strong>Cédula:</strong> {cita.cedula}
                    </p>
                    <p className="text-muted mb-0" style={{ fontSize: "0.85rem" }}>
                      <strong>Teléfono:</strong> {formatTelefono(cita.telefono)}
                    </p>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        </>
      )}

      {/* Filters */}
      <Card className="border-0 shadow-sm mb-4">
        <Card.Body className="p-4">
          <Row className="align-items-end g-3">
            <Col xs={12} md={3}>
              <Form.Group>
                <Form.Label className="small text-muted mb-1">Desde</Form.Label>
                <Form.Control
                  type="date"
                  size="sm"
                  value={fechaDesde}
                  onChange={(e) => setFechaDesde(e.target.value)}
                  isInvalid={!!fechaError}
                />
              </Form.Group>
            </Col>
            <Col xs={12} md={3}>
              <Form.Group>
                <Form.Label className="small text-muted mb-1">Hasta</Form.Label>
                <Form.Control
                  type="date"
                  size="sm"
                  value={fechaHasta}
                  min={fechaDesde}
                  onChange={(e) => setFechaHasta(e.target.value)}
                  isInvalid={!!fechaError}
                />
                {fechaError && (
                  <Form.Control.Feedback type="invalid">
                    La fecha "Hasta" no puede ser anterior a "Desde"
                  </Form.Control.Feedback>
                )}
              </Form.Group>
            </Col>
            <Col xs={12} md={3}>
              <Form.Group>
                <Form.Label className="small text-muted mb-1">Tipo de Cita</Form.Label>
                <Form.Select
                  size="sm"
                  value={filtroTipo}
                  onChange={(e) => setFiltroTipo(e.target.value)}
                >
                  <option value="">Todos</option>
                  {tiposDisponibles.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>
            <Col xs={12} md={3}>
              <Form.Group>
                <Form.Label className="small text-muted mb-1">Estado</Form.Label>
                <Form.Select
                  size="sm"
                  value={filtroEstado}
                  onChange={(e) => setFiltroEstado(e.target.value)}
                >
                  <option value="">Todos</option>
                  {estadosDisponibles.map((e) => (
                    <option key={e} value={e}>{e}</option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Table */}
      <Card className="border-0 shadow-sm">
        <Card.Body className="p-4">
          {error ? (
            <div className="text-center py-5 text-danger">{error}</div>
          ) : (
            <>
              <Table hover responsive className="text-nowrap">
                <thead className="table-light">
                  <tr>
                    <th>ID</th>
                    <th>Cedula</th>
                    <th>Mascota</th>
                    <th>Dueño</th>
                    <th>Fecha Cita</th>
                    <th>Hora Cita</th>
                    <th>Tipo Cita</th>
                    <th>Telefono</th>
                    <th>Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {citasPaginadas.length > 0 ? (
                    citasPaginadas.map((cita, index) => (
                      <tr key={index}>
                        <td>{cita.id}</td>
                        <td>{cita.cedula}</td>
                        <td>{cita.mascota}</td>
                        <td>{cita.dueno}</td>
                        <td>{cita.fechaCita}</td>
                        <td>{cita.horaCita}</td>
                        <td>{cita.tipoCita}</td>
                        <td>{formatTelefono(cita.telefono)}</td>
                        <td>
                          <Badge pill bg={getEstadoBadge(cita.estado)} className="px-3 py-2">
                            {cita.estado}
                          </Badge>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={9} className="text-center text-muted py-4">
                        No se encontraron citas
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
    </Container>
  );
};

export default Citas;
