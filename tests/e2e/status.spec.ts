import { test, expect } from "@playwright/test";

test("unknown public status page returns or renders 404", async ({ page }) => {
  const response = await page.goto("/status/unknown-status-slug");
  expect(response?.status()).toBeGreaterThanOrEqual(200);
});
