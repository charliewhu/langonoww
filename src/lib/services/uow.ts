import * as domain from '$lib/domain'
import { TinybaseRepository } from '$lib/adapters/repository'
import type { Store } from 'tinybase/with-schemas'
import { store, type tablesSchema } from '$lib/adapters/db'
import type { NoValuesSchema } from 'tinybase'

export interface IRepository<T> {
	get(id: string): T
	save(entity: T): void
}

export default class TinybaseUOW {
	#readers: IRepository<domain.Reader>

	constructor(db: Store<[typeof tablesSchema, NoValuesSchema]> = store) {
		this.#readers = new TinybaseRepository(db)
	}

	get readers() {
		return this.#readers
	}

	async begin(): Promise<void> {
		// start transaction
	}

	async commit(): Promise<void> {
		// commit transaction
	}

	async rollback(): Promise<void> {
		// rollback transaction
	}
}
