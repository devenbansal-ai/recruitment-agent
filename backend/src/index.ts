import dotenv from "dotenv";
if (process.env.NODE_ENV !== "production") {
  dotenv.config();
}

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
import googleAuthRoutes from "./routes/googleAuth";
import Logger from "./utils/logger";
import { LOGGER_TAGS } from "./utils/tags";

Logger.log(LOGGER_TAGS.STARTING_BACKEND);

const app = express();
app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/candidate", candidateRoutes);
app.use("/api/job", jobRoutes);
app.use("/api", testLLMStreamRoutes);
app.use("/api", testLLMRoutes);
app.use("/api", testVectorRoutes);
app.use("/api/ingest", ingestRoutes);
app.use("/api/agent", agentRoutes);
app.use("/api", googleAuthRoutes);
app.use("/traces", express.static(path.resolve(process.cwd(), "traces")));

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Backend running on port ${PORT}`));
