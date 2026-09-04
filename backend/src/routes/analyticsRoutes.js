import { Router } from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import { getAnalytics } from "../controllers/analyticsController.js";

const router = Router();

router.use(authMiddleware);

router.get("/", getAnalytics);

export default router;