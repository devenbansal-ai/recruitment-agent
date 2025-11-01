import dotenv from "dotenv";
import Logger from "./utils/logger";
if (process.env.NODE_ENV !== "production") {
  dotenv.config();
}
Logger.log("OpenAI Key prefix:", process.env.OPENAI_API_KEY?.slice(0, 4));

import express from "express";
import path from "path";
import cors from "cors";
import authRoutes from "./routes/auth";
import candidateRoutes from "./routes/candidate";
import jobRoutes from "./routes/job";
import testLLMStreamRoutes from "./routes/testLLMStream";
import testLLMRoutes from "./routes/testLLM";
import testVectorRoutes from "./routes/testVector";
import ingestRoutes from "./routes/ingest";
import agentRoutes from "./routes/agent";
import agentReplayRoutes from "./routes/agentReplay";
import vectorRoutes from "./routes/vector";
import ragRoutes from "./routes/rag";
import googleAuthRoutes from "./routes/googleAuth";
import webSearchRoutes from "./routes/webSearch";
import calendarRoutes from "./routes/calendar";
import uploadRoutes from "./routes/upload";
import { LOGGER_TAGS } from "./utils/tags";
import { logRequestCost } from "./utils/requestLogger";

Logger.log(LOGGER_TAGS.STARTING_BACKEND);

const app = express();
app.use(cors());
app.use(express.json());
app.use(logRequestCost);

app.use("/api/auth", authRoutes);
app.use("/api/candidate", candidateRoutes);
app.use("/api/job", jobRoutes);
app.use("/api/ingest", ingestRoutes);
app.use("/api/agent", agentRoutes);
app.use("/api/agent", agentReplayRoutes);
app.use("/api/google-auth", googleAuthRoutes);
app.use("/api/rag", ragRoutes);
app.use("/api/vector", vectorRoutes);
app.use("/api/web-search", webSearchRoutes);
app.use("/api/calendar", calendarRoutes);
app.use("/api/upload", uploadRoutes);

app.use("/api", testLLMStreamRoutes);
app.use("/api", testLLMRoutes);
app.use("/api", testVectorRoutes);

app.use("/traces", express.static(path.resolve(process.cwd(), "traces")));

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`Backend running on port ${PORT}`));
