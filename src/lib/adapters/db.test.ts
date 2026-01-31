import { describe, it, expect, beforeEach } from 'vitest'
import { store } from '$lib/adapters/db'

const title = 'title'
const content = 'This: example'

describe('database', () => {
	beforeEach(() => {})

	it('can add texts', async () => {
		expect(store.getRowCount('texts')).toEqual(0)
		store.addRow('texts', { title, content })

		expect(store.getRowCount('texts')).toEqual(1)
	})

	it('can add words', async () => {
		expect(store.getRowCount('words')).toEqual(0)

		store.addRow('words', { name: 'word' })
		expect(store.getRowCount('words')).toEqual(1)
	})
})
