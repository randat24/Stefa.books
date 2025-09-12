import { test, expect } from '@playwright/test';

test.describe('User Profile', () => {
  test.beforeEach(async ({ page }) => {
    // Login before each test
    await page.goto('/');
    await page.click('text=Увійти');
    await page.fill('input[name="email"]', 'test@example.com');
    await page.fill('input[name="password"]', 'password123');
    await page.click('button[type="submit"]');
  });

  test('user can access profile page', async ({ page }) => {
    // Click on profile button in header
    await page.click('text=Мій профіль');
    
    // Expect to be on profile page
    await expect(page).toHaveURL('/profile');
    await expect(page.locator('h1')).toContainText('Мій профіль');
  });

  test('profile page displays user information', async ({ page }) => {
    await page.goto('/profile');
    
    // Expect profile sections to be visible
    await expect(page.locator('text=Особиста інформація')).toBeVisible();
    await expect(page.locator('text=Контактна інформація')).toBeVisible();
  });

  test('user can edit profile information', async ({ page }) => {
    await page.goto('/profile');
    
    // Click edit button
    await page.click('text=Редагувати');
    
    // Fill updated information
    await page.fill('input[name="firstName"]', 'Updated');
    await page.fill('input[name="lastName"]', 'Name');
    await page.fill('input[name="phone"]', '+380509876543');
    
    // Save changes
    await page.click('text=Зберегти');
    
    // Expect success message
    await expect(page.locator('text=Профіль оновлено')).toBeVisible();
  });

  test('user can logout from profile page', async ({ page }) => {
    await page.goto('/profile');
    
    // Click logout button
    await page.click('text=Вийти');
    
    // Expect to be redirected to home
    await expect(page).toHaveURL('/');
    
    // Expect login button to be visible
    await expect(page.locator('text=Увійти')).toBeVisible();
  });

  test('profile form shows validation errors', async ({ page }) => {
    await page.goto('/profile');
    await page.click('text=Редагувати');
    
    // Clear required fields
    await page.fill('input[name="firstName"]', '');
    await page.fill('input[name="lastName"]', '');
    
    // Try to save
    await page.click('text=Зберегти');
    
    // Expect validation errors
    await expect(page.locator('text=Введіть ім\'я')).toBeVisible();
    await expect(page.locator('text=Введіть прізвище')).toBeVisible();
  });

  test('user can view subscription status', async ({ page }) => {
    await page.goto('/profile');
    
    // Expect subscription section to be visible
    await expect(page.locator('text=Підписка')).toBeVisible();
  });

  test('user can view rental history from profile', async ({ page }) => {
    await page.goto('/profile');
    
    // Click on rental history link
    await page.click('text=Мої оренди');
    
    // Expect to be on rental history page
    await expect(page).toHaveURL('/my-rentals');
  });
});
