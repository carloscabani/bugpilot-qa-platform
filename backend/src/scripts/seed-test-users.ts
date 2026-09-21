import "dotenv/config";

import { pool } from "../config/database";

import {
  createUser,
  getUserByEmail
} from "../services/user.service";

async function seedTestUsers() {

  if (
    process.env.NODE_ENV !== "test" ||
    process.env.DB_NAME !== "bugpilot_test"
  ) {
    throw new Error(
      "Test users can only be created in the test database"
    );
  }

  const adminEmail =
    process.env.E2E_ADMIN_EMAIL;

  const adminPassword =
    process.env.E2E_ADMIN_PASSWORD;

  const developerEmail =
    process.env.E2E_DEV_EMAIL;

  const developerPassword =
    process.env.E2E_DEV_PASSWORD;

  if (
    !adminEmail ||
    !adminPassword ||
    !developerEmail ||
    !developerPassword
  ) {
    throw new Error(
      "Missing E2E test credentials"
    );
  }

  const adminExists =
    await getUserByEmail(adminEmail);

  if (!adminExists) {

    await createUser({
      name: "E2E Admin",
      email: adminEmail,
      password: adminPassword,
      role: "ADMIN"
    });

    console.log("E2E ADMIN created");

  }

  const developerExists =
    await getUserByEmail(developerEmail);

  if (!developerExists) {

    await createUser({
      name: "Developer One",
      email: developerEmail,
      password: developerPassword,
      role: "DEVELOPER"
    });

    console.log("E2E DEVELOPER created");

  }

  console.log(
    "Test users initialized successfully"
  );

}

seedTestUsers()
  .catch(error => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await pool.end();
  });