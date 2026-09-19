import { pool } from "../config/database";

export async function getBugHistory(bugId: number) {
  const result = await pool.query(
    `
    SELECT
      h.id,
      h.bug_id,
      h.old_status,
      h.new_status,
      h.changed_at,
      u.id AS changed_by,
      u.name AS changed_by_name

    FROM bug_history h

    INNER JOIN users u
      ON h.changed_by = u.id

    WHERE h.bug_id = $1

    ORDER BY h.changed_at ASC, h.id ASC
    `,
    [bugId]
  );

  return result.rows;
}