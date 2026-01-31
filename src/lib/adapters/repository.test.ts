import { describe, it, expect, beforeEach } from 'vitest'
import { store } from '$lib/adapters/db'
import { TinybaseRepository } from './repository'

describe('uow', () => {
	const readerId = '1'
	const title = 'title'
	let content = 'New text content'
	let repo = new TinybaseRepository(store)

	beforeEach(() => {
		repo = new TinybaseRepository(store)
		store.delTables() // ensure empty store
	})

	it('creates domain objects', async () => {
		// create store objects

		repo.get(readerId)

		// assert domain objects exist in correct structure
	})
})
