import { defineConfig, devices } from '@playwright/test';
export default defineConfig({
  testDir:'tests/e2e', fullyParallel:false, workers:1, retries:0, timeout:30000,
  use:{baseURL:'http://127.0.0.1:4321',trace:'retain-on-failure'},
  projects:[
    {name:'desktop',use:{...devices['Desktop Chrome']}},
    {name:'mobile',use:{...devices['Pixel 7']}},
  ],
  webServer:{
    command:'npm run build && npm run preview -- --host 127.0.0.1 --port 4321',url:'http://127.0.0.1:4321',reuseExistingServer:false,timeout:180000,
    env:{PUBLIC_SUPABASE_URL:'https://acbostnsohltuaegfkwl.supabase.co',PUBLIC_SUPABASE_PUBLISHABLE_KEY:'sb_publishable_ui_test',PUBLIC_SPRINT03_STORAGE:'true',PUBLIC_GLOSSARY_REVIEW:'true',ASTRO_TELEMETRY_DISABLED:'1'},
  },
});
