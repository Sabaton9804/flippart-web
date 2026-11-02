const { defineConfig } = require('@playwright/test');

// Puerto y comando del servidor estático configurables: PW_PORT=5500 npx playwright test
const PORT = Number(process.env.PW_PORT || 5733);
const PYTHON = process.env.PYTHON || (process.platform === 'win32' ? 'python' : 'python3');
const BASE_URL = `http://127.0.0.1:${PORT}`;

module.exports = defineConfig({
  testDir: './tests',
  timeout: 60000,
  use: {
    baseURL: BASE_URL,
    viewport: { width: 1280, height: 900 },
    screenshot: 'only-on-failure',
  },
  webServer: {
    command: process.env.PW_SERVER_CMD || `${PYTHON} -m http.server ${PORT} --bind 127.0.0.1`,
    url: BASE_URL,
    reuseExistingServer: !process.env.CI,
    timeout: 15000,
  },
});
