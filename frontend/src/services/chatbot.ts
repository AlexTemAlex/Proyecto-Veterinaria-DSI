//const API_BASE_URL = "http://localhost:8000/api";
const API_BASE_URL = "/api";

interface ChatbotResponse {
  output?: string;
  message?: string;
}

export const sendChatbot = async (
  payload: {
    user_id: string;
    type_message: string;
    text_message: string;
    date_time: string;
  }
): Promise<ChatbotResponse> => {
  const res = await fetch(`${API_BASE_URL}/web/chatbot`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(payload),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data?.error || "API error");
  }

  return data;
};
