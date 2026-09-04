import { Router } from "express";
import { body } from "express-validator";

import {
  register,
  login,
  getMe,
  logout,
} from "../controllers/authController.js";

import authMiddleware from "../middleware/authMiddleware.js";
import validate from "../middleware/validate.js";

const router = Router();

router.post(
  "/register",
  [
    body("name")
      .trim()
      .isLength({ min: 2, max: 50 })
      .withMessage("Name must be between 2 and 50 characters"),

    body("email")
      .trim()
      .isEmail()
      .withMessage("Please enter a valid email"),

    body("password")
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters"),
  ],
  validate,
  register
);

router.post(
  "/login",
  [
    body("email")
      .trim()
      .isEmail()
      .withMessage("Please enter a valid email"),

    body("password")
      .notEmpty()
      .withMessage("Password is required"),
  ],
  validate,
  login
);

router.get("/me", authMiddleware, getMe);

router.post("/logout", logout);

export default router;