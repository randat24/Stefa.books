import { test, expect } from '@playwright/test';

test.describe('Authentication Flow', () => {
  test('user can register a new account', async ({ page }) => {
    await page.goto('/');
    
    // Click on login button to open auth modal
    await page.click('text=Увійти');
    
    // Switch to registration tab
    await page.click('text=Реєстрація');
    
    // Fill registration form
    await page.fill('input[name="firstName"]', 'Test');
    await page.fill('input[name="lastName"]', 'User');
    await page.fill('input[name="email"]', 'test@example.com');
    await page.fill('input[name="phone"]', '+380501234567');
    await page.fill('input[name="password"]', 'password123');
    await page.fill('input[name="confirmPassword"]', 'password123');
    
    // Submit registration
    await page.click('button[type="submit"]');
    
    // Expect success message
    await expect(page.locator('text=Користувач успішно зареєстрований')).toBeVisible();
  });

  test('user can login with valid credentials', async ({ page }) => {
    await page.goto('/');
    
    // Click on login button
    await page.click('text=Увійти');
    
    // Fill login form
    await page.fill('input[name="email"]', 'test@example.com');
    await page.fill('input[name="password"]', 'password123');
    
    // Submit login
    await page.click('button[type="submit"]');
    
    // Expect to see profile button instead of login button
    await expect(page.locator('text=Мій профіль')).toBeVisible();
    await expect(page.locator('text=Увійти')).not.toBeVisible();
  });

  test('user can logout from profile page', async ({ page }) => {
    // First login (assuming user is already registered)
    await page.goto('/');
    await page.click('text=Увійти');
    await page.fill('input[name="email"]', 'test@example.com');
    await page.fill('input[name="password"]', 'password123');
    await page.click('button[type="submit"]');
    
    // Go to profile page
    await page.click('text=Мій профіль');
    await expect(page).toHaveURL('/profile');
    
    // Click logout button
    await page.click('text=Вийти');
    
    // Expect to be redirected to home and see login button
    await expect(page).toHaveURL('/');
    await expect(page.locator('text=Увійти')).toBeVisible();
  });

  test('login form shows validation errors', async ({ page }) => {
    await page.goto('/');
    await page.click('text=Увійти');
    
    // Try to submit empty form
    await page.click('button[type="submit"]');
    
    // Expect validation errors
    await expect(page.locator('text=Введіть email')).toBeVisible();
    await expect(page.locator('text=Введіть пароль')).toBeVisible();
  });

  test('registration form shows validation errors', async ({ page }) => {
    await page.goto('/');
    await page.click('text=Увійти');
    await page.click('text=Реєстрація');
    
    // Try to submit empty form
    await page.click('button[type="submit"]');
    
    // Expect validation errors
    await expect(page.locator('text=Введіть ім\'я')).toBeVisible();
    await expect(page.locator('text=Введіть прізвище')).toBeVisible();
    await expect(page.locator('text=Введіть email')).toBeVisible();
  });
});
