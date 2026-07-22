import { test, expect } from '@playwright/test';

test('has title and renders the grid', async ({ page }) => {
  await page.goto('/');

  // Expect a title "to contain" a substring.
  await expect(page).toHaveTitle(/Nexus/);

  // Check that the hero title is visible
  await expect(page.locator('h1', { hasText: 'Ultimate Spatial Gallery Directory' })).toBeVisible();

  // Check for the search button
  await expect(page.locator('#hero-search-btn')).toBeVisible();

  // Check if grid or tools exist
  // We expect at least one BentoCard or Skeleton to be visible
  await expect(page.locator('.bento-grid').first()).toBeVisible();
});
