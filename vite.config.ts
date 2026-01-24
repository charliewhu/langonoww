import devtoolsJson from 'vite-plugin-devtools-json'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vitest/config'
import { playwright } from '@vitest/browser-playwright'
import { sveltekit } from '@sveltejs/kit/vite'

export default defineConfig({
	plugins: [tailwindcss(), sveltekit(), devtoolsJson()],
	resolve: process.env.VITEST
		? {
				conditions: ['browser'],
			}
		: undefined,
	test: {
		expect: { requireAssertions: true },

		projects: [
			{
				extends: './vite.config.ts',
				test: {
					// page/component interaction tests
					name: 'client',
					browser: {
						enabled: true,
						provider: playwright(),
						instances: [{ browser: 'chromium' }],
					},
					setupFiles: ['./vitest-setup-client.ts'],
					include: ['src/**/*.spec.{js,ts}'],
					exclude: ['src/lib/server/**'],
				},
			},

			{
				extends: './vite.config.ts',
				test: {
					// cross-cutting logic eg stores and repositories
					name: 'integration',
					browser: {
						enabled: true,
						provider: playwright(),
						instances: [{ browser: 'chromium' }],
						headless: true,
					},

					setupFiles: ['./vitest-setup-client.ts'],
					include: ['src/**/*.svelte.test.{js,ts}'],
					exclude: ['src/**/*.svelte.spec.{js,ts}', 'src/lib/server/**'],
				},
			},

			{
				extends: './vite.config.ts',
				test: {
					// unit tests (*.test.ts)
					name: 'server',
					environment: 'node',
					include: ['src/**/*.test.{js,ts}'],
					exclude: ['src/**/*.svelte.{test,spec}.{js,ts}'],
				},
			},
		],
	},
})
