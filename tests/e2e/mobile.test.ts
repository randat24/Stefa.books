import { test, expect } from '@playwright/test';

test.describe('Mobile Experience', () => {
  test.use({ viewport: { width: 375, height: 667 } }); // iPhone SE size

  test('mobile navigation menu works', async ({ page }) => {
    await page.goto('/');
    
    // Open mobile menu
    await page.click('[data-testid="mobile-menu-button"]');
    
    // Expect mobile menu to be visible
    await expect(page.locator('[data-testid="mobile-menu"]')).toBeVisible();
    
    // Click on catalog link
    await page.click('text=Каталог');
    
    // Expect to be on books page (catalog redirects to books)
    await expect(page).toHaveURL('/books');
  });

  test('mobile search works', async ({ page }) => {
    await page.goto('/');
    
    // Open mobile menu
    await page.click('[data-testid="mobile-menu-button"]');
    
    // Use search in mobile menu
    await page.fill('[data-testid="mobile-search"]', 'test');
    await page.press('[data-testid="mobile-search"]', 'Enter');
    
    // Expect search results
    await expect(page.locator('[data-testid="search-results"]')).toBeVisible();
  });

  test('mobile book cards are responsive', async ({ page }) => {
    await page.goto('/books');
    
    // Expect book cards to be visible and properly sized
    const bookCards = page.locator('[data-testid="book-card"]');
    await expect(bookCards).toBeVisible();
    
    // Check that cards are stacked vertically on mobile
    const firstCard = bookCards.first();
    const secondCard = bookCards.nth(1);
    
    const firstCardBox = await firstCard.boundingBox();
    const secondCardBox = await secondCard.boundingBox();
    
    // Second card should be below first card
    expect(secondCardBox!.y).toBeGreaterThan(firstCardBox!.y + firstCardBox!.height);
  });

  test('mobile forms are usable', async ({ page }) => {
    await page.goto('/');
    await page.click('text=Підписка');
    
    // Fill subscription form on mobile
    await page.fill('input[name="firstName"]', 'Test');
    await page.fill('input[name="lastName"]', 'User');
    await page.fill('input[name="email"]', 'test@example.com');
    await page.fill('input[name="phone"]', '+380501234567');
    
    // Expect form to be filled correctly
    await expect(page.locator('input[name="firstName"]')).toHaveValue('Test');
    await expect(page.locator('input[name="email"]')).toHaveValue('test@example.com');
  });

  test('mobile profile access works', async ({ page }) => {
    // Login first
    await page.goto('/');
    await page.click('text=Увійти');
    await page.fill('input[name="email"]', 'test@example.com');
    await page.fill('input[name="password"]', 'password123');
    await page.click('button[type="submit"]');
    
    // Open mobile menu
    await page.click('[data-testid="mobile-menu-button"]');
    
    // Click on profile
    await page.click('text=Мій профіль');
    
    // Expect to be on profile page
    await expect(page).toHaveURL('/profile');
  });
});
