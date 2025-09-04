import { test, expect } from '@playwright/test';

test('API returns books data', async ({ request }) => {
  const response = await request.get('/api/books');
  
  expect(response.status()).toBe(200);
  expect(response.headers()['content-type']).toContain('application/json');
  
  const data = await response.json();
  expect(data).toHaveProperty('success', true);
  expect(data).toHaveProperty('data');
  expect(Array.isArray(data.data)).toBe(true);
});

test('API returns categories data', async ({ request }) => {
  const response = await request.get('/api/categories');
  
  expect(response.status()).toBe(200);
  expect(response.headers()['content-type']).toContain('application/json');
  
  const data = await response.json();
  expect(data).toHaveProperty('success', true);
  expect(data).toHaveProperty('data');
  expect(Array.isArray(data.data)).toBe(true);
});

test('API handles search queries', async ({ request }) => {
  const response = await request.get('/api/books?search=test');
  
  expect(response.status()).toBe(200);
  expect(response.headers()['content-type']).toContain('application/json');
  
  const data = await response.json();
  expect(data).toHaveProperty('success', true);
  expect(data).toHaveProperty('data');
  expect(data).toHaveProperty('count');
});

test('API handles category filtering', async ({ request }) => {
  const response = await request.get('/api/books?category=Fiction');
  
  expect(response.status()).toBe(200);
  expect(response.headers()['content-type']).toContain('application/json');
  
  const data = await response.json();
  expect(data).toHaveProperty('success', true);
  expect(data).toHaveProperty('data');
});