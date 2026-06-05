import { describe, expect, it } from 'vitest'

import {
	buildSharedStyle,
	buildVisualBackgroundStyle,
	getEmojiClassNames,
} from '../src/fluent-emoji-style.js'

describe('getEmojiClassNames', () => {
	it('derives text and visual class names from the root class', () => {
		expect(getEmojiClassNames('emoji-img')).toEqual({
			root: 'emoji-img',
			text: 'emoji-img-text',
			visual: 'emoji-img-visual',
		})
	})
})

describe('buildSharedStyle', () => {
	it('includes layout, text, visual, and selection rules', () => {
		const style = buildSharedStyle('fluent-emoji')

		expect(style).toContain(
			'.fluent-emoji{position:relative;display:inline-block;width:1em;height:1em;line-height:1;vertical-align:-0.125em}',
		)
		expect(style).toContain('.fluent-emoji-text{color:transparent;-webkit-text-fill-color:transparent')
		expect(style).toContain('.fluent-emoji-text::selection{color:transparent;-webkit-text-fill-color:transparent}')
		expect(style).toContain('.fluent-emoji-visual{position:absolute;inset:0;z-index:1')
		expect(style).toContain('background-size:100% 100%')
		expect(style).not.toContain('background-image:url')
	})

	it('uses the custom class name', () => {
		const style = buildSharedStyle('emoji-img')

		expect(style).toContain('.emoji-img{position:relative;display:inline-block')
		expect(style).toContain('.emoji-img-text{')
		expect(style).toContain('.emoji-img-visual{')
	})
})

describe('buildVisualBackgroundStyle', () => {
	it('only sets the per-emoji background image URL', () => {
		expect(buildVisualBackgroundStyle('/emoji/1f63a_color.svg')).toBe(
			'background-image:url(/emoji/1f63a_color.svg)',
		)
	})
})
