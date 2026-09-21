import { test, expect } from "@playwright/test";

test.describe("BugPilot Authentication", () => {

  test("ADMIN can login successfully", async ({ page }) => {

    await page.goto("/login");

    await page.getByLabel("Email").fill(
      "process.env.E2E_ADMIN_EMAIL!"
    );

    await page.getByLabel("Password").fill(
      "process.env.E2E_ADMIN_PASSWORD!"
    );

    await page.getByRole("button", {
      name: "Sign in"
    }).click();

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
      "process.env.E2E_ADMIN_EMAIL!"
    );

    await page.getByLabel("Password").fill(
      "incorrect-password"
    );

    await page.getByRole("button", {
      name: "Sign in"
    }).click();

    await expect(
      page.getByText("Invalid credentials")
    ).toBeVisible();

    await expect(page).toHaveURL(
      /\/login$/
    );

  });

});