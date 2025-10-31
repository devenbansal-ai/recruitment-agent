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
│  │  • Upload docs → chunk → embed │      | • Planner → Execute.         │ │
│  │  • Upsert → Vector DB          │      | • Tool Registry + Validator  │ │
│  │  • Vector search → LLM answer  │      | • Repeat till final_answer   │ │
│  │                                │      | • Trace Logger (JSON per req)│ │
│  └────────────────────────────────┘      └──────────────────────────────┘ │
│              │                                   │                        │
│              ▼                                   ▼                        │
│  ┌──────────────────────┐       ┌───────────────────────────────────────┐ │
│  │ Embeddings Provider  │       │ External Tools (Connectors)           │ │
│  │  (OpenAI)            │       │  - Web Search (SerpAPI)               │ │
│  │                      │       │  - Calendar (Google OAuth API)        │ │
│  └──────────────────────┘       │  - Vector Search (Pinecone)           │ │
│                                 └───────────────────────────────────────┘ │
└───────────────────────────────────────────────────────────────────────────┘
                                │
                                ▼
                        🗄️ PostgreSQL / Vector DB
```
