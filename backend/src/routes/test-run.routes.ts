import { Router } from "express";

import {
  createTestRunController,
  getTestRunsController,
  getTestRunsByTestCaseController
} from "../controllers/test-run.controller";

import {
  authenticateToken,
  authorizeRoles
} from "../middleware/auth.middleware";

const router = Router();

router.post(
  "/",
  authenticateToken,
  authorizeRoles("ADMIN", "QA"),
  createTestRunController
);

router.get(
  "/",
  authenticateToken,
  getTestRunsController
);

router.get(
  "/test-case/:id",
  authenticateToken,
  getTestRunsByTestCaseController
);

export default router;