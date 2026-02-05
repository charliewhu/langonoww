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

function useTinybaseUow(initialDb: IStore = store) {
	let db = $state<IStore>(initialDb)
	let readers = $derived(new TinybaseRepository(db))

	$effect.root(() => {
		$effect(() => {
			const listener = db.addTableListener(null, (store) => {
				db = store
			})
			return () => {
				db.delListener(listener)
			}
		})
	})

	async function execute<T>(work: (uow: ReturnType<typeof useTinybaseUow>) => Promise<T>) {
		db.startTransaction()
		const result = await work({ db, readers, execute, commit, rollback })
		rollback()
		return result
	}

	async function commit() {
		db.finishTransaction()
	}

	async function rollback() {
		db.finishTransaction(() => true)
	}

	return {
		get db() {
			return db
		},
		get readers() {
			return readers
		},
		execute,
		commit,
		rollback,
	}
}

async function createTinybaseUow() {
	await waitForDb
	return useTinybaseUow()
}

export const uow = await createTinybaseUow()
