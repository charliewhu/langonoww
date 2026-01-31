import { describe, it, expect, beforeEach } from 'vitest'
import { store } from '$lib/adapters/db'
import { TinybaseRepository } from './repository'
import * as domain from '$lib/domain'
import type { tablesSchema } from '$lib/adapters/db'

const readerId = '1'
const title = 'Test Title'
const content = 'Hello world'

function createDomainObjects() {
	const r = new domain.Reader(readerId)
	r.addText({ title, content })

	return r
}

function addDbObjects() {
	const r = createDomainObjects()

	r.texts.map((t) => {
		store.setRow('texts', t.id, { reader: readerId, title: t.title, content: t.content })
		t.words.map((tw) => {
			if (tw.word) {
				store.setRow('words', tw.word.id, {
					reader: readerId,
					name: tw.word.name,
					status: tw.word.status,
				})
			}
			store.setRow('text_words', tw.id, {
				text: t.id,
				word: tw.word ? tw.word!.id : tw.word,
				name: tw.name,
				order: tw.order,
			})
		})
	})

	return r
}

describe('TinybaseRepository', () => {
	let repo: TinybaseRepository<[typeof tablesSchema, any]>

	beforeEach(() => {
		repo = new TinybaseRepository(store)
		store.delTables() // ensure empty store

		// Add reader row - key is the ID, no id column in schema
		store.setRow('readers', readerId, {})
	})

	it('loads database rows and returns domain objects with correct structure', () => {
		const r = addDbObjects()

		// Load and construct domain objects
		const reader = repo.get(readerId)

		// Assert Texts are constructed
		expect(reader.texts).toHaveLength(1)
		const text = reader.texts[0]
		expect(text).toBeInstanceOf(domain.Text)
		expect(text.title).toBe(title)
		expect(text.content).toBe(content)

		// Assert Words are constructed
		expect(reader.words).toHaveLength(r.words.length)
		const word = reader.words[0]
		expect(word).toBeInstanceOf(domain.Word)
		expect(word.name).toBe('hello')
		expect(word.status).toBe('unknown')
	})

	it('saves domain objects to database', async () => {
		const r = createDomainObjects()

		repo.save(r)

		const texts = store.getTable('texts')
		const row = Object.values(texts)[0]
		expect(row.title).toBe(r.texts[0].title)
		expect(row.content).toBe(r.texts[0].content)

		const words = store.getTable('words')
		const rows = Object.values(words)
		expect(rows.length).toEqual(2)
		expect(rows[0].name).toBe(content.split(' ')[0].toLowerCase())
	})

	it('can update db objects', async () => {
		// save to repo
		let r = createDomainObjects()
		repo.save(r)

		// load from repo
		r = repo.get(r.id)

		// make changes
		r.words[0].status = 'known'

		// save to repo
		repo.save(r)

		// assert db object updated
		expect(Object.values(store.getTable('words'))[0].status).toEqual('known')
		// assert correct number of db rows
		expect(Object.values(store.getTable('words')).length).toEqual(2)
	})
})
