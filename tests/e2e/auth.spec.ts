import { test, expect } from '@playwright/test';

test.describe('Authentication Flow', () => {
  test('should open auth modal when clicking profile or save', async ({ page }) => {
    await page.goto('/');

    // Wait for the hydration and tools to load
    await page.waitForSelector('text=Discover');

    // Find a save button on a BentoCard (usually has a heart icon)
    // Wait for bento cards to render
    const bentoCard = page.locator('article').first();
    if (await bentoCard.count() > 0) {
      const saveButton = bentoCard.locator('button', { hasText: '' }).last();
      await saveButton.click();

      // Check if auth modal appears
      await expect(page.locator('text=Sign In')).toBeVisible();
    }
  });

  test('should allow switching between sign in and sign up', async ({ page }) => {
    await page.goto('/');

    // Assuming we can trigger auth modal via a keyboard shortcut or button
    // The previous test triggers it via save, let's trigger it directly via script or find a login button if available
    // But since the save button is the main way to trigger it when not logged in:
    const bentoCard = page.locator('article').first();
    if (await bentoCard.count() > 0) {
      await bentoCard.hover();
      const saveButton = bentoCard.locator('button').last();
      await saveButton.click();

      // Should be Sign In initially
      await expect(page.locator('h2', { hasText: 'Sign In' })).toBeVisible();

      // Switch to Sign Up
      await page.click('text=Sign Up instead');
      await expect(page.locator('h2', { hasText: 'Create Account' })).toBeVisible();

      // Switch back
      await page.click('text=Sign In instead');
      await expect(page.locator('h2', { hasText: 'Sign In' })).toBeVisible();
    }
  });
});
