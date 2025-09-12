import { test, expect } from '@playwright/test';

test.describe('Book Rental Flow', () => {
  test('user can view book details', async ({ page }) => {
    await page.goto('/books');
    
    // Click on first book card
    const firstBook = page.locator('[data-testid="book-card"]').first();
    await firstBook.click();
    
    // Expect to be on book detail page
    await expect(page).toHaveURL(/\/books\//);
    
    // Expect book details to be visible
    await expect(page.locator('[data-testid="book-title"]')).toBeVisible();
    await expect(page.locator('[data-testid="book-author"]')).toBeVisible();
    await expect(page.locator('[data-testid="book-description"]')).toBeVisible();
  });

  test('user can see rental button on book page', async ({ page }) => {
    await page.goto('/books');
    const firstBook = page.locator('[data-testid="book-card"]').first();
    await firstBook.click();
    
    // Expect rental button to be visible
    await expect(page.locator('text=Орендувати')).toBeVisible();
  });

  test('user can open rental form', async ({ page }) => {
    await page.goto('/books');
    const firstBook = page.locator('[data-testid="book-card"]').first();
    await firstBook.click();
    
    // Click rental button
    await page.click('text=Орендувати');
    
    // Expect rental form to be visible
    await expect(page.locator('[data-testid="rental-form"]')).toBeVisible();
  });

  test('user can fill rental form', async ({ page }) => {
    await page.goto('/books');
    const firstBook = page.locator('[data-testid="book-card"]').first();
    await firstBook.click();
    await page.click('text=Орендувати');
    
    // Fill rental form
    await page.fill('input[name="firstName"]', 'Test');
    await page.fill('input[name="lastName"]', 'User');
    await page.fill('input[name="email"]', 'test@example.com');
    await page.fill('input[name="phone"]', '+380501234567');
    await page.fill('textarea[name="address"]', 'Test Address, 123');
    
    // Select rental period
    await page.selectOption('select[name="rentalPeriod"]', '1');
    
    // Expect form to be filled
    await expect(page.locator('input[name="firstName"]')).toHaveValue('Test');
    await expect(page.locator('input[name="email"]')).toHaveValue('test@example.com');
  });

  test('user can submit rental request', async ({ page }) => {
    await page.goto('/books');
    const firstBook = page.locator('[data-testid="book-card"]').first();
    await firstBook.click();
    await page.click('text=Орендувати');
    
    // Fill and submit form
    await page.fill('input[name="firstName"]', 'Test');
    await page.fill('input[name="lastName"]', 'User');
    await page.fill('input[name="email"]', 'test@example.com');
    await page.fill('input[name="phone"]', '+380501234567');
    await page.fill('textarea[name="address"]', 'Test Address, 123');
    await page.selectOption('select[name="rentalPeriod"]', '1');
    
    await page.click('button[type="submit"]');
    
    // Expect success message
    await expect(page.locator('text=Заявка на оренду відправлена')).toBeVisible();
  });

  test('rental form shows validation errors', async ({ page }) => {
    await page.goto('/books');
    const firstBook = page.locator('[data-testid="book-card"]').first();
    await firstBook.click();
    await page.click('text=Орендувати');
    
    // Try to submit empty form
    await page.click('button[type="submit"]');
    
    // Expect validation errors
    await expect(page.locator('text=Введіть ім\'я')).toBeVisible();
    await expect(page.locator('text=Введіть email')).toBeVisible();
  });

  test('user can view rental history', async ({ page }) => {
    // First login
    await page.goto('/');
    await page.click('text=Увійти');
    await page.fill('input[name="email"]', 'test@example.com');
    await page.fill('input[name="password"]', 'password123');
    await page.click('button[type="submit"]');
    
    // Go to rental history
    await page.click('text=Мої оренди');
    await expect(page).toHaveURL('/my-rentals');
    
    // Expect rental history page to be visible
    await expect(page.locator('h1')).toContainText('Мої оренди');
  });
});
