export class Reader {
	readonly id: string
	#texts: Text[]
	#words: Word[]

	constructor(id?: string, texts: Text[] = [], words: Word[] = []) {
		this.id = id ?? crypto.randomUUID()
		this.#texts = texts
		this.#words = words
	}

	addText(...text: ConstructorParameters<typeof Text>) {
		const params = text[0]

		if (params.title === '' || params.content === '') return

		const newText = new Text(params)
		const parsedWords = newText.parseRawContent()

		parsedWords.forEach((raw, index) => {
			const word = this.findOrCreateWord(raw)
			newText.addWord({ name: raw, order: index, word: word })
		})

		this.texts.push(newText)
		return newText
	}

	get texts() {
		return this.#texts
	}

	get words() {
		return this.#words
	}

	private findOrCreateWord(raw: string) {
		// handle punctuation/spaces
		if (!Word.isWord(raw)) return undefined

		let normalised = raw.toLowerCase()
		let word = this.words.find((w) => w.name == normalised)

		if (!word) {
			word = new Word(normalised)
			this.words.push(word)
		}
		return word
	}
}

export class Text {
	readonly title: string
	readonly content: string
	readonly words: TextWord[]

	constructor({ title, content }: { title: string; content: string }) {
		this.title = title
		this.content = content
		this.words = []
	}

	addWord(...word: ConstructorParameters<typeof TextWord>) {
		const textWord = new TextWord(word[0])
		this.words.push(textWord)
	}
	parseRawContent() {
		// create list of words, punctuation, spaces
		return this.content.split(/(?=[\s:])|(?<=[\s:])/).filter(Boolean)
	}
}

class TextWord {
	// container to map ordered Words to Text content

	readonly name // raw 'word' element from Text eg 'This' or ','
	readonly order: number // ordered position in text content
	readonly word: Word | undefined

	constructor({ name, order, word }: { name: string; order: number; word?: Word }) {
		this.name = name
		this.order = order
		this.word = word
	}

	markAsKnown() {
		if (!this.word) return

		this.word.status = 'known'
	}

	markAsDifficult() {
		if (!this.word) return

		this.word.status = 'difficult'
	}
}

class Word {
	readonly name: string
	status: 'known' | 'unknown' | 'difficult'

	constructor(name: string) {
		this.name = name.toLowerCase()
		this.status = 'unknown'
	}

	static isWord(raw: string) {
		return /^\p{L}+$/u.test(raw)
	}
}
