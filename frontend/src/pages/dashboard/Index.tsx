import { Fragment, useState, useEffect, useMemo } from "react";
import {
  Container, Col, Row, Card, Table, Badge, Form, Spinner, Alert,
} from "react-bootstrap";
import {
  BoxSeam,
  FileEarmarkText,
  GraphUpArrow,
  GraphDownArrow,
  PersonFill,
} from "react-bootstrap-icons";
import Chart from "react-apexcharts";
import { ApexOptions } from "apexcharts";
import {
  fetchDashboardData,
  DashboardData,
  Cita,
} from "services/dashboardService";

const MESES = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
];

const getEstadoBadge = (estado: string) => {
  switch (estado) {
    case "Activo":
      return "success";
    case "Modificado":
      return "warning";
    case "Cancelado":
      return "danger";
    default:
      return "secondary";
  }
};

const Dashboard = () => {
  const [selectedYear, setSelectedYear] = useState(
    new Date().getFullYear().toString()
  );
  const [selectedMonth, setSelectedMonth] = useState(
    MESES[new Date().getMonth()]
  );
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await fetchDashboardData();
        setDashboardData(data);
      } catch (err) {
        setError("Error al cargar los datos del dashboard. Verifica que el servidor esté corriendo.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  // Filtrar citas por año y mes seleccionados
  const citasFiltradas = useMemo((): Cita[] => {
    if (!dashboardData) return [];
    const mesIndex = MESES.indexOf(selectedMonth);
    return dashboardData.citasDetalladas.filter((c) => {
      const fecha = new Date(c.fecha);
      return (
        fecha.getFullYear().toString() === selectedYear &&
        fecha.getMonth() === mesIndex
      );
    });
  }, [dashboardData, selectedYear, selectedMonth]);

  // Datos del gráfico filtrados por año, recortados a rango activo
  const { chartValues, chartLabels } = useMemo(() => {
    if (!dashboardData) return { chartValues: [], chartLabels: [] };

    const allData = MESES.map((_, index) => {
      return dashboardData.citasDetalladas.filter((c) => {
        const fecha = new Date(c.fecha);
        return (
          fecha.getFullYear().toString() === selectedYear &&
          fecha.getMonth() === index
        );
      }).length;
    });

    // Encontrar primer y último mes con datos
    let first = allData.findIndex((v) => v > 0);
    let last = allData.length - 1;
    while (last >= 0 && allData[last] === 0) last--;

    // Si no hay datos, mostrar todos los meses vacíos
    if (first === -1) {
      return { chartValues: allData, chartLabels: [...MESES] };
    }

    return {
      chartValues: allData.slice(first, last + 1),
      chartLabels: MESES.slice(first, last + 1),
    };
  }, [dashboardData, selectedYear]);

  // Calcular el máximo del eje Y dinámicamente
  const maxY = useMemo(() => {
    const max = Math.max(...chartValues, 1);
    return Math.ceil(max * 1.2);
  }, [chartValues]);

  // Años disponibles basados en los datos
  const availableYears = useMemo((): string[] => {
    if (!dashboardData) return [new Date().getFullYear().toString()];
    const years = new Set<string>();
    dashboardData.citasDetalladas.forEach((c) => {
      const year = new Date(c.fecha).getFullYear().toString();
      years.add(year);
    });
    if (years.size === 0) years.add(new Date().getFullYear().toString());
    return Array.from(years).sort().reverse();
  }, [dashboardData]);

  // Meses con citas para el año seleccionado
  const mesesConCitas = useMemo((): Map<number, number> => {
    const map = new Map<number, number>();
    if (!dashboardData) return map;
    dashboardData.citasDetalladas.forEach((c) => {
      const fecha = new Date(c.fecha);
      if (fecha.getFullYear().toString() === selectedYear) {
        const mes = fecha.getMonth();
        map.set(mes, (map.get(mes) || 0) + 1);
      }
    });
    return map;
  }, [dashboardData, selectedYear]);

  // Calcular % de citas: mes actual vs mes anterior
  const citasPercentage = useMemo(() => {
    if (!dashboardData) return { value: "0%", trend: "up" as const };
    const now = new Date();
    const mesActual = now.getMonth();
    const yearActual = now.getFullYear();

    // Mes anterior (puede ser diciembre del año pasado)
    const mesAnterior = mesActual === 0 ? 11 : mesActual - 1;
    const yearAnterior = mesActual === 0 ? yearActual - 1 : yearActual;

    const citasEsteMes = dashboardData.citasDetalladas.filter((c) => {
      const f = new Date(c.fecha);
      return f.getMonth() === mesActual && f.getFullYear() === yearActual;
    }).length;

    const citasMesPasado = dashboardData.citasDetalladas.filter((c) => {
      const f = new Date(c.fecha);
      return f.getMonth() === mesAnterior && f.getFullYear() === yearAnterior;
    }).length;

    if (citasMesPasado === 0) {
      return {
        value: citasEsteMes > 0 ? "100%" : "0%",
        trend: "up" as const,
      };
    }

    const diff = ((citasEsteMes - citasMesPasado) / citasMesPasado) * 100;
    return {
      value: `${Math.abs(diff).toFixed(1)}%`,
      trend: diff >= 0 ? ("up" as const) : ("down" as const),
    };
  }, [dashboardData]);

  // Calcular % de documentos: este mes vs mes anterior
  const docsPercentage = useMemo(() => {
    if (!dashboardData) return { value: "0%", trend: "up" as const };
    const { docsEsteMes, docsMesPasado } = dashboardData;

    if (docsMesPasado === 0) {
      return {
        value: docsEsteMes > 0 ? "100%" : "0%",
        trend: docsEsteMes > 0 ? ("up" as const) : ("up" as const),
      };
    }

    const diff = ((docsEsteMes - docsMesPasado) / docsMesPasado) * 100;
    return {
      value: `${Math.abs(diff).toFixed(1)}%`,
      trend: diff >= 0 ? ("up" as const) : ("down" as const),
    };
  }, [dashboardData]);

  // Inventario: % de productos con stock bajo
  const inventarioPercentage = useMemo(() => {
    if (!dashboardData || dashboardData.totalInventario === 0) {
      return { value: "0%", trend: "up" as const };
    }
    const { stockBajo, totalInventario } = dashboardData;
    const pct = (stockBajo / totalInventario) * 100;
    return {
      value: `${pct.toFixed(1)}%`,
      // Si hay stock bajo es tendencia negativa
      trend: stockBajo > 0 ? ("down" as const) : ("up" as const),
    };
  }, [dashboardData]);

  const statsData = [
    {
      title: "Total de Citas",
      value: dashboardData?.totalCitas ?? 0,
      percentage: citasPercentage.value,
      trend: citasPercentage.trend,
      subtitle: "vs mes anterior",
      icon: <PersonFill size={24} />,
      iconBg: "#e8e0f5",
      iconColor: "#7c3aed",
    },
    {
      title: "Total de Inventario",
      value: dashboardData?.totalInventario ?? 0,
      percentage: inventarioPercentage.value,
      trend: inventarioPercentage.trend,
      subtitle: dashboardData?.stockBajo
        ? `${dashboardData.stockBajo} con stock bajo`
        : "stock estable",
      icon: <BoxSeam size={24} />,
      iconBg: "#fef3cd",
      iconColor: "#f59e0b",
    },
    {
      title: "Total de Documentos",
      value: dashboardData?.totalDocumentos ?? 0,
      percentage: docsPercentage.value,
      trend: docsPercentage.trend,
      subtitle: "vs mes anterior",
      icon: <FileEarmarkText size={24} />,
      iconBg: "#d1fae5",
      iconColor: "#10b981",
    },
  ];

  const chartOptions: ApexOptions = {
    chart: {
      type: "area",
      height: 350,
      toolbar: { show: false },
      zoom: { enabled: false },
    },
    dataLabels: { enabled: false },
    stroke: { curve: "straight", width: 2, colors: ["#4361ee"] },
    fill: {
      type: "gradient",
      gradient: {
        shadeIntensity: 1,
        opacityFrom: 0.3,
        opacityTo: 0.05,
        stops: [0, 90, 100],
      },
    },
    xaxis: {
      categories: chartLabels,
      labels: { style: { colors: "#6c757d", fontSize: "12px" } },
    },
    yaxis: {
      labels: {
        formatter: (val: number) => `${val}`,
        style: { colors: "#6c757d", fontSize: "12px" },
      },
      min: 0,
      max: maxY,
    },
    grid: { borderColor: "#f1f1f1", strokeDashArray: 4 },
    tooltip: {
      y: { formatter: (val: number) => `${val} citas` },
    },
    colors: ["#4361ee"],
  };

  const chartSeries = [
    {
      name: "Citas",
      data: chartValues,
    },
  ];

  if (loading) {
    return (
      <Container fluid className="p-6 d-flex justify-content-center align-items-center" style={{ minHeight: "60vh" }}>
        <Spinner animation="border" variant="primary" />
      </Container>
    );
  }

  return (
    <Fragment>
      <Container fluid className="p-6">
        {error && (
          <Alert variant="warning" dismissible onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {/* Stat Cards */}
        <Row className="mb-4">
          {statsData.map((stat, index) => (
            <Col xl={4} lg={4} md={12} xs={12} className="mb-4" key={index}>
              <Card className="h-100 border-0 shadow-sm rounded-4">
                <Card.Body className="p-4">
                  <div className="d-flex justify-content-between align-items-start">
                    <div>
                      <p className="text-muted mb-1 fs-6">{stat.title}</p>
                      <h2 className="fw-bold mb-2" style={{ fontSize: "2.2rem" }}>
                        {stat.value}
                      </h2>
                      <div className="d-flex align-items-center">
                        {stat.trend === "up" && (
                          <GraphUpArrow size={14} className="text-success me-1" />
                        )}
                        {stat.trend === "down" && (
                          <GraphDownArrow size={14} className="text-danger me-1" />
                        )}
                        <span
                          className={
                            stat.trend === "up"
                              ? "text-success"
                              : stat.trend === "down"
                              ? "text-danger"
                              : "text-muted"
                          }
                          style={{ fontSize: "0.85rem" }}
                        >
                          {stat.percentage}
                        </span>
                        {stat.subtitle && (
                          <span className="text-muted ms-1" style={{ fontSize: "0.8rem" }}>
                            {stat.subtitle}
                          </span>
                        )}
                      </div>
                    </div>
                    <div
                      className="d-flex align-items-center justify-content-center rounded-circle"
                      style={{
                        width: 50,
                        height: 50,
                        backgroundColor: stat.iconBg,
                        color: stat.iconColor,
                      }}
                    >
                      {stat.icon}
                    </div>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>

        {/* Chart */}
        <Row className="mb-4">
          <Col xs={12}>
            <Card className="border-0 shadow-sm rounded-4">
              <Card.Body className="p-4">
                <div className="d-flex justify-content-between align-items-center mb-4">
                  <h5 className="fw-bold mb-0">Citas</h5>
                  <Form.Select
                    size="sm"
                    style={{ width: "auto" }}
                    value={selectedYear}
                    onChange={(e) => setSelectedYear(e.target.value)}
                  >
                    {availableYears.map((year) => (
                      <option key={year} value={year}>{year}</option>
                    ))}
                  </Form.Select>
                </div>
                <Chart
                  options={chartOptions}
                  series={chartSeries}
                  type="area"
                  height={350}
                />
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Citas Table */}
        <Row>
          <Col xs={12}>
            <Card className="border-0 shadow-sm rounded-4">
              <Card.Body className="p-4">
                <div className="d-flex justify-content-between align-items-center mb-4">
                  <h5 className="fw-bold mb-0">Citas Detalladas</h5>
                  <Form.Select
                    size="sm"
                    style={{ width: "auto" }}
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(e.target.value)}
                  >
                    {MESES.map((mes, index) => {
                      const cantidad = mesesConCitas.get(index) || 0;
                      return (
                        <option key={mes} value={mes}>
                          {mes}{cantidad > 0 ? ` (${cantidad})` : ""}
                        </option>
                      );
                    })}
                  </Form.Select>
                </div>
                <Table responsive className="text-nowrap">
                  <thead className="table-light">
                    <tr>
                      <th>Nombre del Dueño</th>
                      <th>Nombre de la Mascota</th>
                      <th>Fecha de la cita</th>
                      <th>Tipo</th>
                      <th>Raza</th>
                      <th>Estado</th>
                    </tr>
                  </thead>
                  <tbody>
                    {citasFiltradas.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="text-center text-muted py-4">
                          No hay citas para {selectedMonth} {selectedYear}
                        </td>
                      </tr>
                    ) : (
                      citasFiltradas.map((cita, index) => (
                        <tr key={index}>
                          <td>{cita.dueno}</td>
                          <td>{cita.mascota}</td>
                          <td>{cita.fecha}</td>
                          <td>{cita.tipo}</td>
                          <td>{cita.raza}</td>
                          <td>
                            <Badge
                              pill
                              bg={getEstadoBadge(cita.estado)}
                              className="px-3 py-2"
                            >
                              {cita.estado}
                            </Badge>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </Table>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </Fragment>
  );
};

export default Dashboard;
