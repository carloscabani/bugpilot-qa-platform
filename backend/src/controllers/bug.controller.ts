import { Response } from "express";

import { AuthRequest } from "../middleware/auth.middleware";

import {
  createBug,
  getBugs,
  getBugById,
  assignBug,
  updateBugStatus
} from "../services/bug.service";

import {
  canTransition,
  BugStatus,
  UserRole
} from "../services/bug-workflow.service";

import { getProjectById } from "../services/project.service";
import { getUserById } from "../services/user.service";
import { getBugHistory } from "../services/bug-history.service";

export async function createBugController(
  req: AuthRequest,
  res: Response
) {

  try {

    const {
      project_id,
      title,
      description,
      severity = "MEDIUM",
      priority = "MEDIUM",
      environment,
      steps_to_reproduce,
      expected_result,
      actual_result
    } = req.body;

    // Validate project ID

    if (
      !Number.isSafeInteger(project_id) ||
      project_id <= 0
    ) {
      return res.status(400).json({
        message: "Valid project_id is required"
      });
    }

    // Validate title

    if (
      typeof title !== "string" ||
      title.trim().length === 0 ||
      title.length > 200
    ) {
      return res.status(400).json({
        message: "Valid bug title is required"
      });
    }

    // Validate description

    if (
      typeof description !== "string" ||
      description.trim().length === 0
    ) {
      return res.status(400).json({
        message: "Bug description is required"
      });
    }

    // Validate severity

    const allowedSeverities = [
      "LOW",
      "MEDIUM",
      "HIGH",
      "CRITICAL"
    ];

    if (!allowedSeverities.includes(severity)) {
      return res.status(400).json({
        message: "Invalid severity"
      });
    }

    // Validate priority

    const allowedPriorities = [
      "LOW",
      "MEDIUM",
      "HIGH",
      "URGENT"
    ];

    if (!allowedPriorities.includes(priority)) {
      return res.status(400).json({
        message: "Invalid priority"
      });
    }

    // Validate optional text fields

    const optionalFields = [
      environment,
      steps_to_reproduce,
      expected_result,
      actual_result
    ];

    if (
      optionalFields.some(
        value =>
          value !== undefined &&
          typeof value !== "string"
      )
    ) {
      return res.status(400).json({
        message: "Optional bug fields must be strings"
      });
    }

    if (!req.user) {
      return res.status(401).json({
        message: "Authentication required"
      });
    }

    // Check if project exists

    const project = await getProjectById(project_id);

    if (!project) {
      return res.status(404).json({
        message: "Project not found"
      });
    }

    // Create bug

    const bug = await createBug({
      projectId: project_id,
      title: title.trim(),
      description: description.trim(),
      severity,
      priority,
      reportedBy: req.user.userId,
      environment,
      stepsToReproduce: steps_to_reproduce,
      expectedResult: expected_result,
      actualResult: actual_result
    });

    return res.status(201).json({
      message: "Bug reported successfully",
      bug
    });

  } catch (error) {

    console.error("Error creating bug:", error);

    return res.status(500).json({
      message: "Internal server error"
    });

  }

}

export async function getBugsController(
  _req: AuthRequest,
  res: Response
) {

  try {

    const bugs = await getBugs();

    return res.status(200).json({
      bugs
    });

  } catch (error) {

    console.error("Error fetching bugs:", error);

    return res.status(500).json({
      message: "Internal server error"
    });

  }

}

export async function getBugByIdController(
  req: AuthRequest,
  res: Response
) {

  try {

    const id = Number(req.params.id);

    if (!Number.isSafeInteger(id) || id <= 0) {
      return res.status(400).json({
        message: "Invalid bug ID"
      });
    }

    const bug = await getBugById(id);

    if (!bug) {
      return res.status(404).json({
        message: "Bug not found"
      });
    }

    return res.status(200).json({
      bug
    });

  } catch (error) {

    console.error("Error fetching bug:", error);

    return res.status(500).json({
      message: "Internal server error"
    });

  }

}

export async function assignBugController(
  req: AuthRequest,
  res: Response
) {

  try {

    const bugId = Number(req.params.id);

    const { developer_id } = req.body;

    if (!Number.isSafeInteger(bugId) || bugId <= 0) {
      return res.status(400).json({
        message: "Invalid bug ID"
      });
    }

    if (
      !Number.isSafeInteger(developer_id) ||
      developer_id <= 0
    ) {
      return res.status(400).json({
        message: "Valid developer_id is required"
      });
    }

    const developer = await getUserById(developer_id);

    if (!developer) {
      return res.status(404).json({
        message: "Developer not found"
      });
    }

    if (developer.role !== "DEVELOPER") {
      return res.status(400).json({
        message: "Assigned user must have DEVELOPER role"
      });
    }

    const bug = await assignBug(
      bugId,
      developer_id
    );

    if (!bug) {
      return res.status(404).json({
        message: "Bug not found"
      });
    }

    return res.status(200).json({
      message: "Bug assigned successfully",
      bug
    });

  } catch (error) {

    console.error("Error assigning bug:", error);

    return res.status(500).json({
      message: "Internal server error"
    });

  }

}

export async function updateBugStatusController(
  req: AuthRequest,
  res: Response
) {

  try {

    const bugId = Number(req.params.id);
    const { status } = req.body;

    if (!Number.isSafeInteger(bugId) || bugId <= 0) {
      return res.status(400).json({
        message: "Invalid bug ID"
      });
    }

    const validStatuses: BugStatus[] = [
      "OPEN",
      "IN_PROGRESS",
      "READY_FOR_QA",
      "REOPENED",
      "CLOSED"
    ];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        message: "Invalid bug status"
      });
    }

    if (!req.user) {
      return res.status(401).json({
        message: "Authentication required"
      });
    }

    const bug = await getBugById(bugId);

    if (!bug) {
      return res.status(404).json({
        message: "Bug not found"
      });
    }

    const role = req.user.role as UserRole;

    const allowed = canTransition(
      bug.status as BugStatus,
      status,
      role
    );

    if (!allowed) {
      return res.status(403).json({
        message: "Status transition not allowed"
      });
    }

    // Developers can only update their assigned bugs

    if (
      role === "DEVELOPER" &&
      bug.assigned_to !== req.user.userId
    ) {
      return res.status(403).json({
        message: "You are not assigned to this bug"
      });
    }

    const updatedBug = await updateBugStatus(
      bugId,
      status,
      bug.status,
      req.user.userId
    );

    if (!updatedBug) {
      return res.status(409).json({
        message: "Bug status changed. Please refresh and retry"
      });
    }

    return res.status(200).json({
      message: "Bug status updated successfully",
      bug: updatedBug
    });

  } catch (error) {

    console.error("Error updating bug status:", error);

    return res.status(500).json({
      message: "Internal server error"
    });

  }

}

export async function getBugHistoryController(
  req: AuthRequest,
  res: Response
) {
  try {
    const bugId = Number(req.params.id);

    if (!Number.isSafeInteger(bugId) || bugId <= 0) {
      return res.status(400).json({
        message: "Invalid bug ID"
      });
    }

    const bug = await getBugById(bugId);

    if (!bug) {
      return res.status(404).json({
        message: "Bug not found"
      });
    }

    const history = await getBugHistory(bugId);

    return res.status(200).json({
      bug_id: bugId,
      history
    });

  } catch (error) {
    console.error("Error fetching bug history:", error);

    return res.status(500).json({
      message: "Internal server error"
    });
  }
}