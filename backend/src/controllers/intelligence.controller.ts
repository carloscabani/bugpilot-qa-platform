import { Response } from "express";

import { AuthRequest } from "../middleware/auth.middleware";

import { getBugById } from "../services/bug.service";

import { analyzeBug } from "../services/intelligence.service";

export async function analyzeBugController(
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

    const {
      reproducible,
      user_impact
    } = req.body ?? {};

    if (
      typeof reproducible !== "boolean" ||
      !["LOW", "MEDIUM", "HIGH"].includes(user_impact)
    ) {
      return res.status(400).json({
        message: "Valid reproducible and user_impact are required"
      });
    }

    const analysis = await analyzeBug({

      severity: bug.severity,

      priority: bug.priority,

      reproducible,

      user_impact

    });

    return res.status(200).json({

      bug_id: bugId,

      current_priority: bug.priority,

      analysis

    });

  } catch (error) {

    console.error(
      "Error analyzing bug:",
      error
    );

    return res.status(503).json({
      message: "Intelligence service unavailable"
    });

  }

}