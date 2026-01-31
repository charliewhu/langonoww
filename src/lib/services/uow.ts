import * as domain from '$lib/domain'
import { TinybaseRepository } from '$lib/adapters/repository'
import type { Store } from 'tinybase/with-schemas'
import { store, type tablesSchema, waitForDb } from '$lib/adapters/db'
import type { NoValuesSchema } from 'tinybase'

type IStore = Store<[typeof tablesSchema, NoValuesSchema]>

export interface IRepository<T> {
	get(id: string): T | undefined
	save(entity: T): void
}

export default class TinybaseUOW {
	#readers: IRepository<domain.Reader>
	db: IStore

	private constructor(db: IStore = store) {
		this.db = db
		this.#readers = new TinybaseRepository(db)
	}

	static async create(db?: IStore) {
		await waitForDb
		return new TinybaseUOW(db)
	}

	get readers() {
		return this.#readers
	}

	async execute<T>(work: (uow: this) => Promise<T>) {
		this.db.startTransaction()
		const result = await work(this)
		this.rollback()
		return result
	}

	async commit() {
		this.db.finishTransaction()
	}

	async rollback() {
		this.db.finishTransaction(() => true)
	}
}
