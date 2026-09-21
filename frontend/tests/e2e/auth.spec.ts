import { test, expect } from "@playwright/test";

const ADMIN_EMAIL = process.env.E2E_ADMIN_EMAIL;
const ADMIN_PASSWORD = process.env.E2E_ADMIN_PASSWORD;

test.describe("BugPilot Authentication", () => {

  test.beforeEach(() => {

    if (!ADMIN_EMAIL || !ADMIN_PASSWORD) {
      throw new Error(
        "Missing E2E_ADMIN_EMAIL or E2E_ADMIN_PASSWORD"
      );
    }

  });


  test("ADMIN can login successfully", async ({ page }) => {

    await page.goto("/login");

    await page.getByLabel("Email").fill(
      ADMIN_EMAIL!
    );

    await page.getByLabel("Password").fill(
      ADMIN_PASSWORD!
    );

    const loginResponse = page.waitForResponse(
      response =>
        response.url().includes("/api/auth/login") &&
        response.request().method() === "POST"
    );

    await page.getByRole("button", {
      name: "Sign in"
    }).click();

    const response = await loginResponse;

    expect(response.status()).toBe(200);

    await expect(page).toHaveURL(
      /\/dashboard$/
    );

    await expect(
      page.getByRole("heading", {
        name: "Overview"
      })
    ).toBeVisible();

  });


  test("invalid credentials are rejected", async ({ page }) => {

    await page.goto("/login");

    await page.getByLabel("Email").fill(
      ADMIN_EMAIL!
    );

    await page.getByLabel("Password").fill(
      "incorrect-password"
    );

    const loginResponse = page.waitForResponse(
      response =>
        response.url().includes("/api/auth/login") &&
        response.request().method() === "POST"
    );

    await page.getByRole("button", {
      name: "Sign in"
    }).click();

    const response = await loginResponse;

    expect(response.status()).toBe(401);

    await expect(
      page.getByText("Invalid credentials")
    ).toBeVisible();

    await expect(page).toHaveURL(
      /\/login$/
    );

  });

});