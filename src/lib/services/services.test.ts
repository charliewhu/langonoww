import { describe, it, expect, beforeEach } from 'vitest'
import * as domain from '$lib/domain'
import * as services from '$lib/services'
import { MockUnitOfWork } from './test-utils'

describe('services', () => {
	const readerId = '1'
	const title = 'title'
	const content = 'New text content'

	let uow: MockUnitOfWork
	let reader: domain.Reader

	beforeEach(() => {
		uow = new MockUnitOfWork()
		reader = new domain.Reader(readerId)
		uow.readers.save(reader)
	})

	it('creates text and saves to repository', async () => {
		const text = await services.createText(uow, readerId, { title, content })

		expect(text).toBeDefined()
		expect(text!.title).toEqual(title)
		expect(text!.content).toEqual(content)

		const savedReader = uow.readers.get(readerId)
		expect(savedReader).toBeDefined()
		if (!savedReader) throw new Error()
		expect(savedReader.texts).toHaveLength(1)
		expect(savedReader.texts[0]).toEqual(text)
	})

	it('does not create text for non-existent reader', async () => {
		await expect(async () => {
			await services.createText(uow, 'non-existent', { title, content })
		}).rejects.toThrow('No item with id: non-existent')
	})

	it('does not create text with empty title or content', async () => {
		const emptyTitle = await services.createText(uow, readerId, { title: '', content })
		const emptyContent = await services.createText(uow, readerId, { title, content: '' })

		expect(emptyTitle).toBeUndefined()
		expect(emptyContent).toBeUndefined()
	})

	it('gets reader with texts', async () => {
		services.createText(uow, readerId, { title, content })

		const title2 = 'another title'
		services.createText(uow, readerId, { title: title2, content: 'other stuff' })

		const retrievedReader = services.getReader(uow, readerId)

		if (!retrievedReader) throw new Error()
		expect(retrievedReader.texts.length).toEqual(2)
		expect(retrievedReader.texts[0].title).toEqual(title)
		expect(retrievedReader.texts[1].title).toEqual(title2)
	})

	it('parses words from text content', async () => {
		const content = 'Hello, world! This is a test.'
		const text = await services.createText(uow, readerId, { title, content })

		expect(text).toBeDefined()
		expect(text!.words).toHaveLength(13)
		expect(text!.words[0].name).toEqual('Hello')
		expect(text!.words[1].name).toEqual(',')
		expect(text!.words[2].name).toEqual(' ')
		expect(text!.words[3].name).toEqual('world')
		expect(text!.words[4].name).toEqual('!')
		expect(text!.words[5].name).toEqual(' ')
		expect(text!.words[6].name).toEqual('This')
	})

	it('creates words for text', async () => {
		const content = 'Hello world'
		await services.createText(uow, readerId, { title, content })

		const savedReader = uow.readers.get(readerId)
		if (!savedReader) throw new Error()
		expect(savedReader.words.length).toEqual(2)
		expect(savedReader.words[0].name).toEqual('hello')
		expect(savedReader.words[1].name).toEqual('world')
		expect(savedReader.words[0].status).toEqual('unknown')
		expect(savedReader.words[1].status).toEqual('unknown')
	})

	it('does not duplicate words across texts', async () => {
		await services.createText(uow, readerId, { title: 'text1', content: 'hello world' })
		await services.createText(uow, readerId, { title: 'text2', content: 'hello there' })

		const savedReader = uow.readers.get(readerId)
		if (!savedReader) throw new Error()
		expect(savedReader.words.length).toEqual(3)
		expect(savedReader.words.map((w) => w.name)).toEqual(['hello', 'world', 'there'])
	})
})
