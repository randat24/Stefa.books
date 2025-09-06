import { test, expect } from '@playwright/test';

test('catalog page displays books and categories', async ({ page }) => {
  await page.goto('/catalog');

  // Expect the page title to contain "Каталог"
  await expect(page.locator('h1')).toContainText('Каталог');

  // Expect to find category filters
  await expect(page.locator('[data-testid="category-filter"]')).toBeVisible();

  // Expect to find book cards
  const bookCards = page.locator('[data-testid="book-card"]');
  await expect(bookCards).not.toHaveCount(0);
});

test('category filtering works', async ({ page }) => {
  await page.goto('/catalog');

  // Click on the first category filter
  const firstCategory = page.locator('[data-testid="category-filter"]').first();
  const categoryName = await firstCategory.textContent();
  await firstCategory.click();

  // Expect the URL to contain the category
  await expect(page).toHaveURL(new RegExp(`category=${encodeURIComponent(categoryName || '')}`));

  // Expect to see only books from that category
  // This would require more complex assertions based on the actual implementation
});

test('book detail page navigation', async ({ page }) => {
  await page.goto('/catalog');

  // Click on the first book card
  const firstBookCard = page.locator('[data-testid="book-card"]').first();
  await firstBookCard.click();

  // Expect to be on a book detail page
  await expect(page).toHaveURL(/\/books\//);

  // Expect to see book details
  await expect(page.locator('[data-testid="book-title"]')).toBeVisible();
  await expect(page.locator('[data-testid="book-author"]')).toBeVisible();
});