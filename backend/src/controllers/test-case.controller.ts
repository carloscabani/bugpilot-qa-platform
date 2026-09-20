import { Response } from "express";

import { AuthRequest } from "../middleware/auth.middleware";

import {
  createTestCase,
  getTestCases,
  getTestCaseById
} from "../services/test-case.service";

import { getProjectById } from "../services/project.service";

import { getBugById } from "../services/bug.service";


// CREATE TEST CASE

export async function createTestCaseController(
  req: AuthRequest,
  res: Response
) {

  try {

    const {
      project_id,
      bug_id,
      title,
      description,
      preconditions,
      steps,
      expected_result,
      priority = "MEDIUM",
      test_type = "MANUAL"
    } = req.body;

    if (
      !Number.isSafeInteger(project_id) ||
      project_id <= 0
    ) {
      return res.status(400).json({
        message: "Valid project_id is required"
      });
    }

    if (
      typeof title !== "string" ||
      !title.trim() ||
      title.length > 200
    ) {
      return res.status(400).json({
        message: "Valid test case title is required"
      });
    }

    if (
      typeof steps !== "string" ||
      !steps.trim()
    ) {
      return res.status(400).json({
        message: "Test steps are required"
      });
    }

    if (
      typeof expected_result !== "string" ||
      !expected_result.trim()
    ) {
      return res.status(400).json({
        message: "Expected result is required"
      });
    }

    const optionalFields = [
      description,
      preconditions
    ];

    if (
      optionalFields.some(
        value =>
          value !== undefined &&
          typeof value !== "string"
      )
    ) {
      return res.status(400).json({
        message: "Optional text fields must be strings"
      });
    }

    if (
      !["LOW", "MEDIUM", "HIGH", "URGENT"]
        .includes(priority)
    ) {
      return res.status(400).json({
        message: "Invalid priority"
      });
    }

    if (
      !["MANUAL", "AUTOMATED"]
        .includes(test_type)
    ) {
      return res.status(400).json({
        message: "Invalid test type"
      });
    }

    if (!req.user) {
      return res.status(401).json({
        message: "Authentication required"
      });
    }

    // Validate project

    const project = await getProjectById(
      project_id
    );

    if (!project) {
      return res.status(404).json({
        message: "Project not found"
      });
    }

    // Validate optional bug relationship

    if (bug_id !== undefined && bug_id !== null) {

      if (
        !Number.isSafeInteger(bug_id) ||
        bug_id <= 0
      ) {
        return res.status(400).json({
          message: "Invalid bug_id"
        });
      }

      const bug = await getBugById(bug_id);

      if (!bug) {
        return res.status(404).json({
          message: "Bug not found"
        });
      }

      if (bug.project_id !== project_id) {
        return res.status(400).json({
          message: "Bug does not belong to this project"
        });
      }

    }

    const testCase = await createTestCase({

      projectId: project_id,

      bugId: bug_id,

      title: title.trim(),

      description,

      preconditions,

      steps: steps.trim(),

      expectedResult: expected_result.trim(),

      priority,

      testType: test_type,

      createdBy: req.user.userId

    });

    return res.status(201).json({

      message: "Test case created successfully",

      test_case: testCase

    });

  } catch (error) {

    console.error(
      "Error creating test case:",
      error
    );

    return res.status(500).json({
      message: "Internal server error"
    });

  }

}


// GET ALL TEST CASES

export async function getTestCasesController(
  _req: AuthRequest,
  res: Response
) {

  try {

    const testCases = await getTestCases();

    return res.status(200).json({
      test_cases: testCases
    });

  } catch (error) {

    console.error(error);

    return res.status(500).json({
      message: "Internal server error"
    });

  }

}


// GET TEST CASE BY ID

export async function getTestCaseByIdController(
  req: AuthRequest,
  res: Response
) {

  try {

    const id = Number(req.params.id);

    if (
      !Number.isSafeInteger(id) ||
      id <= 0
    ) {
      return res.status(400).json({
        message: "Invalid test case ID"
      });
    }

    const testCase = await getTestCaseById(id);

    if (!testCase) {
      return res.status(404).json({
        message: "Test case not found"
      });
    }

    return res.status(200).json({
      test_case: testCase
    });

  } catch (error) {

    console.error(error);

    return res.status(500).json({
      message: "Internal server error"
    });

  }

}