import express from "express";
import cors from "cors";
import rateLimit from "express-rate-limit";
import swaggerUi from "swagger-ui-express";
import morgan from "morgan";

import authRoutes from "./routes/authRoutes.js";
import interviewRoutes from "./routes/interviewRoutes.js";
import questionRoutes from "./routes/questionRoutes.js";
import evaluationRoutes from "./routes/evaluationRoutes.js";
import analyticsRoutes from "./routes/analyticsRoutes.js";
import preparationRoutes from "./routes/preparationRoutes.js";
import aiRoutes from "./routes/aiRoutes.js";

import swaggerDocument from "./config/swagger.js";
import errorMiddleware from "./middleware/errorMiddleware.js";

const app = express();

app.use(morgan("dev"));

app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
  })
);

app.use(express.json());

app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 200,
  })
);

app.get("/api/health", (_req, res) => {
  res.json({
    success: true,
    message: "InterviewPrep AI API is running",
  });
});

app.use(
  "/api-docs",
  swaggerUi.serve,
  swaggerUi.setup(swaggerDocument)
);

app.use("/api/auth", authRoutes);
app.use("/api/interviews", interviewRoutes);
app.use("/api/questions", questionRoutes);
app.use("/api/evaluations", evaluationRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/preparation", preparationRoutes);
app.use("/api/ai", aiRoutes);

app.use(errorMiddleware);

export default app;