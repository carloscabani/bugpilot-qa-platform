import "dotenv/config";

import fs from "fs";
import path from "path";

import { pool } from "../config/database";

async function initializeTestDatabase() {

  if (
    process.env.NODE_ENV !== "test" ||
    process.env.DB_NAME !== "bugpilot_test"
  ) {
    throw new Error(
      "Database initialization is only allowed in the test environment"
    );
  }

  const initPath = path.resolve(
    process.cwd(),
    "../database/init.sql"
  );

  const sql = fs.readFileSync(
    initPath,
    "utf-8"
  );

  await pool.query(sql);

  console.log(
    "Test database initialized successfully"
  );

}

initializeTestDatabase()
  .catch(error => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await pool.end();
  });