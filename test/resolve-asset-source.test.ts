import { describe, expect, it } from 'vitest'

import { resolveAssetSource } from '../src/resolve-asset-source.js'

describe('resolveAssetSource', () => {
	it('resolves a GitHub repository URL', () => {
		expect(
			resolveAssetSource('https://github.com/withxat/fluentui-emoji-unicode'),
		).toBe(
			'https://raw.githubusercontent.com/withxat/fluentui-emoji-unicode/webp/assets',
		)
	})

	it('resolves a GitHub repository URL with branch', () => {
		expect(
			resolveAssetSource(
				'https://github.com/withxat/fluentui-emoji-unicode/tree/webp',
			),
		).toBe(
			'https://raw.githubusercontent.com/withxat/fluentui-emoji-unicode/webp/assets',
		)
	})

	it('resolves owner/repo shorthand', () => {
		expect(resolveAssetSource('withxat/fluentui-emoji-unicode', 'webp')).toBe(
			'https://raw.githubusercontent.com/withxat/fluentui-emoji-unicode/webp/assets',
		)
	})

	it('keeps an existing raw asset base URL', () => {
		expect(
			resolveAssetSource(
				'https://raw.githubusercontent.com/withxat/fluentui-emoji-unicode/webp/assets',
			),
		).toBe(
			'https://raw.githubusercontent.com/withxat/fluentui-emoji-unicode/webp/assets',
		)
	})
})
