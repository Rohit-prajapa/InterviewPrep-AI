import { Router } from "express";
import { body } from "express-validator";

import authMiddleware from "../middleware/authMiddleware.js";
import validate from "../middleware/validate.js";

import {
  createPreparationPlan,
  generateAIPlan,
  getPreparationPlan,
  updatePreparationPlan,
} from "../controllers/preparationController.js";

const router = Router();

router.use(authMiddleware);

router.post(
  "/",
  [
    body("targetRole")
      .trim()
      .isLength({ min: 2, max: 100 })
      .withMessage("Target role must be between 2 and 100 characters"),

    body("goals")
      .optional()
      .isArray()
      .withMessage("Goals must be an array"),

    body("weeks")
      .optional()
      .isArray()
      .withMessage("Weeks must be an array"),
  ],
  validate,
  createPreparationPlan
);

router.post("/generate", generateAIPlan);

router.get("/", getPreparationPlan);

router.put("/:id", updatePreparationPlan);

export default router;