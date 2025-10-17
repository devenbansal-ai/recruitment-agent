import { Router } from "express";
import { login, signup, getProfile } from "../controllers/authController";
import { verifyToken } from "../middleware/authMiddleware";

const router = Router();

router.post("/login", login);
router.post("/signup", signup);
router.get("/me", verifyToken, getProfile);

export default router;
