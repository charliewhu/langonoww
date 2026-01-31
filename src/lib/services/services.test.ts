import { describe, it, expect, beforeEach } from 'vitest'
import * as domain from '$lib/domain'
import * as services from '$lib/services'
import { store } from '$lib/adapters/db'
import TinybaseUOW from './uow'

class MockRepository<T> {
	private items = new Map<string, T>()

	get(id: string) {
		/* return item or throw */
	}
	save(entity: T) {
		/* store entity */
	}
	getAll() {
		/* helper for tests */
	}
}

class MockUnitOfWork {
	readers: MockRepository<domain.Reader>

	constructor() {
		this.readers = new MockRepository<domain.Reader>()
	}

	async begin() {}
	async commit() {}
	async rollback() {}
}

describe('services', () => {
	const readerId = '1'
	const title = 'title'
	const content = 'New text content'

	let uow: TinybaseUOW

	beforeEach(async () => {
		uow = await TinybaseUOW.create()
		store.delTables() // ensure empty store
	})

	it('adds to repo', async () => {
		const text = services.createText(uow, readerId, { title, content })

		expect(text).toBeDefined()
		expect(text!.title).toEqual(title)

		const texts = Object.values(store.getTable('texts'))
		expect(texts).toHaveLength(1)
		const words = Object.values(store.getTable('words'))
		expect(words).toHaveLength(3)
	})

	it('gets reader', async () => {
		const text = services.createText(uow, readerId, { title, content })

		const title2 = 'another title'
		services.createText(uow, readerId, { title: title2, content: 'other stuff' })

		const r = services.getReader(uow, readerId)

		expect(r.texts.length).toEqual(2)
		expect(r.texts[0].title).toEqual(title)
		expect(r.texts[1].title).toEqual(title2)
	})
})
