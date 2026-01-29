import { describe, it, expect, beforeEach } from 'vitest'
import * as services from '$lib/services'
import { store } from '$lib/adapters/db'
import * as domain from '$lib/domain'
import TinybaseUOW from './uow'

class FakeRepository<T> {
	private data: Map<string, T> = new Map()

	get() {
		// will only be 1 Reader in data
		return Array.from(this.data.values())[0]
	}

	save(entity: T) {
		this.data.set((entity as any).id, entity)
	}
}

describe('services', () => {
	const title = 'title'
	const content = 'New text content'

	let uow: TinybaseUOW

	beforeEach(() => {
		uow = new TinybaseUOW()
	})

	it('can load from database', async () => {
		// arrange
		const id = '1'
		store.addRow('readers', { id })
		store.addRow('texts', { reader: id, title, content })
		store.addRow('words', { reader: id, name: 'word' })

		const texts = store.getTable('texts')
		console.log(Object.values(texts))

		// act
		const reader = uow.readers.get(id)

		// assert
		expect(reader.id).toEqual(id)
		expect(reader.texts).toHaveLength(1)
		expect(reader.words).toHaveLength(3)
	})

	it.skip('adds to repo', async () => {
		const text = services.createText(uow, { title, content })

		expect(text).toBeDefined()
		expect(text!.title).toEqual(title)

		expect(Object.keys(store.getTable('texts'))).toHaveLength(3)
	})
})
