import { describe, it, expect, beforeEach } from 'vitest'
import * as domain from '$lib/domain'

const title = 'title'
const content = 'This: example'

describe('Reader', () => {
	let reader = new domain.Reader()
	it('can add texts to collection', async () => {
		// act: add Text
		reader.addText({ title, content })

		// assert: child objects created
		expect(reader.texts.length).toEqual(1)
		const readerText = reader.texts[0]
		expect(readerText.words.length).toEqual(4)
		expect(readerText.words[0].word).toBeDefined()
		expect(readerText.words[0].word!.status).toEqual('unknown')

		// word order
		expect(readerText.words[0].order).toEqual(0)
		expect(readerText.words[1].order).toEqual(1)
	})

	it('can find or create word', async () => {
		// @ts-ignore
		const word = reader.findOrCreateWord('hello')

		expect(word).toBeDefined()
		expect(word!.name).toEqual('hello')
		expect(word!.status).toEqual('unknown')
	})

	it('doesnt create fake word', async () => {
		// @ts-ignore
		const word = reader.findOrCreateWord(' ')

		expect(word).not.toBeDefined()
	})

	it('can mark word as known', async () => {
		reader.addText({ title, content })

		const word = reader.texts[0].words[0]
		word.markAsKnown()

		expect(word.word!.status).toEqual('known')
	})
	it('can mark word as difficult', async () => {
		reader.addText({ title, content })

		const word = reader.texts[0].words[0]
		word.markAsDifficult()

		expect(word.word!.status).toEqual('difficult')
	})
})

describe('Text', () => {
	it('can parse content', async () => {
		const text = new domain.Text({ title, content })

		const parsed = text.parseRawContent()

		const expected = ['This', ':', ' ', 'example']
		expect(parsed).toEqual(expected)
	})
})
