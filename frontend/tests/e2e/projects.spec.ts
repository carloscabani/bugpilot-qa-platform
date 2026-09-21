import { test, expect } from "@playwright/test";

test.describe("BugPilot Projects", () => {

  test("ADMIN can create a project", async ({ page }) => {

    await page.goto("/login");

    await page.getByLabel("Email").fill(
      "carlos@example.com"
    );

    await page.getByLabel("Password").fill(
      "123456"
    );

    await page.getByRole("button", {
      name: "Sign in"
    }).click();

    await expect(page).toHaveURL(
      /\/dashboard$/
    );

    await page.getByRole("link", {
      name: "Projects"
    }).click();

    await expect(page).toHaveURL(
      /\/projects$/
    );

    await page.getByRole("button", {
      name: /New Project/
    }).click();

    const projectName =
      `Playwright Project ${Date.now()}`;

    await page.getByRole("textbox", {
      name: "Project Name"
    }).fill(projectName);

    await page.getByRole("textbox", {
      name: "Description"
    }).fill(
      "Created automatically by Playwright"
    );

    await page.getByRole("button", {
      name: "Create Project"
    }).click();

    await expect(
      page.getByText(projectName)
    ).toBeVisible();

  });

});