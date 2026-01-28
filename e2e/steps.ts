import { expect, Page } from '@playwright/test'
import { createBdd, DataTable } from 'playwright-bdd'

const { Given, When, Then } = createBdd()

async function cacheUrl(page: Page, url: string) {
	const serviceWorkerPromise = page.context().waitForEvent('serviceworker')
	await page.goto(url)
	await serviceWorkerPromise
}

const APP_URLS = ['/', '/texts', '/texts/add']

Given('the application is loaded', async ({ page }) => {
	const urls = APP_URLS
	for (const url of urls) {
		await cacheUrl(page, url)
	}
})

Given('I am offline', async ({ page }) => {
	await page.context().setOffline(true)
})

Given('I add content {string} {string}', async ({ page }, arg: string, arg1: string) => {
	// Step: Given I add content 'hola' 'hola amigo como estas'
	// From: e2e/sample.feature:31:3
	await page.goto('/texts/add')
	await page.getByLabel('Title').fill(arg)
	await page.getByLabel('Content').fill(arg1)
	await page.getByRole('button', { name: 'Create' }).click()

	// ensure item is in indexeddb before navigating off page
	// would rather wait than complicate production code
	await page.waitForTimeout(5)
})

When('I navigate to {string}', async ({ page }, arg: string) => {
	await page.goto(arg)
})

When('I click the {string} button', async ({ page }, buttonText: string) => {
	await page.getByRole('button', { name: buttonText }).click()
})

Then('{string} appears in the list', async ({ page }, arg) => {
	// Step: Then the 'hola' and 'adios' appear in the document list
	await page.goto('/texts')

	const word = page.getByText(arg, { exact: false })
	await expect(word).toBeVisible()
})

When('I click {string}', async ({ page }, arg: string) => {
	// Step: And when I click 'hola'
	if (arg === 'Complete') {
		await page.getByRole('button', { name: arg }).click()
	} else {
		// Try to click as text link first (for text titles), then as button (for words)
		try {
			await page.getByText(arg).click({ timeout: 1000 })
		} catch {
			await page.getByRole('button', { name: arg }).click()
		}
	}
})

Then('{string} is visible', async ({ page }, arg: string) => {
	// Step: Then 'hola amigo como estas' is visible
	// From: e2e/sample.feature:34:3
	const text = page.getByText(arg)
	await expect(text).toBeVisible()
})
