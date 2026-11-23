import { test, expect } from "@playwright/test";

test("security route redirects or renders", async ({ page }) => {
  await page.goto("/security");
  await expect(page).toHaveURL(/(?:\/security|\/login)/);
});
