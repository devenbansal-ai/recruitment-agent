import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import authRoutes from "./routes/auth";
import candidateRoutes from "./routes/candidate";
import jobRoutes from "./routes/job";
import testLLMStreamRoutes from "./routes/testLLMStream";
import testLLMRoutes from "./routes/testLLM";

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/candidate", candidateRoutes);
app.use("/api/job", jobRoutes);
app.use("/api", testLLMStreamRoutes);
app.use("/api", testLLMRoutes);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Backend running on port ${PORT}`));
