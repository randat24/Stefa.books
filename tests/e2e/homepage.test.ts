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

  // Expect the URL to contain books (catalog redirects to books)
  await expect(page).toHaveURL(/.*books/);

  // Go back to home
  await page.goBack();
  await expect(page).toHaveURL('/');
});

test('search functionality works', async ({ page }) => {
  await page.goto('/');

  // Click on search button to open search modal
  await page.click('[data-testid="open-search"]');

  // Fill in the search box
  await page.fill('[data-testid="mobile-search"]', 'test');

  // Submit the search
  await page.press('[data-testid="mobile-search"]', 'Enter');

  // Expect to be redirected to books page with search
  await expect(page).toHaveURL(/.*books.*search/);
});