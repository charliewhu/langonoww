import { describe, it, expect, beforeEach } from 'vitest'
import * as domain from '$lib/domain'
import * as services from '$lib/services'
import { MockUnitOfWork } from './test-utils'

describe('services', () => {
	const readerId = '1'
	const title = 'title'
	let content = 'New text content'

	let uow: MockUnitOfWork
	let reader: domain.Reader

	beforeEach(() => {
		uow = new MockUnitOfWork()
		reader = new domain.Reader(readerId)
		uow.readers.save(reader)
	})

	describe('marking text complete', () => {
		it('can mark text as complete', async () => {
			const newText = await services.createText(uow, readerId, { title, content })

			await services.completeText(uow, newText!.id)

			expect(
				newText.words.filter((w) => w.word).every((w) => w.word?.status == 'known'),
			).toBeTruthy()
		})

		it('doesnt override difficult words', async () => {
			const newText = await services.createText(uow, readerId, { title, content })
			await services.markWordDifficult(uow, newText.words[0].word!.id)

			expect(await services.getDifficultWordsCount(uow)).toEqual(1)

			await services.completeText(uow, newText.id)

			expect(await services.getDifficultWordsCount(uow)).toEqual(1)
		})
	})

	it('gets known words count', async () => {
		const newText = await services.createText(uow, readerId, { title, content })
		newText!.words[0].word!.status = 'known'

		const c = await services.getKnownWordsCount(uow)

		expect(c).toEqual(1)
	})

	it('gets difficult words count', async () => {
		const newText = await services.createText(uow, readerId, { title, content })
		newText!.words[0].word!.status = 'difficult'
		newText!.words[2].word!.status = 'difficult'

		const c = await services.getDifficultWordsCount(uow)

		expect(c).toEqual(2)
	})

	it('can mark words as difficult', async () => {
		const newText = await services.createText(uow, readerId, { title, content })
		await services.markWordDifficult(uow, newText.words[0].word!.id)

		const diffWords = uow.readers.get('1')
		expect(diffWords?.words[0].status).toEqual('difficult')
		const c = await services.getDifficultWordsCount(uow)

		expect(c).toEqual(1)
	})

	it('can mark duplicate words as difficult', async () => {
		// when we have the same word twice in a text
		const newText = await services.createText(uow, readerId, { title, content: 'repeat repeat' })
		await services.markWordDifficult(uow, newText.words[0].word!.id)

		const diffWords = uow.readers.get('1')
		expect(diffWords?.words[0].status).toEqual('difficult')
		const c = await services.getDifficultWordsCount(uow)

		expect(c).toEqual(1)
	})

	it('loads text', async () => {
		const newText = await services.createText(uow, readerId, { title, content })

		const text = await services.getText(uow, newText!.id)

		expect(text!.words[0].name).toEqual(content.split(' ')[0])
		expect(text!.words).toHaveLength(5)
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

	it('creates text with accent', async () => {
		content = "j'avais une bierre"
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
		await expect(async () => {
			await services.createText(uow, readerId, { title: '', content })
		}).rejects.toThrow()

		await expect(async () => {
			await services.createText(uow, readerId, { title, content: '' })
		}).rejects.toThrow()
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

	it('doesnt create duplicate words', async () => {
		const content = 'Hello hello'
		await services.createText(uow, readerId, { title, content })
		const savedReader = uow.readers.get(readerId)

		if (!savedReader) throw new Error()
		expect(savedReader.words.length).toEqual(1)
		expect(savedReader.words[0].name).toEqual('hello')
	})

	it('handles contractions', async () => {
		const text = await services.createText(uow, readerId, {
			title: 'contract',
			content: "j'avais une bierre",
		})
		const words = text.words.map((w) => w.name)
		expect(words).toEqual(["j'avais", ' ', 'une', ' ', 'bierre'])

		const reader = await services.getReader(uow, '1')
		expect(reader.words).toHaveLength(3)
	})

	it('handles newline-only content', async () => {
		const text = await services.createText(uow, readerId, { title: 'newlines', content: '\n\n\n' })
		const words = text.words.map((w) => w.name)
		expect(words).toEqual(['\n', '\n', '\n'])

		const reader = await services.getReader(uow, '1')
		expect(reader.words).toHaveLength(0)
	})

	it('handles accented characters', async () => {
		const text = await services.createText(uow, readerId, {
			title: 'accented',
			content: 'café naïve résumé',
		})
		const words = text.words.map((w) => w.name)
		expect(words).toEqual(['café', ' ', 'naïve', ' ', 'résumé'])

		const reader = await services.getReader(uow, '1')
		expect(reader.words).toHaveLength(3)
	})

	it('handles emoji characters', async () => {
		const text = await services.createText(uow, readerId, {
			title: 'emojis',
			content: '🌟 Star power 🚀',
		})
		const words = text.words.map((w) => w.name)
		expect(words).toEqual(['🌟', ' ', 'Star', ' ', 'power', ' ', '🚀'])

		const reader = await services.getReader(uow, '1')
		expect(reader.words).toHaveLength(2)
	})

	it('handles mixed punctuation patterns', async () => {
		const text = await services.createText(uow, readerId, {
			title: 'punctuation',
			content: 'Hello, world! How are you?',
		})
		const words = text.words.map((w) => w.name)
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

		const reader = await services.getReader(uow, '1')
		expect(reader.words).toHaveLength(5)
	})

	it('handles complex punctuation', async () => {
		const text = await services.createText(uow, readerId, {
			title: 'complex punctuation',
			content: '"Hello," she said; "how are you?"',
		})
		const words = text.words.map((w) => w.name)
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

		const reader = await services.getReader(uow, '1')
		expect(reader.words).toHaveLength(6)
	})

	it('handles special characters', async () => {
		const text = await services.createText(uow, readerId, {
			title: 'special',
			content: '@user #tag $100 %50',
		})
		const words = text.words.map((w) => w.name)
		expect(words).toEqual(['@user', ' ', '#tag', ' ', '$100', ' ', '%50'])

		const reader = await services.getReader(uow, '1')
		expect(reader.words).toHaveLength(0)
	})

	it('handles contractions with apostrophes', async () => {
		const text = await services.createText(uow, readerId, {
			title: 'contractions',
			content: "don't can't won't",
		})
		const words = text.words.map((w) => w.name)
		expect(words).toEqual(["don't", ' ', "can't", ' ', "won't"])

		const reader = await services.getReader(uow, '1')
		expect(reader.words).toHaveLength(3)
	})

	it('handles numbers mixed with text', async () => {
		const text = await services.createText(uow, readerId, {
			title: 'numbers',
			content: '123numbers456 abc123',
		})
		const words = text.words.map((w) => w.name)
		expect(words).toEqual(['123numbers456', ' ', 'abc123'])

		const reader = await services.getReader(uow, '1')
		expect(reader.words).toHaveLength(0)
	})

	it('handles hyphenated words', async () => {
		const text = await services.createText(uow, readerId, {
			title: 'hyphenated',
			content: 'word-together state-of-the-art',
		})
		const words = text.words.map((w) => w.name)
		expect(words).toEqual(['word-together', ' ', 'state-of-the-art'])

		const reader = await services.getReader(uow, '1')
		expect(reader.words).toHaveLength(2)
	})

	it('handles colons and spaces', async () => {
		const text = await services.createText(uow, readerId, {
			title: 'colon spaces',
			content: 'Word: Another: thing',
		})
		const words = text.words.map((w) => w.name)
		expect(words).toEqual(['Word', ':', ' ', 'Another', ':', ' ', 'thing'])

		const reader = await services.getReader(uow, '1')
		expect(reader.words).toHaveLength(3)
	})

	it('handles multiple consecutive spaces', async () => {
		const text = await services.createText(uow, readerId, {
			title: 'multiple spaces',
			content: 'Hello  world',
		})
		const words = text.words.map((w) => w.name)
		expect(words).toEqual(['Hello', ' ', ' ', 'world'])

		const reader = await services.getReader(uow, '1')
		expect(reader.words).toHaveLength(2)
	})

	it('handles mixed unicode and punctuation', async () => {
		const text = await services.createText(uow, readerId, {
			title: 'mixed unicode',
			content: 'café, naïve!',
		})
		const words = text.words.map((w) => w.name)
		expect(words).toEqual(['café', ',', ' ', 'naïve', '!'])

		const reader = await services.getReader(uow, '1')
		expect(reader.words).toHaveLength(2)
	})

	it('handles currency symbols', async () => {
		const text = await services.createText(uow, readerId, {
			title: 'currency',
			content: '$100 €200 ¥300',
		})
		const words = text.words.map((w) => w.name)
		expect(words).toEqual(['$100', ' ', '€200', ' ', '¥300'])

		const reader = await services.getReader(uow, '1')
		expect(reader.words).toHaveLength(0)
	})

	it('can mark word as difficult', async () => {
		const text = await services.createText(uow, readerId, { title, content: 'hello world' })

		text.words[0].word!.status = 'difficult'

		expect(text.words[0].word!.status).toEqual('difficult')
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
