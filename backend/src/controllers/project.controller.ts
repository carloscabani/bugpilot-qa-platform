import { Response } from "express";
import { AuthRequest } from "../middleware/auth.middleware";
import {
  createProject,
  getProjects,
  getProjectById
} from "../services/project.service";

export async function createProjectController(
  req: AuthRequest,
  res: Response
) {

  try {

    const { name, description } = req.body;

    if (
      typeof name !== "string" ||
      name.trim().length === 0 ||
      name.length > 150
    ) {
      return res.status(400).json({
        message: "Project name is required and must not exceed 150 characters"
      });
    }

    if (
      description !== undefined &&
      typeof description !== "string"
    ) {
      return res.status(400).json({
        message: "Description must be a string"
      });
    }

    if (!req.user) {
      return res.status(401).json({

        message: "Authentication required"
      });
    }

    const project = await createProject({
      name: name.trim(),
      description,
      createdBy: req.user.userId
    });

    return res.status(201).json({
      message: "Project created successfully",
      project
    });

  } catch (error) {

    console.error("Error creating project:", error);

    return res.status(500).json({
      message: "Internal server error"
    });

  }

}

export async function getProjectsController(
  _req: AuthRequest,
  res: Response
) {

  try {

    const projects = await getProjects();

    return res.status(200).json({
      projects
    });

  } catch (error) {

    console.error("Error fetching projects:", error);

    return res.status(500).json({
      message: "Internal server error"
    });

  }

}

export async function getProjectByIdController(
  req: AuthRequest,
  res: Response
) {

  try {

    const id = Number(req.params.id);

    if (!Number.isSafeInteger(id) || id <= 0) {
      return res.status(400).json({
        message: "Invalid project ID"
      });
    }

    const project = await getProjectById(id);

    if (!project) {
      return res.status(404).json({
        message: "Project not found"
      });
    }

    return res.status(200).json({
      project
    });

  } catch (error) {

    console.error("Error fetching project:", error);

    return res.status(500).json({
      message: "Internal server error"
    });

  }

}