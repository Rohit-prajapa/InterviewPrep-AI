import { Router } from "express";
import { body } from "express-validator";

import authMiddleware from "../middleware/authMiddleware.js";
import validate from "../middleware/validate.js";

import {
  createQuestion,
  getQuestions,
  updateQuestion,
  deleteQuestion,
  togglePin,
} from "../controllers/questionController.js";

const router = Router();

router.use(authMiddleware);

router.get("/", getQuestions);

router.post(
  "/",
  [
    body("question")
      .trim()
      .isLength({ min: 5, max: 5000 })
      .withMessage("Question must be between 5 and 5000 characters"),

    body("category")
      .trim()
      .notEmpty()
      .withMessage("Category is required"),

    body("difficulty")
      .optional()
      .isIn(["easy", "medium", "hard"])
      .withMessage("Invalid difficulty"),

    body("answer")
      .optional()
      .isLength({ max: 10000 })
      .withMessage("Answer cannot exceed 10000 characters"),

    body("explanation")
      .optional()
      .isLength({ max: 10000 })
      .withMessage("Explanation cannot exceed 10000 characters"),
  ],
  validate,
  createQuestion
);

router.put(
  "/:id",
  [
    body("question")
      .optional()
      .trim()
      .isLength({ min: 5, max: 5000 })
      .withMessage("Question must be between 5 and 5000 characters"),

    body("category")
      .optional()
      .trim()
      .notEmpty()
      .withMessage("Category cannot be empty"),

    body("difficulty")
      .optional()
      .isIn(["easy", "medium", "hard"])
      .withMessage("Invalid difficulty"),

    body("answer")
      .optional()
      .isLength({ max: 10000 })
      .withMessage("Answer cannot exceed 10000 characters"),

    body("explanation")
      .optional()
      .isLength({ max: 10000 })
      .withMessage("Explanation cannot exceed 10000 characters"),
  ],
  validate,
  updateQuestion
);

router.delete("/:id", deleteQuestion);

router.patch("/:id/pin", togglePin);

export default router;