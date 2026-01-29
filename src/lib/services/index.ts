import * as domain from '$lib/domain'
import type { IRepository } from '$lib/services/uow'

export interface IUnitOfWork {
	readers: IRepository<domain.Reader>
	begin(): Promise<void>
	commit(): Promise<void>
	rollback(): Promise<void>
}

export function createText(
	uow: IUnitOfWork,
	// id: string,
	...payload: ConstructorParameters<typeof domain.Text>
) {
	const reader = repo.get()

	if (!reader) return

	const text = reader.addText(payload[0])
	repo.save(reader)

	return text
}
