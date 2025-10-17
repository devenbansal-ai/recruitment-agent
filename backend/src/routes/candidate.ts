import { Router } from "express";
import { uploadResume, extractProfile } from "../controllers/candidateController";
import { verifyToken } from "../middleware/authMiddleware";

const router = Router();

router.post("/upload", verifyToken, uploadResume);
router.get("/extract", verifyToken, extractProfile);

export default router;
