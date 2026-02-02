//const API_BASE_URL = "http://localhost:8000/api";
const API_BASE_URL = "/api";
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

/* ================= NORMALIZADOR ================= */
const normalizeProductos = (raw: any): Producto[] => {
  const data = Array.isArray(raw?.products) ? raw.products : [];

  return data.map((item: any) => ({
    codigo: item["Código"] ?? "",
    producto: item["Producto"] ?? "",
    categoria: item["Categoría"] ?? "",
    subcategoria: item["Subcategoría"] ?? "",
    presentacion: item["Presentación"] ?? "",
    stock: Number(
      item["Stock"] ??
      item["Stock Mínimo"] ??
      item["Stock_Minimo"]
    ) || 0,
  }));
};

/* ================= INVENTARIO ================= */
export const fetchInventario = async (): Promise<Producto[]> => {
  const response = await fetch(`${API_BASE_URL}/drive/products`, {
    headers: { "Accept": "application/json" },
  });

  if (!response.ok) {
    const text = await response.text();
    console.error("Respuesta backend:", text);
    throw new Error("Error al obtener inventario");
  }
  
  const raw = await response.json();
  const nor = normalizeProductos(raw);
  return nor;
};

/* ================= DOCUMENTOS ================= */
export const fetchDocumentosDetallado = async (): Promise<{
  total: number;
  esteMes: number;
  mesPasado: number;
}> => {
  const response = await fetch(`${API_BASE_URL}/drive/folders`);
  if (!response.ok) throw new Error("Error al obtener documentos");

  const raw = await response.json();

  const folders: GoogleDriveFolder[] = Array.isArray(raw)
    ? raw
    : raw.carpetas || raw.folders || [];

  const now = new Date();
  const mesActual = now.getMonth();
  const yearActual = now.getFullYear();
  const mesAnterior = mesActual === 0 ? 11 : mesActual - 1;
  const yearAnterior = mesActual === 0 ? yearActual - 1 : yearActual;

  let total = 0;
  let esteMes = 0;
  let mesPasado = 0;

  for (const folder of folders) {
    try {
      const filesRes = await fetch(
        `${API_BASE_URL}/drive/folders/${folder.id}/files`
      );

      if (!filesRes.ok) continue;

      const rawFiles = await filesRes.json();

      const files: GoogleDriveFile[] = Array.isArray(rawFiles)
        ? rawFiles
        : rawFiles.archivos || rawFiles.files || [];

      total += files.length; // ✅ contar solo archivos reales

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
    } catch (e) {
      console.error("Error leyendo carpeta", folder.id, e);
    }
  }

  return { total, esteMes, mesPasado };
};

/* ================= CITAS ================= */
export const fetchCitas = async (): Promise<Cita[]> => { 
  try {
    const response = await fetch(`${API_BASE_URL}/citas`);
    if (!response.ok) throw new Error("Error al obtener citas");

    const raw = await response.json();

    if (Array.isArray(raw)) return raw;

    if (Array.isArray(raw.citas)) return raw.citas;

    if (Array.isArray(raw.data)) return raw.data;

    return [];
  } catch (e) {
    console.error("Error fetchCitas:", e);
    return [];
  }
};

/* ================= DASHBOARD ================= */
const STOCK_BAJO_LIMITE = 10;

export const fetchDashboardData = async (): Promise<DashboardData> => {
  const meses = [
    "Enero","Febrero","Marzo","Abril","Mayo","Junio",
    "Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre",
  ];

  const [inventario, docsData, citas] = await Promise.allSettled([
    fetchInventario(),
    fetchDocumentosDetallado(),
    fetchCitas(),
  ]);

  const productos = inventario.status === "fulfilled" ? inventario.value : [];
  const docs =
    docsData.status === "fulfilled"
      ? docsData.value
      : { total: 0, esteMes: 0, mesPasado: 0 };

  const citasList = citas.status === "fulfilled" ? citas.value : [];

  const stockBajo = productos.filter((p) => p.stock < STOCK_BAJO_LIMITE).length;

  const citasPorMes: CitasMensuales[] = meses.map((mes, index) => ({
    mes,
    cantidad: citasList.filter((c) => new Date(c.fecha).getMonth() === index).length,
  }));

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
