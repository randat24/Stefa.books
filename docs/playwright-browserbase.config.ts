import { defineConfig, devices } from '@playwright/test';

const browserbaseConfig = require('./browserbase.config.js');

/**
 * Playwright configuration for Browserbase cloud testing
 * @see https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  testDir: './src/__tests__/e2e/browserbase',

  /* Run tests in files in parallel */
  fullyParallel: true,

  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,

  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,

  /* Opt out of parallel tests on CI. */
  workers: process.env.CI ? 1 : undefined,

  /* Reporter configuration */
  reporter: [
    ['html'],
    ['json', { outputFile: 'test-results/browserbase-results.json' }],
    ['junit', { outputFile: 'test-results/browserbase-junit.xml' }]
  ],

  /* Shared settings for all the projects below */
  use: {
    /* Base URL for testing */
    baseURL: process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',

    /* Collect trace when retrying the failed test */
    trace: 'on-first-retry',

    /* Ukrainian locale */
    locale: 'uk-UA',

    /* Browserbase configuration */
    connectOptions: {
      wsEndpoint: `wss://connect.browserbase.com?apiKey=${browserbaseConfig.apiKey}&projectId=${browserbaseConfig.projectId}`,
    },
  },

  /* Configure projects for major browsers via Browserbase */
  projects: [
    {
      name: 'chromium-browserbase',
      use: {
        ...devices['Desktop Chrome'],
        ...browserbaseConfig.session.browserSettings,
      },
    },

    {
      name: 'firefox-browserbase',
      use: {
        ...devices['Desktop Firefox'],
        ...browserbaseConfig.session.browserSettings,
      },
    },

    {
      name: 'webkit-browserbase',
      use: {
        ...devices['Desktop Safari'],
        ...browserbaseConfig.session.browserSettings,
      },
    },

    /* Mobile testing via Browserbase */
    {
      name: 'mobile-chrome-browserbase',
      use: {
        ...devices['Pixel 5'],
        locale: 'uk-UA',
      },
    },

    {
      name: 'mobile-safari-browserbase',
      use: {
        ...devices['iPhone 12'],
        locale: 'uk-UA',
      },
    },
  ],

  /* Global setup for Browserbase sessions */
  globalSetup: require.resolve('./src/__tests__/e2e/browserbase/global-setup.ts'),
  globalTeardown: require.resolve('./src/__tests__/e2e/browserbase/global-teardown.ts'),
});