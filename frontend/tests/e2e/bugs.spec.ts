import { test, expect } from "@playwright/test";

const ADMIN_EMAIL = process.env.E2E_ADMIN_EMAIL;
const ADMIN_PASSWORD = process.env.E2E_ADMIN_PASSWORD;

const DEV_EMAIL = process.env.E2E_DEV_EMAIL;
const DEV_PASSWORD = process.env.E2E_DEV_PASSWORD;

test("Complete Bug Workflow - ADMIN and DEVELOPER", async ({
  page
}) => {

  if (
    !ADMIN_EMAIL ||
    !ADMIN_PASSWORD ||
    !DEV_EMAIL ||
    !DEV_PASSWORD
  ) {
    throw new Error(
      "Configure E2E_ADMIN_EMAIL, E2E_ADMIN_PASSWORD, " +
      "E2E_DEV_EMAIL and E2E_DEV_PASSWORD"
    );
  }

  async function login(
    email: string,
    password: string
  ) {

    await page.goto("/login");

    await page.getByLabel("Email").fill(email);

    await page.getByLabel("Password").fill(password);

    await page.getByRole("button", {
      name: "Sign in"
    }).click();

    await expect(page).toHaveURL(/\/dashboard$/);

  }


  async function logout() {

    await page.getByRole("button", {
      name: "Sign out"
    }).click();

    await expect(page).toHaveURL(/\/login$/);

  }


  // =====================================
  // ADMIN LOGIN
  // =====================================

  await login(ADMIN_EMAIL, ADMIN_PASSWORD);


  // =====================================
  // CREATE PROJECT
  // =====================================

  await page.getByRole("link", {
    name: "Projects"
  }).click();

  await page.getByRole("button", {
    name: /New Project/
  }).click();

  const projectName =
    `E2E Bug Project ${Date.now()}`;

  const projectModal = page.locator(".modal");

  await projectModal
    .locator('[name="name"]')
    .fill(projectName);

  await projectModal
    .locator('[name="description"]')
    .fill("Playwright workflow testing");

  await projectModal.getByRole("button", {
    name: "Create Project"
  }).click();

  await expect(
    page.getByText(projectName)
  ).toBeVisible();


  // =====================================
  // CREATE BUG
  // =====================================

  await page.getByRole("link", {
    name: "Bugs"
  }).click();

  await page.getByRole("button", {
    name: "Report Bug"
  }).click();

  const bugModal = page.locator(".modal");

  const bugTitle =
    `Login defect ${Date.now()}`;

  await bugModal
    .locator('[name="project_id"]')
    .selectOption({ label: projectName });

  await bugModal
    .locator('[name="title"]')
    .fill(bugTitle);

  await bugModal
    .locator('[name="description"]')
    .fill("Login fails with valid credentials");

  await bugModal
    .locator('[name="severity"]')
    .selectOption("HIGH");

  await bugModal
    .locator('[name="priority"]')
    .selectOption("URGENT");

  await bugModal.getByRole("button", {
    name: "Report Bug"
  }).click();

  const bugRow = page
    .locator("tr")
    .filter({ hasText: bugTitle });

  await expect(bugRow).toBeVisible();

  await expect(
    bugRow.locator(".status-badge")
  ).toHaveText("OPEN");


  // =====================================
  // ASSIGN DEVELOPER
  // =====================================

  await bugRow
    .locator(".bug-action-group select")
    .selectOption({ label: "Developer One" });

  await bugRow.getByRole("button", {
    name: "Assign"
  }).click();

  await expect(
    bugRow.getByText("Developer One", {
      exact: true
    }).first()
  ).toBeVisible();


  // =====================================
  // DEVELOPER LOGIN
  // =====================================

  await logout();

  await login(DEV_EMAIL, DEV_PASSWORD);

  await page.getByRole("link", {
    name: "Bugs"
  }).click();

  const developerBugRow = page
    .locator("tr")
    .filter({ hasText: bugTitle });

  await expect(
    developerBugRow
  ).toBeVisible();


  // =====================================
  // OPEN → IN_PROGRESS
  // =====================================

  await developerBugRow
    .locator(".bug-action-group select")
    .selectOption("IN_PROGRESS");

  await developerBugRow.getByRole("button", {
    name: "Update"
  }).click();

  await expect(
    developerBugRow.locator(".status-badge")
  ).toHaveText("IN_PROGRESS");


  // =====================================
  // IN_PROGRESS → READY_FOR_QA
  // =====================================

  await developerBugRow
    .locator(".bug-action-group select")
    .selectOption("READY_FOR_QA");

  await developerBugRow.getByRole("button", {
    name: "Update"
  }).click();

  await expect(
    developerBugRow.locator(".status-badge")
  ).toHaveText("READY_FOR_QA");


  // =====================================
  // ADMIN VALIDATION
  // =====================================

  await logout();

  await login(ADMIN_EMAIL, ADMIN_PASSWORD);

  await page.getByRole("link", {
    name: "Bugs"
  }).click();

  const adminBugRow = page
    .locator("tr")
    .filter({ hasText: bugTitle });

  await expect(
    adminBugRow.locator(".status-badge")
  ).toHaveText("READY_FOR_QA");


  // =====================================
  // READY_FOR_QA → CLOSED
  // =====================================

  await adminBugRow
    .locator(".bug-action-group select")
    .last()
    .selectOption("CLOSED");

  await adminBugRow.getByRole("button", {
    name: "Update"
  }).click();

  await expect(
    adminBugRow.locator(".status-badge")
  ).toHaveText("CLOSED");

});