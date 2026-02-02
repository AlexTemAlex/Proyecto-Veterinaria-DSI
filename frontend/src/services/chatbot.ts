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

/** Chatbot */
export const sendChatbot = (mensaje: string) =>
  apiRequest<{ respuesta: string }>("/chatbot", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ mensaje }),
  });

