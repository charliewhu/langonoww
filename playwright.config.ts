import { defineConfig } from '@playwright/test'
import { defineBddConfig } from 'playwright-bdd'

const LOCALHOST = 'http://localhost:'

const testDir = defineBddConfig({
	features: 'e2e/*.feature',
	steps: 'e2e/steps.ts',
})

export default defineConfig({
	webServer: process.env.CI
		? { command: 'npm run build && npm run preview', port: 4173 }
		: undefined,
	timeout: 2000,
	testDir,
	reporter: [['html', { open: 'never' }]],
	use: {
		screenshot: 'only-on-failure',
		baseURL: process.env.CI ? LOCALHOST + '4173' : LOCALHOST + '5173',
		serviceWorkers: 'allow',
	},
})
