import { Router } from "express";

import {
  createBugController,
  getBugsController,
  getBugByIdController,
  assignBugController, updateBugStatusController, getBugHistoryController
} from "../controllers/bug.controller";

import {
  authenticateToken,
  authorizeRoles
} from "../middleware/auth.middleware";

const router = Router();

router.post(
  "/",
  authenticateToken,
  authorizeRoles("ADMIN", "QA"),
  createBugController
);

router.get(
  "/",
  authenticateToken,
  getBugsController
);

router.get(
  "/:id",
  authenticateToken,
  getBugByIdController
);

router.patch(
  "/:id/status",
  authenticateToken,
  updateBugStatusController
);

router.get(
  "/:id/history",
  authenticateToken,
  getBugHistoryController
);

router.patch(
  "/:id/assign",
  authenticateToken,
  authorizeRoles("ADMIN", "QA"),
  assignBugController
);

export default router;

