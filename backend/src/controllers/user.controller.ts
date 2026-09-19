import { Request, Response } from "express";
import { createUser, getUsers, getUserById } from "../services/user.service";

export async function createUserController(
  req: Request,
  res: Response
) {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password || !role) {
      return res.status(400).json({
        message: "name, email, password and role are required"
      });
    }

    const allowedRoles = ["ADMIN", "QA", "DEVELOPER"];

    if (!allowedRoles.includes(role)) {
      return res.status(400).json({
        message: "Invalid role"
      });
    }

    const user = await createUser({
      name,
      email,
      password,
      role
    });

    return res.status(201).json({
      message: "User created successfully",
      user
    });

  } catch (error: any) {

    if (error.code === "23505") {
      return res.status(409).json({
        message: "Email already exists"
      });
    }

    console.error(error);

    return res.status(500).json({
      message: "Internal server error"
    });
  }
}

export async function getUsersController(
  _req: Request,
  res: Response
) {
  try {
    const users = await getUsers();

    return res.status(200).json({
      users
    });

  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Internal server error"
    });
  }
}

export async function getUserByIdController(
  req: Request,
  res: Response
) {
  try {
    const id = Number(req.params.id);

    if (Number.isNaN(id)) {
      return res.status(400).json({
        message: "Invalid user id"
      });
    }

    const user = await getUserById(id);

    if (!user) {
      return res.status(404).json({
        message: "User not found"
      });
    }

    return res.status(200).json({
      user
    });

  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Internal server error"
    });
  }
}