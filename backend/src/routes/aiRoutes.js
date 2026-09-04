import { Router } from "express";
import { body } from "express-validator";

import authMiddleware from "../middleware/authMiddleware.js";
import validate from "../middleware/validate.js";

import {
  generateQuestions,
  evaluateCandidateAnswer,
  generateAdaptive,
} from "../controllers/aiController.js";

const router = Router();

router.use(authMiddleware);

router.post(
  "/generate-questions",
  [
    body("role")
      .trim()
      .isLength({ min: 2, max: 100 })
      .withMessage("Role must be between 2 and 100 characters"),

    body("difficulty")
      .optional()
      .isIn(["easy", "medium", "hard"])
      .withMessage("Invalid difficulty"),

    body("mode")
      .optional()
      .isIn(["technical", "hr", "behavioral", "mixed"])
      .withMessage("Invalid interview mode"),

    body("questionCount")
      .optional()
      .isInt({ min: 1, max: 50 })
      .withMessage("Question count must be between 1 and 50"),
  ],
  validate,
  generateQuestions
);

router.post(
  "/evaluate-answer",
  [
    body("question")
      .trim()
      .notEmpty()
      .withMessage("Question is required"),

    body("answer")
      .trim()
      .isLength({ min: 2, max: 10000 })
      .withMessage("Answer must be between 2 and 10000 characters"),

    body("role")
      .trim()
      .notEmpty()
      .withMessage("Role is required"),

    body("mode")
      .optional()
      .isIn(["technical", "hr", "behavioral", "mixed"])
      .withMessage("Invalid interview mode"),
  ],
  validate,
  evaluateCandidateAnswer
);

router.post(
  "/adaptive-question",
  [
    body("role")
      .trim()
      .notEmpty()
      .withMessage("Role is required"),

    body("previousQuestion")
      .trim()
      .notEmpty()
      .withMessage("Previous question is required"),

    body("previousAnswer")
      .trim()
      .notEmpty()
      .withMessage("Previous answer is required"),

    body("previousScore")
      .isFloat({ min: 0, max: 100 })
      .withMessage("Previous score must be between 0 and 100"),

    body("mode")
      .optional()
      .isIn(["technical", "hr", "behavioral", "mixed"])
      .withMessage("Invalid interview mode"),
  ],
  validate,
  generateAdaptive
);

export default router;