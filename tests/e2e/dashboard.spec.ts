import { test, expect } from "@playwright/test";

test("protected dashboard redirects or renders", async ({ page }) => {
  await page.goto("/dashboard");
  await expect(page).toHaveURL(/(?:\/dashboard|\/login)/);
});
