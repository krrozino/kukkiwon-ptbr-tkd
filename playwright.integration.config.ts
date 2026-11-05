import {defineConfig} from '@playwright/test';
import base from './playwright.config';
const target=process.env.KUKKIWON_LOCAL_API_URL;
if(!target||!/^http:\/\/127\.0\.0\.1:\d+$/.test(target))throw new Error('Integração exige API isolada em loopback.');
export default defineConfig({...base,testDir:'tests/integration',outputDir:'test-results/integration'});
