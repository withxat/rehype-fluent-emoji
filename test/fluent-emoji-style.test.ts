import { describe, expect, it } from 'vitest'

import {
	buildRootStyle,
	buildTextStyle,
	buildVisualStyle,
	EMOJI_SIZE,
	FLUENT_EMOJI_CSS,
	getEmojiClassNames,
} from '../src/fluent-emoji-style.js'

describe('getEmojiClassNames', () => {
	it('derives text class names from the root class', () => {
		expect(getEmojiClassNames('emoji-img')).toEqual({
			root: 'emoji-img',
			text: 'emoji-img-text',
			visual: 'emoji-img-visual',
		})
	})
})

describe('buildRootStyle', () => {
	it('builds layout styles when inlineStyle is true', () => {
		const style = buildRootStyle(true)

		expect(style).toContain(`width:${EMOJI_SIZE}`)
		expect(style).toContain('position:relative')
		expect(style).not.toContain('background:')
	})

	it('returns undefined when inlineStyle is false', () => {
		expect(buildRootStyle(false)).toBeUndefined()
	})
})

describe('buildVisualStyle', () => {
	it('builds visual layer and background styles when inlineStyle is true', () => {
		const style = buildVisualStyle('/emoji/1f63a_color.svg', true)

		expect(style).toContain('position:absolute')
		expect(style).toContain('inset:0')
		expect(style).toContain('z-index:1')
		expect(style).toContain('background:url(/emoji/1f63a_color.svg)')
	})

	it('builds only the css variable when inlineStyle is false', () => {
		expect(buildVisualStyle('/emoji/1f63a_color.svg', false)).toBe(
			'--fluent-emoji-url:url(/emoji/1f63a_color.svg)',
		)
	})
})

describe('buildTextStyle', () => {
	it('builds transparent selectable text styles when inlineStyle is true', () => {
		const style = buildTextStyle(true)

		expect(style).toContain('display:inline-block')
		expect(style).toContain('position:relative')
		expect(style).toContain('z-index:0')
		expect(style).toContain('width:100%')
		expect(style).toContain('height:100%')
		expect(style).toContain('line-height:1')
		expect(style).toContain('user-select:text')
		expect(style).toContain('-webkit-user-select:text')
		expect(style).toContain('color:transparent!important')
		expect(style).toContain('-webkit-text-fill-color:transparent!important')
		expect(style).not.toContain('opacity:0')
		expect(style).not.toContain('font-size:0')
		expect(style).not.toContain('clip:')
		expect(style).not.toContain('user-select:none')
	})

	it('returns undefined when inlineStyle is false', () => {
		expect(buildTextStyle(false)).toBeUndefined()
	})
})

describe('fLUENT_EMOJI_CSS', () => {
	it('styles the visual background and copyable text layer', () => {
		expect(FLUENT_EMOJI_CSS).toContain('.fluent-emoji-text')
		expect(FLUENT_EMOJI_CSS).toContain('.fluent-emoji-visual')
		expect(FLUENT_EMOJI_CSS).toContain('background-image: var(--fluent-emoji-url)')
		expect(FLUENT_EMOJI_CSS).toContain('z-index: 1')
		expect(FLUENT_EMOJI_CSS).toContain('::selection')
		expect(FLUENT_EMOJI_CSS).toContain('line-height: 1')
		expect(FLUENT_EMOJI_CSS).toContain('user-select: text')
		expect(FLUENT_EMOJI_CSS).toContain('color: transparent !important')
		expect(FLUENT_EMOJI_CSS).toContain(
			'-webkit-text-fill-color: transparent !important',
		)
		expect(FLUENT_EMOJI_CSS).not.toContain('background: transparent')
		expect(FLUENT_EMOJI_CSS).not.toContain('opacity: 0')
		expect(FLUENT_EMOJI_CSS).not.toContain('font-size: 0')
	})
})
