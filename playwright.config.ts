import { defineConfig, devices } from '@playwright/test';

// Browser tests run against the production build (`npm run build` first) served like Netlify serves it.
// The enquiry endpoint is always intercepted: no test sends a real email.
const PORT = 4399;

export default defineConfig({
  testDir: 'tests/e2e',
  timeout: 60_000,
  fullyParallel: true,
  workers: 3,
  reporter: [['list'], ['json', { outputFile: 'output/qa/e2e-results.json' }]],
  use: { baseURL: `http://127.0.0.1:${PORT}`, trace: 'retain-on-failure' },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: {
    command: `node scripts/serve-dist.mjs ${PORT}`,
    url: `http://127.0.0.1:${PORT}/`,
    reuseExistingServer: false,
    timeout: 60_000,
  },
});
