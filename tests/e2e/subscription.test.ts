import { test, expect } from '@playwright/test';

test.describe('Subscription Flow', () => {
  test('user can open subscription modal', async ({ page }) => {
    await page.goto('/');
    
    // Click on subscription button
    await page.click('text=Підписка');
    
    // Expect subscription modal to be visible
    await expect(page.locator('[data-testid="subscription-modal"]')).toBeVisible();
  });

  test('user can fill subscription form', async ({ page }) => {
    await page.goto('/');
    await page.click('text=Підписка');
    
    // Fill subscription form
    await page.fill('input[name="firstName"]', 'Test');
    await page.fill('input[name="lastName"]', 'User');
    await page.fill('input[name="email"]', 'test@example.com');
    await page.fill('input[name="phone"]', '+380501234567');
    await page.fill('textarea[name="address"]', 'Test Address, 123');
    
    // Select subscription plan
    await page.click('input[value="monthly"]');
    
    // Select payment method
    await page.click('input[value="card"]');
    
    // Expect form to be filled correctly
    await expect(page.locator('input[name="firstName"]')).toHaveValue('Test');
    await expect(page.locator('input[name="email"]')).toHaveValue('test@example.com');
  });

  test('user can submit subscription with bank transfer', async ({ page }) => {
    await page.goto('/');
    await page.click('text=Підписка');
    
    // Fill basic form
    await page.fill('input[name="firstName"]', 'Test');
    await page.fill('input[name="lastName"]', 'User');
    await page.fill('input[name="email"]', 'test@example.com');
    await page.fill('input[name="phone"]', '+380501234567');
    await page.fill('textarea[name="address"]', 'Test Address, 123');
    
    // Select bank transfer payment method
    await page.click('input[value="transfer"]');
    
    // Expect bank transfer info to be visible
    await expect(page.locator('text=Переказ на карту')).toBeVisible();
    await expect(page.locator('text=5168 7573 8888 0000')).toBeVisible();
    
    // Submit form
    await page.click('button[type="submit"]');
    
    // Expect success message
    await expect(page.locator('text=Заявка успішно відправлена')).toBeVisible();
  });

  test('user can upload screenshot for bank transfer', async ({ page }) => {
    await page.goto('/');
    await page.click('text=Підписка');
    
    // Fill form and select bank transfer
    await page.fill('input[name="firstName"]', 'Test');
    await page.fill('input[name="lastName"]', 'User');
    await page.fill('input[name="email"]', 'test@example.com');
    await page.fill('input[name="phone"]', '+380501234567');
    await page.fill('textarea[name="address"]', 'Test Address, 123');
    await page.click('input[value="transfer"]');
    
    // Upload screenshot
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles({
      name: 'screenshot.png',
      mimeType: 'image/png',
      buffer: Buffer.from('fake-image-data')
    });
    
    // Expect file to be selected
    await expect(page.locator('text=screenshot.png')).toBeVisible();
  });

  test('subscription form shows validation errors', async ({ page }) => {
    await page.goto('/');
    await page.click('text=Підписка');
    
    // Try to submit empty form
    await page.click('button[type="submit"]');
    
    // Expect validation errors
    await expect(page.locator('text=Введіть ім\'я')).toBeVisible();
    await expect(page.locator('text=Введіть прізвище')).toBeVisible();
    await expect(page.locator('text=Введіть email')).toBeVisible();
  });

  test('user can close subscription modal', async ({ page }) => {
    await page.goto('/');
    await page.click('text=Підписка');
    
    // Close modal
    await page.click('[data-testid="modal-close"]');
    
    // Expect modal to be hidden
    await expect(page.locator('[data-testid="subscription-modal"]')).not.toBeVisible();
  });
});
