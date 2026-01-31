import { createIndexedDbPersister } from 'tinybase/persisters/persister-indexed-db/with-schemas'
import { createStore } from 'tinybase/with-schemas'

let dbInitialized = false
let initPromise: Promise<void> | null = null

export const tablesSchema = {
	readers: {
		id: { type: 'string' },
	},
	texts: {
		reader: { type: 'string' },
		title: { type: 'string' },
		content: { type: 'string' },
	},
	text_words: {
		text: { type: 'string' },
		word: { type: 'string' },
		name: { type: 'string' },
		order: { type: 'number' },
	},
	words: {
		reader: { type: 'string' },
		name: { type: 'string' },
		status: { type: 'string', default: 'unknown' },
	},
} as const

const store = createStore().setTablesSchema(tablesSchema)

const indexedDbPersister = createIndexedDbPersister(store, 'langonoww')

async function initDb() {
	if (dbInitialized) return
	try {
		await indexedDbPersister.startAutoLoad()
		await indexedDbPersister.startAutoSave()
		dbInitialized = true
	} catch (error) {
		console.error('Failed to initialize database:', error)
	}
}

if (!initPromise) {
	initPromise = initDb()
}

export const waitForDb = initPromise

// TODO: remove hack, only 1 user with 1 language for now
store.addRow('readers', { id: '1' })

export { store }
