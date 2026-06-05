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
	it('builds transparent selectable text styles when inlineStyle is true', () => {
		const style = buildTextStyle(true)

		expect(style).toContain('display:inline-block')
		expect(style).toContain('width:100%')
		expect(style).toContain('height:100%')
		expect(style).toContain('font-size:0')
		expect(style).toContain('line-height:0')
		expect(style).toContain('user-select:text')
		expect(style).toContain('-webkit-user-select:text')
		expect(style).toContain('-webkit-text-fill-color:transparent')
		expect(style).not.toContain('clip:')
		expect(style).not.toContain('user-select:none')
	})

	it('returns undefined when inlineStyle is false', () => {
		expect(buildTextStyle(false)).toBeUndefined()
	})
})

describe('fLUENT_EMOJI_CSS', () => {
	it('styles the root background and copyable text layer', () => {
		expect(FLUENT_EMOJI_CSS).toContain('.fluent-emoji-text')
		expect(FLUENT_EMOJI_CSS).toContain('background-image: var(--fluent-emoji-url)')
		expect(FLUENT_EMOJI_CSS).toContain('::selection')
		expect(FLUENT_EMOJI_CSS).toContain('font-size: 0')
		expect(FLUENT_EMOJI_CSS).toContain('line-height: 0')
		expect(FLUENT_EMOJI_CSS).toContain('user-select: text')
		expect(FLUENT_EMOJI_CSS).toContain('-webkit-text-fill-color: transparent')
		expect(FLUENT_EMOJI_CSS).not.toContain('user-select: none')
	})
})
