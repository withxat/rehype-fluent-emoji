import { describe, expect, it } from 'vitest'

import {
	buildRootStyle,
	buildTextStyle,
	EMOJI_SIZE,
	FLUENT_EMOJI_CSS,
	getEmojiClassNames,
} from '../src/fluent-emoji-style.js'

describe('getEmojiClassNames', () => {
	it('derives text class names from the root class', () => {
		expect(getEmojiClassNames('emoji-img')).toEqual({
			root: 'emoji-img',
			text: 'emoji-img-text',
		})
	})
})

describe('buildRootStyle', () => {
	it('builds layout and background styles when inlineStyle is true', () => {
		const style = buildRootStyle('/emoji/1f63a_color.svg', true)

		expect(style).toContain(`width:${EMOJI_SIZE}`)
		expect(style).toContain('background:url(/emoji/1f63a_color.svg)')
		expect(style).toContain('position:relative')
	})

	it('builds only the css variable when inlineStyle is false', () => {
		expect(buildRootStyle('/emoji/1f63a_color.svg', false)).toBe(
			'--fluent-emoji-url:url(/emoji/1f63a_color.svg)',
		)
	})
})

describe('buildTextStyle', () => {
	it('builds visually hidden styles when inlineStyle is true', () => {
		const style = buildTextStyle(true)

		expect(style).toContain('clip:rect(0,0,0,0)')
		expect(style).toContain('clip-path:inset(50%)')
		expect(style).toContain('margin:-1px')
		expect(style).toContain('-webkit-text-fill-color:transparent')
	})

	it('returns undefined when inlineStyle is false', () => {
		expect(buildTextStyle(false)).toBeUndefined()
	})
})

describe('fLUENT_EMOJI_CSS', () => {
	it('styles the root background and hidden text layer', () => {
		expect(FLUENT_EMOJI_CSS).toContain('.fluent-emoji-text')
		expect(FLUENT_EMOJI_CSS).toContain('background-image: var(--fluent-emoji-url)')
		expect(FLUENT_EMOJI_CSS).toContain('::selection')
		expect(FLUENT_EMOJI_CSS).toContain('clip-path: inset(50%)')
		expect(FLUENT_EMOJI_CSS).toContain('-webkit-text-fill-color: transparent')
	})
})
