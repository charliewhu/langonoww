import * as domain from '$lib/domain'
import type { IRepository } from '$lib/services/uow'

export interface IUnitOfWork {
	readers: IRepository<domain.Reader>
	begin(): Promise<void>
	commit(): Promise<void>
	rollback(): Promise<void>
}

export function getReader(uow: IUnitOfWork, id: string) {
	const reader = uow.readers.get(id)
	return reader
}

export function createText(
	uow: IUnitOfWork,
	id: string,
	...payload: ConstructorParameters<typeof domain.Text>
) {
	const reader = uow.readers.get(id)

	if (!reader) return

	const text = reader.addText(payload[0])

	uow.readers.save(reader)

	return text
}
