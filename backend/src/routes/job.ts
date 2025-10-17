import { Router } from "express";
import { getJobs, rankFit } from "../controllers/jobController";
import { verifyToken } from "../middleware/authMiddleware";

const router = Router();

router.get("/", verifyToken, getJobs);
router.post("/rank", verifyToken, rankFit);

export default router;
