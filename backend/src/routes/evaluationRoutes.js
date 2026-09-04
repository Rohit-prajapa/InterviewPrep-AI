import { Router } from "express";
import { body } from "express-validator";

import authMiddleware from "../middleware/authMiddleware.js";
import validate from "../middleware/validate.js";

import {
  createEvaluation,
  getEvaluations,
  getInterviewEvaluations,
  getEvaluationById,
} from "../controllers/evaluationController.js";

const router = Router();

router.use(authMiddleware);

router.post(
  "/",
  [
    body("interview")
      .notEmpty()
      .withMessage("Interview ID is required"),

    body("question")
      .trim()
      .isLength({ min: 5, max: 5000 })
      .withMessage("Question must be between 5 and 5000 characters"),

    body("answer")
      .trim()
      .isLength({ min: 2, max: 10000 })
      .withMessage("Answer must be between 2 and 10000 characters"),

    body("technicalAccuracy")
      .optional()
      .isFloat({ min: 0, max: 100 })
      .withMessage("Technical accuracy must be between 0 and 100"),

    body("completeness")
      .optional()
      .isFloat({ min: 0, max: 100 })
      .withMessage("Completeness must be between 0 and 100"),

    body("communication")
      .optional()
      .isFloat({ min: 0, max: 100 })
      .withMessage("Communication must be between 0 and 100"),

    body("confidence")
      .optional()
      .isFloat({ min: 0, max: 100 })
      .withMessage("Confidence must be between 0 and 100"),
  ],
  validate,
  createEvaluation
);

router.get("/", getEvaluations);

router.get(
  "/interview/:interviewId",
  getInterviewEvaluations
);

router.get("/:id", getEvaluationById);

export default router;