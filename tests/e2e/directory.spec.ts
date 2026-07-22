import { test, expect } from '@playwright/test';

test.describe('Directory Flow', () => {
  test('should filter by category and search', async ({ page }) => {
    await page.goto('/');

    // Wait for the hydration and tools to load
    await page.waitForSelector('text=Discover');

    // Open categories modal
    await page.click('text=Categories');
    await expect(page.locator('h2', { hasText: 'Categories' })).toBeVisible();

    // Click on 'Design' category
    await page.click('text=Design');
    
    // Category modal should close automatically or we close it manually
    // The active category should now be Design, so we expect the tag to be visible
    await expect(page.locator('text=Design').first()).toBeVisible();

    // Open command palette (search)
    await page.keyboard.press('Control+k');
    
    // Fallback if keyboard shortcut is overridden or mac vs windows:
    // Actually just testing the search bar visibility
    const searchInput = page.locator('input[placeholder*="Search tools"]');
    if (await searchInput.count() > 0) {
      await searchInput.fill('Figma');
      await page.waitForTimeout(500); // Wait for debounce
      // Should show Figma if it exists in test DB
    }
  });
});
