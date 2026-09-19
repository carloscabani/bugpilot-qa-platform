import bcrypt from "bcrypt";
import { pool } from "../config/database";

interface CreateUserInput {
  name: string;
  email: string;
  password: string;
  role: "ADMIN" | "QA" | "DEVELOPER";
}

export async function createUser(data: CreateUserInput) {
  const passwordHash = await bcrypt.hash(data.password, 10);

  const result = await pool.query(
    `
    INSERT INTO users (name, email, password_hash, role)
    VALUES ($1, $2, $3, $4)
    RETURNING id, name, email, role, created_at
    `,
    [
      data.name,
      data.email,
      passwordHash,
      data.role
    ]
  );

  return result.rows[0];
}

export async function getUsers() {
  const result = await pool.query(
    `
    SELECT id, name, email, role, created_at
    FROM users
    ORDER BY created_at DESC
    `
  );

  return result.rows;
}

export async function getUserById(id: number) {
  const result = await pool.query(
    `
    SELECT id, name, email, role, created_at
    FROM users
    WHERE id = $1
    `,
    [id]
  );

  return result.rows[0];
}

export async function getUserByEmail(email: string) {
  const result = await pool.query(
    `
    SELECT id, name, email, password_hash, role, created_at
    FROM users
    WHERE email = $1
    `,
    [email]
  );

  return result.rows[0];
}