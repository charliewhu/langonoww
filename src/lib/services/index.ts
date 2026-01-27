import * as domain from '$lib/domain'

export interface IRepository<T> {
	get(): T
	save(entity: T): void
}

export function createText(
	repo: IRepository<domain.Reader>,
	// id: string,
	...payload: ConstructorParameters<typeof domain.Text>
) {
	const reader = repo.get()

	if (!reader) return

	const text = reader.addText(payload[0])
	repo.save(reader)

	return text
}
