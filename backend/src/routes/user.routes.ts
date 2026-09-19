import { Router } from "express";
import {
  createUserController,
  getUsersController, getUserByIdController
} from "../controllers/user.controller";
import { authenticateToken } from "../middleware/auth.middleware";

const router = Router();

router.post("/", createUserController);
router.get("/", authenticateToken, getUsersController);
router.get("/:id", authenticateToken, getUserByIdController);

export default router;

