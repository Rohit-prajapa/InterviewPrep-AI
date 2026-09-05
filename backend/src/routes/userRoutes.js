import { Router } from "express";

import {
  getProfile,
  updateProfile,
} from "../controllers/userController.js";

import authMiddleware from "../middleware/authMiddleware.js";

const router = Router();

// Get logged-in user's profile
router.get(
  "/profile",
  authMiddleware,
  getProfile
);

// Update logged-in user's profile
router.put(
  "/profile",
  authMiddleware,
  updateProfile
);

export default router;