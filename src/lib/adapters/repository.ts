import * as domain from '$lib/domain'
import type { NoValuesSchema, Store } from 'tinybase/with-schemas'
import type { tablesSchema } from './db'

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
		const texts = Object.entries(dbTexts).map(([textId, row]) => {
			const text = new domain.Text({ id: textId, title: row.title!, content: row.content! })

			// Add text words for this text
			const textWordsForText = Object.entries(dbTextWords).filter(
				([_, textWordRow]) => textWordRow.text === textId,
			)

			textWordsForText.forEach(([textWordId, textWordRow]) => {
				// Find the corresponding word
				const wordId = textWordRow.word
				let word: domain.Word | undefined
				if (wordId) {
					const wordRow = dbWords[wordId]
					if (wordRow) {
						word = new domain.Word({ id: wordId, name: wordRow.name! })
						word.status = wordRow.status as 'known' | 'unknown' | 'difficult'

						// only create domain object if word with ID isnt found
						if (!reader.words.find((w) => w.id === word!.id)) {
							reader.words.push(word)
						}
					}
				}
				text.addWord({
					id: textWordId,
					name: textWordRow.name!,
					order: textWordRow.order!,
					word,
				})
			})

			return text
		})

		// Add texts to reader
		texts.forEach((text) => {
			reader.texts.push(text)
		})

		return reader
	}

	save(reader: Reader) {
		// Persist reader
		reader.texts.forEach((t: Text) => {
			// create text
			this.db.setRow('texts', t.id, { reader: reader.id, title: t.title, content: t.content })

			t.words.forEach((w) => {
				// save text_word
				this.db.setRow('text_words', w.id, {
					text: t.id,
					word: w.word ? w.word.id : undefined,
					name: w.name,
					order: w.order,
				})
			})
		})

		reader.words.forEach((w: Word) => {
			this.db.setRow('words', w.id, { reader: reader.id, name: w.name, status: w.status })
		})
		// Handle relationships
	}
}
