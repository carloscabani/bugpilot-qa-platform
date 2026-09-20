import express from "express";
import cors from "cors";
import testCaseRoutes from "./routes/test-case.routes"; 
import testRunRoutes from "./routes/test-run.routes";

import { pool } from "./config/database";

import userRoutes from "./routes/user.routes";
import authRoutes from "./routes/auth.routes";
import projectRoutes from "./routes/project.routes";
import bugRoutes from "./routes/bug.routes";

const app = express();

// Global middleware
app.use(cors());
app.use(express.json());

// Health check
app.get("/api/health", async (_req, res) => {
  try {
    await pool.query("SELECT 1");

    res.status(200).json({
      status: "ok",
      service: "bugpilot-api",
      database: "connected"
    });

  } catch (error) {
    console.error("Database health check failed:", error);

    res.status(500).json({
      status: "error",
      service: "bugpilot-api",
      database: "disconnected"
    });
  }
});

// API routes
app.use("/api/users", userRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/bugs", bugRoutes);
app.use("/api/test-cases", testCaseRoutes);
app.use("/api/test-runs", testRunRoutes);

export default app;