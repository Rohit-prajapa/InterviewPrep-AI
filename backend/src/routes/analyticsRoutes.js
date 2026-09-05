import { Router } from "express";

import authMiddleware from "../middleware/authMiddleware.js";
import { getAnalytics } from "../controllers/analyticsController.js";

const router = Router();

// Protect all analytics routes
router.use(authMiddleware);

// GET /api/analytics
router.get("/", getAnalytics);

export default router;