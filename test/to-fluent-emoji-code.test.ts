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

	it('drops FE0F variation selectors by default', () => {
		expect(toFluentEmojiCode('🛠️')).toBe('1f6e0')
		expect(toFluentEmojiCode('🏳️‍⚧️')).toBe('1f3f3-200d-26a7')
		expect(toFluentEmojiCode('👨‍⚕️')).toBe('1f468-200d-2695')
	})

	it('converts thumbs up without skin tone', () => {
		expect(toFluentEmojiCode('👍')).toBe('1f44d')
	})
})
