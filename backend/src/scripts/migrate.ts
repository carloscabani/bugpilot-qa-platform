import "dotenv/config";

import fs from "node:fs";
import path from "node:path";

import { pool } from "../config/database";

async function runMigrations() {

  const migrationsPath = path.resolve(
    process.cwd(),
    "../database/migrations"
  );

  const client = await pool.connect();

  try {

    // Create migrations tracking table

    await client.query(`
      CREATE TABLE IF NOT EXISTS schema_migrations (
        id SERIAL PRIMARY KEY,
        filename VARCHAR(255) UNIQUE NOT NULL,
        executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Read migration files

    const files = fs.readdirSync(migrationsPath)
      .filter(file => file.endsWith(".sql"))
      .sort();

    for (const file of files) {

      // Check whether migration was already executed

      const result = await client.query(
        `
        SELECT id
        FROM schema_migrations
        WHERE filename = $1
        `,
        [file]
      );

      if (result.rows.length > 0) {

        console.log(`Skipping migration: ${file}`);

        continue;
      }

      console.log(`Running migration: ${file}`);

      const sql = fs.readFileSync(
        path.join(migrationsPath, file),
        "utf8"
      );

      // Execute migration atomically

      await client.query("BEGIN");

      try {

        await client.query(sql);

        await client.query(
          `
          INSERT INTO schema_migrations (filename)
          VALUES ($1)
          `,
          [file]
        );

        await client.query("COMMIT");

        console.log(`Migration completed: ${file}`);

      } catch (error) {

        await client.query("ROLLBACK");

        throw error;

      }

    }

    console.log("All migrations completed");

  } finally {

    client.release();

    await pool.end();

  }

}

runMigrations().catch(error => {

  console.error("Migration failed:", error);

  process.exitCode = 1;

});