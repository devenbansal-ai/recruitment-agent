## 🏗️ Architecture Overview

```
               ┌──────────────────────────────────────────┐
               │                Frontend                  │
               │   React + Vercel UI                      │
               │   - Chat + file upload + trace viewer    │
               └──────────────────────────────────────────┘
                                │
                                ▼
┌───────────────────────────────────────────────────────────────────────────┐
│                             Backend (Node + Express + TS)                 │
│  ┌────────────────────────────────┐      ┌──────────────────────────────┐ │
│  │  RAG Pipeline                  │      │  Agent Orchestration         │ │
│  │  • Upload docs → chunk → embed │      | • Planner → Executor Loop    │ │
│  │  • Upsert → Vector DB          │      | • Tool Registry + Validator  │ │
│  │  • Vector search → LLM answer  │      | • Trace Logger (JSON per req)│ │
│  └────────────────────────────────┘      └──────────────────────────────┘ │
│              │                                   │                        │
│              ▼                                   ▼                        │
│  ┌──────────────────────┐       ┌───────────────────────────────────────┐ │
│  │ Embeddings Provider  │       │ External Tools (Connectors)           │ │
│  │  (OpenAI / Ollama)   │       │  - Web Search (SerpAPI)               │ │
│  │                      │       │  - Calendar (Google OAuth API)        │ │
│  └──────────────────────┘       │  - Vector Search (Turso / Pinecone)   │ │
│                                 └───────────────────────────────────────┘ │
└───────────────────────────────────────────────────────────────────────────┘
                                │
                                ▼
                        🗄️ PostgreSQL / Vector DB
```
