import { Router } from "express";

import {
  createProjectController,
  getProjectsController,
  getProjectByIdController
} from "../controllers/project.controller";

import {
  authenticateToken,
  authorizeRoles
} from "../middleware/auth.middleware";

const router = Router();


// Create project - ADMIN only

router.post(
  "/",
  authenticateToken,
  authorizeRoles("ADMIN"),
  createProjectController
);


// Get all projects

router.get(
  "/",
  authenticateToken,
  getProjectsController
);


// Get project by ID

router.get(
  "/:id",
  authenticateToken,
  getProjectByIdController
);


export default router;