import { test, expect } from "@playwright/test";

test("monitor route redirects or renders", async ({ page }) => {
  await page.goto("/monitors");
  await expect(page).toHaveURL(/(?:\/monitors|\/login)/);
});
