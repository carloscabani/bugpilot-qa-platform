import { Router } from "express";

import {
  createTestCaseController,
  getTestCasesController,
  getTestCaseByIdController
} from "../controllers/test-case.controller";

import {
  authenticateToken,
  authorizeRoles
} from "../middleware/auth.middleware";

const router = Router();


// Create test case

router.post(
  "/",
  authenticateToken,
  authorizeRoles("ADMIN", "QA"),
  createTestCaseController
);


// List test cases

router.get(
  "/",
  authenticateToken,
  getTestCasesController
);


// Get test case by ID

router.get(
  "/:id",
  authenticateToken,
  getTestCaseByIdController
);


export default router;