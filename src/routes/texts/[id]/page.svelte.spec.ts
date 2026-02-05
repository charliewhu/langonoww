import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { page as pageTest } from 'vitest/browser'
import { render } from 'vitest-browser-svelte'
import { flushSync } from 'svelte'

import Page from './+page.svelte'
import * as domain from '$lib/domain'
import * as services from '$lib/services'
import { uow } from '$lib/services/uow.svelte'

const mockPageParams = vi.hoisted(() => {
	return {
		id: '1',
	}
})

vi.mock('$app/state', async () => {
	const original = await vi.importActual('$app/state')

	return {
		...original,
		page: {
			params: mockPageParams,
		},
	}
})

describe('text reader', () => {
	const title = 'title'
	const content = 'new content'
	let u: services.IUnitOfWork
	let text: domain.Text | undefined
	let id: string | undefined
	let reader: domain.Reader

	beforeEach(async () => {
		u = uow
		reader = new domain.Reader('1')
		u.readers.save(reader)

		text = await services.createText(u, '1', { title, content })
		id = text.id
		mockPageParams.id = id

		flushSync()
	})

	afterEach(() => {
		flushSync()
	})

	it('clicking a word saves it to difficult words', async () => {
		if (!id) return

		render(Page)

		await pageTest.getByRole('button', { name: content.split(' ')[0] }).click()
		flushSync()

		// expect difficult-words to be 1
		const diffWords = await services.getDifficultWordsCount(u)
		expect(diffWords).toEqual(1)
	})

	it.skip('clicking a difficult word adds it to known words', async () => {
		if (!id) return

		console.log(reader.words[0])
		// await services.markWordDifficult(u, reader.words[0].id)

		render(Page)

		let diffWords = await services.getDifficultWordsCount(u)
		expect(diffWords).toEqual(1)

		await pageTest.getByRole('button', { name: content.split(' ')[0] }).click()
		flushSync()

		// expect difficult-words to be 0
		diffWords = await services.getDifficultWordsCount(u)
		expect(diffWords).toEqual(1)

		const knownWords = await services.getKnownWordsCount(u)
		expect(knownWords).toEqual(1)
	})
})
