import * as domain from '$lib/domain'
import type { IRepository } from '$lib/services/uow.svelte'

export interface IUnitOfWork {
	readers: IRepository<domain.Reader>
	execute<T>(work: (uow: this) => Promise<T>): Promise<T>
	rollback(): Promise<void>
	commit(): Promise<void>
}

// Getters

export function getReader(uow: IUnitOfWork, id: string) {
	const reader = uow.readers.get(id)
	if (!reader) throw new Error('Reader not found')

	return reader
}

export async function getText(uow: IUnitOfWork, id: string) {
	const reader = uow.readers.get('1') // TODO: more than one reader
	// if (!reader) throw new Error('Reader not found')

	const text = reader!.texts.find((t) => t.id == id)
	// if (!text) throw new Error('Text not found')

	return text
}

export async function getKnownWords(uow: IUnitOfWork) {
	const reader = uow.readers.get('1')
	if (!reader) return []

	return reader.words.filter((w) => w.status === 'known')
}

// Aggregations / Summaries

export async function getKnownWordsCount(uow: IUnitOfWork) {
	const words = await getKnownWords(uow)
	return words.length
}

export async function getDifficultWordsCount(uow: IUnitOfWork) {
	const reader = uow.readers.get('1')
	if (!reader) return 0

	return reader.words.filter((w) => w.status === 'difficult').length
}

// Commands

export async function markWordDifficult(uow: IUnitOfWork, id: string) {
	await uow.execute(async (uow) => {
		const reader = uow.readers.get('1')
		if (!reader) return

		const word = reader.words.find((w) => w.id === id)
		if (!word) return

		word.status = 'difficult'
		uow.readers.save(reader)
		await uow.commit()
	})
}

export async function markWordKnown(uow: IUnitOfWork, id: string) {
	await uow.execute(async (uow) => {
		const reader = uow.readers.get('1')
		if (!reader) throw new Error(`No reader`)

		const word = reader.words.find((w) => w.id === id)
		if (!word) throw new Error('Cant find text')

		word.markAsKnown()

		uow.readers.save(reader)
		await uow.commit()
	})
}

export async function completeText(uow: IUnitOfWork, id: string) {
	await uow.execute(async (uow) => {
		const reader = uow.readers.get('1')
		if (!reader) throw new Error(`No reader`)

		const text = reader.texts.find((t) => t.id === id)
		if (!text) throw new Error('Cant find text')

		text.words.filter((w) => w.word?.status == 'unknown').forEach((w) => w.word!.markAsKnown())

		uow.readers.save(reader)
		await uow.commit()
	})
}

// Creators

export async function createText(
	uow: IUnitOfWork,
	id: string,
	...payload: ConstructorParameters<typeof domain.Text>
) {
	if (payload[0].title === '' || payload[0].content === '') {
		// TODO: use validator
		throw new Error('Cant be empty')
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
