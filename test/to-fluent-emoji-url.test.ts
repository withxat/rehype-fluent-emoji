import { describe, expect, it } from 'vitest'

import {
	toFluentEmojiFilename,
	toFluentEmojiUrl,
} from '../src/to-fluent-emoji-url.js'

describe('toFluentEmojiFilename', () => {
	it('builds the flattened unicode asset filename', () => {
		expect(toFluentEmojiFilename('😺')).toBe('1f63a_color.webp')
	})
})

describe('toFluentEmojiUrl', () => {
	it('builds a default Fluent Emoji asset URL', () => {
		expect(toFluentEmojiUrl('😺')).toBe('/emoji/1f63a_color.webp')
	})

	it('supports custom assetBase, style, and ext', () => {
		expect(
			toFluentEmojiUrl('👍🏻', {
				assetBase: 'https://cdn.example.com/emoji/',
				style: 'flat',
			}),
		).toBe('https://cdn.example.com/emoji/1f44d-1f3fb_flat.webp')
	})

	it('supports 3d asset URLs', () => {
		expect(
			toFluentEmojiUrl('😺', {
				style: '3d',
			}),
		).toBe('/emoji/1f63a_3d.webp')
	})
})
