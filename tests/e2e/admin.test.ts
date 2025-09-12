import { test, expect } from '@playwright/test';

test.describe('Admin Panel', () => {
  test.beforeEach(async ({ page }) => {
    // Login as admin before each test
    await page.goto('/admin/login');
    await page.fill('input[name="email"]', 'admin@stefa.books');
    await page.fill('input[name="password"]', 'oqP_Ia5VMO2wy46p');
    await page.click('button[type="submit"]');
  });

  test('admin can access dashboard', async ({ page }) => {
    // Expect to be redirected to admin dashboard
    await expect(page).toHaveURL('/admin');
    await expect(page.locator('h1')).toContainText('Адмін панель');
  });

  test('admin can view books management', async ({ page }) => {
    await page.goto('/admin');
    
    // Click on books management
    await page.click('text=Управління книгами');
    
    // Expect books table to be visible
    await expect(page.locator('[data-testid="books-table"]')).toBeVisible();
  });

  test('admin can add new book', async ({ page }) => {
    await page.goto('/admin');
    await page.click('text=Управління книгами');
    
    // Click add book button
    await page.click('text=Додати книгу');
    
    // Fill book form
    await page.fill('input[name="title"]', 'Test Book');
    await page.fill('input[name="author"]', 'Test Author');
    await page.fill('textarea[name="description"]', 'Test description');
    await page.fill('input[name="isbn"]', '1234567890');
    await page.selectOption('select[name="category"]', '1');
    
    // Submit form
    await page.click('button[type="submit"]');
    
    // Expect success message
    await expect(page.locator('text=Книгу додано')).toBeVisible();
  });

  test('admin can edit existing book', async ({ page }) => {
    await page.goto('/admin');
    await page.click('text=Управління книгами');
    
    // Click edit button on first book
    const firstBook = page.locator('[data-testid="book-row"]').first();
    await firstBook.locator('text=Редагувати').click();
    
    // Update book title
    await page.fill('input[name="title"]', 'Updated Book Title');
    
    // Save changes
    await page.click('text=Зберегти');
    
    // Expect success message
    await expect(page.locator('text=Книгу оновлено')).toBeVisible();
  });

  test('admin can view users management', async ({ page }) => {
    await page.goto('/admin');
    
    // Click on users management
    await page.click('text=Управління користувачами');
    
    // Expect users table to be visible
    await expect(page.locator('[data-testid="users-table"]')).toBeVisible();
  });

  test('admin can view analytics', async ({ page }) => {
    await page.goto('/admin');
    
    // Click on analytics
    await page.click('text=Аналітика');
    
    // Expect analytics dashboard to be visible
    await expect(page.locator('[data-testid="analytics-dashboard"]')).toBeVisible();
  });

  test('admin can view rental management', async ({ page }) => {
    await page.goto('/admin');
    
    // Click on rental management
    await page.click('text=Управління орендою');
    
    // Expect rental table to be visible
    await expect(page.locator('[data-testid="rentals-table"]')).toBeVisible();
  });

  test('admin can export data', async ({ page }) => {
    await page.goto('/admin');
    
    // Click on export button
    await page.click('text=Експорт даних');
    
    // Expect export options to be visible
    await expect(page.locator('text=Експорт книг')).toBeVisible();
    await expect(page.locator('text=Експорт користувачів')).toBeVisible();
  });

  test('admin can logout', async ({ page }) => {
    await page.goto('/admin');
    
    // Click logout button
    await page.click('text=Вийти');
    
    // Expect to be redirected to admin login
    await expect(page).toHaveURL('/admin/login');
  });
});
