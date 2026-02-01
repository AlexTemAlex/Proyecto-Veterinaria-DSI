const API_BASE_URL = "http://localhost:3001/api";

export interface Producto {
  codigo: string;
  producto: string;
  categoria: string;
  subcategoria: string;
  presentacion: string;
  stock: number;
}

export interface Cita {
  dueno: string;
  mascota: string;
  fecha: string;
  tipo: string;
  raza: string;
  estado: string;
}

export interface CitasMensuales {
  mes: string;
  cantidad: number;
}

export interface GoogleDriveFolder {
  id: string;
  name: string;
  fileCount?: number;
}

export interface GoogleDriveFile {
  id: string;
  name: string;
  createdTime: string;
  modifiedTime: string;
}

export interface DashboardData {
  totalCitas: number;
  totalInventario: number;
  totalDocumentos: number;
  stockBajo: number;
  docsEsteMes: number;
  docsMesPasado: number;
  citasPorMes: CitasMensuales[];
  citasDetalladas: Cita[];
}

/**
 * Obtener total de productos del inventario (Google Sheets)
 */
export const fetchInventario = async (): Promise<Producto[]> => {
  const response = await fetch(`${API_BASE_URL}/inventario`);
  if (!response.ok) throw new Error("Error al obtener inventario");
  return response.json();
};

/**
 * Obtener carpetas y archivos de Google Drive con fechas
 */
export const fetchDocumentosDetallado = async (): Promise<{
  total: number;
  esteMes: number;
  mesPasado: number;
}> => {
  const response = await fetch(`${API_BASE_URL}/google-drive/folders`);
  if (!response.ok) throw new Error("Error al obtener documentos");
  const folders: GoogleDriveFolder[] = await response.json();

  const now = new Date();
  const mesActual = now.getMonth();
  const yearActual = now.getFullYear();
  const mesAnterior = mesActual === 0 ? 11 : mesActual - 1;
  const yearAnterior = mesActual === 0 ? yearActual - 1 : yearActual;

  let total = folders.length;
  let esteMes = 0;
  let mesPasado = 0;

  // Obtener archivos de cada carpeta para contar por fecha
  for (const folder of folders) {
    total += folder.fileCount || 0;
    try {
      const filesRes = await fetch(
        `${API_BASE_URL}/google-drive/folders/${folder.id}/files`
      );
      if (filesRes.ok) {
        const files: GoogleDriveFile[] = await filesRes.json();
        for (const file of files) {
          const created = new Date(file.createdTime);
          if (
            created.getMonth() === mesActual &&
            created.getFullYear() === yearActual
          ) {
            esteMes++;
          } else if (
            created.getMonth() === mesAnterior &&
            created.getFullYear() === yearAnterior
          ) {
            mesPasado++;
          }
        }
      }
    } catch {
      // Ignorar errores de carpetas individuales
    }
  }

  return { total, esteMes, mesPasado };
};

/**
 * Obtener datos de citas desde Google Sheets
 * Requiere endpoint: GET /api/citas
 */
export const fetchCitas = async (): Promise<Cita[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/citas`);
    if (!response.ok) throw new Error("Error al obtener citas");
    return response.json();
  } catch {
    return [];
  }
};

const STOCK_BAJO_LIMITE = 10;

/**
 * Obtener todos los datos del dashboard
 */
export const fetchDashboardData = async (): Promise<DashboardData> => {
  const meses = [
    "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
    "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
  ];

  const [inventario, docsData, citas] = await Promise.allSettled([
    fetchInventario(),
    fetchDocumentosDetallado(),
    fetchCitas(),
  ]);

  const productos = inventario.status === "fulfilled" ? inventario.value : [];
  const docs = docsData.status === "fulfilled"
    ? docsData.value
    : { total: 0, esteMes: 0, mesPasado: 0 };
  const citasList = citas.status === "fulfilled" ? citas.value : [];

  const stockBajo = productos.filter((p) => p.stock < STOCK_BAJO_LIMITE).length;

  // Agrupar citas por mes
  const citasPorMes: CitasMensuales[] = meses.map((mes, index) => {
    const cantidad = citasList.filter((c) => {
      const fecha = new Date(c.fecha);
      return fecha.getMonth() === index;
    }).length;
    return { mes, cantidad };
  });

  return {
    totalCitas: citasList.length,
    totalInventario: productos.length,
    totalDocumentos: docs.total,
    stockBajo,
    docsEsteMes: docs.esteMes,
    docsMesPasado: docs.mesPasado,
    citasPorMes,
    citasDetalladas: citasList,
  };
};
