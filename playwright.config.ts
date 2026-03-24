import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  timeout: 60000,
  use: {
    baseURL: 'http://localhost:3005',
    headless: true,
  },
  webServer: {
    command: 'npx next dev -p 3005',
    port: 3005,
    timeout: 60000,
    reuseExistingServer: true,
  },
});
