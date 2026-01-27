import { describe, it, expect, beforeEach } from 'vitest'
import * as services from '$lib/services'
import * as domain from '$lib/domain'

class FakeRepository<T> {
	private data: Map<string, T> = new Map()

	get() {
		// will only be 1 Reader in data
		return Array.from(this.data.values())[0]
	}

	save(entity: T) {
		this.data.set((entity as any).id, entity)
	}
}

describe('services', () => {
	const id = 'id'
	let repo: FakeRepository<domain.Reader>

	beforeEach(() => {
		repo = new FakeRepository<domain.Reader>()
		repo.save(new domain.Reader(id))
	})

	it('adds to repo', async () => {
		const title = 'title'
		const content = 'New text content'
		const text = services.createText(repo, { title, content })

		expect(text).toBeDefined()
		expect(text!.title).toEqual(title)

		expect(repo.get()!.words).toHaveLength(3)
	})
})
