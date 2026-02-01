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

	describe('parseRawContent', () => {
		it('handles empty strings', async () => {
			const text = new domain.Text({ title: 'empty', content: '' })
			const parsed = text.parseRawContent()
			expect(parsed).toEqual([])
		})

		it('handles contractions', async () => {
			const text = new domain.Text({ title: 'contract', content: "j'avais une bierre" })
			const parsed = text.parseRawContent()
			expect(parsed).toEqual(["j'avais", ' ', 'une', ' ', 'bierre'])
		})

		it('handles newline-only content', async () => {
			const text = new domain.Text({ title: 'newlines', content: '\n\n\n' })
			const parsed = text.parseRawContent()
			expect(parsed).toEqual(['\n', '\n', '\n'])
		})

		it('handles accented characters', async () => {
			const text = new domain.Text({ title: 'accented', content: 'café naïve résumé' })
			const parsed = text.parseRawContent()
			expect(parsed).toEqual(['café', ' ', 'naïve', ' ', 'résumé'])
		})

		it('handles emoji characters', async () => {
			const text = new domain.Text({ title: 'emojis', content: '🌟 Star power 🚀' })
			const parsed = text.parseRawContent()
			expect(parsed).toEqual(['🌟', ' ', 'Star', ' ', 'power', ' ', '🚀'])
		})

		it('handles mixed punctuation patterns', async () => {
			const text = new domain.Text({ title: 'punctuation', content: 'Hello, world! How are you?' })
			const parsed = text.parseRawContent()
			expect(parsed).toEqual([
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
			const text = new domain.Text({
				title: 'complex punctuation',
				content: '"Hello," she said; "how are you?"',
			})
			const parsed = text.parseRawContent()
			expect(parsed).toEqual([
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
			const text = new domain.Text({ title: 'special', content: '@user #tag $100 %50' })
			const parsed = text.parseRawContent()
			expect(parsed).toEqual(['@user', ' ', '#tag', ' ', '$100', ' ', '%50'])
		})

		it('handles contractions with apostrophes', async () => {
			const text = new domain.Text({ title: 'contractions', content: "don't can't won't" })
			const parsed = text.parseRawContent()
			expect(parsed).toEqual(["don't", ' ', "can't", ' ', "won't"])
		})

		it('handles numbers mixed with text', async () => {
			const text = new domain.Text({ title: 'numbers', content: '123numbers456 abc123' })
			const parsed = text.parseRawContent()
			expect(parsed).toEqual(['123numbers456', ' ', 'abc123'])
		})

		it('handles hyphenated words', async () => {
			const text = new domain.Text({
				title: 'hyphenated',
				content: 'word-together state-of-the-art',
			})
			const parsed = text.parseRawContent()
			expect(parsed).toEqual(['word-together', ' ', 'state-of-the-art'])
		})

		it('handles numbers mixed with text', async () => {
			const text = new domain.Text({ title: 'numbers', content: '123numbers456 abc123' })
			const parsed = text.parseRawContent()
			expect(parsed).toEqual(['123numbers456', ' ', 'abc123'])
		})

		it('handles colons and spaces', async () => {
			const text = new domain.Text({ title: 'colon spaces', content: 'Word: Another: thing' })
			const parsed = text.parseRawContent()
			expect(parsed).toEqual(['Word', ':', ' ', 'Another', ':', ' ', 'thing'])
		})

		it('handles multiple consecutive spaces', async () => {
			const text = new domain.Text({ title: 'multiple spaces', content: 'Hello  world' })
			const parsed = text.parseRawContent()
			expect(parsed).toEqual(['Hello', ' ', ' ', 'world'])
		})

		it('handles mixed unicode and punctuation', async () => {
			const text = new domain.Text({ title: 'mixed unicode', content: 'café, naïve!' })
			const parsed = text.parseRawContent()
			expect(parsed).toEqual(['café', ',', ' ', 'naïve', '!'])
		})

		it('handles currency symbols', async () => {
			const text = new domain.Text({ title: 'currency', content: '$100 €200 ¥300' })
			const parsed = text.parseRawContent()
			expect(parsed).toEqual(['$100', ' ', '€200', ' ', '¥300'])
		})
	})
})
