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
	let text: domain.Text | undefined
	let id: string | undefined
	let reader: domain.Reader

	beforeEach(async () => {
		uow.db.delTables() // uow data must be empty

		reader = new domain.Reader('1')
		uow.readers.save(reader)

		text = await services.createText(uow, '1', { title, content })
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
		const diffWords = await services.getDifficultWordsCount(uow)
		expect(diffWords).toEqual(1)
	})

	it('clicking a difficult word adds it to known words', async () => {
		if (!text) return
		await services.markWordDifficult(uow, text.words[0].word!.id)
		let diffWords = await services.getDifficultWordsCount(uow)
		expect(diffWords).toEqual(1)
		expect(await services.getKnownWordsCount(uow)).toEqual(0)

		render(Page)

		await pageTest.getByRole('button', { name: content.split(' ')[0] }).click()
		flushSync()

		// expect difficult-words to be 0
		diffWords = await services.getDifficultWordsCount(uow)
		expect(diffWords).toEqual(0)

		// known words still should be incremented
		const knownWords = await services.getKnownWordsCount(uow)
		expect(knownWords).toEqual(1)
	})
})
