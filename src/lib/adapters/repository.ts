import * as domain from '$lib/domain'
import type { NoValuesSchema, Store } from 'tinybase/with-schemas'
import type { tablesSchema } from './db'
import type { TablesSchema } from 'tinybase'

export interface IRepository<T> {
	get(id: string): T
	save(entity: T): void
}

export class TinybaseRepository<S extends [typeof tablesSchema, NoValuesSchema]> {
	private db: Store<[typeof tablesSchema, NoValuesSchema]>

	constructor(db: Store<[typeof tablesSchema, NoValuesSchema]>) {
		this.db = db
	}

	get(id: string) {
		// get db reader
		const dbReader = this.db.getRow('readers', id)
		if (!dbReader) throw new Error('No reader')

		// get related objects
		const dbTexts = this.db.getTable('texts')
		const dbWords = this.db.getTable('words')
		const dbTextWords = this.db.getTable('text_words')

		// construct domain Reader object
		const reader = new domain.Reader(id)

		// add nested objects
		// TODO: performance concerns here?
		// make async or create texts, words, textWords directly
		// from db data?
		Object.entries(dbTexts).map(([id, row]) =>
			reader.addText({ title: row.title!, content: row.content! }),
		)

		return reader
	}

	save() {
		// Persist reader
		// Persist all texts (new and existing)
		// Persist all words (new and existing)
		// Handle relationships
	}
}
