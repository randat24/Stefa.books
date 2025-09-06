import { test, expect } from '@playwright/test';

test('homepage has title and displays book catalog', async ({ page }) => {
  await page.goto('/');

  // Expect a title "to contain" a substring.
  await expect(page).toHaveTitle(/Stefa/);

  // Expect the catalog section to be visible
  await expect(page.locator('text=Каталог')).toBeVisible();

  // Expect to find book cards
  const bookCards = page.locator('[data-testid="book-card"]');
  await expect(bookCards).not.toHaveCount(0);
});

test('navigation menu works correctly', async ({ page }) => {
  await page.goto('/');

  // Click on the catalog link
  await page.click('text=Каталог');

  // Expect the URL to contain catalog
  await expect(page).toHaveURL(/.*catalog/);

  // Go back to home
  await page.goBack();
  await expect(page).toHaveURL('/');
});

test('search functionality works', async ({ page }) => {
  await page.goto('/');

  // Fill in the search box
  await page.fill('[data-testid="search-input"]', 'test');

  // Submit the search
  await page.press('[data-testid="search-input"]', 'Enter');

  // Expect to see search results
  await expect(page.locator('[data-testid="search-results"]')).toBeVisible();
});