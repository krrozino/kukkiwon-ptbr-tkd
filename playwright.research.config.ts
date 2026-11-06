import { defineConfig, devices } from '@playwright/test';
export default defineConfig({
  testDir: 'tests/research-ui', workers: 1, retries: 0, timeout: 60_000,
  use: { baseURL: 'http://127.0.0.1:4322', trace: 'retain-on-failure', acceptDownloads: true },
  projects: [{ name: 'desktop', use: { ...devices['Desktop Chrome'] } }, { name: 'mobile', use: { ...devices['Pixel 7'] } }],
  webServer: {
    command: 'npm run dev -- --host 127.0.0.1 --port 4322', url: 'http://127.0.0.1:4322/pesquisa-local', timeout: 120_000, reuseExistingServer: false,
    env: { PUBLIC_CONTENT_REVIEW: 'false', PUBLIC_GLOSSARY_REVIEW: 'false', PUBLIC_KNOWLEDGE_SCHEMA: 'false', ASTRO_TELEMETRY_DISABLED: '1' },
  },
});
