import { test, expect } from "@playwright/test";

test("settings route redirects or renders", async ({ page }) => {
  await page.goto("/settings");
  await expect(page).toHaveURL(/(?:\/settings|\/login)/);
});
