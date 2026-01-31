import { describe, it, expect, beforeEach } from 'vitest'
import { store } from '$lib/adapters/db'
import TinybaseUOW from './uow'

describe('uow', () => {
	const readerId = '1'
	const title = 'title'
	let content = 'New text content'

	let uow: TinybaseUOW

	beforeEach(() => {
		uow = new TinybaseUOW()
		store.delTables() // ensure empty store
	})

	it.skip('can load from database', async () => {
		// arrange
		store.addRow('readers', { id: readerId })
		store.addRow('texts', { reader: readerId, title, content })
		store.addRow('words', { reader: readerId, name: 'dbWord' })

		// act
		const reader = uow.readers.get(readerId)

		// assert
		expect(reader.id).toEqual(readerId)
		expect(reader.texts).toHaveLength(1)
		expect(reader.words).toHaveLength(3)
	})

	it.skip('can modifiy repo data', async () => {
		// arrange
		store.setRow('readers', readerId, { id: readerId })
		content = 'text'
		store.setRow('texts', 'textId', { reader: readerId, title, content })
		store.setRow('words', 'wordId', { reader: readerId, name: 'dbWord' })

		const word = store.getTable('words')
		console.log(store.getTables())
		console.log({ word })

		// load from repo and modify.
		const reader = uow.readers.get(readerId)
		const newName = 'newWord'
		reader.words[0].name = newName

		uow.readers.save(reader)

		// expect words to be the same length as before
		const wordsTable = store.getTable('words')
		console.log({ wordsTable })
		expect(store.getRow('words', Object.keys(word)[0]).name).toEqual(newName)
	})
})
