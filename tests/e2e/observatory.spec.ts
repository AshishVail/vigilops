import { test, expect } from "@playwright/test";

test("observatory route redirects or renders", async ({ page }) => {
  await page.goto("/observatory");
  await expect(page).toHaveURL(/(?:\/observatory|\/login)/);
});
