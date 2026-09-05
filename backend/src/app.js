import express from "express";
import cors from "cors";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import swaggerUi from "swagger-ui-express";
import morgan from "morgan";

import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import interviewRoutes from "./routes/interviewRoutes.js";
import questionRoutes from "./routes/questionRoutes.js";
import evaluationRoutes from "./routes/evaluationRoutes.js";
import analyticsRoutes from "./routes/analyticsRoutes.js";
import preparationRoutes from "./routes/preparationRoutes.js";
import aiRoutes from "./routes/aiRoutes.js";

import swaggerDocument from "./config/swagger.js";
import errorMiddleware from "./middleware/errorMiddleware.js";

const app = express();

// =====================================================
// Security
// =====================================================

app.disable("x-powered-by");

app.use(
  helmet({
    crossOriginResourcePolicy: false,
  })
);

// =====================================================
// Logging
// =====================================================

app.use(morgan("dev"));

// =====================================================
// CORS
// =====================================================

const allowedOrigin =
  process.env.CLIENT_URL || "http://localhost:5173";

app.use(
  cors({
    origin: allowedOrigin,
    methods: [
      "GET",
      "POST",
      "PUT",
      "PATCH",
      "DELETE",
      "OPTIONS",
    ],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
    ],
    credentials: true,
  })
);

// =====================================================
// Body Parser
// =====================================================

app.use(
  express.json({
    limit: "1mb",
  })
);

// =====================================================
// Global Rate Limiting
// =====================================================

const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 200,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: {
    success: false,
    message:
      "Too many requests. Please try again later.",
  },
});

app.use(globalLimiter);

// =====================================================
// Health Check
// =====================================================

app.get("/api/health", (_req, res) => {
  res.status(200).json({
    success: true,
    message: "InterviewPrep AI API is running",
  });
});

// =====================================================
// Swagger API Documentation
// =====================================================

app.use(
  "/api-docs",
  swaggerUi.serve,
  swaggerUi.setup(swaggerDocument)
);

// =====================================================
// API Routes
// =====================================================

app.use("/api/auth", authRoutes);

app.use("/api/users", userRoutes);

app.use("/api/interviews", interviewRoutes);

app.use("/api/questions", questionRoutes);

app.use("/api/evaluations", evaluationRoutes);

app.use("/api/analytics", analyticsRoutes);

app.use("/api/preparation", preparationRoutes);

app.use("/api/ai", aiRoutes);

// =====================================================
// Global Error Handler
// =====================================================

app.use(errorMiddleware);

export default app;