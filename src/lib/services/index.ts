import * as domain from '$lib/domain'
import type { IRepository } from '$lib/services/uow'

export interface IUnitOfWork {
	readers: IRepository<domain.Reader>
	execute<T>(work: (uow: this) => Promise<T>): Promise<T>
	rollback(): Promise<void>
	commit(): Promise<void>
}

export function getReader(uow: IUnitOfWork, id: string) {
	const reader = uow.readers.get(id)
	return reader
}

export async function getText(uow: IUnitOfWork, id: string) {
	const reader = uow.readers.get('1') // TODO: more than one reader

	if (!reader) return

	return reader.texts.find((t) => t.id == id)
}

export async function createText(
	uow: IUnitOfWork,
	id: string,
	...payload: ConstructorParameters<typeof domain.Text>
) {
	if (payload[0].title === '' || payload[0].content === '') {
		return
	}

	const text = await uow.execute(async (uow) => {
		const reader = uow.readers.get(id)
		if (!reader) {
			throw new Error(`No item with id: ${id}`)
		}

		const text = reader.addText(payload[0])

		uow.readers.save(reader)
		await uow.commit()
		return text
	})

	return text
}
