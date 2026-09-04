import { Router } from "express";
import { body } from "express-validator";

import authMiddleware from "../middleware/authMiddleware.js";
import validate from "../middleware/validate.js";

import {
  createInterview,
  getInterviews,
  getInterviewById,
  updateInterview,
  completeInterview,
} from "../controllers/interviewController.js";

const router = Router();

router.use(authMiddleware);

router.post(
  "/",
  [
    body("role")
      .trim()
      .isLength({ min: 2, max: 100 })
      .withMessage("Role must be between 2 and 100 characters"),

    body("mode")
      .optional()
      .isIn(["technical", "hr", "behavioral", "mixed"])
      .withMessage("Invalid interview mode"),

    body("difficulty")
      .optional()
      .isIn(["easy", "medium", "hard"])
      .withMessage("Invalid difficulty"),

    body("questionCount")
      .optional()
      .isInt({ min: 1, max: 50 })
      .withMessage("Question count must be between 1 and 50"),
  ],
  validate,
  createInterview
);

router.get("/", getInterviews);

router.get("/:id", getInterviewById);

router.put("/:id", updateInterview);

router.patch("/:id/complete", completeInterview);

export default router;