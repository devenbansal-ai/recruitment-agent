# 🧠 Recruitment Agent — Frontend

> AI-powered Recruitment Agent demo combining Retrieval-Augmented Generation and an agentic tool orchestration layer. Implements **RAG ingestion**, **embeddings**, **Pinecone vector store**, **LLM planner + executor**, and **tool connectors (web search, Google Calendar)**.

### 1. Build locally

npm run build

### 2. Set backend endpoint

NEXT_PUBLIC_API_URL=https://[your-backend-on-railway].up.railway.app

### 3. Deploy on Vercel (CLI)

npm i -g vercel
vercel --prod
