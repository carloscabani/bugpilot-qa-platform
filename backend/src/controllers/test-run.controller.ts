import { Response } from "express";

import { AuthRequest } from "../middleware/auth.middleware";

import {
  createTestRun,
  getTestRuns,
  getTestRunsByTestCase
} from "../services/test-run.service";

import {
  getTestCaseById
} from "../services/test-case.service";


// CREATE TEST RUN

export async function createTestRunController(
  req: AuthRequest,
  res: Response
) {

  try {

    const {
      test_case_id,
      status,
      environment,
      actual_result,
      notes
    } = req.body;

    if (
      !Number.isSafeInteger(test_case_id) ||
      test_case_id <= 0
    ) {
      return res.status(400).json({
        message: "Valid test_case_id is required"
      });
    }

    const allowedStatuses = [
      "PASS",
      "FAIL",
      "BLOCKED"
    ];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        message: "Invalid test run status"
      });
    }

    const optionalFields = [
      environment,
      actual_result,
      notes
    ];

    if (
      optionalFields.some(
        value =>
          value !== undefined &&
          typeof value !== "string"
      )
    ) {
      return res.status(400).json({
        message: "Optional fields must be strings"
      });
    }

    if (!req.user) {
      return res.status(401).json({
        message: "Authentication required"
      });
    }

    const testCase = await getTestCaseById(
      test_case_id
    );

    if (!testCase) {
      return res.status(404).json({
        message: "Test case not found"
      });
    }

    const testRun = await createTestRun({

      testCaseId: test_case_id,

      executedBy: req.user.userId,

      status,

      environment,

      actualResult: actual_result,

      notes

    });

    return res.status(201).json({
      message: "Test run recorded successfully",
      test_run: testRun
    });

  } catch (error) {

    console.error(
      "Error creating test run:",
      error
    );

    return res.status(500).json({
      message: "Internal server error"
    });

  }

}


// GET ALL TEST RUNS

export async function getTestRunsController(
  _req: AuthRequest,
  res: Response
) {

  try {

    const testRuns = await getTestRuns();

    return res.status(200).json({
      test_runs: testRuns
    });

  } catch (error) {

    console.error(error);

    return res.status(500).json({
      message: "Internal server error"
    });

  }

}


// GET TEST RUNS BY TEST CASE

export async function getTestRunsByTestCaseController(
  req: AuthRequest,
  res: Response
) {

  try {

    const testCaseId = Number(req.params.id);

    if (
      !Number.isSafeInteger(testCaseId) ||
      testCaseId <= 0
    ) {
      return res.status(400).json({
        message: "Invalid test case ID"
      });
    }

    const testCase = await getTestCaseById(
      testCaseId
    );

    if (!testCase) {
      return res.status(404).json({
        message: "Test case not found"
      });
    }

    const testRuns = await getTestRunsByTestCase(
      testCaseId
    );

    return res.status(200).json({
      test_case_id: testCaseId,
      test_runs: testRuns
    });

  } catch (error) {

    console.error(error);

    return res.status(500).json({
      message: "Internal server error"
    });

  }

}