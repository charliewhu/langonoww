import { describe, it, expect } from 'vitest'
import * as domain from '$lib/domain'

describe('Reader', () => {
	it('can find or create word', async () => {
		const reader = new domain.Reader()
		// @ts-ignore
		const word = reader.findOrCreateWord('hello')

		expect(word).toBeDefined()
		expect(word!.name).toEqual('hello')
		expect(word!.status).toEqual('unknown')
	})

	it('doesnt create fake word', async () => {
		const reader = new domain.Reader()
		// @ts-ignore
		const word = reader.findOrCreateWord(' ')

		expect(word).not.toBeDefined()
	})
})
