import { describe, expect, it } from 'vitest'

import { toFluentEmojiCode } from '../src/to-fluent-emoji-code.js'

describe('toFluentEmojiCode', () => {
	it('converts a single-codepoint emoji', () => {
		expect(toFluentEmojiCode('😺')).toBe('1f63a')
	})

	it('converts skin tone modifiers', () => {
		expect(toFluentEmojiCode('👍🏻')).toBe('1f44d-1f3fb')
	})

	it('converts ZWJ sequences', () => {
		expect(toFluentEmojiCode('👨‍👩‍👧‍👦')).toBe(
			'1f468-200d-1f469-200d-1f467-200d-1f466',
		)
	})

	it('converts flag emoji', () => {
		expect(toFluentEmojiCode('🇺🇸')).toBe('1f1fa-1f1f8')
	})

	it('preserves FE0F variation selectors', () => {
		expect(toFluentEmojiCode('🏳️‍⚧️')).toBe('1f3f3-fe0f-200d-26a7-fe0f')
	})

	it('converts thumbs up without skin tone', () => {
		expect(toFluentEmojiCode('👍')).toBe('1f44d')
	})
})
