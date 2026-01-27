// import { createIndexedDbPersister } from 'tinybase/persisters/persister-indexed-db/with-schemas'
import { createStore } from 'tinybase/with-schemas'
import type { OptionalTablesSchema } from 'tinybase/with-schemas'

// let dbInitialized = $state(false)

export const tablesSchema = {
	texts: {
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
		name: { type: 'string' },
		status: { type: 'string', default: 'unknown' },
	},
} satisfies OptionalTablesSchema

const store = createStore().setTablesSchema(tablesSchema)

// const indexedDbPersister = createIndexedDbPersister(store, 'langonoww')

// async function initDb() {
// 	if (dbInitialized) return
// 	try {
// 		await indexedDbPersister.startAutoLoad()
// 		await indexedDbPersister.startAutoSave()
// 		dbInitialized = true
// 	} catch (error) {
// 		console.error('Failed to initialize database:', error)
// 	}
// }

// void initDb()

// export const isDbInitialized = () => dbInitialized

export { store as db }
