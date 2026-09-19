import { pool } from "../config/database";

interface CreateProjectInput {
  name: string;
  description?: string;
  createdBy: number;
}

export async function createProject(data: CreateProjectInput) {

  const result = await pool.query(
    `
    INSERT INTO projects (name, description, created_by)
    VALUES ($1, $2, $3)
    RETURNING
      id,
      name,
      description,
      created_by,
      created_at,
      updated_at
    `,
    [
      data.name,
      data.description ?? null,
      data.createdBy
    ]
  );

  return result.rows[0];
}

export async function getProjects() {

  const result = await pool.query(
    `
    SELECT
      p.id,
      p.name,
      p.description,
      p.created_by,
      u.name AS creator_name,
      p.created_at,
      p.updated_at
    FROM projects p
    INNER JOIN users u
      ON p.created_by = u.id
    ORDER BY p.created_at DESC
    `
  );

  return result.rows;
}


export async function getProjectById(id: number) {

  const result = await pool.query(
    `
    SELECT
      p.id,
      p.name,
      p.description,
      p.created_by,
      u.name AS creator_name,
      p.created_at,
      p.updated_at
    FROM projects p
    INNER JOIN users u
      ON p.created_by = u.id
    WHERE p.id = $1
    `,
    [id]
  );

  return result.rows[0];
}