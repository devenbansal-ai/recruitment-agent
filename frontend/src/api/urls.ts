const LOCAL_API_URL = "http://localhost:8080/api";
const NEXT_PUBLIC_API_URL = process.env.NEXT_PUBLIC_API_URL ?? LOCAL_API_URL;

const API_URL =
  process.env.NEXT_PUBLIC_SERVER_TYPE === "local"
    ? LOCAL_API_URL
    : NEXT_PUBLIC_API_URL;

export const API_URLS = {
  UPLOAD: `${API_URL}/upload`,
  AGENT_ASK: `${API_URL}/agent/ask`,
  AGENT_RETRY: `${API_URL}/agent/retry`,
  RAG: `${API_URL}/rag`,
  RAG_STREAM: `${API_URL}/rag/stream`,
};
