import { test, expect } from "@playwright/test";

test("landing page exposes live demo", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("button", { name: "Try Live Demo" })).toBeVisible();
});
