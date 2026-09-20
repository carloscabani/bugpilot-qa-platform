import { pool } from "../config/database";

interface CreateTestRunInput {
  testCaseId: number;
  executedBy: number;
  status: string;
  environment?: string;
  actualResult?: string;
  notes?: string;
}

export async function createTestRun(
  data: CreateTestRunInput
) {

  const result = await pool.query(
    `
    INSERT INTO test_runs (
      test_case_id,
      executed_by,
      status,
      environment,
      actual_result,
      notes
    )

    VALUES ($1, $2, $3, $4, $5, $6)

    RETURNING *
    `,
    [
      data.testCaseId,
      data.executedBy,
      data.status,
      data.environment ?? null,
      data.actualResult ?? null,
      data.notes ?? null
    ]
  );

  return result.rows[0];
}


// GET ALL TEST RUNS

export async function getTestRuns() {

  const result = await pool.query(
    `
    SELECT
      tr.*,
      tc.title AS test_case_title,
      u.name AS executor_name

    FROM test_runs tr

    INNER JOIN test_cases tc
      ON tr.test_case_id = tc.id

    INNER JOIN users u
      ON tr.executed_by = u.id

    ORDER BY tr.executed_at DESC, tr.id DESC
    `
  );

  return result.rows;
}


// GET RUNS BY TEST CASE

export async function getTestRunsByTestCase(
  testCaseId: number
) {

  const result = await pool.query(
    `
    SELECT
      tr.*,
      u.name AS executor_name

    FROM test_runs tr

    INNER JOIN users u
      ON tr.executed_by = u.id

    WHERE tr.test_case_id = $1

    ORDER BY tr.executed_at DESC, tr.id DESC
    `,
    [testCaseId]
  );

  return result.rows;
}