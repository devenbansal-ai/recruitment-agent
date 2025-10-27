# 🧠 Recruitment Agent — Backend

> AI-powered recruitment assistant combining **RAG Q&A**, **multi-tool agents**, and **traceable tool orchestration**.

---

## ⚙️ Tech Stack

| Layer               | Tools / Libraries                                            |
| ------------------- | ------------------------------------------------------------ |
| **Language**        | TypeScript (Node 20+)                                        |
| **Web Framework**   | Express                                                      |
| **LLM Integration** | OpenAI SDK (v4)                                              |
| **Vector DB**       | Pinecone / Weaviate (pluggable client)                       |
| **Embeddings**      | `text-embedding-3-small` (OpenAI)                            |
| **Agent Tools**     | Web Search (SerpAPI), Calendar (Google OAuth), Vector Search |
| **Orchestration**   | Custom planner loop + JSON trace logging                     |
| **Testing**         | Jest / Supertest                                             |
| **Deployment**      | Railway (staging) / Vercel (optional)                        |
| **CI/CD**           | GitHub Actions (lint + build)                                |

---

## 🚀 How to Run Locally

### 1️⃣ Clone Repo

```bash
git clone https://github.com/devenbansal-ai/recruitment-agent.git
cd recruitment-agent/backend
```

### 2️⃣ Install Dependencies

```bash
npm install
```

### 3️⃣ Configure Environment

Create `.env` (based on `.env.example`):

```bash
PORT=xxxx
OPENAI_API_KEY=sk-xxxx
VECTOR_DB_URL=https://your-vector-db-url
GOOGLE_CLIENT_ID=xxxx
GOOGLE_CLIENT_SECRET=xxxx
SERPAPI_KEY=xxxx
```

_(Do not commit real .env; set these in Railway → Variables tab)_

### 4️⃣ Run in Dev Mode

```bash
npm run dev
```

→ starts at `http://localhost:{PORT}`

#### Test APIs:

_(Assuming PORT = 8080)_
| Type | URL | Description | Parameters |
|------|-----|-------------|------------|
| GET | http://localhost:8080/api/pinecone-indexes | See available pinecone indexes |
| GET | http://localhost:8080/api/web-search | Call web search api |
| GET | http://localhost:8080/api/google-auth/generate-code | Generate google auth code |
| GET | http://localhost:8080/api/calendar/events | List all calendar events |
| POST | http://localhost:8080/api/agent | Call an agent | prompt |
| GET | http://localhost:8080/api/agent/{request-id}/steps | Retreive Agent Logs |

### 5️⃣ Run Tests

```bash
npm run test
```

### 6️⃣ Build for Production

```bash
npm run build
npm start
```

---

## 🌐 Environment Variables

| Key                                         | Purpose                      |
| ------------------------------------------- | ---------------------------- |
| `OPENAI_API_KEY`                            | LLM embeddings + generation  |
| `VECTOR_DB_URL`                             | Vector store endpoint        |
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` | Calendar tool OAuth          |
| `SERPAPI_KEY`                               | Web search tool API access   |
| `NODE_ENV`                                  | `development` / `production` |
| `PORT`                                      | Express server port          |

---

## 🧩 Core Modules

| Module                       | Description                                             |
| ---------------------------- | ------------------------------------------------------- |
| `/src/routes/ingest.ts`      | File upload → embed → vector upsert → query endpoint    |
| `/src/routes/agent.ts`       | Agent loop (planner + action executor + trace) endpoint |
| `/src/agents/tools/`         | Tool implementations (web search, calendar, vector)     |
| `/src/agents/traceLogger.ts` | JSON trace per request (logging + replay)               |
| `/src/tests/`                | Unit and E2E tests                                      |

---

## 📦 Deployment (Production / Staging)

### Railway (Recommended)

1. Link GitHub repo → select root `backend/`
2. In Variables tab, add keys from `.env.example`
3. Railway auto-builds and serves Express app

### Verify

```
curl https://<your-project>.up.railway.app/api/test-llm
```
