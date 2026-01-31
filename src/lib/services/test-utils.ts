import * as domain from '$lib/domain'
import type { IRepository } from '$lib/services/uow'

export class MockRepository<T> implements IRepository<T> {
	private items = new Map<string, T>()

	get(id: string) {
		const item = this.items.get(id)
		return item
	}

	save(entity: T) {
		if (entity && typeof entity === 'object' && 'id' in entity && typeof entity.id === 'string') {
			this.items.set(entity.id, entity)
		}
	}

	getAll() {
		return Array.from(this.items.values())
	}

	clear(): void {
		this.items.clear()
	}
}

export class MockUnitOfWork {
	readers: MockRepository<domain.Reader>
	committed: boolean

	constructor() {
		this.readers = new MockRepository<domain.Reader>()
		this.committed = false
	}

	async execute<T>(work: (uow: this) => Promise<T>) {
		const result = await work(this)
		return result
	}

	async commit() {
		this.committed = true
	}

	async rollback() {}
}

export interface IUnitOfWork {
	readers: IRepository<domain.Reader>
	rollback(): Promise<void>
	commit(): Promise<void>
}
