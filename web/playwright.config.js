const { defineConfig } = require('@playwright/test');

module.exports = defineConfig({
  testDir: './tests',
  timeout: 60000,
  use: {
    baseURL: 'http://127.0.0.1:5500',
    viewport: { width: 1280, height: 900 },
    screenshot: 'only-on-failure',
  },
  webServer: {
    command: 'python -m http.server 5500',
    url: 'http://127.0.0.1:5500',
    reuseExistingServer: true,
    timeout: 15000,
  },
});
