# 🧠 Recruitment Agent — Backend

> AI-powered Recruitment Agent demo combining Retrieval-Augmented Generation and an agentic tool orchestration layer. Implements **RAG ingestion**, **embeddings**, **Pinecone vector store**, **LLM planner + executor**, and **tool connectors (web search, Google Calendar)**.

---

## ⚙️ Tech Stack

| Layer               | Tools / Libraries                                            |
| ------------------- | ------------------------------------------------------------ |
| **Language**        | TypeScript (Node 20+)                                        |
| **Web Framework**   | Express                                                      |
| **LLM Integration** | OpenAI SDK (v4)                                              |
| **Vector DB**       | Pinecone (pluggable client)                                  |
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
| POST | http://localhost:8080/api/agent | Call an agent | query |
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
| `GOOGLE_REFRESH_TOKEN`                      | Refresh token for calendar   |
| `NODE_ENV`                                  | `development` / `production` |
| `PORT`                                      | Express server port          |

---

## 🧩 Core Modules

| Module                        | Description                                                 |
| ----------------------------- | ----------------------------------------------------------- |
| `/src/routes/ingest.ts`       | File upload → embed → vector upsert → query endpoint        |
| `/src/routes/rag.ts`          | RAG endpoint (query → embed → vector DB query → llm)        |
| `/src/routes/agent.ts`        | Agent loop (LLM planner + action executor + trace) endpoint |
| `/src/agents/tools/`          | Tool implementations (web search, calendar, vector)         |
| `/src/utils/traceLogger.ts`   | JSON trace per request (logging + replay)                   |
| `/src/utils/requestLogger.ts` | Log json request details                                    |
| `/src/utils/costTracker.ts`   | Log LLM runnning cost for the request                       |
| `/src/tests/`                 | Unit and E2E tests                                          |

---

## Tradeoffs

- **LLM planner (iterative)** — flexible and robust, but increases latency and cost (multiple LLM calls). Tradeoff between reliability and cost.
- **Server model** (Express + Node) — easier local debugging and long-running processes (vector DB connections), but costs more than fully serverless for low traffic.
- **In-memory cache** — fast and cheap for demo, not resilient across instances. Production must use Redis for shared cache.
- **Trace files** — stored locally for dev; must move to DB for scale and searchability.

---

## Limitations

- Single-user calendar handling assumed via one `GOOGLE_REFRESH_TOKEN`. Multi-user OAuth not implemented.
- Planner currently lightly constrained by schema; adversarial prompts may still produce malformed outputs. Defensive parsing & schema validation included.
- Cost and latency depend on OpenAI model selection and Pinecone region. Expect variability.
- No role-based auth or rate limiting in demo (add before public exposure).

## Measured cost & latency

#### Development

| Scenario                    | Avg latency |  p95 | Avg tokens | Estimated avg cost (USD) |
| --------------------------- | ----------: | ---: | ---------: | -----------------------: |
| Cold RAG request (no cache) |        7.3s | 9.1s |        256 |                $0.000131 |
| Warm cache (cache hit)      |        17ms | 32ms |          0 |                  $0.0000 |

#### Staging (Railway)

| Scenario                    | Avg latency |   p95 | Avg tokens | Estimated avg cost (USD) |
| --------------------------- | ----------: | ----: | ---------: | -----------------------: |
| Cold RAG request (no cache) |        7.9s | 10.2s |        243 |                $0.000146 |
| Warm cache (cache hit)      |       131ms | 203ms |          0 |                  $0.0000 |

## 📦 Deployment (Production / Staging)

### Railway (Recommended)

1. Link GitHub repo → select root `backend/`
2. In Variables tab, add keys from `.env.example`
3. Railway auto-builds and serves Express app

### Verify

```
curl https://<your-project>.up.railway.app/api/test-llm
```

## 🛡️ Security & Safety Guardrails

### Environment Protection

| Concern             | Mitigation                                                                                                                |
| ------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| API Keys exposure   | Never commit `.env` files. Use Railway/Vercel Environment Variables UI for `OPENAI_API_KEY`, `GOOGLE_CLIENT_SECRET`, etc. |
| Unauthorized access | All backend endpoints behind `authMiddleware` stub → replace with JWT/OAuth before production.                            |
| Sensitive logs      | Strip PII and tokens from logs before printing.                                                                           |
| Dependency vulns    | Run `npm audit --production` weekly. Use GitHub Dependabot.                                                               |

### Agent safety controls

| Category             | Implementation                                                 | Description                                                                                  |
| -------------------- | -------------------------------------------------------------- | -------------------------------------------------------------------------------------------- |
| **Action Validator** | `src/agent/actionValidator.ts`                                 | Rejects destructive actions (e.g. file delete, network write) unless explicitly whitelisted. |
| **Tool Whitelist**   | `ALLOWED_TOOLS` array in `.env`                                | Only listed tools can be invoked by planner. Non-listed → blocked.                           |
| **Rate Limiter**     | `express-rate-limit`                                           | Prevents flooding of LLM calls.                                                              |
| **Concurrency Cap**  | `p-limit(5)`                                                   | Ensures ≤ 5 LLM calls at once.                                                               |
| **LLM Prompt Guard** | Planner prompt contains: “Never execute code or modify files.” | Reduces prompt-injection risk.                                                               |

### How to Disable a Tool

**Option A** - Within code:
Navigate to the specific tool in src/agent/tools/\* and set the return value for isEnabled to false

**Option B** - Disable at runtime:
In .env:
DISABLED_TOOLS=calendar,web_search

### Future Hardening Roadmap

- Add JWT auth middleware (Authorization: Bearer <token>).

- Use Redis-backed rate limiting for multi-instance deploy.

- Add CSP headers and HTTPS redirect middleware.

- Integrate OpenAI “response moderation” endpoint for content safety.
