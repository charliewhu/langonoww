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

describe('Reader - addText parsing', () => {
	let reader: domain.Reader

	beforeEach(() => {
		reader = new domain.Reader()
	})

	it('handles empty strings', async () => {
		reader.addText({ title: 'empty', content: '' })
		expect(reader.texts[0].words).toEqual([])
	})

	it('handles contractions', async () => {
		reader.addText({ title: 'contract', content: "j'avais une bierre" })
		const words = reader.texts[0].words.map((w) => w.name)
		expect(words).toEqual(["j'avais", ' ', 'une', ' ', 'bierre'])
	})

	it('handles newline-only content', async () => {
		reader.addText({ title: 'newlines', content: '\n\n\n' })
		const words = reader.texts[0].words.map((w) => w.name)
		expect(words).toEqual(['\n', '\n', '\n'])
	})

	it('handles accented characters', async () => {
		reader.addText({ title: 'accented', content: 'café naïve résumé' })
		const words = reader.texts[0].words.map((w) => w.name)
		expect(words).toEqual(['café', ' ', 'naïve', ' ', 'résumé'])
	})

	it('handles emoji characters', async () => {
		reader.addText({ title: 'emojis', content: '🌟 Star power 🚀' })
		const words = reader.texts[0].words.map((w) => w.name)
		expect(words).toEqual(['🌟', ' ', 'Star', ' ', 'power', ' ', '🚀'])
	})

	it('handles mixed punctuation patterns', async () => {
		reader.addText({ title: 'punctuation', content: 'Hello, world! How are you?' })
		const words = reader.texts[0].words.map((w) => w.name)
		expect(words).toEqual([
			'Hello',
			',',
			' ',
			'world',
			'!',
			' ',
			'How',
			' ',
			'are',
			' ',
			'you',
			'?',
		])
	})

	it('handles complex punctuation', async () => {
		reader.addText({
			title: 'complex punctuation',
			content: '"Hello," she said; "how are you?"',
		})
		const words = reader.texts[0].words.map((w) => w.name)
		expect(words).toEqual([
			'"',
			'Hello',
			',',
			'"',
			' ',
			'she',
			' ',
			'said',
			';',
			' ',
			'"',
			'how',
			' ',
			'are',
			' ',
			'you',
			'?',
			'"',
		])
	})

	it('handles special characters', async () => {
		reader.addText({ title: 'special', content: '@user #tag $100 %50' })
		const words = reader.texts[0].words.map((w) => w.name)
		expect(words).toEqual(['@user', ' ', '#tag', ' ', '$100', ' ', '%50'])
	})

	it('handles contractions with apostrophes', async () => {
		reader.addText({ title: 'contractions', content: "don't can't won't" })
		const words = reader.texts[0].words.map((w) => w.name)
		expect(words).toEqual(["don't", ' ', "can't", ' ', "won't"])
	})

	it('handles numbers mixed with text', async () => {
		reader.addText({ title: 'numbers', content: '123numbers456 abc123' })
		const words = reader.texts[0].words.map((w) => w.name)
		expect(words).toEqual(['123numbers456', ' ', 'abc123'])
	})

	it('handles hyphenated words', async () => {
		reader.addText({ title: 'hyphenated', content: 'word-together state-of-the-art' })
		const words = reader.texts[0].words.map((w) => w.name)
		expect(words).toEqual(['word-together', ' ', 'state-of-the-art'])
	})

	it('handles colons and spaces', async () => {
		reader.addText({ title: 'colon spaces', content: 'Word: Another: thing' })
		const words = reader.texts[0].words.map((w) => w.name)
		expect(words).toEqual(['Word', ':', ' ', 'Another', ':', ' ', 'thing'])
	})

	it('handles multiple consecutive spaces', async () => {
		reader.addText({ title: 'multiple spaces', content: 'Hello  world' })
		const words = reader.texts[0].words.map((w) => w.name)
		expect(words).toEqual(['Hello', ' ', ' ', 'world'])
	})

	it('handles mixed unicode and punctuation', async () => {
		reader.addText({ title: 'mixed unicode', content: 'café, naïve!' })
		const words = reader.texts[0].words.map((w) => w.name)
		expect(words).toEqual(['café', ',', ' ', 'naïve', '!'])
	})

	it('handles currency symbols', async () => {
		reader.addText({ title: 'currency', content: '$100 €200 ¥300' })
		const words = reader.texts[0].words.map((w) => w.name)
		expect(words).toEqual(['$100', ' ', '€200', ' ', '¥300'])
	})
})
