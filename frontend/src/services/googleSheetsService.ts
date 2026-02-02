import { Producto } from "types/index";

// Backend API URL
//const API_BASE_URL = "http://localhost:8000/api";
const API_BASE_URL = "/api";
/** Make API request */
const apiRequest = async <T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> => {
  const res = await fetch(`${API_BASE_URL}${endpoint}`, {
    credentials: "include",
    ...options,
  });

  let data: any = null;

  try {
    data = await res.json();
  } catch (_) {}

  if (!res.ok) {
    throw new Error(data?.error || data?.message || "API error");
  }

  return data as T;
};

/** ========================
 * PRODUCTOS
 * ======================== */

/** Get all products (from n8n backend) */
export const getInventario = async (): Promise<Producto[]> => {
  return apiRequest<Producto[]>(`/drive/products`);
};
