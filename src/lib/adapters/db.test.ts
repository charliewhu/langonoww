import { describe, it, expect, beforeEach } from 'vitest'
import { db } from '$lib/adapters/db'

const title = 'title'
const content = 'This: example'

describe('database', () => {
	beforeEach(() => {})

	it('can be added to', async () => {
		db.addRow('texts', { title, content })

		expect(db.getRowCount('texts')).toEqual(1)
	})
})
