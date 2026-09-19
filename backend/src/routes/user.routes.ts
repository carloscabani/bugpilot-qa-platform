import { Router } from "express";
import {
  createUserController,
  getUsersController, getUserByIdController
} from "../controllers/user.controller";
import { authenticateToken, authorizeRoles } from "../middleware/auth.middleware";

const router = Router();

router.post(
  "/",
  authenticateToken,
  authorizeRoles("ADMIN"),
  createUserController
);
router.get("/", authenticateToken, getUsersController);
router.get("/:id", authenticateToken, getUserByIdController);

export default router;

