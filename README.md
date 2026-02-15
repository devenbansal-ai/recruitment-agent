# Recruitment Agent — LLM-Powered Job Matching Assistant

## 🧠 Overview

The Recruitment Agent is an AI assistant that analyzes resumes, performs live web searches, and recommends relevant job postings.  
Built using Retrieval-Augmented Generation (RAG) and multi-tool agent orchestration.

## 📀 Demo Video

[Recruitment Agent Demo.mp4](https://drive.google.com/file/d/1idbzcktNUy_PKdGWPWJSIEc8D5B_E3HY/view?usp=drive_link)

---

## 🏗️ Architecture Diagram

```mermaid
sequenceDiagram
    autonumber

    actor User
    participant Frontend as Frontend (Next)
    participant Backend as Backend API (Node/Express)
    participant Agent as Recruitment Agent (ReAct)
    participant Tools as Tools (RAG + Resume Parser + Calendar API)

    %% --- Flow Start ---
    User->>Frontend: Upload Resume (PDF/DOCX)
    Frontend->>Backend: POST /upload
    Backend->>Tools: Parse Resume → Extract skills, experience
    Tools-->>Backend: Parsed Resume JSON
    Backend-->>Frontend: Upload Success + Parsed Data Preview

    %% --- Agent Query Flow ---
    User->>Frontend: "Find jobs relevant to my resume"
    Frontend->>Backend: POST /agent/ask { query, file }
    Backend->>Agent: Initialize ReAct chain with context

    %% --- ReAct Loop ---
    Agent->>Tools: Search relevant job postings (Web search API)
    Tools-->>Agent: List of matched jobs
    Agent->>Tools: Retrieve similar resumes / embeddings (RAG)
    Tools-->>Agent: Contextual insights
    Agent-->>Backend: Synthesized answer + reasoning steps

    %% --- Response & Display ---
    Backend-->>Frontend: Streaming response (markdown)
    Frontend->>Frontend: Render response (formatted markdown)
    User-->>Frontend: Sees explanation, matched jobs, and reasoning path

```

## 🛠️ How to run

#### Backend

- cd backend
- cp .env.example .env
- Fill in OpenAI / Pinecone / Google keys
- npm install && npm run dev

#### Frontend

- cd frontend
- cp .env.example .env.local
- Add NEXT_PUBLIC_API_URL={backend-url}
- npm install && npm run dev

## 🏗️ Key Components

| Component               | Description                                            |
| ----------------------- | ------------------------------------------------------ |
| **Embeddings Pipeline** | Upload → Chunk → Embed → Upsert to Pinecone            |
| **RAG Endpoint**        | Retrieves chunks + LLM answer with inline citations    |
| **Agent Planner**       | LLM-driven JSON planner selecting tools                |
| **Tools**               | `vector_search`, `web_search`, `calendar`              |
| **Trace Logger**        | Step-wise decision trace for replay/debug              |
| **Streaming UI**        | Client-side markdown renderer for real-time LLM output |

## 🔒 Security Notes

- Tool actions validated via actionValidator.
- API keys isolated via .env.
- Rate limiting active on backend.

## ✍️ Author

Deven Bansal
[LinkedIn](https://www.linkedin.com/in/deven-bansal/) | [Mail](mailto:deven.bansal01@gmail.com) | [GitHub](https://github.com/devenbansal-ai)
