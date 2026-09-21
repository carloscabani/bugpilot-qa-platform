import { Router } from "express";

import {
  analyzeBugController
} from "../controllers/intelligence.controller";

import {
  authenticateToken,
  authorizeRoles
} from "../middleware/auth.middleware";

const router = Router();

router.post(
  "/bugs/:id/analyze",
  authenticateToken,
  authorizeRoles("ADMIN", "QA"),
  analyzeBugController
);

export default router;