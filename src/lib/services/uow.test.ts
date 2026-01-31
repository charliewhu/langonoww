import { describe, it, expect, beforeEach } from 'vitest'
import { store } from '$lib/adapters/db'
import TinybaseUOW from './uow'

describe('tinybase uow', () => {
	let uow: TinybaseUOW
	let title = 'title'
	let content = 'uow content'

	beforeEach(async () => {
		uow = await TinybaseUOW.create()
		store.delTables() // ensure empty store
	})

	it('rolls back uncommitted by default', async () => {
		// 'create' db objects
		await uow.execute(async (uow) => {
			uow.db.addRow('words', { reader: '1', name: 'name' })
		})

		// database should be empty
		expect(Object.keys(store.getTable('words'))).toHaveLength(0)
	})

	it.skip('rolls back on error', async () => {
		//
	})

	it('commits data', async () => {
		// 'create' db objects
		await uow.execute(async (uow) => {
			uow.db.addRow('words', { reader: '1', name: 'name' })
			uow.commit()
		})

		// database should have rows
		expect(Object.keys(store.getTable('words'))).not.toHaveLength(0)
	})
})
