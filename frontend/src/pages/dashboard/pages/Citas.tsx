import { useState, useMemo, useEffect } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Table,
  Badge,
  Button,
  Form,
  Pagination,
  Spinner,
  Modal,
} from "react-bootstrap";
import { useNotifications } from "context/NotificationContext";

// Interfaces
export interface CitaData {
  id: string;
  paciente: string;
  dueno: string;
  fecha: string;
  horaIngreso: string;
  horaSalida: string;
  tipoCita: string;
  estado: string;
  veterinario?: string;
  actividad?: string;
}

export interface EventoData {
  id: string;
  nombre: string;
  encargado: string;
  fecha: string;
  horaInicio: string;
  horaFin: string;
  actividades: string;
  estado: string;
}

type VistaCalendario = "Lista" | "Mes" | "Semana" | "Dia";

const MESES = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
];

const ITEMS_PER_PAGE = 5;

const API_BASE_URL = "http://localhost:3001/api";

const getEstadoBadge = (estado: string) => {
  switch (estado.toLowerCase()) {
    case "completado":
      return "success";
    case "en espera":
      return "warning";
    case "cancelado":
      return "danger";
    case "activo":
      return "success";
    case "modificado":
      return "info";
    default:
      return "secondary";
  }
};

const formatFechaSidebar = (fecha: string): string => {
  const dias = ["Domingo", "Lunes", "Martes", "Miercoles", "Jueves", "Viernes", "Sabado"];
  const d = new Date(fecha);
  return `${dias[d.getDay()]} ${d.getDate().toString().padStart(2, "0")} de ${MESES[d.getMonth()]} a las ${d.toLocaleTimeString("es", { hour: "2-digit", minute: "2-digit" })}`;
};

const Citas = () => {
  const { addNotification } = useNotifications();

  // Data state
  const [citas, setCitas] = useState<CitaData[]>([]);
  const [eventos, setEventos] = useState<EventoData[]>([]);
  const [loading, setLoading] = useState(true);

  // Calendar state
  const [currentDate, setCurrentDate] = useState(new Date());
  const [vistaActiva, setVistaActiva] = useState<VistaCalendario>("Lista");

  // Citas filters
  const [filtroTipoCita, setFiltroTipoCita] = useState("");
  const [filtroEstadoCita, setFiltroEstadoCita] = useState("");
  const [paginaCitas, setPaginaCitas] = useState(1);

  // Eventos filters
  const [filtroFechaEvento, setFiltroFechaEvento] = useState("");
  const [filtroEstadoEvento, setFiltroEstadoEvento] = useState("");
  const [paginaEventos, setPaginaEventos] = useState(1);

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState<"cita" | "evento">("cita");
  const [newCita, setNewCita] = useState<Partial<CitaData>>({});
  const [newEvento, setNewEvento] = useState<Partial<EventoData>>({});

  // Fetch data
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [citasRes, eventosRes] = await Promise.allSettled([
          fetch(`${API_BASE_URL}/citas`).then((r) => (r.ok ? r.json() : [])),
          fetch(`${API_BASE_URL}/eventos`).then((r) => (r.ok ? r.json() : [])),
        ]);
        setCitas(citasRes.status === "fulfilled" ? citasRes.value : []);
        setEventos(eventosRes.status === "fulfilled" ? eventosRes.value : []);
      } catch {
        setCitas([]);
        setEventos([]);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Calendar navigation
  const mesActual = currentDate.getMonth();
  const yearActual = currentDate.getFullYear();

  const navigateMonth = (dir: number) => {
    setCurrentDate(new Date(yearActual, mesActual + dir, 1));
    setPaginaCitas(1);
    setPaginaEventos(1);
  };

  // Filter citas by current month
  const citasDelMes = useMemo(() => {
    return citas.filter((c) => {
      const f = new Date(c.fecha);
      return f.getMonth() === mesActual && f.getFullYear() === yearActual;
    });
  }, [citas, mesActual, yearActual]);

  // Tipos de cita disponibles
  const tiposCita = useMemo(() => {
    return [...new Set(citasDelMes.map((c) => c.tipoCita))];
  }, [citasDelMes]);

  // Estados disponibles
  const estadosCita = useMemo(() => {
    return [...new Set(citasDelMes.map((c) => c.estado))];
  }, [citasDelMes]);

  const estadosEvento = useMemo(() => {
    return [...new Set(eventos.map((e) => e.estado))];
  }, [eventos]);

  // Filtered citas
  const citasFiltradas = useMemo(() => {
    return citasDelMes.filter((c) => {
      if (filtroTipoCita && c.tipoCita !== filtroTipoCita) return false;
      if (filtroEstadoCita && c.estado !== filtroEstadoCita) return false;
      return true;
    });
  }, [citasDelMes, filtroTipoCita, filtroEstadoCita]);

  // Filtered eventos
  const eventosFiltrados = useMemo(() => {
    return eventos.filter((e) => {
      const f = new Date(e.fecha);
      if (f.getMonth() !== mesActual || f.getFullYear() !== yearActual) return false;
      if (filtroFechaEvento) {
        const filterDate = new Date(filtroFechaEvento);
        if (f.toDateString() !== filterDate.toDateString()) return false;
      }
      if (filtroEstadoEvento && e.estado !== filtroEstadoEvento) return false;
      return true;
    });
  }, [eventos, mesActual, yearActual, filtroFechaEvento, filtroEstadoEvento]);

  // Pagination
  const totalPagesCitas = Math.max(1, Math.ceil(citasFiltradas.length / ITEMS_PER_PAGE));
  const citasPaginadas = citasFiltradas.slice(
    (paginaCitas - 1) * ITEMS_PER_PAGE,
    paginaCitas * ITEMS_PER_PAGE
  );

  const totalPagesEventos = Math.max(1, Math.ceil(eventosFiltrados.length / ITEMS_PER_PAGE));
  const eventosPaginados = eventosFiltrados.slice(
    (paginaEventos - 1) * ITEMS_PER_PAGE,
    paginaEventos * ITEMS_PER_PAGE
  );

  // Próximas actividades (sidebar)
  const proximasActividades = useMemo(() => {
    const now = new Date();
    const allItems = [
      ...citas.map((c) => ({
        tipo: "CITA" as const,
        titulo: `${c.tipoCita} ${c.paciente}`,
        fecha: c.fecha,
        horaIngreso: c.horaIngreso,
        paciente: c.paciente,
        dueno: c.dueno,
        veterinario: c.veterinario || "",
        actividad: c.actividad || "",
        color: "primary",
      })),
      ...eventos.map((e) => ({
        tipo: "EVENTO" as const,
        titulo: e.nombre,
        fecha: e.fecha,
        horaIngreso: e.horaInicio,
        paciente: "",
        dueno: "",
        veterinario: e.encargado,
        actividad: e.actividades,
        color: "warning",
      })),
    ];
    return allItems
      .filter((item) => new Date(item.fecha) >= new Date(now.toDateString()))
      .sort((a, b) => new Date(a.fecha).getTime() - new Date(b.fecha).getTime())
      .slice(0, 5);
  }, [citas, eventos]);

  // Reset filters
  const resetCitaFilters = () => {
    setFiltroTipoCita("");
    setFiltroEstadoCita("");
    setPaginaCitas(1);
  };

  const resetEventoFilters = () => {
    setFiltroFechaEvento("");
    setFiltroEstadoEvento("");
    setPaginaEventos(1);
  };

  // Add new cita
  const handleAddCita = () => {
    if (!newCita.paciente || !newCita.fecha) return;
    const cita: CitaData = {
      id: `C${String(citas.length + 1).padStart(5, "0")}`,
      paciente: newCita.paciente || "",
      dueno: newCita.dueno || "",
      fecha: newCita.fecha || "",
      horaIngreso: newCita.horaIngreso || "",
      horaSalida: newCita.horaSalida || "------",
      tipoCita: newCita.tipoCita || "",
      estado: "En Espera",
      veterinario: newCita.veterinario || "",
      actividad: newCita.actividad || "",
    };
    setCitas((prev) => [...prev, cita]);
    addNotification("citas", "agregar", `cita para "${cita.paciente}"`);
    setShowModal(false);
    setNewCita({});
  };

  // Add new evento
  const handleAddEvento = () => {
    if (!newEvento.nombre || !newEvento.fecha) return;
    const evento: EventoData = {
      id: `E${String(eventos.length + 1).padStart(5, "0")}`,
      nombre: newEvento.nombre || "",
      encargado: newEvento.encargado || "",
      fecha: newEvento.fecha || "",
      horaInicio: newEvento.horaInicio || "",
      horaFin: newEvento.horaFin || "",
      actividades: newEvento.actividades || "",
      estado: "En Espera",
    };
    setEventos((prev) => [...prev, evento]);
    addNotification("citas", "agregar", `evento "${evento.nombre}"`);
    setShowModal(false);
    setNewEvento({});
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
      <h2 className="fw-bold mb-4">Calendario de Citas</h2>

      <Row>
        {/* Sidebar */}
        <Col lg={3} className="mb-4">
          <Button
            variant="success"
            className="w-100 mb-4"
            onClick={() => {
              setModalType("cita");
              setShowModal(true);
            }}
          >
            + Agregar Nueva Actividad
          </Button>

          <h6 className="fw-bold mb-3">Próximas Actividades</h6>
          {proximasActividades.length === 0 ? (
            <p className="text-muted small">No hay actividades próximas</p>
          ) : (
            proximasActividades.map((act, i) => (
              <Card
                key={i}
                className="mb-3 border-0 shadow-sm"
                style={{
                  borderLeft: `4px solid ${
                    act.tipo === "CITA" ? "#0d6efd" : "#ffc107"
                  }`,
                }}
              >
                <Card.Body className="p-3">
                  <div className="d-flex align-items-center mb-1">
                    <Badge
                      bg={act.tipo === "CITA" ? "primary" : "warning"}
                      className="me-2"
                      style={{ fontSize: "0.7rem" }}
                    >
                      {act.tipo}
                    </Badge>
                    <strong className="small">{act.titulo}</strong>
                  </div>
                  <p className="text-muted mb-1" style={{ fontSize: "0.75rem" }}>
                    {formatFechaSidebar(act.fecha)}
                  </p>
                  {act.paciente && (
                    <p className="mb-0 text-muted" style={{ fontSize: "0.75rem" }}>
                      &lt;Paciente&gt; {act.paciente}
                    </p>
                  )}
                  {act.dueno && (
                    <p className="mb-0 text-muted" style={{ fontSize: "0.75rem" }}>
                      &lt;Dueño&gt; {act.dueno}
                    </p>
                  )}
                  {act.veterinario && (
                    <p className="mb-0 text-muted" style={{ fontSize: "0.75rem" }}>
                      &lt;Veterinario o Empleado&gt; {act.veterinario}
                    </p>
                  )}
                  {act.actividad && (
                    <p className="mb-0 text-muted" style={{ fontSize: "0.75rem" }}>
                      &lt;Actividad&gt; {act.actividad}
                    </p>
                  )}
                </Card.Body>
              </Card>
            ))
          )}

          {proximasActividades.length > 0 && (
            <Button variant="primary" size="sm" className="w-100">
              Ver Más
            </Button>
          )}
        </Col>

        {/* Main content */}
        <Col lg={9}>
          {/* Calendar header */}
          <Card className="border-0 shadow-sm mb-4">
            <Card.Body className="p-3">
              <div className="d-flex justify-content-between align-items-center">
                <Button variant="outline-secondary" size="sm">
                  Hoy
                </Button>
                <div className="d-flex align-items-center gap-3">
                  <Button
                    variant="link"
                    className="text-dark p-0"
                    onClick={() => navigateMonth(-1)}
                  >
                    &lt;
                  </Button>
                  <h5 className="mb-0 fw-bold">
                    {MESES[mesActual]} {yearActual}
                  </h5>
                  <Button
                    variant="link"
                    className="text-dark p-0"
                    onClick={() => navigateMonth(1)}
                  >
                    &gt;
                  </Button>
                </div>
                <div className="btn-group">
                  {(["Lista", "Mes", "Semana", "Dia"] as VistaCalendario[]).map(
                    (vista) => (
                      <Button
                        key={vista}
                        variant={vistaActiva === vista ? "primary" : "outline-primary"}
                        size="sm"
                        onClick={() => setVistaActiva(vista)}
                      >
                        {vista}
                      </Button>
                    )
                  )}
                </div>
              </div>
            </Card.Body>
          </Card>

          {/* Citas Table */}
          <Card className="border-0 shadow-sm mb-4">
            <Card.Body className="p-4">
              <h5 className="fw-bold mb-3">Citas</h5>
              <div className="d-flex align-items-center gap-3 mb-3 flex-wrap">
                <i className="fe fe-filter text-muted"></i>
                <span className="text-muted small">
                  {new Date(yearActual, mesActual, 1).toLocaleDateString("es", {
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric",
                  })}{" "}
                  al{" "}
                  {new Date(yearActual, mesActual + 1, 0).toLocaleDateString("es", {
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric",
                  })}
                </span>
                <Form.Select
                  size="sm"
                  style={{ width: "auto" }}
                  value={filtroTipoCita}
                  onChange={(e) => {
                    setFiltroTipoCita(e.target.value);
                    setPaginaCitas(1);
                  }}
                >
                  <option value="">Filtrar Tipo De Cita</option>
                  {tiposCita.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </Form.Select>
                <Form.Select
                  size="sm"
                  style={{ width: "auto" }}
                  value={filtroEstadoCita}
                  onChange={(e) => {
                    setFiltroEstadoCita(e.target.value);
                    setPaginaCitas(1);
                  }}
                >
                  <option value="">Filtrar Estado</option>
                  {estadosCita.map((e) => (
                    <option key={e} value={e}>{e}</option>
                  ))}
                </Form.Select>
                <Button
                  variant="link"
                  size="sm"
                  className="text-danger"
                  onClick={resetCitaFilters}
                >
                  <i className="fe fe-refresh-cw me-1"></i>
                  Reiniciar Filtro
                </Button>
              </div>

              <Table responsive className="text-nowrap">
                <thead className="table-light">
                  <tr>
                    <th>ID</th>
                    <th>PACIENTE</th>
                    <th>DUEÑO</th>
                    <th>FECHA</th>
                    <th>HORA INGRESO</th>
                    <th>HORA SALIDA</th>
                    <th>TIPO DE CITA</th>
                    <th>ESTADO</th>
                  </tr>
                </thead>
                <tbody>
                  {citasPaginadas.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="text-center text-muted py-4">
                        No hay citas para este mes
                      </td>
                    </tr>
                  ) : (
                    citasPaginadas.map((cita) => (
                      <tr key={cita.id}>
                        <td>{cita.id}</td>
                        <td>{cita.paciente}</td>
                        <td>{cita.dueno}</td>
                        <td>
                          {new Date(cita.fecha).toLocaleDateString("es", {
                            day: "2-digit",
                            month: "2-digit",
                            year: "numeric",
                          })}
                        </td>
                        <td>{cita.horaIngreso}</td>
                        <td>{cita.horaSalida}</td>
                        <td>{cita.tipoCita}</td>
                        <td>
                          <Badge pill bg={getEstadoBadge(cita.estado)} className="px-3 py-2">
                            {cita.estado}
                          </Badge>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </Table>

              {totalPagesCitas > 1 && (
                <div className="d-flex justify-content-between align-items-center">
                  <Button
                    variant="outline-secondary"
                    size="sm"
                    disabled={paginaCitas <= 1}
                    onClick={() => setPaginaCitas((p) => p - 1)}
                  >
                    &lt; Anterior
                  </Button>
                  <Button
                    variant="outline-secondary"
                    size="sm"
                    disabled={paginaCitas >= totalPagesCitas}
                    onClick={() => setPaginaCitas((p) => p + 1)}
                  >
                    Siguiente &gt;
                  </Button>
                </div>
              )}
            </Card.Body>
          </Card>

          {/* Eventos Table */}
          <Card className="border-0 shadow-sm">
            <Card.Body className="p-4">
              <h5 className="fw-bold mb-3">Eventos</h5>
              <div className="d-flex align-items-center gap-3 mb-3 flex-wrap">
                <i className="fe fe-filter text-muted"></i>
                <Form.Control
                  type="date"
                  size="sm"
                  style={{ width: "auto" }}
                  value={filtroFechaEvento}
                  onChange={(e) => {
                    setFiltroFechaEvento(e.target.value);
                    setPaginaEventos(1);
                  }}
                />
                <Form.Select
                  size="sm"
                  style={{ width: "auto" }}
                  value={filtroEstadoEvento}
                  onChange={(e) => {
                    setFiltroEstadoEvento(e.target.value);
                    setPaginaEventos(1);
                  }}
                >
                  <option value="">Filtrar Estado</option>
                  {estadosEvento.map((e) => (
                    <option key={e} value={e}>{e}</option>
                  ))}
                </Form.Select>
                <Button
                  variant="link"
                  size="sm"
                  className="text-danger"
                  onClick={resetEventoFilters}
                >
                  <i className="fe fe-refresh-cw me-1"></i>
                  Reiniciar Filtro
                </Button>
                <div className="ms-auto">
                  <Button
                    variant="warning"
                    size="sm"
                    onClick={() => {
                      setModalType("evento");
                      setShowModal(true);
                    }}
                  >
                    + Nuevo Evento
                  </Button>
                </div>
              </div>

              <Table responsive className="text-nowrap">
                <thead className="table-light">
                  <tr>
                    <th>ID</th>
                    <th>NOMBRE</th>
                    <th>ENCARGADO</th>
                    <th>FECHA</th>
                    <th>HORA INICIO</th>
                    <th>HORA FIN</th>
                    <th>ACTIVIDADES</th>
                    <th>ESTADO</th>
                  </tr>
                </thead>
                <tbody>
                  {eventosPaginados.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="text-center text-muted py-4">
                        No hay eventos para este mes
                      </td>
                    </tr>
                  ) : (
                    eventosPaginados.map((evento) => (
                      <tr key={evento.id}>
                        <td>{evento.id}</td>
                        <td>{evento.nombre}</td>
                        <td>{evento.encargado}</td>
                        <td>
                          {new Date(evento.fecha).toLocaleDateString("es", {
                            day: "2-digit",
                            month: "2-digit",
                            year: "numeric",
                          })}
                        </td>
                        <td>{evento.horaInicio}</td>
                        <td>{evento.horaFin}</td>
                        <td>{evento.actividades}</td>
                        <td>
                          <Badge pill bg={getEstadoBadge(evento.estado)} className="px-3 py-2">
                            {evento.estado}
                          </Badge>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </Table>

              {totalPagesEventos > 1 && (
                <div className="d-flex justify-content-between align-items-center">
                  <Button
                    variant="outline-secondary"
                    size="sm"
                    disabled={paginaEventos <= 1}
                    onClick={() => setPaginaEventos((p) => p - 1)}
                  >
                    &lt; Anterior
                  </Button>
                  <Button
                    variant="outline-secondary"
                    size="sm"
                    disabled={paginaEventos >= totalPagesEventos}
                    onClick={() => setPaginaEventos((p) => p + 1)}
                  >
                    Siguiente &gt;
                  </Button>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Modal para agregar cita o evento */}
      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>
            {modalType === "cita" ? "Nueva Cita" : "Nuevo Evento"}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {modalType === "cita" ? (
            <>
              <Form.Group className="mb-3">
                <Form.Label>Paciente</Form.Label>
                <Form.Control
                  value={newCita.paciente || ""}
                  onChange={(e) => setNewCita({ ...newCita, paciente: e.target.value })}
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Dueño</Form.Label>
                <Form.Control
                  value={newCita.dueno || ""}
                  onChange={(e) => setNewCita({ ...newCita, dueno: e.target.value })}
                />
              </Form.Group>
              <Row>
                <Col>
                  <Form.Group className="mb-3">
                    <Form.Label>Fecha</Form.Label>
                    <Form.Control
                      type="date"
                      value={newCita.fecha || ""}
                      onChange={(e) => setNewCita({ ...newCita, fecha: e.target.value })}
                    />
                  </Form.Group>
                </Col>
                <Col>
                  <Form.Group className="mb-3">
                    <Form.Label>Hora Ingreso</Form.Label>
                    <Form.Control
                      type="time"
                      value={newCita.horaIngreso || ""}
                      onChange={(e) => setNewCita({ ...newCita, horaIngreso: e.target.value })}
                    />
                  </Form.Group>
                </Col>
              </Row>
              <Form.Group className="mb-3">
                <Form.Label>Tipo de Cita</Form.Label>
                <Form.Control
                  value={newCita.tipoCita || ""}
                  onChange={(e) => setNewCita({ ...newCita, tipoCita: e.target.value })}
                  placeholder="Ej: Vacunación, Control, Cirugía"
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Veterinario o Empleado</Form.Label>
                <Form.Control
                  value={newCita.veterinario || ""}
                  onChange={(e) => setNewCita({ ...newCita, veterinario: e.target.value })}
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Actividad</Form.Label>
                <Form.Control
                  value={newCita.actividad || ""}
                  onChange={(e) => setNewCita({ ...newCita, actividad: e.target.value })}
                />
              </Form.Group>
            </>
          ) : (
            <>
              <Form.Group className="mb-3">
                <Form.Label>Nombre del Evento</Form.Label>
                <Form.Control
                  value={newEvento.nombre || ""}
                  onChange={(e) => setNewEvento({ ...newEvento, nombre: e.target.value })}
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Encargado</Form.Label>
                <Form.Control
                  value={newEvento.encargado || ""}
                  onChange={(e) => setNewEvento({ ...newEvento, encargado: e.target.value })}
                />
              </Form.Group>
              <Row>
                <Col>
                  <Form.Group className="mb-3">
                    <Form.Label>Fecha</Form.Label>
                    <Form.Control
                      type="date"
                      value={newEvento.fecha || ""}
                      onChange={(e) => setNewEvento({ ...newEvento, fecha: e.target.value })}
                    />
                  </Form.Group>
                </Col>
              </Row>
              <Row>
                <Col>
                  <Form.Group className="mb-3">
                    <Form.Label>Hora Inicio</Form.Label>
                    <Form.Control
                      type="time"
                      value={newEvento.horaInicio || ""}
                      onChange={(e) => setNewEvento({ ...newEvento, horaInicio: e.target.value })}
                    />
                  </Form.Group>
                </Col>
                <Col>
                  <Form.Group className="mb-3">
                    <Form.Label>Hora Fin</Form.Label>
                    <Form.Control
                      type="time"
                      value={newEvento.horaFin || ""}
                      onChange={(e) => setNewEvento({ ...newEvento, horaFin: e.target.value })}
                    />
                  </Form.Group>
                </Col>
              </Row>
              <Form.Group className="mb-3">
                <Form.Label>Actividades</Form.Label>
                <Form.Control
                  value={newEvento.actividades || ""}
                  onChange={(e) => setNewEvento({ ...newEvento, actividades: e.target.value })}
                />
              </Form.Group>
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Cancelar
          </Button>
          <Button
            variant="primary"
            onClick={modalType === "cita" ? handleAddCita : handleAddEvento}
          >
            Guardar
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default Citas;
