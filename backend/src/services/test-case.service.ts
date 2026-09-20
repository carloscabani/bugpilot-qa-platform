import { pool } from "../config/database";

interface CreateTestCaseInput {
  projectId: number;
  bugId?: number | null;
  title: string;
  description?: string;
  preconditions?: string;
  steps: string;
  expectedResult: string;
  priority: string;
  testType: string;
  createdBy: number;
}

export async function createTestCase(
  data: CreateTestCaseInput
) {

  const result = await pool.query(
    `
    INSERT INTO test_cases (
      project_id,
      bug_id,
      title,
      description,
      preconditions,
      steps,
      expected_result,
      priority,
      test_type,
      created_by
    )

    VALUES (
      $1, $2, $3, $4, $5,
      $6, $7, $8, $9, $10
    )

    RETURNING *
    `,
    [
      data.projectId,
      data.bugId ?? null,
      data.title,
      data.description ?? null,
      data.preconditions ?? null,
      data.steps,
      data.expectedResult,
      data.priority,
      data.testType,
      data.createdBy
    ]
  );

  return result.rows[0];
}


// Get all test cases

export async function getTestCases() {

  const result = await pool.query(
    `
    SELECT
      tc.*,
      p.name AS project_name,
      u.name AS creator_name,
      b.title AS bug_title

    FROM test_cases tc

    INNER JOIN projects p
      ON tc.project_id = p.id

    INNER JOIN users u
      ON tc.created_by = u.id

    LEFT JOIN bugs b
      ON tc.bug_id = b.id

    ORDER BY tc.created_at DESC
    `
  );

  return result.rows;
}


// Get test case by ID

export async function getTestCaseById(
  id: number
) {

  const result = await pool.query(
    `
    SELECT
      tc.*,
      p.name AS project_name,
      u.name AS creator_name,
      b.title AS bug_title

    FROM test_cases tc

    INNER JOIN projects p
      ON tc.project_id = p.id

    INNER JOIN users u
      ON tc.created_by = u.id

    LEFT JOIN bugs b
      ON tc.bug_id = b.id

    WHERE tc.id = $1
    `,
    [id]
  );

  return result.rows[0];
}