import { pool } from "../config/database";

interface CreateBugInput {
  projectId: number;
  title: string;
  description: string;

  severity: string;
  priority: string;

  reportedBy: number;

  environment?: string;
  stepsToReproduce?: string;
  expectedResult?: string;
  actualResult?: string;
}

export async function createBug(data: CreateBugInput) {

  const result = await pool.query(
    `
    INSERT INTO bugs (
      project_id,
      title,
      description,
      severity,
      priority,
      reported_by,
      environment,
      steps_to_reproduce,
      expected_result,
      actual_result
    )

    VALUES (
      $1, $2, $3, $4, $5,
      $6, $7, $8, $9, $10
    )

    RETURNING *
    `,
    [
      data.projectId,
      data.title,
      data.description,
      data.severity,
      data.priority,
      data.reportedBy,
      data.environment ?? null,
      data.stepsToReproduce ?? null,
      data.expectedResult ?? null,
      data.actualResult ?? null
    ]
  );

  return result.rows[0];

}

export async function getBugs() {

  const result = await pool.query(
    `
    SELECT
      b.*,
      p.name AS project_name,
      reporter.name AS reporter_name,
      assignee.name AS assignee_name

    FROM bugs b

    INNER JOIN projects p
      ON b.project_id = p.id

    INNER JOIN users reporter
      ON b.reported_by = reporter.id

    LEFT JOIN users assignee
      ON b.assigned_to = assignee.id

    ORDER BY b.created_at DESC
    `
  );

  return result.rows;
}

export async function getBugById(id: number) {

  const result = await pool.query(
    `
    SELECT
      b.*,
      p.name AS project_name,
      reporter.name AS reporter_name,
      assignee.name AS assignee_name

    FROM bugs b

    INNER JOIN projects p
      ON b.project_id = p.id

    INNER JOIN users reporter
      ON b.reported_by = reporter.id

    LEFT JOIN users assignee
      ON b.assigned_to = assignee.id

    WHERE b.id = $1
    `,
    [id]
  );

  return result.rows[0];
}

export async function assignBug(
  bugId: number,
  developerId: number
) {

  const result = await pool.query(
    `
    UPDATE bugs

    SET
      assigned_to = $1,
      updated_at = CURRENT_TIMESTAMP

    WHERE id = $2

    RETURNING *
    `,
    [developerId, bugId]
  );

  return result.rows[0];
}


export async function updateBugStatus(
  bugId: number,
  status: string,
  expectedStatus: string,
  changedBy: number
) {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const result = await client.query(
      `
      UPDATE bugs

      SET
        status = $1,
        updated_at = CURRENT_TIMESTAMP

      WHERE id = $2
        AND status = $3

      RETURNING *
      `,
      [status, bugId, expectedStatus]
    );

    const updatedBug = result.rows[0];

    if (!updatedBug) {
      await client.query("ROLLBACK");
      return null;
    }

    await client.query(
      `
      INSERT INTO bug_history (
        bug_id,
        changed_by,
        old_status,
        new_status
      )

      VALUES ($1, $2, $3, $4)
      `,
      [
        bugId,
        changedBy,
        expectedStatus,
        status
      ]
    );

    await client.query("COMMIT");

    return updatedBug;

  } catch (error) {
    await client.query("ROLLBACK");
    throw error;

  } finally {
    client.release();
  }
}