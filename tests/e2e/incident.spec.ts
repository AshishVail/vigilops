import { test, expect } from "@playwright/test";

test("incident route redirects or renders", async ({ page }) => {
  await page.goto("/incidents");
  await expect(page).toHaveURL(/(?:\/incidents|\/login)/);
});
