import express from "express";
import cors from "cors";
import { pool } from "./config/database";
import userRoutes from "./routes/user.routes";
import authRoutes from "./routes/auth.routes";

const app = express();

app.use(cors());
app.use(express.json());

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

app.use("/api/users", userRoutes);
app.use("/api/auth", authRoutes); 
export default app;